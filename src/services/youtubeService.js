import axios from 'axios'

const API_KEY = 'AIzaSyCfZfFR3QzWmQWBYMgwmXx8n2EdyjdFi2s'
const CHANNEL_ID = 'UCDIm8G-WBXBXbRpCNwwI_Wg'
const BASE_URL = 'https://www.googleapis.com/youtube/v3'
const MAX_RESULTS = 50
const TV_CAMARA_VIDEOS_URL =
  process.env.REACT_APP_TV_CAMARA_VIDEOS_URL ||
  'https://southamerica-east1-cm-pacatuba.cloudfunctions.net/listarVideosTvCamara'
const TV_CAMARA_SYNC_URL =
  process.env.REACT_APP_TV_CAMARA_SYNC_URL ||
  'https://southamerica-east1-cm-pacatuba.cloudfunctions.net/atualizarPlaylistYoutube'

function normalizeServerVideo(video) {
  const thumbnailUrl =
    video.thumbnailUrl ||
    video.snippet?.thumbnails?.maxres?.url ||
    video.snippet?.thumbnails?.standard?.url ||
    video.snippet?.thumbnails?.high?.url ||
    video.snippet?.thumbnails?.medium?.url ||
    video.snippet?.thumbnails?.default?.url ||
    ''

  return {
    videoId: video.videoId,
    publishedAt: video.publishedAt || null,
    snippet: {
      ...(video.snippet || {}),
      title: video.title || video.snippet?.title || 'TV Câmara',
      description: video.description || video.snippet?.description || '',
      publishedAt: video.publishedAt || video.snippet?.publishedAt || null,
      thumbnails: {
        ...(video.snippet?.thumbnails || {}),
        high: video.snippet?.thumbnails?.high || { url: thumbnailUrl },
        default: video.snippet?.thumbnails?.default || { url: thumbnailUrl },
      },
    },
  }
}

async function fetchChannelVideos() {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: {
      part: 'snippet',
      channelId: CHANNEL_ID,
      maxResults: MAX_RESULTS,
      order: 'date',
      type: 'video',
      key: API_KEY,
    },
  })
  return response.data.items || []
}

export async function fetchPlaylistItems(options = {}) {
  const requestOptions = options.noCache
    ? {
        params: { t: Date.now() },
        headers: { 'Cache-Control': 'no-cache' },
      }
    : undefined

  try {
    const serverResponse = await axios.get(TV_CAMARA_VIDEOS_URL, requestOptions)
    const serverVideos = serverResponse.data?.videos || []
    if (serverResponse.data?.ok && serverVideos.length > 0) {
      return serverVideos.map(normalizeServerVideo)
    }
  } catch (err) {
    console.warn('Server playlist fetch failed, falling back to public YouTube API:', err.message)
  }

  try {
    const playlistResponse = await axios.get(`${BASE_URL}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        maxResults: MAX_RESULTS,
        playlistId: 'PLmz0IMGXMgF996ottv9cmJQvZDzglOtXR',
        key: API_KEY,
      },
    })
    const playlistItems = playlistResponse.data.items || []
    // normalize playlist items and return directly (cheap quota call)
    const normalizedPlaylist = playlistItems.map(item => ({
      videoId: item.contentDetails.videoId,
      snippet: item.snippet,
      publishedAt: item.snippet.publishedAt || item.contentDetails.videoPublishedAt || null,
    }))
    return normalizedPlaylist
  } catch (err) {
    console.warn('Playlist fetch failed, falling back to channel search:', err.message)
  }

  // fallback: try channel uploads (only used when playlist call fails)
  const channelItems = await fetchChannelVideos()
  return channelItems.map(item => ({
    videoId: item.id.videoId,
    snippet: item.snippet,
    publishedAt: item.snippet.publishedAt || null,
  }))
}

// This function uses the more expensive `search` endpoint to check for new uploads
// and merge them with the playlist. Call this only when you want to refresh the
// playlist from recent uploads (e.g. manual refresh button or low-frequency cron).
export async function refreshPlaylistFromChannel() {
  try {
    await axios.get(TV_CAMARA_SYNC_URL)
    return fetchPlaylistItems({ noCache: true })
  } catch (err) {
    console.warn('Server playlist sync failed, falling back to client refresh:', err.message)
  }

  // fetch playlist items first
  const playlist = await fetchPlaylistItems()

  // try to fetch recent uploads via search (expensive)
  try {
    const recentRes = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId: CHANNEL_ID,
        maxResults: 50,
        order: 'date',
        type: 'video',
        key: API_KEY,
      },
    })

    const recent = (recentRes.data.items || []).map(it => ({
      videoId: it.id.videoId,
      snippet: it.snippet,
      publishedAt: it.snippet.publishedAt || null,
    }))

    // merge unique by videoId, prefer recent order then playlist
    const map = new Map()
    ;[...recent, ...playlist].forEach(v => {
      if (!map.has(v.videoId)) map.set(v.videoId, v)
    })
    const merged = Array.from(map.values()).sort((a, b) => {
      const da = a.publishedAt || ''
      const db = b.publishedAt || ''
      return db.localeCompare(da)
    })
    return merged
  } catch (err) {
    console.warn('refreshPlaylistFromChannel failed:', err.message)
    return playlist
  }
}

export function startPlaylistPolling(onUpdate, intervalMs = 60000) {
  onUpdate()
  const timer = setInterval(onUpdate, intervalMs)
  return () => clearInterval(timer)
}

// Convenience function: fetch merged playlist (using refresh) and persist it.
// If `endpointUrl` is provided, POSTs the merged playlist to that endpoint
// (useful for server-side persistence with OAuth). Otherwise falls back to
// saving a cached copy in localStorage (client-side) for fast retrieval.
export async function updatePlaylistOnServer(endpointUrl) {
  const merged = await refreshPlaylistFromChannel()

  if (!merged) return null

  // try to persist remotely if endpoint provided
  if (endpointUrl) {
    try {
      const res = await axios.post(endpointUrl, { videos: merged })
      return { merged, response: res.data }
    } catch (err) {
      console.warn('Failed to POST merged playlist to server:', err.message)
      // fallthrough to local save
    }
  }

  // client-side cache fallback
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('cachedPlaylist', JSON.stringify(merged))
    }
  } catch (err) {
    console.warn('Could not save playlist to localStorage:', err.message)
  }

  return { merged }
}


// axios.defaults.baseURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&part=contentDetails&maxResults=10000&playlistId=PLmz0IMGXMgF996ottv9cmJQvZDzglOtXR&key=AIzaSyCfZfFR3QzWmQWBYMgwmXx8n2EdyjdFi2s'
