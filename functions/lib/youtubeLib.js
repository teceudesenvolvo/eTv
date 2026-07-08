const functions = require('firebase-functions');
const { google } = require('googleapis');
const { XMLParser } = require('fast-xml-parser');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

function getConfigValue(key, fallback) {
  const config = functions.config().youtube || {};
  return config[key] || process.env[key] || fallback || null;
}

async function createYoutubeClient() {
  const clientId = getConfigValue('client_id');
  const clientSecret = getConfigValue('client_secret');
  const refreshToken = getConfigValue('refresh_token');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing YouTube OAuth configuration. Set firebase functions config values for youtube.client_id, youtube.client_secret and youtube.refresh_token.');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

async function getUploadsPlaylistId(youtube, channelId) {
  const resp = await youtube.channels.list({ part: ['contentDetails'], id: [channelId], maxResults: 1 });
  const uploads = resp.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error('Could not find uploads playlist for channel');
  return uploads;
}

async function listAllPlaylistVideos(youtube, playlistId) {
  const videos = [];
  let pageToken;
  do {
    const res = await youtube.playlistItems.list({ part: ['snippet'], playlistId, maxResults: 50, pageToken });
    const items = res.data.items || [];
    for (const it of items) {
      const videoId = it.snippet?.resourceId?.videoId;
      if (videoId) {
        videos.push({ videoId, title: it.snippet.title, publishedAt: it.snippet.publishedAt || null });
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return videos;
}

async function addVideoToPlaylistIfMissing({ youtube, playlistId, videoId, knownPlaylistVideoIds }) {
  const db = admin.firestore();
  const cacheRef = db.collection('youtubePlaylistVideos').doc(videoId);
  const cached = await cacheRef.get();
  if (cached.exists || (knownPlaylistVideoIds && knownPlaylistVideoIds.has(videoId))) return false;

  await youtube.playlistItems.insert({ part: ['snippet'], requestBody: { snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId } } } });

  await cacheRef.set({ videoId, playlistId, addedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  if (knownPlaylistVideoIds) knownPlaylistVideoIds.add(videoId);
  return true;
}

async function youtubeChannelWebhook(request, response) {
  // WebSub verification (GET)
  try {
    const expectedVerifyToken = getConfigValue('webhook_verify_token') || process.env.YOUTUBE_WEBHOOK_VERIFY_TOKEN;
    if (request.method === 'GET') {
      const mode = String(request.query['hub.mode'] || '');
      const challenge = String(request.query['hub.challenge'] || '');
      const verifyToken = String(request.query['hub.verify_token'] || '');
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

    const body = request.rawBody?.toString('utf8') || '';
    if (!body) { response.status(204).send(''); return; }

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
    const parsed = parser.parse(body);
    const entries = parsed?.feed?.entry ? (Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry]) : [];

    if (entries.length === 0) { response.status(204).send(''); return; }

    const channelId = getConfigValue('channel_id');
    const playlistId = getConfigValue('playlist_id');
    if (!channelId || !playlistId) throw new Error('Missing YouTube channel/playlist config values.');

    const youtube = await createYoutubeClient();
    let inserted = 0;
    for (const entry of entries) {
      const videoId = entry?.videoId || entry?.id || entry?.link?.['@_href'] || null;
      const entryChannelId = entry?.channelId || entry?.author?.['yt:channelId'] || null;
      if (!videoId || entryChannelId !== channelId) continue;
      const wasInserted = await addVideoToPlaylistIfMissing({ youtube, playlistId, videoId });
      if (wasInserted) inserted += 1;
    }

    response.status(204).send('');
  } catch (err) {
    console.error('youtubeChannelWebhook error:', err);
    response.status(500).send('Webhook processing failed');
  }
}

async function atualizarPlaylistYoutube(request, response) {
  try {
    const channelId = getConfigValue('channel_id');
    const playlistId = getConfigValue('playlist_id');
    if (!channelId || !playlistId) throw new Error('Missing YouTube channel/playlist config values.');

    const youtube = await createYoutubeClient();
    const uploadsPlaylistId = await getUploadsPlaylistId(youtube, channelId);

    const [channelUploads, currentPlaylistVideos] = await Promise.all([
      listAllPlaylistVideos(youtube, uploadsPlaylistId),
      listAllPlaylistVideos(youtube, playlistId),
    ]);

    const currentIds = new Set(currentPlaylistVideos.map(v => v.videoId));
    const uniqueChannelVideos = Array.from(new Map(channelUploads.map(v => [v.videoId, v])).values());

    let inserted = 0;
    for (const video of uniqueChannelVideos) {
      const wasInserted = await addVideoToPlaylistIfMissing({ youtube, playlistId, videoId: video.videoId, knownPlaylistVideoIds: currentIds });
      if (wasInserted) inserted += 1;
    }

    response.json({ ok: true, inserted });
  } catch (err) {
    console.error('atualizarPlaylistYoutube error:', err);
    response.status(500).json({ ok: false, error: String(err) });
  }
}

module.exports = { youtubeChannelWebhook, atualizarPlaylistYoutube };
