/**
 * Libertad - YouTube Content Orchestrator
 * Central lifecycle entry point connecting modular engines:
 * Cache, Utils, Styles, Shorts, Subscriptions, Dislikes, Sponsors, and Untranslate.
 */

(function () {
  'use strict';

  const Libertad = globalThis.Libertad || {};

  // Fallback defaults from single source of truth
  let currentSettings =
    typeof DEFAULT_SETTINGS !== 'undefined'
      ? { ...DEFAULT_SETTINGS }
      : {
          preset: 'basic',
          theme: 'dark',
          lang: 'auto',
          scale: 'auto',
          activeTab: 'focus',
          hideHomeFeed: false,
          redirectHomeToSubscriptions: false,
          hideSidebar: false,
          hideComments: false,
          hideShorts: true,
          hideEndScreens: true,
          hideVoiceSearch: false,
          hideCreateButton: false,
          hideNotifications: false,
          hideSearchSuggestions: false,
          hideFilterChips: false,
          hideAutoplay: false,
          hideUpNext: true,
          hideWatermark: true,
          hidePaidPromo: true,
          hideMiniplayer: false,
          hideAskAi: true,
          hideDownload: true,
          hideThanksClips: false,
          hideJoinButton: false,
          hideShare: false,
          hideSave: false,
          hideLikeDislike: false,
          hideSubscribeButton: false,
          hideSubscriberCount: false,
          hideViewsDate: false,
          hideMoreActions: false,
          hideMerchShelf: true,
          hideLiveChat: false,
          hideExplore: false,
          hideTrending: false,
          hideMoreFromYoutube: false,
          showDislikes: true,
          untranslateMaster: true,
          untranslateTitles: true,
          untranslateAudio: true,
          untranslateDescription: true,
          untranslateCaptions: true,
          untranslateChapters: true,
          skipSponsors: true,
        };

  // Synchronous cache hydration to completely eliminate reverse FOUC at document_start
  try {
    const cachedSettings = sessionStorage.getItem('libertad_settings');
    if (cachedSettings) {
      const parsed = JSON.parse(cachedSettings);
      if (parsed && typeof parsed === 'object') {
        currentSettings = { ...currentSettings, ...parsed };
      }
    }
  } catch (_) {}

  // Early route checks at document_start
  if (Libertad.redirectShortsIfActive) {
    Libertad.redirectShortsIfActive(currentSettings);
  }
  if (Libertad.redirectHomeToSubscriptions) {
    Libertad.redirectHomeToSubscriptions(currentSettings);
  }

  // Initialize SPA link interceptor for instantaneous subscription routing
  if (Libertad.setupSubscriptionsLinkInterceptor) {
    Libertad.setupSubscriptionsLinkInterceptor(() => currentSettings);
  }

  // Apply styles immediately at document_start
  if (Libertad.applyStyles) {
    Libertad.applyStyles(currentSettings);
  }

  // Synchronize all modules with current settings
  function syncAllModules() {
    if (Libertad.applyStyles) Libertad.applyStyles(currentSettings);
    if (Libertad.cleanLiveChat) Libertad.cleanLiveChat(currentSettings);
    if (Libertad.redirectShortsIfActive) {
      Libertad.redirectShortsIfActive(currentSettings);
    }
    if (Libertad.redirectHomeToSubscriptions) {
      Libertad.redirectHomeToSubscriptions(currentSettings);
    }
    if (Libertad.updateDislikeCount) {
      Libertad.updateDislikeCount(currentSettings);
    }
    if (Libertad.updateWatchTitle) {
      Libertad.updateWatchTitle(currentSettings);
    }
    if (Libertad.untranslateFeed) {
      Libertad.untranslateFeed(currentSettings);
    }
    if (Libertad.enforceOriginalAudioTrack) {
      Libertad.enforceOriginalAudioTrack(currentSettings);
    }
    if (Libertad.restoreOriginalDescription) {
      Libertad.restoreOriginalDescription(currentSettings);
    }
    if (Libertad.neutralizeAutoTranslatedCaptions) {
      Libertad.neutralizeAutoTranslatedCaptions(currentSettings);
    }
    if (Libertad.restoreOriginalChapters) {
      Libertad.restoreOriginalChapters(currentSettings);
    }
    if (Libertad.updateSponsorSegments) {
      Libertad.updateSponsorSegments(currentSettings);
    }
    if (Libertad.bindVideoSponsorListener) {
      Libertad.bindVideoSponsorListener(currentSettings);
    }
  }

  // Throttled scroll listener for feed titles
  let scrollThrottleTimer = null;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollThrottleTimer) return;
      scrollThrottleTimer = setTimeout(() => {
        scrollThrottleTimer = null;
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateTitles !== false &&
          Libertad.untranslateFeed
        ) {
          Libertad.untranslateFeed(currentSettings);
        }
      }, 250);
    },
    { passive: true },
  );

  // Initial load and DOMContentLoaded events
  document.addEventListener('DOMContentLoaded', () => {
    if (Libertad.untranslateFeed) Libertad.untranslateFeed(currentSettings);
    if (Libertad.updateZenBanner) Libertad.updateZenBanner(currentSettings);
  });
  window.addEventListener('load', () => {
    if (Libertad.untranslateFeed) Libertad.untranslateFeed(currentSettings);
    if (Libertad.updateZenBanner) Libertad.updateZenBanner(currentSettings);
  });

  // Load saved settings from storage
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      currentSettings = { ...currentSettings, ...saved };
      try {
        sessionStorage.setItem(
          'libertad_settings',
          JSON.stringify(currentSettings),
        );
      } catch (_) {}
    }
    syncAllModules();
  });

  // Listen for storage changes in real time with granular key diffing
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      let stylesChanged = false;
      let dislikesChanged = false;
      let titleChanged = false;
      let sponsorsChanged = false;
      let shortsChanged = false;
      let subscriptionsChanged = false;

      for (const key in changes) {
        currentSettings[key] = changes[key].newValue;
        if (key === 'showDislikes' || key === 'hideLikeDislike') {
          dislikesChanged = true;
        } else if (key.startsWith('untranslate')) {
          titleChanged = true;
        } else if (
          key.startsWith('skipSponsors') ||
          key.startsWith('sponsorSkip')
        ) {
          sponsorsChanged = true;
        } else if (key === 'hideShorts') {
          stylesChanged = true;
          shortsChanged = true;
        } else if (key === 'redirectHomeToSubscriptions') {
          subscriptionsChanged = true;
        } else if (
          key === 'preset' ||
          (typeof TOGGLE_KEYS !== 'undefined' && TOGGLE_KEYS.includes(key)) ||
          key === 'lang' ||
          key === 'theme' ||
          key === 'scale'
        ) {
          stylesChanged = true;
        }
      }

      try {
        sessionStorage.setItem(
          'libertad_settings',
          JSON.stringify(currentSettings),
        );
      } catch (_) {}

      if (stylesChanged && Libertad.applyStyles) {
        Libertad.applyStyles(currentSettings);
        if (Libertad.cleanLiveChat) Libertad.cleanLiveChat(currentSettings);
      }
      if (shortsChanged && Libertad.redirectShortsIfActive) {
        Libertad.redirectShortsIfActive(currentSettings);
      }
      if (subscriptionsChanged && Libertad.redirectHomeToSubscriptions) {
        Libertad.redirectHomeToSubscriptions(currentSettings);
      }
      if (dislikesChanged && Libertad.updateDislikeCount) {
        Libertad.updateDislikeCount(currentSettings);
      }
      if (titleChanged) {
        if (Libertad.updateWatchTitle) {
          Libertad.updateWatchTitle(currentSettings);
        }
        if (Libertad.untranslateFeed) {
          Libertad.untranslateFeed(currentSettings);
        }
        if (Libertad.enforceOriginalAudioTrack) {
          Libertad.enforceOriginalAudioTrack(currentSettings);
        }
        if (Libertad.restoreOriginalDescription) {
          Libertad.restoreOriginalDescription(currentSettings);
        }
        if (Libertad.neutralizeAutoTranslatedCaptions) {
          Libertad.neutralizeAutoTranslatedCaptions(currentSettings);
        }
        if (Libertad.restoreOriginalChapters) {
          Libertad.restoreOriginalChapters(currentSettings);
        }
      }
      if (sponsorsChanged) {
        if (Libertad.updateSponsorSegments) {
          Libertad.updateSponsorSegments(currentSettings);
        }
        if (Libertad.bindVideoSponsorListener) {
          Libertad.bindVideoSponsorListener(currentSettings);
        }
      }
    }
  });

  let lastDislikeBtn = null;
  let lastCheckedHref = '';

  // Handle YouTube SPA Navigation events
  window.addEventListener('yt-navigate-start', (event) => {
    lastDislikeBtn = null;
    lastCheckedHref = '';
    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy?.hasAttribute('flexy-chat-collapsed_')) {
      flexy.removeAttribute('flexy-chat-collapsed_');
    }
    const targetUrl = event?.detail?.url;
    if (Libertad.redirectShortsIfActive) {
      Libertad.redirectShortsIfActive(currentSettings, targetUrl);
    }
    if (Libertad.redirectHomeToSubscriptions) {
      Libertad.redirectHomeToSubscriptions(currentSettings, targetUrl);
    }
    if (Libertad.updateZenBanner) {
      Libertad.updateZenBanner(currentSettings);
    }
    if (Libertad.resetSponsorNavigation) Libertad.resetSponsorNavigation();
    if (Libertad.resetUntranslateNavigation) {
      Libertad.resetUntranslateNavigation();
    }
  });

  window.addEventListener('yt-navigate-finish', () => {
    lastDislikeBtn = null;
    syncAllModules();
  });

  window.addEventListener('popstate', () => {
    lastDislikeBtn = null;
    lastCheckedHref = '';
    if (Libertad.redirectShortsIfActive) {
      Libertad.redirectShortsIfActive(currentSettings);
    }
    if (Libertad.redirectHomeToSubscriptions) {
      Libertad.redirectHomeToSubscriptions(currentSettings);
    }
  });

  // Throttled MutationObserver with node-addition filtering and memoized lookups
  let isCheckingMutation = false;

  const observer = new MutationObserver((mutations) => {
    let hasAddedNodes = false;
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        hasAddedNodes = true;
        break;
      }
    }
    if (!hasAddedNodes) return;

    if (isCheckingMutation) return;
    isCheckingMutation = true;

    window.requestAnimationFrame(() => {
      isCheckingMutation = false;

      const currentHref = window.location.href;
      const currentPath = window.location.pathname;
      const hrefChanged = currentHref !== lastCheckedHref;
      lastCheckedHref = currentHref;

      if (hrefChanged) {
        if (Libertad.redirectShortsIfActive) {
          Libertad.redirectShortsIfActive(currentSettings);
        }
        if (Libertad.redirectHomeToSubscriptions) {
          Libertad.redirectHomeToSubscriptions(currentSettings);
        }
      }

      const isHome = currentPath === '/' || currentPath === '';
      if (isHome && Libertad.updateZenBanner) {
        Libertad.updateZenBanner(currentSettings);
      }

      if (currentPath === '/watch') {
        if (currentSettings.hideLiveChat && Libertad.cleanLiveChat) {
          Libertad.cleanLiveChat(currentSettings);
        }
        if (currentSettings.showDislikes && Libertad.findDislikeButton) {
          const hasBadge =
            lastDislikeBtn?.isConnected &&
            lastDislikeBtn.querySelector('.libertad-dislike-badge');
          if (!hasBadge) {
            const dislikeBtn = Libertad.findDislikeButton();
            if (dislikeBtn) {
              lastDislikeBtn = dislikeBtn;
              if (
                !dislikeBtn.querySelector('.libertad-dislike-badge') &&
                Libertad.updateDislikeCount
              ) {
                Libertad.updateDislikeCount(currentSettings);
              }
            }
          }
        }
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateTitles !== false &&
          Libertad.updateWatchTitle
        ) {
          Libertad.updateWatchTitle(currentSettings);
        }
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateDescription !== false &&
          Libertad.restoreOriginalDescription
        ) {
          Libertad.restoreOriginalDescription(currentSettings);
        }
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateChapters !== false &&
          Libertad.restoreOriginalChapters
        ) {
          Libertad.restoreOriginalChapters(currentSettings);
        }
        if (currentSettings.skipSponsors && Libertad.getActiveVideoId) {
          const activeVid = Libertad.getActiveVideoId();
          const currentSponsorVid =
            typeof Libertad.getCurrentSponsorVideoId === 'function'
              ? Libertad.getCurrentSponsorVideoId()
              : null;
          if (
            activeVid &&
            activeVid !== currentSponsorVid &&
            Libertad.updateSponsorSegments
          ) {
            Libertad.updateSponsorSegments(currentSettings);
          }
          if (Libertad.bindVideoSponsorListener) {
            Libertad.bindVideoSponsorListener(currentSettings);
          }
          const segments =
            typeof Libertad.getCurrentSponsorSegments === 'function'
              ? Libertad.getCurrentSponsorSegments()
              : [];
          const hasContainer = Libertad.hasActiveSponsorContainer
            ? Libertad.hasActiveSponsorContainer()
            : false;
          if (
            segments.length > 0 &&
            !hasContainer &&
            Libertad.renderSponsorProgressBar
          ) {
            Libertad.renderSponsorProgressBar();
          }
        }
      }

      if (
        currentSettings.untranslateMaster !== false &&
        currentSettings.untranslateTitles !== false
      ) {
        const isWatch = currentPath === '/watch';
        if (
          (!isHome || !currentSettings.hideHomeFeed) &&
          (!isWatch || !currentSettings.hideSidebar) &&
          Libertad.debouncedUntranslateFeed
        ) {
          Libertad.debouncedUntranslateFeed(currentSettings);
        }
      }
    });
  });

  const observeTarget = document.body || document.documentElement;
  observer.observe(observeTarget, {
    childList: true,
    subtree: true,
  });
})();
