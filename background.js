// Libertad Service Worker
const DEFAULT_SETTINGS = {
  preset: 'balanced', // 'off', 'basic', 'balanced', 'extreme', 'custom'
  theme: 'dark',      // 'dark', 'light', 'oled'
  hideHomeFeed: false,
  hideSidebar: true,
  hideComments: true,
  hideShorts: true,
  hideEndScreens: true,
  showDislikes: true,
  untranslateTitles: true,
  customConfig: {
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true
  }
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
});

// Relay external requests to prevent CSP/CORS issues
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FETCH_DISLIKES') {
    const videoId = request.videoId;
    if (!videoId) {
      sendResponse({ success: false, error: 'No video ID provided' });
      return;
    }

    fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((err) => {
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

    // YouTube oEmbed endpoint returns untranslated original title
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
    fetch(oembedUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        sendResponse({ success: true, title: data.title, author: data.author_name });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
