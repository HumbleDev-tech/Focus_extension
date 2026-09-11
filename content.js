/**
 * Libertad - YouTube Content Engine
 * Injects dynamic CSS rules, manages Zen mode, and displays dislike counts.
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
    showDislikes: true
  };

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
      .libertad-dislike-badge {
        display: inline-flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        margin-left: 6px;
        color: inherit;
        pointer-events: none;
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

  // Format dislike count (e.g. 1500 -> 1.5K)
  function formatNumber(num) {
    if (typeof num !== 'number') return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }

  // Dislike restoration logic
  let lastFetchedVideoId = null;
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

    // Try finding the dislike button container
    const dislikeButton = document.querySelector('ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button') ||
                          document.querySelector('dislike-button-view-model button') ||
                          document.querySelector('#segmented-dislike-button button');

    if (!dislikeButton) {
      return;
    }

    if (lastFetchedVideoId === videoId && dislikeButton.querySelector('.libertad-dislike-badge')) {
      return;
    }

    lastFetchedVideoId = videoId;

    // Fetch dislike count via background service worker
    chrome.runtime.sendMessage({ action: 'FETCH_DISLIKES', videoId }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success || !response.data) {
        return;
      }

      const dislikes = response.data.dislikes;
      if (dislikes === undefined) return;

      const formatted = formatNumber(dislikes);
      injectDislikeBadge(dislikeButton, formatted);
    });
  }

  function injectDislikeBadge(button, formattedCount) {
    let badge = button.querySelector('.libertad-dislike-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'libertad-dislike-badge';
      button.appendChild(badge);
    }
    badge.textContent = formattedCount;
  }

  function removeDislikeBadge() {
    const badges = document.querySelectorAll('.libertad-dislike-badge');
    badges.forEach(b => b.remove());
  }

  // Initialize and load saved settings
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      currentSettings = { ...currentSettings, ...saved };
    }
    applyStyles(currentSettings);
    updateDislikeCount();
  });

  // Listen for storage changes in real time (e.g. from popup clicks)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      for (const key in changes) {
        currentSettings[key] = changes[key].newValue;
      }
      applyStyles(currentSettings);
      updateDislikeCount();
    }
  });

  // Handle YouTube SPA Navigation events
  window.addEventListener('yt-navigate-finish', () => {
    lastFetchedVideoId = null;
    applyStyles(currentSettings);
    // Give YouTube a short moment to render the action buttons
    setTimeout(updateDislikeCount, 500);
    setTimeout(updateDislikeCount, 1500);
  });

  // Optimized observer for dynamically loaded elements (throttled with requestAnimationFrame)
  let isCheckingMutation = false;
  const observer = new MutationObserver(() => {
    if (isCheckingMutation) return;
    isCheckingMutation = true;

    window.requestAnimationFrame(() => {
      isCheckingMutation = false;
      updateZenBanner(currentSettings);

      if (currentSettings.showDislikes && window.location.pathname === '/watch') {
        const dislikeBtn = document.querySelector('ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button') ||
                            document.querySelector('dislike-button-view-model button') ||
                            document.querySelector('#segmented-dislike-button button');
        if (dislikeBtn && !dislikeBtn.querySelector('.libertad-dislike-badge')) {
          updateDislikeCount();
        }
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
