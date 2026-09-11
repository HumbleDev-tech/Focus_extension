/**
 * Libertad - YouTube Content Engine
 * Injects dynamic CSS rules, manages Zen mode, restores Dislikes, and untranslates video titles across Watch page and Feeds.
 */

(function () {
  'use strict';

  const STYLE_ID = 'libertad-focus-styles';
  const ZEN_CONTAINER_ID = 'libertad-zen-container';

  // Fallback defaults in case storage hasn't initialized
  let currentSettings = {
    preset: 'balanced',
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    showDislikes: true,
    untranslateTitles: true
  };

  // Caches and queues
  const dislikeCache = new Map();
  const titlesCache = new Map();
  let isFetchingDislikes = false;
  let currentWatchVideoId = null;
  let currentOriginalTitle = null;

  const feedFetchQueue = [];
  const pendingFeedVideoIds = new Set();
  let activeFeedFetches = 0;
  const MAX_CONCURRENT_FEED_FETCHES = 8;

  // Build high-efficiency CSS rules based on settings
  function buildStylesheet(settings) {
    const rules = [];

    // Home feed
    if (settings.hideHomeFeed) {
      rules.push(`
        ytd-browse[page-subtype="home"] #contents,
        ytd-browse[page-subtype="home"] #chips-wrapper,
        ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
          display: none !important;
        }
      `);
    }

    // Related / Sidebar
    if (settings.hideSidebar) {
      rules.push(`
        #secondary.ytd-watch-flexy,
        #related.ytd-watch-flexy,
        ytd-watch-next-secondary-results-renderer {
          display: none !important;
        }
        ytd-watch-flexy:not([theater]):not([fullscreen]) #primary.ytd-watch-flexy {
          max-width: 1100px !important;
          margin: 0 auto !important;
        }
      `);
    }

    // Comments
    if (settings.hideComments) {
      rules.push(`
        #comments,
        ytd-comments {
          display: none !important;
        }
      `);
    }

    // Shorts (Shelves, sidebars, header/navigation links)
    if (settings.hideShorts) {
      rules.push(`
        ytd-reel-shelf-renderer,
        ytd-rich-shelf-renderer[is-shorts],
        ytd-rich-section-renderer:has(ytd-reel-shelf-renderer),
        ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
        ytd-guide-entry-renderer:has(a[title="Shorts"]),
        ytd-guide-entry-renderer:has(a[href^="/shorts"]),
        ytd-mini-guide-entry-renderer[aria-label="Shorts"],
        a[title="Shorts"] {
          display: none !important;
        }
      `);
    }

    // Video Endscreens & Cards
    if (settings.hideEndScreens) {
      rules.push(`
        .ytp-ce-element,
        .ytp-endscreen-content,
        .ytp-cards-teaser,
        .ytp-cards-button {
          display: none !important;
        }
      `);
    }

    // Dislike Button Fix & Expansion
    rules.push(`
      /* Ensure Dislike button container allows text expansion and proper padding */
      ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button,
      segmented-like-dislike-button-view-model dislike-button-view-model button,
      dislike-button-view-model button,
      #segmented-dislike-button button,
      #dislike-button button {
        width: auto !important;
        min-width: 48px !important;
        padding-left: 8px !important;
        padding-right: 12px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .libertad-dislike-badge {
        display: inline-flex !important;
        align-items: center !important;
        font-family: "Roboto", "Segoe UI", Arial, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        line-height: 1 !important;
        color: inherit !important;
        margin-left: 6px !important;
        pointer-events: none !important;
        white-space: nowrap !important;
      }
    `);

    // Libertad UI Elements styling
    rules.push(`
      #libertad-zen-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 55vh;
        text-align: center;
        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--yt-spec-text-primary, #f1f1f1);
        padding: 40px 20px;
        animation: libertadFadeIn 0.35s ease-out;
      }
      @keyframes libertadFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .libertad-zen-card {
        background: var(--yt-spec-brand-background-primary, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--yt-spec-10-percent-layer, rgba(255, 255, 255, 0.1));
        border-radius: 20px;
        padding: 36px 44px;
        max-width: 480px;
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      .libertad-zen-icon {
        font-size: 42px;
        margin-bottom: 12px;
        display: inline-block;
      }
      .libertad-zen-title {
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.5px;
        margin-bottom: 10px;
        color: var(--yt-spec-text-primary, #ffffff);
      }
      .libertad-zen-desc {
        font-size: 14px;
        line-height: 1.5;
        color: var(--yt-spec-text-secondary, #aaaaaa);
        margin: 0;
      }
    `);

    return rules.join('\n');
  }

  // Inject or update the active stylesheet
  function applyStyles(settings) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildStylesheet(settings);
    updateZenBanner(settings);
  }

  // Show a calm, intentional screen on YouTube home if home feed is disabled
  function updateZenBanner(settings) {
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    const existing = document.getElementById(ZEN_CONTAINER_ID);

    if (settings.hideHomeFeed && isHomePage) {
      if (!existing) {
        const targetContainer = document.querySelector('ytd-browse[page-subtype="home"] #primary') ||
                                document.querySelector('ytd-browse[page-subtype="home"]') ||
                                document.querySelector('ytd-page-manager');
        if (targetContainer) {
          const zen = document.createElement('div');
          zen.id = ZEN_CONTAINER_ID;
          zen.innerHTML = `
            <div class="libertad-zen-card">
              <span class="libertad-zen-icon">🕊️</span>
              <div class="libertad-zen-title">Focus Mode Active</div>
              <p class="libertad-zen-desc">Home feed is hidden so you can focus on what matters. Search above to find what you came for.</p>
            </div>
          `;
          targetContainer.prepend(zen);
        }
      }
    } else {
      if (existing) {
        existing.remove();
      }
    }
  }

  // Format number (e.g. 1500 -> 1.5K)
  function formatNumber(num) {
    if (typeof num !== 'number') return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }

  // Find modern YouTube dislike button
  function findDislikeButton() {
    return (
      document.querySelector('ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button') ||
      document.querySelector('segmented-like-dislike-button-view-model dislike-button-view-model button') ||
      document.querySelector('dislike-button-view-model button') ||
      document.querySelector('#segmented-dislike-button button') ||
      document.querySelector('like-button-view-model + dislike-button-view-model button') ||
      document.querySelector('#dislike-button button')
    );
  }

  // Inject or update the dislike badge
  function injectDislikeBadge(button, formattedCount) {
    button.classList.remove('yt-spec-button-shape-next--icon-button');
    button.classList.add('yt-spec-button-shape-next--icon-leading');

    let textWrapper = button.querySelector('.yt-spec-button-shape-next__button-text-content');
    if (!textWrapper) {
      textWrapper = button.querySelector('.libertad-dislike-badge');
    }

    if (!textWrapper) {
      textWrapper = document.createElement('div');
      textWrapper.className = 'yt-spec-button-shape-next__button-text-content libertad-dislike-badge';
      button.appendChild(textWrapper);
    } else {
      textWrapper.classList.add('libertad-dislike-badge');
    }

    if (textWrapper.textContent !== formattedCount) {
      textWrapper.textContent = formattedCount;
    }
    button.setAttribute('aria-label', `Dislike (${formattedCount})`);
  }

  function removeDislikeBadge() {
    const badges = document.querySelectorAll('.libertad-dislike-badge');
    badges.forEach((b) => b.remove());
  }

  // Dislike restoration logic
  function updateDislikeCount() {
    if (!currentSettings.showDislikes) {
      removeDislikeBadge();
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    if (!videoId) {
      removeDislikeBadge();
      return;
    }

    const dislikeButton = findDislikeButton();
    if (!dislikeButton) return;

    if (dislikeCache.has(videoId)) {
      injectDislikeBadge(dislikeButton, dislikeCache.get(videoId));
      return;
    }

    if (isFetchingDislikes) return;
    isFetchingDislikes = true;

    const fetchPromise = new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'FETCH_DISLIKES', videoId }, (res) => {
        if (!chrome.runtime.lastError && res && res.success && res.data) {
          resolve(res.data);
        } else {
          fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`)
            .then((r) => r.json())
            .then((data) => resolve(data))
            .catch(() => resolve(null));
        }
      });
    });

    fetchPromise
      .then((data) => {
        isFetchingDislikes = false;
        if (data && typeof data.dislikes === 'number') {
          const formatted = formatNumber(data.dislikes);
          dislikeCache.set(videoId, formatted);
          const currentBtn = findDislikeButton();
          if (currentBtn) {
            injectDislikeBadge(currentBtn, formatted);
          }
        }
      })
      .catch(() => {
        isFetchingDislikes = false;
      });
  }

  // -----------------------------------------------------------
  // Untranslate Engine: Watch Page & Feeds
  // -----------------------------------------------------------

  // Fetch true original title (direct same-origin oEmbed + background fallback)
  async function fetchOriginalTitle(videoId) {
    if (!videoId) return null;
    if (titlesCache.has(videoId)) {
      return titlesCache.get(videoId);
    }

    // 1. If on watch page, check application/ld+json
    if (window.location.pathname === '/watch') {
      const ldJsonEl = document.querySelector('script[type="application/ld+json"]');
      if (ldJsonEl && ldJsonEl.textContent) {
        try {
          const data = JSON.parse(ldJsonEl.textContent);
          if (data && data.name && (location.search.includes(videoId) || data.url?.includes(videoId) || data.embedUrl?.includes(videoId))) {
            const t = data.name.trim();
            titlesCache.set(videoId, t);
            return t;
          }
        } catch (e) {}
      }
    }

    // 2. Direct same-origin oEmbed fetch (~25ms response, no IPC)
    try {
      const oembedUrl = `/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          const t = data.title.trim();
          titlesCache.set(videoId, t);
          return t;
        }
      }
    } catch (e) {}

    // 3. Fallback to background worker
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'FETCH_ORIGINAL_TITLE', videoId }, (res) => {
        if (!chrome.runtime.lastError && res && res.success && res.title) {
          const t = res.title.trim();
          titlesCache.set(videoId, t);
          resolve(t);
        } else {
          resolve(null);
        }
      });
    });
  }

  // Comprehensive watch title selectors
  function getWatchTitleElements() {
    const elements = [];
    const selectors = [
      'ytd-watch-metadata #title yt-formatted-string',
      'ytd-watch-metadata #title h1',
      'ytd-watch-metadata h1 yt-formatted-string',
      'ytd-watch-metadata h1',
      '#above-the-fold #title yt-formatted-string',
      '#above-the-fold #title h1',
      'h1.style-scope.ytd-watch-metadata yt-formatted-string',
      'h1.style-scope.ytd-watch-metadata',
      '#title.style-scope.ytd-watch-metadata yt-formatted-string',
      'ytd-watch-flexy:not([hidden]) #container > h1 > yt-formatted-string',
      'ytd-video-primary-info-renderer h1.title yt-formatted-string',
      'h1.title yt-formatted-string',
      'h1.title > *'
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
  function applyWatchTitle(originalTitle) {
    if (!originalTitle || !originalTitle.trim()) return false;
    const clean = originalTitle.trim();
    currentOriginalTitle = clean;

    let modified = false;
    const titleNodes = getWatchTitleElements();
    titleNodes.forEach((node) => {
      if (node.innerText !== clean || node.textContent !== clean) {
        node.innerText = clean;
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
  function updateWatchTitle() {
    if (!currentSettings.untranslateTitles) return;
    if (window.location.pathname !== '/watch') return;

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    if (!videoId) return;

    if (currentWatchVideoId !== videoId) {
      currentWatchVideoId = videoId;
      currentOriginalTitle = null;
    }

    if (currentOriginalTitle) {
      applyWatchTitle(currentOriginalTitle);
      return;
    }

    fetchOriginalTitle(videoId).then((orig) => {
      if (orig) {
        applyWatchTitle(orig);
      }
    });
  }

  // Universal selector covering both legacy Polymer (#video-title) and modern Lockup ViewModels (Wiz)
  function getAllVideoTitleNodes() {
    const nodes = [];

    // 1. Classic Polymer title elements
    document.querySelectorAll('#video-title, yt-formatted-string#video-title, span#video-title, a#video-title').forEach((el) => {
      if (!el.closest('ytd-watch-metadata, #above-the-fold') && !nodes.includes(el)) {
        nodes.push(el);
      }
    });

    // 2. Modern YouTube Lockup ViewModels (2024+) & heading links
    document.querySelectorAll(
      'h3 a[href*="watch?v="], h3 a[href*="/shorts/"], [class*="lockup"] a[href*="watch?v="], [class*="lockup"] a[href*="/shorts/"], a.yt-lockup-metadata-view-model-wiz__title'
    ).forEach((a) => {
      if (a.closest('ytd-watch-metadata, #above-the-fold')) return;

      // Locate the innermost text-bearing element
      const inner = a.querySelector('#video-title, yt-formatted-string, span[role="text"], .yt-core-attributed-string, span');
      const target = inner || a;
      if (!nodes.includes(target)) {
        nodes.push(target);
      }
    });

    return nodes;
  }

  // Extract video ID accurately from a title element or its parent card
  function extractVideoId(el) {
    if (!el) return null;

    // Direct <a> tag with href
    if (el.tagName === 'A' && el.href) {
      const m = el.href.match(/[?&]v=([^&]+)/) || el.href.match(/\/shorts\/([^?&]+)/);
      if (m) return m[1];
    }

    // Closest <a> parent (e.g. Home feed: a#video-title-link or sidebar anchor)
    const a = el.closest('a');
    if (a && a.href) {
      const m = a.href.match(/[?&]v=([^&]+)/) || a.href.match(/\/shorts\/([^?&]+)/);
      if (m) return m[1];
    }

    // Check thumbnail link in the containing card
    const card = el.closest(
      'ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer, ytd-reel-item-renderer, [class*="lockup"], [class*="item-section"]'
    );
    if (card) {
      const link = card.querySelector('a[href*="watch?v="], a[href*="/shorts/"], a#thumbnail, a#video-title-link, a.ytd-thumbnail');
      if (link && link.href) {
        const m = link.href.match(/[?&]v=([^&]+)/) || link.href.match(/\/shorts\/([^?&]+)/);
        if (m) return m[1];
      }
    }

    return null;
  }

  // Apply original title exclusively to the title text node (without destroying parent anchors)
  function applyTitleToNode(titleNode, cleanTitle, videoId) {
    if (!titleNode || !cleanTitle) return;

    // Avoid redundant work if already applied
    if (titleNode.dataset.libertadApplied === videoId && titleNode.textContent.trim() === cleanTitle) {
      return;
    }

    // If titleNode contains an inner text-bearing span (e.g. yt-core-attributed-string)
    const childSpan = titleNode.querySelector('span[role="text"], .yt-core-attributed-string, span');
    if (childSpan && childSpan !== titleNode) {
      childSpan.innerText = cleanTitle;
      childSpan.textContent = cleanTitle;
    }

    // Update inner text on the actual title container
    titleNode.innerText = cleanTitle;
    titleNode.textContent = cleanTitle;
    titleNode.setAttribute('title', cleanTitle);
    titleNode.removeAttribute('is-empty');
    titleNode.dataset.libertadApplied = videoId;

    // Update title/aria-label tooltip on parent anchor if present
    const parentA = titleNode.tagName === 'A' ? titleNode : titleNode.closest('a');
    if (parentA) {
      parentA.setAttribute('title', cleanTitle);
      parentA.setAttribute('aria-label', cleanTitle);
    }
  }

  // Update all matching elements in the DOM for a given video ID
  function updateFeedElementsForVideoId(videoId, origTitle) {
    const clean = origTitle.trim();
    const titleNodes = getAllVideoTitleNodes();

    titleNodes.forEach((node) => {
      const vId = extractVideoId(node);
      if (vId === videoId) {
        applyTitleToNode(node, clean, videoId);
      }
    });
  }

  // Concurrency queue processor
  function processFeedFetchQueue() {
    while (activeFeedFetches < MAX_CONCURRENT_FEED_FETCHES && feedFetchQueue.length > 0) {
      const videoId = feedFetchQueue.shift();
      activeFeedFetches++;

      fetchOriginalTitle(videoId)
        .then((origTitle) => {
          activeFeedFetches--;
          pendingFeedVideoIds.delete(videoId);
          if (origTitle) {
            updateFeedElementsForVideoId(videoId, origTitle);
          }
          processFeedFetchQueue();
        })
        .catch(() => {
          activeFeedFetches--;
          pendingFeedVideoIds.delete(videoId);
          processFeedFetchQueue();
        });
    }
  }

  // Automatically untranslate all video titles visible in Home, Search, and Recommendations
  function untranslateFeed() {
    if (!currentSettings.untranslateTitles) return;

    const titleNodes = getAllVideoTitleNodes();

    titleNodes.forEach((node) => {
      const videoId = extractVideoId(node);
      if (!videoId) return;

      if (titlesCache.has(videoId)) {
        applyTitleToNode(node, titlesCache.get(videoId), videoId);
      } else if (!pendingFeedVideoIds.has(videoId)) {
        pendingFeedVideoIds.add(videoId);
        feedFetchQueue.push(videoId);
      }
    });

    processFeedFetchQueue();
  }

  // -----------------------------------------------------------
  // Lifecycle & Watchdogs
  // -----------------------------------------------------------

  // Regular heartbeat to catch virtual-scroll DOM re-use on YouTube
  setInterval(() => {
    if (window.location.pathname === '/watch' && currentSettings.untranslateTitles && currentOriginalTitle) {
      applyWatchTitle(currentOriginalTitle);
    }
    if (currentSettings.untranslateTitles) {
      untranslateFeed();
    }
  }, 700);

  // Throttled scroll listener
  let scrollThrottleTimer = null;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollThrottleTimer) return;
      scrollThrottleTimer = setTimeout(() => {
        scrollThrottleTimer = null;
        if (currentSettings.untranslateTitles) {
          untranslateFeed();
        }
      }, 150);
    },
    { passive: true }
  );

  // Page load listeners
  document.addEventListener('DOMContentLoaded', () => {
    untranslateFeed();
  });
  window.addEventListener('load', () => {
    untranslateFeed();
  });

  // Initialize and load saved settings
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      currentSettings = { ...currentSettings, ...saved };
    }
    applyStyles(currentSettings);
    updateDislikeCount();
    updateWatchTitle();
    untranslateFeed();
  });

  // Listen for storage changes in real time (e.g. from popup clicks)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      for (const key in changes) {
        currentSettings[key] = changes[key].newValue;
      }
      applyStyles(currentSettings);
      updateDislikeCount();
      updateWatchTitle();
      untranslateFeed();
    }
  });

  // Handle YouTube SPA Navigation events
  window.addEventListener('yt-navigate-finish', () => {
    currentOriginalTitle = null;
    currentWatchVideoId = null;

    applyStyles(currentSettings);

    setTimeout(() => {
      updateDislikeCount();
      updateWatchTitle();
      untranslateFeed();
    }, 200);

    setTimeout(() => {
      updateDislikeCount();
      updateWatchTitle();
      untranslateFeed();
    }, 600);

    setTimeout(() => {
      updateDislikeCount();
      updateWatchTitle();
      untranslateFeed();
    }, 1500);
  });

  // Throttled MutationObserver
  let isCheckingMutation = false;
  const observer = new MutationObserver(() => {
    if (isCheckingMutation) return;
    isCheckingMutation = true;

    window.requestAnimationFrame(() => {
      isCheckingMutation = false;
      updateZenBanner(currentSettings);

      if (window.location.pathname === '/watch') {
        if (currentSettings.showDislikes) {
          const dislikeBtn = findDislikeButton();
          if (dislikeBtn && !dislikeBtn.querySelector('.libertad-dislike-badge')) {
            updateDislikeCount();
          }
        }
        if (currentSettings.untranslateTitles) {
          updateWatchTitle();
        }
      }

      if (currentSettings.untranslateTitles) {
        untranslateFeed();
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
