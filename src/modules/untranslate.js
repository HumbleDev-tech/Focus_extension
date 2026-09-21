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
  const inFlightTitles = new Map();
  let currentWatchVideoId = null;
  let currentOriginalTitle = null;
  let lastAppliedWatchTitleElement = null;
  let lastRestoredChaptersVideoId = null;
  let lastRestoredSnippetVideoId = null;
  let lastRestoredExpandedVideoId = null;
  let metadataRequestPending = false;
  let latestOriginalMetadata = null;
  let activeUntranslateSettings = null;

  const feedFetchQueue = [];
  const pendingFeedVideoIds = new Set();
  const observedTitleNodesByVideoId = new Map();
  let activeFeedFetches = 0;
  const MAX_CONCURRENT_FEED_FETCHES = 3;
  let feedIntersectionObserver = null;
  let untranslateDebounceTimer = null;

  // Helper to send command to Main World Agent
  function sendAgentCommand(action) {
    window.dispatchEvent(
      new CustomEvent('libertad-agent-cmd', {
        detail: { action },
      }),
    );
  }

  // Listen for broadcasted metadata from Main World Agent
  window.addEventListener('libertad-agent-metadata', (event) => {
    const detail = event?.detail;
    if (!detail || typeof detail !== 'object') return;

    const videoId = detail.videoId;
    if (
      !videoId ||
      typeof videoId !== 'string' ||
      !/^[a-zA-Z0-9_-]{11}$/.test(videoId)
    ) {
      return;
    }

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const currentVid = parseId(window.location.href);
    if (currentVid && currentVid !== videoId) {
      return;
    }

    latestOriginalMetadata = {
      videoId,
      title: typeof detail.title === 'string' ? detail.title : null,
      description:
        typeof detail.description === 'string' ? detail.description : null,
      author: typeof detail.author === 'string' ? detail.author : null,
      defaultAudioLanguage:
        typeof detail.defaultAudioLanguage === 'string'
          ? detail.defaultAudioLanguage
          : null,
    };
    metadataRequestPending = false;

    if (
      latestOriginalMetadata.title &&
      window.location.pathname === '/watch' &&
      (!activeUntranslateSettings ||
        (activeUntranslateSettings.untranslateMaster !== false &&
          activeUntranslateSettings.untranslateTitles !== false))
    ) {
      applyWatchTitle(latestOriginalMetadata.title, videoId);
    }
    if (
      !activeUntranslateSettings ||
      (activeUntranslateSettings.untranslateMaster !== false &&
        activeUntranslateSettings.untranslateDescription !== false)
    ) {
      restoreOriginalDescription(activeUntranslateSettings);
    }
    if (
      !activeUntranslateSettings ||
      (activeUntranslateSettings.untranslateMaster !== false &&
        activeUntranslateSettings.untranslateChapters !== false)
    ) {
      restoreOriginalChapters(activeUntranslateSettings);
    }
  });

  function resetUntranslateNavigation() {
    currentOriginalTitle = null;
    currentWatchVideoId = null;
    lastAppliedWatchTitleElement = null;
    lastRestoredChaptersVideoId = null;
    lastRestoredSnippetVideoId = null;
    lastRestoredExpandedVideoId = null;
    latestOriginalMetadata = null;
    metadataRequestPending = false;
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
    if (inFlightTitles.has(videoId)) {
      return inFlightTitles.get(videoId);
    }

    const fetchPromise = (async () => {
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
        try {
          chrome.runtime.sendMessage(
            { action: 'FETCH_ORIGINAL_TITLE', videoId },
            (res) => {
              if (!chrome.runtime?.id || chrome.runtime.lastError) {
                titlesCache.set(videoId, false);
                resolve(null);
                return;
              }
              const titleCandidate = res?.data?.title || res?.title;
              if (
                res?.success &&
                typeof titleCandidate === 'string' &&
                titleCandidate.trim()
              ) {
                const t = titleCandidate.trim();
                titlesCache.set(videoId, t);
                resolve(t);
              } else {
                titlesCache.set(videoId, false);
                resolve(null);
              }
            },
          );
        } catch (_) {
          titlesCache.set(videoId, false);
          resolve(null);
        }
      });
    })().finally(() => {
      inFlightTitles.delete(videoId);
    });

    inFlightTitles.set(videoId, fetchPromise);
    return fetchPromise;
  }

  const WATCH_TITLE_SELECTOR = [
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
  ].join(', ');

  // Comprehensive watch title selectors (single unified query)
  function getWatchTitleElements() {
    if (window.location.pathname !== '/watch') return [];
    const scope =
      document.querySelector('ytd-watch-metadata, #above-the-fold') || document;
    const nodes = scope.querySelectorAll(WATCH_TITLE_SELECTOR);
    return Array.from(nodes);
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
    if (settings) activeUntranslateSettings = settings;
    if (
      settings &&
      (settings.untranslateMaster === false ||
        settings.untranslateTitles === false)
    ) {
      return;
    }
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

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    if (el.tagName === 'A' && el.href) {
      const foundId = parseId(el.href);
      if (foundId) return foundId;
    }

    const a = el.closest('a');
    if (a?.href) {
      const foundId = parseId(a.href);
      if (foundId) return foundId;
    }

    const card = el.closest(
      'ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer, ytd-reel-item-renderer, yt-lockup-view-model, [class*="lockup"], [class*="item-section"]',
    );
    if (card) {
      const link = card.querySelector(
        'a[href*="watch?v="], a[href*="/shorts/"], a#video-title-link, a#thumbnail, a.ytd-thumbnail',
      );
      if (link?.href) {
        return parseId(link.href);
      }
    }

    return null;
  }

  function applyTitleToNode(titleNode, cleanTitle, videoId) {
    if (
      !titleNode ||
      !cleanTitle ||
      typeof cleanTitle !== 'string' ||
      !cleanTitle.trim()
    ) {
      return;
    }

    const clean = cleanTitle.trim();
    if (
      titleNode.dataset.libertadApplied === videoId &&
      titleNode.textContent.trim() === clean
    ) {
      return;
    }

    const childSpan = titleNode.querySelector(
      'span.yt-core-attributed-string, span[role="text"], #video-title, yt-formatted-string',
    );
    if (childSpan && childSpan !== titleNode) {
      childSpan.textContent = clean;
      childSpan.dataset.libertadApplied = videoId;
      childSpan.setAttribute('title', clean);
    } else {
      titleNode.textContent = clean;
    }

    titleNode.dataset.libertadApplied = videoId;
    delete titleNode.dataset.libertadPendingId;
    titleNode.setAttribute('title', clean);
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

  function pruneDisconnectedObservedNodes() {
    for (const [vId, set] of observedTitleNodesByVideoId.entries()) {
      for (const node of set) {
        if (!node.isConnected) {
          if (feedIntersectionObserver) {
            feedIntersectionObserver.unobserve(node);
          }
          set.delete(node);
        }
      }
      if (set.size === 0) {
        observedTitleNodesByVideoId.delete(vId);
      }
    }
  }

  function updateFeedElementsForVideoId(videoId, origTitle) {
    if (!videoId || !origTitle) return;

    const observedNodes = observedTitleNodesByVideoId.get(videoId);
    if (observedNodes) {
      observedNodes.forEach((node) => {
        if (feedIntersectionObserver) {
          feedIntersectionObserver.unobserve(node);
        }
        if (node.isConnected) {
          applyTitleToNode(node, origTitle, videoId);
        }
      });
      observedTitleNodesByVideoId.delete(videoId);
    }
    pruneDisconnectedObservedNodes();
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
          const observedNodes = observedTitleNodesByVideoId.get(videoId);
          if (observedNodes && feedIntersectionObserver) {
            observedNodes.forEach((node) => {
              feedIntersectionObserver.unobserve(node);
            });
          }
          observedTitleNodesByVideoId.delete(videoId);
        }
        processFeedFetchQueue();
      })
      .catch(() => {
        activeFeedFetches--;
        const observedNodes = observedTitleNodesByVideoId.get(videoId);
        if (observedNodes && feedIntersectionObserver) {
          observedNodes.forEach((node) => {
            feedIntersectionObserver.unobserve(node);
          });
        }
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
    pruneDisconnectedObservedNodes();

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
                const currentActualId = extractVideoId(targetNode);
                const effectiveId = currentActualId || vId;
                if (titlesCache.has(effectiveId)) {
                  const cached = titlesCache.get(effectiveId);
                  if (cached) {
                    applyTitleToNode(targetNode, cached, effectiveId);
                  }
                } else if (!pendingFeedVideoIds.has(effectiveId)) {
                  pendingFeedVideoIds.add(effectiveId);
                  feedFetchQueue.push(effectiveId);
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
    if (settings) activeUntranslateSettings = settings;
    if (
      settings &&
      (settings.untranslateMaster === false ||
        settings.untranslateTitles === false)
    ) {
      return;
    }

    const isHome =
      window.location.pathname === '/' || window.location.pathname === '';
    if (isHome && settings.hideHomeFeed) return;

    const isWatch = window.location.pathname === '/watch';
    if (isWatch && settings.hideSidebar) return;

    const titleNodes = getAllVideoTitleNodes();
    for (let i = 0; i < titleNodes.length; i++) {
      const node = titleNodes[i];
      const appliedId = node.dataset.libertadApplied;
      if (appliedId) {
        const directAnchor = node.tagName === 'A' ? node : node.closest('a');
        if (directAnchor?.href?.includes(appliedId)) {
          continue;
        }
      }

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

  // Enforce creator's original audio track (Anti AI-Dubbing)
  function enforceOriginalAudioTrack(settings) {
    if (settings) activeUntranslateSettings = settings;
    if (
      settings &&
      (settings.untranslateMaster === false ||
        settings.untranslateAudio === false)
    ) {
      return;
    }
    if (window.location.pathname !== '/watch') return;
    sendAgentCommand('ENFORCE_AUDIO');
  }

  // Clear algorithmic auto-translated subtitles
  function neutralizeAutoTranslatedCaptions(settings) {
    if (settings) activeUntranslateSettings = settings;
    if (
      settings &&
      (settings.untranslateMaster === false ||
        settings.untranslateCaptions === false)
    ) {
      return;
    }
    if (window.location.pathname !== '/watch') return;
    sendAgentCommand('NEUTRALIZE_CAPTIONS');
  }

  // Restore creator's raw untranslated video description
  function restoreOriginalDescription(settings) {
    if (settings) activeUntranslateSettings = settings;
    if (
      settings &&
      (settings.untranslateMaster === false ||
        settings.untranslateDescription === false)
    ) {
      return;
    }
    if (window.location.pathname !== '/watch') return;

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const videoId = parseId(window.location.href);
    if (!videoId) return;

    if (!latestOriginalMetadata || latestOriginalMetadata.videoId !== videoId) {
      if (!metadataRequestPending) {
        metadataRequestPending = true;
        sendAgentCommand('REQUEST_METADATA');
        setTimeout(() => {
          metadataRequestPending = false;
        }, 1500);
      }
      return;
    }

    const rawDescription = latestOriginalMetadata.description;
    if (!rawDescription || typeof rawDescription !== 'string') return;

    // 1. Update the expanded description body (revealed when clicking "...more")
    const expandedSpan =
      document.querySelector(
        '#description-inline-expander ytd-expandable-video-description-body-renderer yt-attributed-string span.yt-core-attributed-string',
      ) ||
      document.querySelector(
        '#description-inline-expander #expanded yt-attributed-string span.yt-core-attributed-string',
      ) ||
      document.querySelector(
        '#description-inline-expander #expanded yt-attributed-string',
      ) ||
      document.querySelector(
        'ytd-watch-metadata #description yt-formatted-string',
      );

    if (expandedSpan) {
      if (
        lastRestoredExpandedVideoId !== videoId ||
        expandedSpan.textContent !== rawDescription
      ) {
        expandedSpan.textContent = rawDescription;
        expandedSpan.dataset.libertadOrigApplied = videoId;
        lastRestoredExpandedVideoId = videoId;
      }
    }

    // 2. Safely update the collapsed snippet preview WITHOUT bloating or destroying line-clamping
    if (lastRestoredSnippetVideoId !== videoId) {
      const snippetSpan =
        document.querySelector(
          '#description-inline-expander #snippet yt-attributed-string span.yt-core-attributed-string',
        ) ||
        document.querySelector(
          '#description-inline-expander #snippet yt-attributed-string',
        );

      if (snippetSpan) {
        const firstLines = rawDescription
          .trim()
          .split(/\r?\n/)
          .filter(Boolean)
          .slice(0, 2)
          .join(' ');
        const previewText =
          firstLines.length > 140
            ? firstLines.slice(0, 140) + '...'
            : firstLines;

        if (previewText && snippetSpan.textContent !== previewText) {
          snippetSpan.textContent = previewText;
        }
        snippetSpan.dataset.libertadOrigApplied = videoId;
        lastRestoredSnippetVideoId = videoId;
      }
    }
  }

  // Restore creator's raw timeline chapter titles
  function restoreOriginalChapters(settings) {
    if (settings) activeUntranslateSettings = settings;
    if (
      settings &&
      (settings.untranslateMaster === false ||
        settings.untranslateChapters === false)
    ) {
      return;
    }
    if (window.location.pathname !== '/watch') return;

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const videoId = parseId(window.location.href);
    if (!videoId) return;

    if (lastRestoredChaptersVideoId === videoId) return;

    if (!latestOriginalMetadata || latestOriginalMetadata.videoId !== videoId) {
      if (!metadataRequestPending) {
        metadataRequestPending = true;
        sendAgentCommand('REQUEST_METADATA');
        setTimeout(() => {
          metadataRequestPending = false;
        }, 1500);
      }
      return;
    }

    const rawDesc = latestOriginalMetadata.description;
    if (!rawDesc) return;

    const chapterRegex =
      /(?:(?:(\d{1,2}):)?(\d{2}):(\d{2})|(\d{1,2}):(\d{2}))\s*[-–—:]?\s*([^\n\r]+)/g;
    const chapters = [];
    const matches = rawDesc.matchAll(chapterRegex);
    for (const match of matches) {
      const title = (match[6] || '').trim();
      if (title && title.length < 80) {
        chapters.push(title);
      }
    }

    if (chapters.length === 0) return;

    const chapterItems = document.querySelectorAll(
      'ytd-macro-markers-list-item-renderer',
    );
    if (chapterItems.length > 0) {
      chapterItems.forEach((item, index) => {
        if (!chapters[index]) return;
        const titleEl = item.querySelector('#details #title, h4');
        if (titleEl && titleEl.textContent.trim() !== chapters[index]) {
          titleEl.textContent = chapters[index];
        }
      });
      lastRestoredChaptersVideoId = videoId;
    }
  }

  globalThis.Libertad.updateWatchTitle = updateWatchTitle;
  globalThis.Libertad.untranslateFeed = untranslateFeed;
  globalThis.Libertad.debouncedUntranslateFeed = debouncedUntranslateFeed;
  globalThis.Libertad.resetUntranslateNavigation = resetUntranslateNavigation;
  globalThis.Libertad.enforceOriginalAudioTrack = enforceOriginalAudioTrack;
  globalThis.Libertad.neutralizeAutoTranslatedCaptions =
    neutralizeAutoTranslatedCaptions;
  globalThis.Libertad.restoreOriginalDescription = restoreOriginalDescription;
  globalThis.Libertad.restoreOriginalChapters = restoreOriginalChapters;
})();
