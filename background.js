// Libertad Service Worker
importScripts('constants.js');

async function injectYouTubeTabs() {
  if (!chrome.scripting || !chrome.tabs) return;
  try {
    const ytTabs = await chrome.tabs.query({
      url: ['*://*.youtube.com/*', '*://youtube.com/*'],
    });
    const contentScriptFiles = [
      'constants.js',
      'src/core/cache.js',
      'src/core/utils.js',
      'src/modules/styles.js',
      'src/modules/zen.js',
      'src/modules/shorts.js',
      'src/modules/subscriptions.js',
      'src/modules/dislikes.js',
      'src/modules/sponsors.js',
      'src/modules/untranslate.js',
      'content.js',
    ];

    for (const tab of ytTabs) {
      if (!tab.id || tab.url?.startsWith('chrome://')) continue;
      // Inject main world player agent
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: ['src/injected/agent.js'],
          world: 'MAIN',
        })
        .catch(() => {});

      // Inject isolated world orchestrator and modules
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: contentScriptFiles,
        })
        .catch(() => {});
    }
  } catch (_) {}
}

chrome.runtime.onStartup.addListener(async () => {
  // 1. Ensure local storage integrity and cross-storage migration on browser launch
  if (chrome.storage?.local) {
    chrome.storage.local.get(null, (localSaved) => {
      if (!localSaved || Object.keys(localSaved).length === 0) {
        if (chrome.storage?.sync) {
          chrome.storage.sync.get(null, (syncSaved) => {
            if (syncSaved && Object.keys(syncSaved).length > 0) {
              chrome.storage.local.set(syncSaved);
            } else {
              chrome.storage.local.set(DEFAULT_SETTINGS);
              chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
                // Consume lastError to prevent unhandled runtime warnings if sync is unavailable
                if (chrome.runtime?.lastError) {
                }
              });
            }
          });
        } else {
          chrome.storage.local.set(DEFAULT_SETTINGS);
        }
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  const syncStorage = (saved) => {
    if (!saved || Object.keys(saved).length === 0) {
      if (chrome.storage?.local) chrome.storage.local.set(DEFAULT_SETTINGS);
      if (chrome.storage?.sync) {
        chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
          // Consume lastError to prevent unhandled runtime warnings if sync is unavailable
          if (chrome.runtime?.lastError) {
          }
        });
      }
      return;
    }
    const currentPreset = saved.preset || 'balanced';
    const presetTemplate =
      currentPreset === 'custom'
        ? {}
        : typeof PRESET_MAP !== 'undefined' && PRESET_MAP[currentPreset]
          ? extractToggles(PRESET_MAP[currentPreset])
          : typeof PRESET_MAP !== 'undefined' && PRESET_MAP.balanced
            ? extractToggles(PRESET_MAP.balanced)
            : {};
    const merged = {
      ...DEFAULT_SETTINGS,
      ...presetTemplate,
      ...saved,
    };
    // Purge obsolete settings remnants from storage
    if ('hideSearchSuggestions' in merged) {
      delete merged.hideSearchSuggestions;
      if (chrome.storage?.sync)
        chrome.storage.sync.remove('hideSearchSuggestions');
      if (chrome.storage?.local)
        chrome.storage.local.remove('hideSearchSuggestions');
    }
    merged.profiles = {
      ...DEFAULT_SETTINGS.profiles,
      ...(saved.profiles || {}),
    };
    if (chrome.storage?.local) chrome.storage.local.set(merged);
    if (chrome.storage?.sync) {
      chrome.storage.sync.set(merged, () => {
        // Consume lastError to prevent unhandled runtime warnings if sync is unavailable
        if (chrome.runtime?.lastError) {
        }
      });
    }
  };

  if (chrome.storage?.local) {
    chrome.storage.local.get(null, (localSaved) => {
      if (localSaved && Object.keys(localSaved).length > 0) {
        syncStorage(localSaved);
      } else if (chrome.storage?.sync) {
        chrome.storage.sync.get(null, (syncSaved) => {
          syncStorage(syncSaved);
        });
      } else {
        syncStorage(null);
      }
    });
  } else if (chrome.storage?.sync) {
    chrome.storage.sync.get(null, (syncSaved) => {
      syncStorage(syncSaved);
    });
  }

  if (details?.reason === 'install') {
    // 1. Open onboarding welcome page strictly once upon first install
    chrome.storage.local.get(['hasSeenWelcome'], (res) => {
      if (!res?.hasSeenWelcome) {
        chrome.storage.local.set({ hasSeenWelcome: true });
        try {
          chrome.tabs.create({ url: 'welcome.html' });
        } catch (_) {}
      }
    });
  }

  // 2. Programmatically inject content scripts into already open YouTube tabs (install and update)
  await injectYouTubeTabs();
});

// Relay external requests to prevent CSP/CORS issues with two-level caching:
// L1: In-memory Map (synchronous)
// L2: chrome.storage.session (persists across Service Worker lifecycle suspensions)
const dislikesCache = new Map();
const titlesCache = new Map();
const sponsorsCache = new Map();
const MAX_SW_CACHE_SIZE = 200;
const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const inFlightDislikes = new Map();
const inFlightTitles = new Map();
const inFlightSponsors = new Map();

function setBoundedCache(cache, key, value) {
  if (cache.size >= MAX_SW_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, value);
}

async function pruneSessionStorage(prefix) {
  if (!chrome.storage?.session) return;
  try {
    const indexKey = `${prefix}__keys_index`;
    const res = await chrome.storage.session.get(indexKey);
    let keys = Array.isArray(res?.[indexKey]) ? res[indexKey] : [];
    if (keys.length > MAX_SW_CACHE_SIZE) {
      const toRemove = keys.slice(0, keys.length - MAX_SW_CACHE_SIZE);
      keys = keys.slice(keys.length - MAX_SW_CACHE_SIZE);
      await chrome.storage.session.remove(toRemove);
      await chrome.storage.session.set({ [indexKey]: keys });
    }
  } catch (_) {}
}

const sessionKeyQueues = new Map();

function recordSessionKey(prefix, storageKey) {
  if (!chrome.storage?.session) return Promise.resolve();
  const prevPromise = sessionKeyQueues.get(prefix) || Promise.resolve();
  const nextPromise = prevPromise
    .catch(() => {})
    .then(async () => {
      try {
        const indexKey = `${prefix}__keys_index`;
        const res = await chrome.storage.session.get(indexKey);
        const keys = Array.isArray(res?.[indexKey]) ? res[indexKey] : [];
        if (!keys.includes(storageKey)) {
          keys.push(storageKey);
          await chrome.storage.session.set({ [indexKey]: keys });
        }
        if (keys.length > MAX_SW_CACHE_SIZE + 10) {
          await pruneSessionStorage(prefix);
        }
      } catch (_) {}
    });
  sessionKeyQueues.set(prefix, nextPromise);
  return nextPromise;
}

async function getFromCache(cacheMap, prefix, key) {
  if (cacheMap.has(key)) {
    const val = cacheMap.get(key);
    cacheMap.delete(key);
    cacheMap.set(key, val);
    return val;
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
      await recordSessionKey(prefix, storageKey);
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
        if (cached.notFound) {
          sendResponse({ success: false, notFound: true, error: 'Not Found' });
          return;
        }
        sendResponse({ success: true, data: cached });
        return;
      }

      if (inFlightDislikes.has(videoId)) {
        const sharedResult = await inFlightDislikes.get(videoId);
        sendResponse(sharedResult);
        return;
      }

      const fetchPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const res = await fetch(
            `https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`,
            { signal: controller.signal },
          );
          clearTimeout(timeoutId);
          if (res.status === 404) {
            const notFoundPayload = { notFound: true, ts: Date.now() };
            await setToCache(
              dislikesCache,
              'dislikes',
              videoId,
              notFoundPayload,
            );
            return { success: false, notFound: true, error: 'Not Found' };
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          await setToCache(dislikesCache, 'dislikes', videoId, data);
          return { success: true, data };
        } catch (err) {
          clearTimeout(timeoutId);
          return { success: false, error: err.message };
        } finally {
          inFlightDislikes.delete(videoId);
        }
      })();

      inFlightDislikes.set(videoId, fetchPromise);
      const payload = await fetchPromise;
      sendResponse(payload);
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

      if (inFlightTitles.has(videoId)) {
        const sharedResult = await inFlightTitles.get(videoId);
        sendResponse(sharedResult);
        return;
      }

      const fetchPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
          // YouTube oEmbed endpoint returns untranslated original title
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
          const res = await fetch(oembedUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.status === 404) {
            const notFoundPayload = {
              success: false,
              notFound: true,
              error: 'Not Found',
              ts: Date.now(),
            };
            await setToCache(titlesCache, 'titles', videoId, notFoundPayload);
            return notFoundPayload;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const payload = {
            success: true,
            data: {
              title: data.title,
              author: data.author_name,
            },
            title: data.title,
            author: data.author_name,
          };
          await setToCache(titlesCache, 'titles', videoId, payload);
          return payload;
        } catch (err) {
          clearTimeout(timeoutId);
          return { success: false, error: err.message };
        } finally {
          inFlightTitles.delete(videoId);
        }
      })();

      inFlightTitles.set(videoId, fetchPromise);
      const payload = await fetchPromise;
      sendResponse(payload);
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

      if (inFlightSponsors.has(videoId)) {
        const sharedResult = await inFlightSponsors.get(videoId);
        sendResponse(sharedResult);
        return;
      }

      const fetchPromise = (async () => {
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
        const actionTypes = JSON.stringify(['skip']);
        const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${encodeURIComponent(categories)}&actionTypes=${encodeURIComponent(actionTypes)}`;

        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.status === 404) {
            // 404 in SponsorBlock API means no sponsor segments exist for this video
            const emptyPayload = { success: true, data: [], segments: [] };
            await setToCache(sponsorsCache, 'sponsors', videoId, emptyPayload);
            return emptyPayload;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const rawSegments = await res.json();
          const segmentsList = Array.isArray(rawSegments) ? rawSegments : [];
          const payload = {
            success: true,
            data: segmentsList,
            segments: segmentsList,
          };
          await setToCache(sponsorsCache, 'sponsors', videoId, payload);
          return payload;
        } catch (err) {
          clearTimeout(timeoutId);
          console.warn(
            '[Libertad ServiceWorker] SponsorBlock fetch error:',
            err,
          );
          return { success: false, error: err.message };
        } finally {
          inFlightSponsors.delete(videoId);
        }
      })();

      inFlightSponsors.set(videoId, fetchPromise);
      const payload = await fetchPromise;
      sendResponse(payload);
    })();

    return true;
  }

  // Gracefully handle unrecognized or empty actions to prevent dangling message channels
  sendResponse({ success: false, error: 'Unknown or unhandled action' });
  return false;
});
