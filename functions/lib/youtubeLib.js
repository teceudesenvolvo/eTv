const functions = require('firebase-functions');
const { google } = require('googleapis');
const { XMLParser } = require('fast-xml-parser');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const REGION = 'southamerica-east1';
const DEFAULT_PROJECT_ID = 'cm-pacatuba';

function normalizeConfigValue(key, value) {
  if (typeof value !== 'string') return value;
  let cleaned = value.trim();

  if (key === 'refresh_token') {
    // Remove expiry_date metadata if present
    cleaned = cleaned.replace(/\s*expiry_date:.*$/is, '').trim();
    // Remove any additional newlines or extra whitespace within token
    cleaned = cleaned.replace(/[\r\n]+/g, '').trim();
  }

  return cleaned || null;
}

function getConfigValue(key, fallback) {
  const config = functions.config().youtube || {};
  const rawValue = config[key] || process.env[`YOUTUBE_${key.toUpperCase()}`] || process.env[key] || fallback || null;
  return normalizeConfigValue(key, rawValue);
}

function requireConfigValue(key) {
  const value = getConfigValue(key);
  if (!value) {
    throw new Error(`Missing YouTube configuration value: ${key}`);
  }
  return value;
}

function getApiErrorMessage(error) {
  return error && error.message ? error.message : String(error);
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function createYoutubeClient() {
  const clientId = requireConfigValue('client_id');
  const clientSecret = requireConfigValue('client_secret');
  const refreshToken = requireConfigValue('refresh_token');

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

function getPlaylistVideo(item) {
  const playlistItemId = item.id;
  const videoId = item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId;

  if (!playlistItemId || !videoId) {
    return null;
  }

  return {
    playlistItemId,
    videoId,
    title: (item.snippet && item.snippet.title) || 'Novo video na TV Câmara',
  };
}

function getPublicPlaylistVideo(item) {
  const snippet = item.snippet || {};
  const contentDetails = item.contentDetails || {};
  const resourceId = snippet.resourceId || {};
  const videoId = resourceId.videoId || contentDetails.videoId;
  const title = snippet.title;

  if (!videoId || !title) {
    return null;
  }

  const thumbnails = snippet.thumbnails || {};
  const thumbnailUrl =
    (thumbnails.maxres && thumbnails.maxres.url) ||
    (thumbnails.standard && thumbnails.standard.url) ||
    (thumbnails.high && thumbnails.high.url) ||
    (thumbnails.medium && thumbnails.medium.url) ||
    (thumbnails.default && thumbnails.default.url) ||
    null;

  return {
    videoId,
    title,
    description: snippet.description || '',
    thumbnailUrl,
    publishedAt: snippet.publishedAt || contentDetails.videoPublishedAt || null,
    position: typeof snippet.position === 'number' ? snippet.position : null,
    snippet,
  };
}

async function getUploadsPlaylistId(youtube, channelId) {
  const resp = await youtube.channels.list({
    part: ['contentDetails'],
    id: [channelId],
    maxResults: 1,
  });
  const uploads = resp.data.items &&
    resp.data.items[0] &&
    resp.data.items[0].contentDetails &&
    resp.data.items[0].contentDetails.relatedPlaylists &&
    resp.data.items[0].contentDetails.relatedPlaylists.uploads;

  if (!uploads) {
    throw new Error('Could not find uploads playlist for channel.');
  }

  return uploads;
}

async function listAllPlaylistVideos(youtube, playlistId, publicShape) {
  const videos = [];
  let pageToken;

  do {
    const res = await youtube.playlistItems.list({
      part: publicShape ? ['snippet', 'contentDetails'] : ['snippet'],
      playlistId,
      maxResults: 50,
      pageToken,
    });

    const pageVideos = (res.data.items || [])
      .map(publicShape ? getPublicPlaylistVideo : getPlaylistVideo)
      .filter(Boolean);

    videos.push(...pageVideos);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return videos;
}

async function searchRecentChannelVideos(youtube, channelId) {
  const searchRequests = [
    youtube.search.list({
      part: ['snippet'],
      channelId,
      maxResults: 25,
      order: 'date',
      type: ['video'],
    }),
    youtube.search.list({
      part: ['snippet'],
      channelId,
      eventType: 'live',
      maxResults: 10,
      type: ['video'],
    }),
  ];

  const responses = await Promise.all(searchRequests);
  const videos = [];

  for (const response of responses) {
    for (const item of response.data.items || []) {
      const videoId = item.id && item.id.videoId;
      if (!videoId) {
        continue;
      }

      videos.push({
        videoId,
        title: (item.snippet && item.snippet.title) || 'Novo video na TV Câmara',
        publishedAt: item.snippet && item.snippet.publishedAt,
      });
    }
  }

  return Array.from(new Map(videos.map((video) => [video.videoId, video])).values());
}

async function addVideoToPlaylistIfMissing({ youtube, playlistId, videoId, knownPlaylistVideoIds }) {
  const db = admin.firestore();
  const cacheRef = db.collection('youtubePlaylistVideos').doc(videoId);
  const cached = await cacheRef.get();

  if (knownPlaylistVideoIds && knownPlaylistVideoIds.has(videoId)) {
    if (!cached.exists) {
      await cacheRef.set({
        videoId,
        playlistId,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    return false;
  }

  if (!knownPlaylistVideoIds && cached.exists) {
    return false;
  }

  await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId,
        },
      },
    },
  });

  await cacheRef.set({
    videoId,
    playlistId,
    addedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  if (knownPlaylistVideoIds) {
    knownPlaylistVideoIds.add(videoId);
  }

  return true;
}

async function notifyUsersAboutNewYoutubeVideo({ videoId, title }) {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('users').get();
  let batch = db.batch();
  let batchOperations = 0;
  let created = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data() || {};
    const notificationRef = db.collection('notifications').doc();

    batch.set(notificationRef, {
      userId: userDoc.id,
      flavorId: userData.flavorId || 'pacatuba',
      tituloNotification: 'Novo video na TV Câmara',
      descricaoNotification: title || 'Há um novo vídeo disponível para assistir.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      isRead: false,
      data: {
        screen: 'TvCamara',
        type: 'youtube-video',
        videoId,
      },
    });

    batchOperations += 1;
    created += 1;

    if (batchOperations >= 450) {
      await batch.commit();
      batch = db.batch();
      batchOperations = 0;
    }
  }

  if (batchOperations > 0) {
    await batch.commit();
  }

  return created;
}

async function handleYoutubeFeedEntries(entries) {
  const channelId = requireConfigValue('channel_id');
  const playlistId = requireConfigValue('playlist_id');
  const youtube = await createYoutubeClient();
  const currentPlaylistVideos = await listAllPlaylistVideos(youtube, playlistId, false);
  const currentIds = new Set(currentPlaylistVideos.map((video) => video.videoId));
  let inserted = 0;

  for (const entry of entries) {
    const videoId = entry && (entry.videoId || entry['yt:videoId']);
    const entryChannelId = entry && (entry.channelId || entry['yt:channelId']);
    const title = (entry && entry.title) || 'Novo video na TV Câmara';

    if (!videoId || entryChannelId !== channelId) {
      console.warn('Entrada WebSub ignorada por canal ou video invalido.', {
        hasVideoId: Boolean(videoId),
        matchesChannel: entryChannelId === channelId,
      });
      continue;
    }

    const wasInserted = await addVideoToPlaylistIfMissing({
      youtube,
      playlistId,
      videoId,
      knownPlaylistVideoIds: currentIds,
    });

    if (wasInserted) {
      inserted += 1;
      const notificationsCreated = await notifyUsersAboutNewYoutubeVideo({ videoId, title });
      console.log('Video novo adicionado via webhook YouTube.', { videoId, notificationsCreated });
    }
  }

  return inserted;
}

async function youtubeChannelWebhook(request, response) {
  try {
    if (request.method === 'GET') {
      const mode = String(request.query['hub.mode'] || '');
      const challenge = String(request.query['hub.challenge'] || '');
      const verifyToken = String(request.query['hub.verify_token'] || '');
      const expectedVerifyToken = requireConfigValue('webhook_verify_token');

      if (mode === 'subscribe' && challenge && verifyToken === expectedVerifyToken) {
        response.status(200).send(challenge);
        return;
      }

      response.status(403).send('Verification failed');
      return;
    }

    if (request.method !== 'POST') {
      response.status(405).send('Method not allowed');
      return;
    }

    const body = (request.rawBody && request.rawBody.toString('utf8')) || '';
    if (!body) {
      response.status(204).send('');
      return;
    }

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
    const parsed = parser.parse(body);
    const entries = normalizeArray(parsed && parsed.feed && parsed.feed.entry);

    if (entries.length === 0) {
      response.status(204).send('');
      return;
    }

    const inserted = await handleYoutubeFeedEntries(entries);
    console.log('Webhook YouTube processado.', { inserted });
    response.status(204).send('');
  } catch (err) {
    console.error('youtubeChannelWebhook error:', getApiErrorMessage(err));
    response.status(500).send('Webhook processing failed');
  }
}

async function runAtualizarPlaylistYoutube() {
  const channelId = requireConfigValue('channel_id');
  const playlistId = requireConfigValue('playlist_id');
  const youtube = await createYoutubeClient();
  const uploadsPlaylistId = await getUploadsPlaylistId(youtube, channelId);

  const [channelUploads, currentPlaylistVideos] = await Promise.all([
    listAllPlaylistVideos(youtube, uploadsPlaylistId, false),
    listAllPlaylistVideos(youtube, playlistId, false),
  ]);

  const currentIds = new Set(currentPlaylistVideos.map((video) => video.videoId));
  const originalPlaylistVideosCount = currentIds.size;
  const uniqueChannelVideos = Array.from(
    new Map(channelUploads.map((video) => [video.videoId, video])).values()
  );
  let inserted = 0;

  for (const video of uniqueChannelVideos) {
    const wasInserted = await addVideoToPlaylistIfMissing({
      youtube,
      playlistId,
      videoId: video.videoId,
      knownPlaylistVideoIds: currentIds,
    });

    if (wasInserted) {
      inserted += 1;
      const notificationsCreated = await notifyUsersAboutNewYoutubeVideo({
        videoId: video.videoId,
        title: video.title,
      });
      console.log('Video adicionado durante backfill da playlist.', {
        videoId: video.videoId,
        notificationsCreated,
      });
    }
  }

  return {
    channelVideosCount: uniqueChannelVideos.length,
    playlistVideosCount: originalPlaylistVideosCount,
    finalPlaylistVideosCount: currentIds.size,
    inserted,
  };
}

async function runAtualizarPlaylistYoutubeRecentSearch() {
  const channelId = requireConfigValue('channel_id');
  const playlistId = requireConfigValue('playlist_id');
  const youtube = await createYoutubeClient();

  const [recentChannelVideos, currentPlaylistVideos] = await Promise.all([
    searchRecentChannelVideos(youtube, channelId),
    listAllPlaylistVideos(youtube, playlistId, false),
  ]);

  const currentIds = new Set(currentPlaylistVideos.map((video) => video.videoId));
  const originalPlaylistVideosCount = currentIds.size;
  let inserted = 0;

  for (const video of recentChannelVideos) {
    const wasInserted = await addVideoToPlaylistIfMissing({
      youtube,
      playlistId,
      videoId: video.videoId,
      knownPlaylistVideoIds: currentIds,
    });

    if (wasInserted) {
      inserted += 1;
      const notificationsCreated = await notifyUsersAboutNewYoutubeVideo({
        videoId: video.videoId,
        title: video.title,
      });
      console.log('Video recente adicionado na playlist pela busca agendada.', {
        videoId: video.videoId,
        notificationsCreated,
      });
    }
  }

  return {
    searchedVideosCount: recentChannelVideos.length,
    playlistVideosCount: originalPlaylistVideosCount,
    finalPlaylistVideosCount: currentIds.size,
    inserted,
  };
}

async function atualizarPlaylistYoutube(request, response) {
  response.set('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.status(204).send('');
    return;
  }

  try {
    const result = await runAtualizarPlaylistYoutube();
    response.json({ ok: true, ...result });
  } catch (err) {
    console.error('atualizarPlaylistYoutube error:', getApiErrorMessage(err));
    response.status(500).json({ ok: false, error: getApiErrorMessage(err) });
  }
}

async function atualizarPlaylistYoutubeScheduled() {
  console.log('Iniciando busca agendada por videos recentes do YouTube.');
  const result = await runAtualizarPlaylistYoutubeRecentSearch();
  console.log('Busca agendada por videos recentes do YouTube concluida.', result);
  return null;
}

async function listarVideosTvCamara(request, response) {
  response.set('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.status(204).send('');
    return;
  }

  if (request.method !== 'GET') {
    response.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const playlistId = requireConfigValue('playlist_id');
    const youtube = await createYoutubeClient();
    const videos = await listAllPlaylistVideos(youtube, playlistId, true);

    videos.sort((firstVideo, secondVideo) => {
      const firstTime = firstVideo.publishedAt ? Date.parse(firstVideo.publishedAt) : 0;
      const secondTime = secondVideo.publishedAt ? Date.parse(secondVideo.publishedAt) : 0;
      return secondTime - firstTime;
    });

    response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.json({ ok: true, videos });
  } catch (err) {
    console.error('listarVideosTvCamara error:', getApiErrorMessage(err));
    response.status(500).json({ ok: false, error: 'Falha ao carregar videos da TV Camara.' });
  }
}

async function proxyCmpacatubaOpenData(request, response) {
  response.set('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.status(204).send('');
    return;
  }

  if (request.method !== 'GET') {
    response.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const query = new URLSearchParams(request.query).toString();
    const targetUrl = `https://www.cmpacatuba.ce.gov.br/dadosabertosexportar?${query}`;
    const fetchResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const text = await fetchResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error('proxyCmpacatubaOpenData parse error:', jsonErr, 'body:', text);
      response.status(502).json({ ok: false, error: 'Falha ao analisar dados da Câmara.' });
      return;
    }

    response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.status(fetchResponse.ok ? 200 : 502).json(data);
  } catch (err) {
    console.error('proxyCmpacatubaOpenData error:', getApiErrorMessage(err));
    response.status(500).json({ ok: false, error: 'Erro ao buscar dados abertos da Câmara.' });
  }
}

async function subscribeToYoutubeWebSub(callbackUrl) {
  const channelId = requireConfigValue('channel_id');
  const verifyToken = requireConfigValue('webhook_verify_token');
  const params = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.mode': 'subscribe',
    'hub.topic': `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    'hub.verify': 'async',
    'hub.verify_token': verifyToken,
    'hub.lease_seconds': String(60 * 60 * 24 * 5),
  });

  const response = await fetch('https://pubsubhubbub.appspot.com/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Falha ao renovar WebSub: HTTP ${response.status}`);
  }
}

function getWebhookCallbackUrl() {
  const configuredUrl = getConfigValue('webhook_callback_url');
  if (configuredUrl) {
    return configuredUrl;
  }

  const projectId =
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    getConfigValue('project_id') ||
    DEFAULT_PROJECT_ID;

  return `https://${REGION}-${projectId}.cloudfunctions.net/youtubeChannelWebhook`;
}

async function renovarWebhookYoutube(request, response) {
  try {
    const callbackUrl = getWebhookCallbackUrl();
    await subscribeToYoutubeWebSub(callbackUrl);

    console.log('Inscricao WebSub do YouTube renovada.', { callbackUrl });
    if (response) {
      response.json({ ok: true, callbackUrl });
    }
    return null;
  } catch (err) {
    console.error('renovarWebhookYoutube error:', getApiErrorMessage(err));
    if (response) {
      response.status(500).json({ ok: false, error: getApiErrorMessage(err) });
    }
    throw err;
  }
}

module.exports = {
  youtubeChannelWebhook,
  atualizarPlaylistYoutube,
  atualizarPlaylistYoutubeScheduled,
  listarVideosTvCamara,
  renovarWebhookYoutube,
};
