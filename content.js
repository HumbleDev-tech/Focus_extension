/**
 * Libertad - YouTube Content Engine
 * Injects dynamic CSS rules, manages Zen mode, restores Dislikes, and untranslates video titles.
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

  // Caches to prevent duplicate network calls
  const dislikeCache = new Map();
  const titlesCache = new Map();
  let isFetchingDislikes = false;
  let isFetchingTitle = false;

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
    // Remove icon-only constraint class so YouTube's flex layout accommodates text
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

    // Fast path: use cache
    if (dislikeCache.has(videoId)) {
      injectDislikeBadge(dislikeButton, dislikeCache.get(videoId));
      return;
    }

    if (isFetchingDislikes) return;
    isFetchingDislikes = true;

    // Query via background service worker, with direct fetch fallback
    const fetchPromise = new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'FETCH_DISLIKES', videoId }, (res) => {
        if (!chrome.runtime.lastError && res && res.success && res.data) {
          resolve(res.data);
        } else {
          // Direct fetch fallback
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

  // Find video title element on watch page
  function findTitleElement() {
    return (
      document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
      document.querySelector('#title.ytd-watch-metadata yt-formatted-string') ||
      document.querySelector('ytd-watch-metadata h1 yt-formatted-string') ||
      document.querySelector('#title.ytd-watch-flexy h1') ||
      document.querySelector('#container > h1 > yt-formatted-string')
    );
  }

  // Apply original untranslated title
  function applyFoundTitle(videoId, title) {
    if (!title || !title.trim()) return;
    const cleanTitle = title.trim();
    titlesCache.set(videoId, cleanTitle);

    const titleEl = findTitleElement();
    if (titleEl && titleEl.textContent.trim() !== cleanTitle) {
      titleEl.textContent = cleanTitle;
      titleEl.setAttribute('title', cleanTitle);
    }
    if (document.title && !document.title.startsWith(cleanTitle)) {
      document.title = `${cleanTitle} - YouTube`;
    }
  }

  // Untranslate title logic
  function updateUntranslatedTitle() {
    if (!currentSettings.untranslateTitles) return;

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    if (!videoId) return;

    const titleEl = findTitleElement();

    // Fast path: cached original title
    if (titlesCache.has(videoId)) {
      const original = titlesCache.get(videoId);
      if (titleEl && titleEl.textContent.trim() !== original) {
        titleEl.textContent = original;
        titleEl.setAttribute('title', original);
      }
      if (document.title && !document.title.startsWith(original)) {
        document.title = `${original} - YouTube`;
      }
      return;
    }

    // Try reading page meta tags (often loaded initially with the original title)
    const metaTitle = document.querySelector('meta[name="title"]')?.getAttribute('content');
    const metaOg = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const candidate = metaTitle || metaOg;

    if (candidate && candidate.trim() && candidate !== 'YouTube' && !candidate.endsWith(' - YouTube')) {
      applyFoundTitle(videoId, candidate);
      return;
    }

    if (isFetchingTitle) return;
    isFetchingTitle = true;

    // Fetch official oEmbed (returns the author's original untranslated title)
    chrome.runtime.sendMessage({ action: 'FETCH_ORIGINAL_TITLE', videoId }, (res) => {
      isFetchingTitle = false;
      if (!chrome.runtime.lastError && res && res.success && res.title) {
        applyFoundTitle(videoId, res.title);
      } else {
        // Direct oEmbed fallback
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            if (data && data.title) {
              applyFoundTitle(videoId, data.title);
            }
          })
          .catch(() => {});
      }
    });
  }

  // Initialize and load saved settings
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      currentSettings = { ...currentSettings, ...saved };
    }
    applyStyles(currentSettings);
    updateDislikeCount();
    updateUntranslatedTitle();
  });

  // Listen for storage changes in real time (e.g. from popup clicks)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      for (const key in changes) {
        currentSettings[key] = changes[key].newValue;
      }
      applyStyles(currentSettings);
      updateDislikeCount();
      updateUntranslatedTitle();
    }
  });

  // Handle YouTube SPA Navigation events
  window.addEventListener('yt-navigate-finish', () => {
    applyStyles(currentSettings);
    // Give YouTube a moment to mount the watch UI components
    setTimeout(() => {
      updateDislikeCount();
      updateUntranslatedTitle();
    }, 400);
    setTimeout(() => {
      updateDislikeCount();
      updateUntranslatedTitle();
    }, 1200);
  });

  // Optimized observer for dynamically loaded elements (throttled with requestAnimationFrame)
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
          updateUntranslatedTitle();
        }
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
