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

// Relay external requests to prevent CSP/CORS issues
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'FETCH_DISLIKES') {
    const videoId = request.videoId;
    if (!videoId) {
      sendResponse({ success: false, error: 'No video ID provided' });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch(
      `https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`,
      { signal: controller.signal },
    )
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Keep channel open for async response
  }

  if (request.action === 'FETCH_ORIGINAL_TITLE') {
    const videoId = request.videoId;
    if (!videoId) {
      sendResponse({ success: false, error: 'No video ID provided' });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // YouTube oEmbed endpoint returns untranslated original title
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
    fetch(oembedUrl, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        sendResponse({
          success: true,
          title: data.title,
          author: data.author_name,
        });
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
