/**
 * Libertad - Title Untranslation Engine
 * Reverses forced algorithmic translations across watch pages and video feeds.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  const BoundedCache =
    globalThis.Libertad.BoundedCache ||
    class {
      constructor() {
        this.map = new Map();
      }
      get(k) {
        return this.map.get(k);
      }
      set(k, v) {
        this.map.set(k, v);
      }
      has(k) {
        return this.map.has(k);
      }
      clear() {
        this.map.clear();
      }
    };

  const titlesCache = new BoundedCache(300);
  let currentWatchVideoId = null;
  let currentOriginalTitle = null;
  let lastAppliedWatchTitleElement = null;

  const feedFetchQueue = [];
  const pendingFeedVideoIds = new Set();
  const observedTitleNodesByVideoId = new Map();
  let activeFeedFetches = 0;
  const MAX_CONCURRENT_FEED_FETCHES = 3;
  let feedIntersectionObserver = null;
  let untranslateDebounceTimer = null;

  function resetUntranslateNavigation() {
    currentOriginalTitle = null;
    currentWatchVideoId = null;
    lastAppliedWatchTitleElement = null;
    feedFetchQueue.length = 0;
    pendingFeedVideoIds.clear();
    observedTitleNodesByVideoId.clear();
    if (feedIntersectionObserver) {
      feedIntersectionObserver.disconnect();
    }
  }

  // Fetch true original title (direct same-origin oEmbed + background fallback)
  async function fetchOriginalTitle(videoId) {
    if (!videoId) return null;
    if (titlesCache.has(videoId)) {
      const cached = titlesCache.get(videoId);
      return cached ? cached : null;
    }

    // 1. Direct same-origin oEmbed fetch (~25ms response)
    try {
      const oembedUrl = `/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data?.title) {
          const t = data.title.trim();
          titlesCache.set(videoId, t);
          return t;
        }
      } else if (
        res.status === 404 ||
        res.status === 401 ||
        res.status === 403
      ) {
        // Definitive client/video error: skip redundant background worker fetch
        titlesCache.set(videoId, false);
        return null;
      }
    } catch (_) {}

    // 2. Fallback to background worker
    if (!chrome.runtime?.id) return null;
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'FETCH_ORIGINAL_TITLE', videoId },
        (res) => {
          if (!chrome.runtime.lastError && res && res.success && res.title) {
            const t = res.title.trim();
            titlesCache.set(videoId, t);
            resolve(t);
          } else {
            titlesCache.set(videoId, false);
            resolve(null);
          }
        },
      );
    });
  }

  // Comprehensive watch title selectors
  function getWatchTitleElements() {
    const elements = [];
    const selectors = [
      'watch-metadata-view-model #title yt-formatted-string',
      'watch-metadata-view-model #title h1',
      'watch-metadata-view-model h1',
      'watch-metadata-view-model [role="heading"]',
      'ytd-watch-metadata #title yt-formatted-string',
      'ytd-watch-metadata #title h1',
      'ytd-watch-metadata h1 yt-formatted-string',
      'ytd-watch-metadata h1',
      '#above-the-fold #title yt-formatted-string',
      '#above-the-fold #title h1',
      '#above-the-fold h1',
      '#title:has(h1) h1',
      'h1.style-scope.ytd-watch-metadata yt-formatted-string',
      'h1.style-scope.ytd-watch-metadata',
      '#title.style-scope.ytd-watch-metadata yt-formatted-string',
      'ytd-watch-flexy:not([hidden]) #container > h1 > yt-formatted-string',
      'ytd-video-primary-info-renderer h1.title yt-formatted-string',
      'h1.title yt-formatted-string',
      'h1.title > *',
    ];

    for (const sel of selectors) {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach((node) => {
        if (!elements.includes(node)) {
          elements.push(node);
        }
      });
    }
    return elements;
  }

  // Apply original title to watch page
  function applyWatchTitle(originalTitle, videoId) {
    if (!originalTitle?.trim()) return false;

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const currentParam = parseId(window.location.href);
    if (videoId && currentParam && currentParam !== videoId) {
      return false;
    }

    const clean = originalTitle.trim();
    currentOriginalTitle = clean;

    let modified = false;
    const titleNodes = getWatchTitleElements();
    if (titleNodes.length > 0) {
      lastAppliedWatchTitleElement = titleNodes[0];
    }
    titleNodes.forEach((node) => {
      if (node.textContent !== clean) {
        node.textContent = clean;
        node.removeAttribute('is-empty');
        node.setAttribute('title', clean);
        modified = true;
      }
      if (node.parentElement && node.parentElement.tagName === 'H1') {
        node.parentElement.setAttribute('title', clean);
      }
    });

    if (document.title && !document.title.startsWith(clean)) {
      document.title = `${clean} - YouTube`;
    }

    return modified;
  }

  // Untranslate title on watch page
  function updateWatchTitle(settings) {
    if (!settings?.untranslateTitles) return;
    if (window.location.pathname !== '/watch') return;

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const videoId = parseId(window.location.href);
    if (!videoId) return;

    if (currentWatchVideoId !== videoId) {
      currentWatchVideoId = videoId;
      currentOriginalTitle = null;
    }

    if (currentOriginalTitle) {
      // Fast path: if the previously updated title element is still connected and intact, avoid running queries
      if (
        lastAppliedWatchTitleElement?.isConnected &&
        lastAppliedWatchTitleElement.textContent.trim() ===
          currentOriginalTitle &&
        (!document.title || document.title.startsWith(currentOriginalTitle))
      ) {
        return;
      }

      const titleNodes = getWatchTitleElements();
      const needsUpdate = titleNodes.some(
        (node) => node.textContent.trim() !== currentOriginalTitle,
      );
      if (
        !needsUpdate &&
        (!document.title || document.title.startsWith(currentOriginalTitle))
      ) {
        return;
      }
      applyWatchTitle(currentOriginalTitle, videoId);
      return;
    }

    fetchOriginalTitle(videoId).then((orig) => {
      const currentParam = parseId(window.location.href);
      if (currentParam === videoId && orig) {
        currentOriginalTitle = orig;
        applyWatchTitle(orig, videoId);
      }
    });
  }

  function getAllVideoTitleNodes() {
    const root =
      document.querySelector('ytd-page-manager') ||
      document.querySelector('#contents') ||
      document.body;
    if (!root) return [];

    const nodesSet = new Set();
    const elements = root.querySelectorAll(
      '#video-title, yt-formatted-string#video-title, a#video-title-link, a#video-title, h3 a[href*="watch?v="], h3 a[href*="/shorts/"], [class*="lockup-metadata"] h3 a, [class*="lockup-metadata"] [role="heading"] a, a.yt-lockup-metadata-view-model-wiz__title, h3.yt-lockup-metadata-view-model-wiz__heading-reset',
    );

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (
        el.closest(
          'ytd-watch-metadata, #above-the-fold, #thumbnail, ytd-thumbnail, [class*="content-image"], [class*="thumbnail"], ytd-playlist-thumbnail',
        )
      ) {
        continue;
      }

      const inner = el.querySelector(
        'span.yt-core-attributed-string, span[role="text"], #video-title, yt-formatted-string',
      );
      nodesSet.add(inner || el);
    }

    return Array.from(nodesSet);
  }

  function extractVideoId(el) {
    if (!el) return null;
    if (el.dataset?.libertadVideoId) {
      return el.dataset.libertadVideoId;
    }

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    let foundId = null;

    if (el.tagName === 'A' && el.href) {
      foundId = parseId(el.href);
    }

    if (!foundId) {
      const a = el.closest('a');
      if (a?.href) {
        foundId = parseId(a.href);
      }
    }

    if (!foundId) {
      const card = el.closest(
        'ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer, ytd-reel-item-renderer, yt-lockup-view-model, [class*="lockup"], [class*="item-section"]',
      );
      if (card) {
        const link = card.querySelector(
          'a[href*="watch?v="], a[href*="/shorts/"], a#video-title-link, a#thumbnail, a.ytd-thumbnail',
        );
        if (link?.href) {
          foundId = parseId(link.href);
        }
      }
    }

    if (foundId && el.dataset) {
      el.dataset.libertadVideoId = foundId;
    }

    return foundId;
  }

  function applyTitleToNode(titleNode, cleanTitle, videoId) {
    if (!titleNode || !cleanTitle) return;

    if (
      titleNode.dataset.libertadApplied === videoId &&
      titleNode.textContent.trim() === cleanTitle
    ) {
      return;
    }

    const childSpan = titleNode.querySelector(
      'span.yt-core-attributed-string, span[role="text"], #video-title, yt-formatted-string',
    );
    if (childSpan && childSpan !== titleNode) {
      childSpan.textContent = cleanTitle;
      childSpan.dataset.libertadApplied = videoId;
      childSpan.setAttribute('title', cleanTitle);
    } else {
      titleNode.textContent = cleanTitle;
    }

    titleNode.dataset.libertadApplied = videoId;
    titleNode.setAttribute('title', cleanTitle);
    titleNode.removeAttribute('is-empty');

    const parentCard = titleNode.closest(
      'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model',
    );
    if (parentCard) {
      const mainLink = parentCard.querySelector(
        'a#video-title-link, a#video-title, h3 a',
      );
      if (mainLink) {
        mainLink.setAttribute('title', cleanTitle);
        mainLink.setAttribute('aria-label', cleanTitle);
      }
    }
  }

  function updateFeedElementsForVideoId(videoId, origTitle) {
    if (!videoId || !origTitle) return;

    const observedNodes = observedTitleNodesByVideoId.get(videoId);
    if (observedNodes) {
      observedNodes.forEach((node) => {
        if (node.isConnected) {
          applyTitleToNode(node, origTitle, videoId);
        }
      });
      observedTitleNodesByVideoId.delete(videoId);
    }
  }

  function processFeedFetchQueue() {
    if (activeFeedFetches >= MAX_CONCURRENT_FEED_FETCHES) return;
    if (feedFetchQueue.length === 0) return;

    const videoId = feedFetchQueue.shift();
    pendingFeedVideoIds.delete(videoId);

    if (titlesCache.has(videoId)) {
      const cached = titlesCache.get(videoId);
      if (cached) {
        updateFeedElementsForVideoId(videoId, cached);
      }
      processFeedFetchQueue();
      return;
    }

    activeFeedFetches++;
    fetchOriginalTitle(videoId)
      .then((origTitle) => {
        activeFeedFetches--;
        if (origTitle) {
          updateFeedElementsForVideoId(videoId, origTitle);
        } else {
          observedTitleNodesByVideoId.delete(videoId);
        }
        processFeedFetchQueue();
      })
      .catch(() => {
        activeFeedFetches--;
        observedTitleNodesByVideoId.delete(videoId);
        processFeedFetchQueue();
      });
  }

  function observeVideoTitleForFeed(node, videoId) {
    if (!node || !videoId) return;

    let nodeList = observedTitleNodesByVideoId.get(videoId);
    if (!nodeList) {
      nodeList = new Set();
      observedTitleNodesByVideoId.set(videoId, nodeList);
    }
    nodeList.add(node);

    if (!feedIntersectionObserver) {
      feedIntersectionObserver = new IntersectionObserver(
        (entries) => {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.isIntersecting) {
              const targetNode = entry.target;
              feedIntersectionObserver.unobserve(targetNode);
              const vId = targetNode.dataset.libertadPendingId;
              if (vId) {
                if (titlesCache.has(vId)) {
                  const cached = titlesCache.get(vId);
                  if (cached) {
                    applyTitleToNode(targetNode, cached, vId);
                  }
                } else if (!pendingFeedVideoIds.has(vId)) {
                  pendingFeedVideoIds.add(vId);
                  feedFetchQueue.push(vId);
                  processFeedFetchQueue();
                }
              }
            }
          }
        },
        { rootMargin: '250px 0px' },
      );
    }

    node.dataset.libertadPendingId = videoId;
    feedIntersectionObserver.observe(node);
  }

  function untranslateFeed(settings) {
    if (!settings?.untranslateTitles) return;

    const isHome =
      window.location.pathname === '/' || window.location.pathname === '';
    if (isHome && settings.hideHomeFeed) return;

    const isWatch = window.location.pathname === '/watch';
    if (isWatch && settings.hideSidebar) return;

    const titleNodes = getAllVideoTitleNodes();
    for (let i = 0; i < titleNodes.length; i++) {
      const node = titleNodes[i];
      const videoId = extractVideoId(node);
      if (!videoId) continue;

      if (titlesCache.has(videoId)) {
        const cached = titlesCache.get(videoId);
        if (cached) {
          applyTitleToNode(node, cached, videoId);
        }
      } else if (
        node.dataset.libertadApplied !== videoId &&
        node.dataset.libertadPendingId !== videoId
      ) {
        observeVideoTitleForFeed(node, videoId);
      }
    }
  }

  function debouncedUntranslateFeed(settings) {
    if (untranslateDebounceTimer) return;
    untranslateDebounceTimer = setTimeout(() => {
      untranslateDebounceTimer = null;
      untranslateFeed(settings);
    }, 250);
  }

  globalThis.Libertad.updateWatchTitle = updateWatchTitle;
  globalThis.Libertad.untranslateFeed = untranslateFeed;
  globalThis.Libertad.debouncedUntranslateFeed = debouncedUntranslateFeed;
  globalThis.Libertad.resetUntranslateNavigation = resetUntranslateNavigation;
})();
