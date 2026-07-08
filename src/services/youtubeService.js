import axios from 'axios'

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || null;
const CHANNEL_ID = 'UCDIm8G-WBXBXbRpCNwwI_Wg'
const BASE_URL = 'https://www.googleapis.com/youtube/v3'
const MAX_RESULTS = 50

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

export async function fetchPlaylistItems() {
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


// axios.defaults.baseURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&part=contentDetails&maxResults=10000&playlistId=PLmz0IMGXMgF996ottv9cmJQvZDzglOtXR&key=<YOUR_API_KEY>'

// YouTube OAuth credentials are stored securely in Firebase configuration.
// Do not commit any OAuth client IDs, secrets, API keys, or refresh tokens to source control.
