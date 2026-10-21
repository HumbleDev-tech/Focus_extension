/**
 * Libertad - Title Untranslation Engine
 * Reverses forced algorithmic translations across watch pages and video feeds.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  // The bounded cache lives in src/core/cache.js, which the manifest always
  // loads before this module. Map is the API-compatible fallback for the
  // rare case where it is missing: it is unbounded, but it never breaks the
  // module.
  const CacheCtor = globalThis.Libertad?.BoundedCache;

  const titlesCache = CacheCtor ? new CacheCtor(300) : new Map();
  const inFlightTitles = new Map();
  let currentWatchVideoId = null;
  let currentOriginalTitle = null;
  // Localized text captured before this module overwrites it, so the change
  // can be reverted when the user turns Untranslate off.
  let originalDocumentTitle = null;
  let lastAppliedWatchTitleElement = null;
  let lastRestoredChaptersVideoId = null;
  let lastRestoredSnippetVideoId = null;
  let lastRestoredExpandedVideoId = null;
  let metadataRequestPending = false;
  let latestOriginalMetadata = null;
  let activeUntranslateSettings = null;
  // Hydration guard: irreversible actions (network lookups, agent commands
  // that mutate the player) must wait until settings storage has been read.
  // Starts as false: before the first init() the module is not hydrated yet,
  // so a premature agent broadcast must not reach the DOM.
  let moduleHydrated = false;

  function getVideoId(url) {
    if (typeof globalThis.Libertad?.parseYouTubeVideoId === 'function') {
      return globalThis.Libertad.parseYouTubeVideoId(url);
    }
    const m = (url || '').match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  const feedFetchQueue = [];
  const pendingFeedVideoIds = new Set();
  const observedTitleNodesByVideoId = new Map();
  let activeFeedFetches = 0;
  const MAX_CONCURRENT_FEED_FETCHES = 3;
  // Minimum spacing between oEmbed lookups. Without it a busy home feed
  // fires one request per visible card at once and trips YouTube's own rate
  // limiter, which makes the feature degrade itself.
  const MIN_FEED_FETCH_INTERVAL_MS = 200;
  // Bounded retries per card: a transient network failure must not disable
  // the translation forever, but a permanently failing video must not be
  // requested on every DOM mutation either.
  const MAX_TITLE_FETCH_TRIES = 2;
  let lastFeedFetchStartedAt = 0;
  let feedThrottleTimer = null;
  let feedRetryTimer = null;
  let feedIntersectionObserver = null;
  let untranslateDebounceTimer = null;
  let metadataRequestTimer = null;
  const titleHealTimers = new Map();

  // Helper to send command to Main World Agent
  function sendAgentCommand(action) {
    window.dispatchEvent(
      new CustomEvent('libertad-agent-cmd', {
        detail: { action },
      }),
    );
  }

  // Asks the agent for the original metadata, at most once per window.
  // The pending flag is released by a tracked timer: an untracked one would
  // survive destroy() and reset the flag of an already torn down module.
  function requestOriginalMetadata() {
    if (metadataRequestPending) return;
    metadataRequestPending = true;
    sendAgentCommand('REQUEST_METADATA');
    if (metadataRequestTimer) clearTimeout(metadataRequestTimer);
    metadataRequestTimer = setTimeout(() => {
      metadataRequestTimer = null;
      metadataRequestPending = false;
    }, 1500);
  }

  // Listen for broadcasted metadata from Main World Agent
  const onAgentMetadata = (event) => {
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

    const currentVid = getVideoId(window.location.href);
    if (currentVid && currentVid !== videoId) {
      return;
    }

    const cleanTitle =
      typeof detail.title === 'string' && detail.title.trim()
        ? detail.title.trim()
        : null;

    if (cleanTitle) {
      titlesCache.set(videoId, cleanTitle);
    }

    latestOriginalMetadata = {
      videoId,
      title: cleanTitle,
      description:
        typeof detail.description === 'string' ? detail.description : null,
      author: typeof detail.author === 'string' ? detail.author : null,
      defaultAudioLanguage:
        typeof detail.defaultAudioLanguage === 'string'
          ? detail.defaultAudioLanguage
          : null,
    };
    metadataRequestPending = false;

    // Caching the raw metadata above is safe at any time (pure data, no side
    // effects). Applying it to the DOM is gated: pre-hydration broadcasts
    // still carry default settings, so writing them would override a user who
    // actually disabled the Untranslate suite.
    if (
      moduleHydrated &&
      latestOriginalMetadata.title &&
      window.location.pathname === '/watch' &&
      (!activeUntranslateSettings ||
        (activeUntranslateSettings.untranslateMaster !== false &&
          activeUntranslateSettings.untranslateTitles !== false))
    ) {
      applyWatchTitle(latestOriginalMetadata.title, videoId);
    }
    if (
      moduleHydrated &&
      (!activeUntranslateSettings ||
        (activeUntranslateSettings.untranslateMaster !== false &&
          activeUntranslateSettings.untranslateDescription !== false))
    ) {
      restoreOriginalDescription(activeUntranslateSettings);
    }
    if (
      moduleHydrated &&
      (!activeUntranslateSettings ||
        (activeUntranslateSettings.untranslateMaster !== false &&
          activeUntranslateSettings.untranslateChapters !== false))
    ) {
      restoreOriginalChapters(activeUntranslateSettings);
    }
  };

  window.addEventListener('libertad-agent-metadata', onAgentMetadata);

  function resetUntranslateNavigation() {
    currentOriginalTitle = null;
    currentWatchVideoId = null;
    lastAppliedWatchTitleElement = null;
    lastRestoredChaptersVideoId = null;
    lastRestoredSnippetVideoId = null;
    lastRestoredExpandedVideoId = null;
    latestOriginalMetadata = null;
    metadataRequestPending = false;
    if (metadataRequestTimer) {
      clearTimeout(metadataRequestTimer);
      metadataRequestTimer = null;
    }
    feedFetchQueue.length = 0;
    pendingFeedVideoIds.clear();
    observedTitleNodesByVideoId.clear();
    if (pruneTimer) {
      clearTimeout(pruneTimer);
      pruneTimer = null;
    }
    if (feedThrottleTimer) {
      clearTimeout(feedThrottleTimer);
      feedThrottleTimer = null;
    }
    if (feedRetryTimer) {
      clearTimeout(feedRetryTimer);
      feedRetryTimer = null;
    }
    if (feedIntersectionObserver) {
      feedIntersectionObserver.disconnect();
    }
    for (const timer of titleHealTimers.values()) {
      clearTimeout(timer);
    }
    titleHealTimers.clear();
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
      // 1. Direct same-origin oEmbed fetch (~25ms response).
      // Bounded by an AbortController: a stalled connection would keep the
      // in-flight entry alive forever and block the background fallback for
      // this video.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const oembedUrl = `/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
        const res = await fetch(oembedUrl, { signal: controller.signal });
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
      } catch (_) {
      } finally {
        clearTimeout(timeout);
      }

      // 2. Fallback to background worker
      if (!chrome.runtime?.id) return null;
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(
            { action: 'FETCH_ORIGINAL_TITLE', videoId },
            (res) => {
              if (!chrome.runtime?.id || chrome.runtime.lastError) {
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
              } else if (res?.notFound) {
                // Definitive 404 from background worker: safe to cache as false to avoid repeated lookups
                titlesCache.set(videoId, false);
                resolve(null);
              } else {
                // Transient failure (network error, timeout, 429): do NOT poison cache!
                resolve(null);
              }
            },
          );
        } catch (_) {
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

  // True when the title-rewriting half of the suite is still enabled and the
  // module has been hydrated. Every write path funnels through this check:
  // a title lookup resolves seconds after it was issued, and the user may
  // have turned the suite off in the meantime. A stale response must never
  // re-apply the original title (same rule the dislikes and sponsors
  // modules already follow for their own network calls).
  function isUntranslateTitlesEnabled() {
    if (!moduleHydrated) return false;
    const active = activeUntranslateSettings;
    if (!active) return false;
    return (
      active.untranslateMaster !== false && active.untranslateTitles !== false
    );
  }

  // Apply original title to watch page
  function applyWatchTitle(originalTitle, videoId) {
    if (!originalTitle?.trim()) return false;
    if (!isUntranslateTitlesEnabled()) return false;

    const currentParam = getVideoId(window.location.href);
    if (videoId && currentParam && currentParam !== videoId) {
      return false;
    }

    const clean = originalTitle.trim();
    currentOriginalTitle = clean;
    if (videoId) {
      titlesCache.set(videoId, clean);
    }

    let modified = false;
    const titleNodes = getWatchTitleElements();
    // The h1 contains the yt-formatted-string: writing to both of them puts
    // the title twice on screen. Only the innermost match owns the text.
    const leafNodes = titleNodes.filter(
      (node) =>
        !titleNodes.some((other) => other !== node && node.contains(other)),
    );
    if (leafNodes.length > 0) {
      lastAppliedWatchTitleElement = leafNodes[0];
    }
    leafNodes.forEach((node) => {
      if (node.textContent !== clean) {
        captureOriginalText(node);
        if (!setTitleText(node, clean)) return;
        node.removeAttribute('is-empty');
        node.setAttribute('title', clean);
        modified = true;
      }
      if (node.parentElement && node.parentElement.tagName === 'H1') {
        node.parentElement.setAttribute('title', clean);
      }
    });

    if (document.title) {
      const notifPrefix = (document.title.match(/^\(\d+\)\s*/) || [''])[0];
      const titleWithoutCount = document.title.replace(/^\(\d+\)\s*/, '');
      if (!titleWithoutCount.startsWith(clean)) {
        if (originalDocumentTitle === null) {
          originalDocumentTitle = document.title;
        }
        document.title = `${notifPrefix}${clean} - YouTube`;
      }
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

    const videoId = getVideoId(window.location.href);
    if (!videoId) return;

    if (currentWatchVideoId !== videoId) {
      currentWatchVideoId = videoId;
      currentOriginalTitle = null;
    }

    if (!currentOriginalTitle && titlesCache.has(videoId)) {
      const cached = titlesCache.get(videoId);
      if (typeof cached === 'string' && cached) {
        currentOriginalTitle = cached;
      }
    }

    if (currentOriginalTitle) {
      // Fast path: if the previously updated title element is still connected and intact, avoid running queries
      const cleanDocTitle = document.title
        ? document.title.replace(/^\(\d+\)\s*/, '')
        : '';
      if (
        lastAppliedWatchTitleElement?.isConnected &&
        lastAppliedWatchTitleElement.textContent.trim() ===
          currentOriginalTitle &&
        (!document.title || cleanDocTitle.startsWith(currentOriginalTitle))
      ) {
        return;
      }

      const titleNodes = getWatchTitleElements();
      const needsUpdate = titleNodes.some(
        (node) => node.textContent.trim() !== currentOriginalTitle,
      );
      if (
        !needsUpdate &&
        (!document.title || cleanDocTitle.startsWith(currentOriginalTitle))
      ) {
        return;
      }
      applyWatchTitle(currentOriginalTitle, videoId);
      return;
    }

    fetchOriginalTitle(videoId).then((orig) => {
      const currentParam = getVideoId(window.location.href);
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

    if (el.tagName === 'A' && el.href) {
      const foundId = getVideoId(el.href);
      if (foundId) return foundId;
    }

    const a = el.closest('a');
    if (a?.href) {
      const foundId = getVideoId(a.href);
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
        return getVideoId(link.href);
      }
    }

    return null;
  }

  // In-place text writer: only updates existing text nodes, never wipes the
  // element. A full textContent wipe destroys YouTube's internal Lit markers
  // and node references, which blanked titles after SPA re-renders.
  function setTitleText(el, text) {
    const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node = walker.nextNode();
    let target = null;
    while (node) {
      textNodes.push(node);
      if (!target && (node.nodeValue || '').trim()) {
        target = node;
      }
      node = walker.nextNode();
    }

    // No text nodes yet: YouTube has not rendered this title. Creating one
    // here looks like a fix, but YouTube renders its own right after and the
    // two end up concatenated. Skip it and retry on the next pass.
    if (textNodes.length === 0) {
      return false;
    }

    if (!target) {
      target = textNodes[0];
    }
    for (let i = 0; i < textNodes.length; i++) {
      const current = textNodes[i];
      if (current === target) {
        current.nodeValue = text;
      } else if ((current.nodeValue || '').trim()) {
        current.nodeValue = '';
      }
    }
    return true;
  }

  // Captures the localized text before this module overwrites it. Only the
  // first capture wins: later writes (heals, re-renders) must keep the
  // original localized text, not the already translated one.
  function captureOriginalText(node) {
    if (!node || node.dataset.libertadOrigText !== undefined) return;
    const text = node.textContent;
    // An empty title has nothing to restore: capturing it would let a later
    // restore wipe the text YouTube rendered in the meantime.
    if (!text?.trim()) return;
    node.dataset.libertadOrigText = text;
  }

  // Reverts every text this module rewrote (titles, description, chapters)
  // and clears its tracking markers. Called when the user disables
  // Untranslate: without it the translated text stays on screen until
  // YouTube happens to re-render the node.
  function restoreOriginalTexts() {
    const nodes = document.querySelectorAll('[data-libertad-orig-text]');
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // The restore only succeeds when the node still holds a text node to
      // write into. YouTube can replace the content between the capture and
      // the restore; dropping the captured text then would lose the
      // localized title for good, so the marker survives until a restore
      // can actually put the text back.
      const restored = setTitleText(node, node.dataset.libertadOrigText);
      if (restored) {
        delete node.dataset.libertadOrigText;
        node.removeAttribute('title');
        if (node.parentElement?.tagName === 'H1') {
          node.parentElement.removeAttribute('title');
        }
      }
      delete node.dataset.libertadOrigApplied;
      delete node.dataset.libertadPendingId;
      delete node.dataset.libertadHealTries;
      delete node.dataset.libertadFetchTries;
      // The applied marker may sit on a wrapper while the text was written
      // to a child element: clear it on the node and its direct ancestors,
      // otherwise the feed pass believes the card is still translated.
      let owner = node;
      for (let up = 0; up < 3 && owner; up++) {
        delete owner.dataset.libertadApplied;
        owner = owner.parentElement;
      }
    }
    if (originalDocumentTitle) {
      document.title = originalDocumentTitle;
      originalDocumentTitle = null;
    }
    // Reset the "already applied" bookkeeping so the features that are
    // still enabled re-apply their content in the same tick.
    currentOriginalTitle = null;
    lastRestoredExpandedVideoId = null;
    lastRestoredSnippetVideoId = null;
    lastRestoredChaptersVideoId = null;
  }

  // Self-healing: if a later YouTube re-render empties a title we already
  // applied, re-apply it (bounded to avoid any tug-of-war).
  const TITLE_HEAL_DELAY = 1000;
  const TITLE_HEAL_MAX_ATTEMPTS = 2;
  function scheduleTitleHeal(titleNode, clean, videoId) {
    const pending = titleHealTimers.get(titleNode);
    if (pending) {
      clearTimeout(pending);
    }
    const attempts = Number(titleNode.dataset.libertadHealTries || '0');
    if (attempts >= TITLE_HEAL_MAX_ATTEMPTS) {
      return;
    }
    const timer = setTimeout(() => {
      titleHealTimers.delete(titleNode);
      if (!titleNode.isConnected) return;
      if (titleNode.dataset.libertadApplied !== videoId) return;
      if (titleNode.textContent.trim()) return;
      titleNode.dataset.libertadHealTries = String(attempts + 1);
      applyTitleToNode(titleNode, clean, videoId);
    }, TITLE_HEAL_DELAY);
    titleHealTimers.set(titleNode, timer);
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
    // Same guard as the watch title: a card can be written by a lookup that
    // was already in flight when the user turned the suite off.
    if (!isUntranslateTitlesEnabled()) return;

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
      captureOriginalText(childSpan);
      // Nothing was written: YouTube has not rendered the title yet. Leave
      // the node unmarked so the next pass picks it up again.
      if (!setTitleText(childSpan, clean)) return;
      childSpan.dataset.libertadApplied = videoId;
      childSpan.setAttribute('title', clean);
    } else {
      captureOriginalText(titleNode);
      if (!setTitleText(titleNode, clean)) return;
    }

    titleNode.dataset.libertadApplied = videoId;
    delete titleNode.dataset.libertadPendingId;
    delete titleNode.dataset.libertadFetchTries;
    titleNode.setAttribute('title', clean);
    titleNode.removeAttribute('is-empty');
    scheduleTitleHeal(titleNode, clean, videoId);
  }

  let pruneTimer = null;
  function schedulePruneDisconnectedNodes() {
    if (pruneTimer) return;
    pruneTimer = setTimeout(() => {
      pruneTimer = null;
      pruneDisconnectedObservedNodes();
    }, 2000);
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
    schedulePruneDisconnectedNodes();
  }

  // Releases the nodes tracked for a video whose title lookup failed.
  // The pending marker is cleared so the next pass can retry the card:
  // keeping it would make the fast bailout in untranslateFeed() skip that
  // card forever. The attempt counter bounds the retries.
  function releaseObservedNodes(videoId) {
    const observedNodes = observedTitleNodesByVideoId.get(videoId);
    if (observedNodes) {
      observedNodes.forEach((node) => {
        if (feedIntersectionObserver) {
          feedIntersectionObserver.unobserve(node);
        }
        delete node.dataset.libertadPendingId;
        node.dataset.libertadFetchTries = String(
          Number(node.dataset.libertadFetchTries || '0') + 1,
        );
      });
    }
    observedTitleNodesByVideoId.delete(videoId);
    scheduleFeedRetry();
  }

  // Schedules one more pass after a failed lookup so the retry does not
  // depend on the page mutating again.
  function scheduleFeedRetry() {
    if (feedRetryTimer) return;
    feedRetryTimer = setTimeout(() => {
      feedRetryTimer = null;
      if (!moduleHydrated) return;
      debouncedUntranslateFeed(activeUntranslateSettings);
    }, 2000);
  }

  function processFeedFetchQueue() {
    if (activeFeedFetches >= MAX_CONCURRENT_FEED_FETCHES) return;
    if (feedFetchQueue.length === 0) return;

    // Space the requests out: a feed that renders twenty cards at once
    // would otherwise hit YouTube's own limiter.
    const sinceLastFetch = Date.now() - lastFeedFetchStartedAt;
    if (sinceLastFetch < MIN_FEED_FETCH_INTERVAL_MS) {
      if (feedThrottleTimer) return;
      feedThrottleTimer = setTimeout(() => {
        feedThrottleTimer = null;
        processFeedFetchQueue();
      }, MIN_FEED_FETCH_INTERVAL_MS - sinceLastFetch);
      return;
    }
    lastFeedFetchStartedAt = Date.now();

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
          releaseObservedNodes(videoId);
        }
        processFeedFetchQueue();
      })
      .catch(() => {
        activeFeedFetches--;
        releaseObservedNodes(videoId);
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
    schedulePruneDisconnectedNodes();

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
                  const set = observedTitleNodesByVideoId.get(effectiveId);
                  if (set) {
                    set.delete(targetNode);
                    if (set.size === 0) {
                      observedTitleNodesByVideoId.delete(effectiveId);
                    }
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
    const active = activeUntranslateSettings;
    // A pending lookup can settle after destroy() released the settings:
    // there is nothing to translate into anymore.
    if (!active) return;
    if (
      active.untranslateMaster === false ||
      active.untranslateTitles === false
    ) {
      return;
    }

    const isHome =
      window.location.pathname === '/' || window.location.pathname === '';
    if (isHome && active.hideHomeFeed) return;

    const isWatch = window.location.pathname === '/watch';
    if (isWatch && active.hideSidebar) return;

    const titleNodes = getAllVideoTitleNodes();
    for (let i = 0; i < titleNodes.length; i++) {
      const node = titleNodes[i];
      const appliedId = node.dataset.libertadApplied;
      if (appliedId) {
        const directAnchor = node.tagName === 'A' ? node : node.closest('a');
        // Heal titles emptied by a later YouTube re-render: only skip when
        // the previously applied text is still visible.
        if (
          directAnchor?.href?.includes(appliedId) &&
          node.textContent.trim()
        ) {
          continue;
        }
      }

      // Fast bailout: if node is already scheduled with an active pending observation, skip expensive DOM traversal
      const pendingId = node.dataset.libertadPendingId;
      if (pendingId) {
        const directAnchor = node.tagName === 'A' ? node : node.closest('a');
        if (directAnchor?.href?.includes(pendingId)) {
          continue;
        }
        delete node.dataset.libertadPendingId;
      }

      const videoId = extractVideoId(node);
      if (!videoId) continue;

      if (titlesCache.has(videoId)) {
        const cached = titlesCache.get(videoId);
        if (cached) {
          applyTitleToNode(node, cached, videoId);
        }
      } else if (
        node.dataset.libertadPendingId !== videoId &&
        Number(node.dataset.libertadFetchTries || '0') <
          MAX_TITLE_FETCH_TRIES &&
        (node.dataset.libertadApplied !== videoId || !node.textContent.trim())
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

    const videoId = getVideoId(window.location.href);
    if (!videoId) return;

    if (!latestOriginalMetadata || latestOriginalMetadata.videoId !== videoId) {
      requestOriginalMetadata();
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
        captureOriginalText(expandedSpan);
        if (!setTitleText(expandedSpan, rawDescription)) return;
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
          captureOriginalText(snippetSpan);
          if (!setTitleText(snippetSpan, previewText)) return;
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

    const videoId = getVideoId(window.location.href);
    if (!videoId) return;

    if (lastRestoredChaptersVideoId === videoId) return;

    if (!latestOriginalMetadata || latestOriginalMetadata.videoId !== videoId) {
      requestOriginalMetadata();
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
          captureOriginalText(titleEl);
          setTitleText(titleEl, chapters[index]);
        }
      });
      lastRestoredChaptersVideoId = videoId;
    }
  }

  const untranslateModule = {
    init(settings, ctx) {
      moduleHydrated = !(ctx && ctx.hydrated === false);
      activeUntranslateSettings = settings;
      if (!moduleHydrated) {
        // Pre-hydration bootstrap: only reversible, side-effect free work is
        // allowed here. Title lookups hit the network and the agent commands
        // mutate the player, so they must wait for the hydrated pass.
        return;
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateTitles !== false
      ) {
        untranslateFeed(settings);
        if (window.location.pathname === '/watch') {
          updateWatchTitle(settings);
        }
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateAudio !== false &&
        window.location.pathname === '/watch'
      ) {
        enforceOriginalAudioTrack(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateDescription !== false &&
        window.location.pathname === '/watch'
      ) {
        restoreOriginalDescription(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateCaptions !== false &&
        window.location.pathname === '/watch'
      ) {
        neutralizeAutoTranslatedCaptions(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateChapters !== false &&
        window.location.pathname === '/watch'
      ) {
        restoreOriginalChapters(settings);
      }
    },

    onNavigate(_url, settings, phase) {
      activeUntranslateSettings = settings;
      if (phase === 'start') {
        resetUntranslateNavigation();
        return;
      }
      if (!moduleHydrated) return;
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateTitles !== false
      ) {
        const isWatch = window.location.pathname === '/watch';
        const isHome =
          window.location.pathname === '/' || window.location.pathname === '';
        if (
          (!isHome || !settings?.hideHomeFeed) &&
          (!isWatch || !settings?.hideSidebar)
        ) {
          debouncedUntranslateFeed(settings);
        }
        if (isWatch) {
          updateWatchTitle(settings);
        }
      }
      if (window.location.pathname === '/watch') {
        if (
          settings?.untranslateMaster !== false &&
          settings?.untranslateAudio !== false
        ) {
          enforceOriginalAudioTrack(settings);
        }
        if (
          settings?.untranslateMaster !== false &&
          settings?.untranslateDescription !== false
        ) {
          restoreOriginalDescription(settings);
        }
        if (
          settings?.untranslateMaster !== false &&
          settings?.untranslateCaptions !== false
        ) {
          neutralizeAutoTranslatedCaptions(settings);
        }
        if (
          settings?.untranslateMaster !== false &&
          settings?.untranslateChapters !== false
        ) {
          restoreOriginalChapters(settings);
        }
      }
    },

    onSettingsChange(settings, changes) {
      moduleHydrated = true;
      activeUntranslateSettings = settings;
      const untranslateKeys = [
        'untranslateMaster',
        'untranslateTitles',
        'untranslateAudio',
        'untranslateDescription',
        'untranslateCaptions',
        'untranslateChapters',
      ];
      const hasUntranslateChange = changes
        ? untranslateKeys.some((k) => Object.hasOwn(changes, k))
        : true;

      if (!hasUntranslateChange) return;

      // The user turned part of the suite off: put the localized text back
      // first, then let the branches that are still enabled re-apply their
      // own content. Both happen in the same tick, so nothing flickers.
      if (
        settings?.untranslateMaster === false ||
        settings?.untranslateTitles === false ||
        settings?.untranslateDescription === false ||
        settings?.untranslateChapters === false
      ) {
        restoreOriginalTexts();
      }

      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateTitles !== false
      ) {
        updateWatchTitle(settings);
        untranslateFeed(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateAudio !== false
      ) {
        enforceOriginalAudioTrack(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateDescription !== false
      ) {
        restoreOriginalDescription(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateCaptions !== false
      ) {
        neutralizeAutoTranslatedCaptions(settings);
      }
      if (
        settings?.untranslateMaster !== false &&
        settings?.untranslateChapters !== false
      ) {
        restoreOriginalChapters(settings);
      }
    },

    onDomMutation(settings) {
      if (!moduleHydrated) return;
      activeUntranslateSettings = settings;
      if (settings?.untranslateMaster === false) return;

      const activePath = window.location.pathname;
      const isWatch = activePath === '/watch';

      if (isWatch) {
        if (settings?.untranslateTitles !== false) {
          updateWatchTitle(settings);
        }
        if (settings?.untranslateDescription !== false) {
          restoreOriginalDescription(settings);
        }
        if (settings?.untranslateChapters !== false) {
          restoreOriginalChapters(settings);
        }
      }

      if (settings?.untranslateTitles !== false) {
        const isHome = activePath === '/' || activePath === '';
        if (
          (!isHome || !settings?.hideHomeFeed) &&
          (!isWatch || !settings?.hideSidebar)
        ) {
          debouncedUntranslateFeed(settings);
        }
      }
    },

    destroy() {
      moduleHydrated = false;
      window.removeEventListener('libertad-agent-metadata', onAgentMetadata);
      resetUntranslateNavigation();
      if (untranslateDebounceTimer) {
        clearTimeout(untranslateDebounceTimer);
        untranslateDebounceTimer = null;
      }
      feedIntersectionObserver?.disconnect();
      feedIntersectionObserver = null;
      inFlightTitles.clear();
      feedFetchQueue.length = 0;
      pendingFeedVideoIds.clear();
      activeFeedFetches = 0;
      activeUntranslateSettings = null;
    },
  };

  // Self-register in the plugin engine
  if (typeof globalThis.Libertad.registerModule === 'function') {
    globalThis.Libertad.registerModule('untranslate', untranslateModule);
  }
})();
