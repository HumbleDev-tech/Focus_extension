// Libertad Service Worker
const DEFAULT_SETTINGS = {
  preset: 'balanced', // 'off', 'basic', 'balanced', 'extreme', 'custom'
  hideHomeFeed: false,
  hideSidebar: true,
  hideComments: true,
  hideShorts: true,
  hideEndScreens: true,
  showDislikes: true
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
      console.log('Libertad initialized with default balanced settings.');
    });
  }
});

// Relay external requests (e.g. Return YouTube Dislike API) to prevent CSP/CORS issues
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
});
