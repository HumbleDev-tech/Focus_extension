// Libertad Service Worker
importScripts('constants.js');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(null, (saved) => {
    const merged = { ...DEFAULT_SETTINGS, ...(saved || {}) };
    merged.customConfig = {
      ...DEFAULT_SETTINGS.customConfig,
      ...(saved?.customConfig || {}),
    };
    chrome.storage.sync.set(merged);
  });
});

// Relay external requests to prevent CSP/CORS issues with two-level caching:
// L1: In-memory Map (synchronous)
// L2: chrome.storage.session (persists across Service Worker lifecycle suspensions)
const dislikesCache = new Map();
const titlesCache = new Map();
const sponsorsCache = new Map();
const MAX_SW_CACHE_SIZE = 200;
const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

function setBoundedCache(cache, key, value) {
  if (cache.size >= MAX_SW_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, value);
}

async function getFromCache(cacheMap, prefix, key) {
  if (cacheMap.has(key)) {
    return cacheMap.get(key);
  }
  if (chrome.storage?.session) {
    try {
      const storageKey = `${prefix}_${key}`;
      const res = await chrome.storage.session.get(storageKey);
      if (res && res[storageKey] !== undefined) {
        setBoundedCache(cacheMap, key, res[storageKey]);
        return res[storageKey];
      }
    } catch (_) {}
  }
  return undefined;
}

async function setToCache(cacheMap, prefix, key, value) {
  setBoundedCache(cacheMap, key, value);
  if (chrome.storage?.session) {
    try {
      const storageKey = `${prefix}_${key}`;
      await chrome.storage.session.set({ [storageKey]: value });
    } catch (_) {}
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'FETCH_DISLIKES') {
    const videoId = request.videoId;
    if (!videoId || !YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
      sendResponse({ success: false, error: 'Invalid or missing video ID' });
      return;
    }

    (async () => {
      const cached = await getFromCache(dislikesCache, 'dislikes', videoId);
      if (cached) {
        sendResponse({ success: true, data: cached });
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(
          `https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`,
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await setToCache(dislikesCache, 'dislikes', videoId, data);
        sendResponse({ success: true, data });
      } catch (err) {
        clearTimeout(timeoutId);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true; // Keep channel open for async response
  }

  if (request.action === 'FETCH_ORIGINAL_TITLE') {
    const videoId = request.videoId;
    if (!videoId || !YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
      sendResponse({ success: false, error: 'Invalid or missing video ID' });
      return;
    }

    (async () => {
      const cached = await getFromCache(titlesCache, 'titles', videoId);
      if (cached) {
        sendResponse(cached);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        // YouTube oEmbed endpoint returns untranslated original title
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
        const res = await fetch(oembedUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const payload = {
          success: true,
          title: data.title,
          author: data.author_name,
        };
        await setToCache(titlesCache, 'titles', videoId, payload);
        sendResponse(payload);
      } catch (err) {
        clearTimeout(timeoutId);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }

  if (request.action === 'FETCH_SPONSORS') {
    const videoId = request.videoId;
    if (!videoId || !YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
      sendResponse({ success: false, error: 'Invalid or missing video ID' });
      return;
    }

    (async () => {
      const cached = await getFromCache(sponsorsCache, 'sponsors', videoId);
      if (cached) {
        sendResponse(cached);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const categories = JSON.stringify([
        'sponsor',
        'selfpromo',
        'interaction',
        'intro',
        'outro',
        'preview',
        'music_offtopic',
      ]);
      const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${encodeURIComponent(categories)}`;

      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.status === 404) {
          // 404 in SponsorBlock API means no sponsor segments exist for this video
          const emptyPayload = { success: true, segments: [] };
          await setToCache(sponsorsCache, 'sponsors', videoId, emptyPayload);
          sendResponse(emptyPayload);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const segments = await res.json();
        const payload = {
          success: true,
          segments: Array.isArray(segments) ? segments : [],
        };
        await setToCache(sponsorsCache, 'sponsors', videoId, payload);
        sendResponse(payload);
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn('[Libertad ServiceWorker] SponsorBlock fetch error:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }
});
