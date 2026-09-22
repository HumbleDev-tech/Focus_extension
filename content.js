/**
 * Libertad - YouTube Content Orchestrator
 * Central lifecycle entry point connecting modular engines:
 * Cache, Utils, Styles, Shorts, Subscriptions, Dislikes, Sponsors, and Untranslate.
 */

(function () {
  'use strict';

  if (window.__LIBERTAD_CONTENT_INITIALIZED) return;
  window.__LIBERTAD_CONTENT_INITIALIZED = true;

  const Libertad = globalThis.Libertad || {};

  // Single source of truth defaults from constants.js
  let currentSettings =
    typeof DEFAULT_SETTINGS !== 'undefined'
      ? { ...DEFAULT_SETTINGS }
      : typeof PRESET_MAP !== 'undefined' && PRESET_MAP.balanced
        ? { preset: 'balanced', ...extractToggles(PRESET_MAP.balanced) }
        : {};

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

  // Broadcast settings to main world player agent (agent.js)
  function broadcastAgentSettings() {
    window.dispatchEvent(
      new CustomEvent('libertad-agent-settings', {
        detail: {
          isOff: Boolean(
            currentSettings.isOff || currentSettings.preset === 'off',
          ),
          hideAutoplay: Boolean(
            currentSettings.hideAutoplay &&
              !currentSettings.isOff &&
              currentSettings.preset !== 'off',
          ),
          untranslateMaster: currentSettings.untranslateMaster !== false,
          untranslateAudio: currentSettings.untranslateAudio !== false,
          untranslateCaptions: currentSettings.untranslateCaptions !== false,
        },
      }),
    );
  }
  broadcastAgentSettings();

  // Listen for agent readiness event from main world
  window.addEventListener('libertad-agent-ready', () => {
    broadcastAgentSettings();
  });

  // Resilient execution wrapper: prevents any single module failure from breaking the pipeline
  function safeRun(moduleName, fn, ...args) {
    if (typeof fn !== 'function') return undefined;
    try {
      return fn(...args);
    } catch (err) {
      console.warn(`[Libertad] Module fault isolated in ${moduleName}:`, err);
      return undefined;
    }
  }

  // Early route checks at document_start
  safeRun(
    'redirectShortsIfActive',
    Libertad.redirectShortsIfActive,
    currentSettings,
  );
  safeRun(
    'redirectHomeToSubscriptions',
    Libertad.redirectHomeToSubscriptions,
    currentSettings,
  );

  // Initialize SPA link interceptor for instantaneous subscription routing
  safeRun(
    'setupSubscriptionsLinkInterceptor',
    Libertad.setupSubscriptionsLinkInterceptor,
    () => currentSettings,
  );

  // Apply styles immediately at document_start
  safeRun('applyStyles', Libertad.applyStyles, currentSettings);

  // Synchronize all modules with current settings
  function syncAllModules() {
    safeRun('applyStyles', Libertad.applyStyles, currentSettings);
    safeRun('cleanLiveChat', Libertad.cleanLiveChat, currentSettings);
    safeRun('cleanExplore', Libertad.cleanExplore, currentSettings);
    safeRun('cleanAutoplay', Libertad.cleanAutoplay, currentSettings);
    safeRun('cleanSidebar', Libertad.cleanSidebar, currentSettings);
    safeRun(
      'redirectShortsIfActive',
      Libertad.redirectShortsIfActive,
      currentSettings,
    );
    safeRun(
      'redirectHomeToSubscriptions',
      Libertad.redirectHomeToSubscriptions,
      currentSettings,
    );
    safeRun('updateDislikeCount', Libertad.updateDislikeCount, currentSettings);
    safeRun('updateWatchTitle', Libertad.updateWatchTitle, currentSettings);
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
    safeRun(
      'enforceOriginalAudioTrack',
      Libertad.enforceOriginalAudioTrack,
      currentSettings,
    );
    safeRun(
      'restoreOriginalDescription',
      Libertad.restoreOriginalDescription,
      currentSettings,
    );
    safeRun(
      'neutralizeAutoTranslatedCaptions',
      Libertad.neutralizeAutoTranslatedCaptions,
      currentSettings,
    );
    safeRun(
      'restoreOriginalChapters',
      Libertad.restoreOriginalChapters,
      currentSettings,
    );
    safeRun(
      'updateSponsorSegments',
      Libertad.updateSponsorSegments,
      currentSettings,
    );
    safeRun(
      'bindVideoSponsorListener',
      Libertad.bindVideoSponsorListener,
      currentSettings,
    );
    broadcastAgentSettings();
  }

  // Initial load and DOMContentLoaded events
  if (document.readyState !== 'loading') {
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
    safeRun('updateZenBanner', Libertad.updateZenBanner, currentSettings);
  }
  document.addEventListener('DOMContentLoaded', () => {
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
    safeRun('updateZenBanner', Libertad.updateZenBanner, currentSettings);
  });
  window.addEventListener('load', () => {
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
    safeRun('updateZenBanner', Libertad.updateZenBanner, currentSettings);
  });

  // Load saved settings from storage with local priority and sync fallback
  const applyLoadedSettings = (saved) => {
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
  };

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(null, (localSaved) => {
      if (localSaved && Object.keys(localSaved).length > 0) {
        applyLoadedSettings(localSaved);
      } else if (chrome.storage?.sync) {
        chrome.storage.sync.get(null, (syncSaved) => {
          applyLoadedSettings(syncSaved);
        });
      } else {
        syncAllModules();
      }
    });
  } else if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync.get(null, (syncSaved) => {
      applyLoadedSettings(syncSaved);
    });
  } else {
    syncAllModules();
  }

  // Listen for storage changes in real time with granular key diffing
  chrome.storage.onChanged.addListener((changes, areaName) => {
    // Only react to local storage events (fallback to sync only if local is unsupported)
    if (areaName !== 'local' && chrome.storage?.local) return;

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
        stylesChanged = true;
      }
      if (key.startsWith('untranslate')) {
        titleChanged = true;
      }
      if (key.startsWith('skipSponsors') || key.startsWith('sponsorSkip')) {
        sponsorsChanged = true;
      }
      if (key === 'hideShorts') {
        stylesChanged = true;
        shortsChanged = true;
      }
      if (key === 'redirectHomeToSubscriptions') {
        subscriptionsChanged = true;
        stylesChanged = true;
      }
      if (
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

    if (stylesChanged) {
      safeRun('applyStyles', Libertad.applyStyles, currentSettings);
      safeRun('cleanLiveChat', Libertad.cleanLiveChat, currentSettings);
      safeRun('cleanExplore', Libertad.cleanExplore, currentSettings);
      safeRun('cleanAutoplay', Libertad.cleanAutoplay, currentSettings);
      safeRun('cleanSidebar', Libertad.cleanSidebar, currentSettings);
    }
    if (shortsChanged) {
      safeRun(
        'redirectShortsIfActive',
        Libertad.redirectShortsIfActive,
        currentSettings,
      );
    }
    if (subscriptionsChanged) {
      safeRun(
        'redirectHomeToSubscriptions',
        Libertad.redirectHomeToSubscriptions,
        currentSettings,
      );
    }

    broadcastAgentSettings();
    if (dislikesChanged) {
      safeRun(
        'updateDislikeCount',
        Libertad.updateDislikeCount,
        currentSettings,
      );
    }
    if (titleChanged) {
      safeRun('updateWatchTitle', Libertad.updateWatchTitle, currentSettings);
      safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
      safeRun(
        'enforceOriginalAudioTrack',
        Libertad.enforceOriginalAudioTrack,
        currentSettings,
      );
      safeRun(
        'restoreOriginalDescription',
        Libertad.restoreOriginalDescription,
        currentSettings,
      );
      safeRun(
        'neutralizeAutoTranslatedCaptions',
        Libertad.neutralizeAutoTranslatedCaptions,
        currentSettings,
      );
      safeRun(
        'restoreOriginalChapters',
        Libertad.restoreOriginalChapters,
        currentSettings,
      );
    }
    if (sponsorsChanged) {
      safeRun(
        'updateSponsorSegments',
        Libertad.updateSponsorSegments,
        currentSettings,
      );
      safeRun(
        'bindVideoSponsorListener',
        Libertad.bindVideoSponsorListener,
        currentSettings,
      );
    }
  });

  let lastDislikeBtn = null;
  let lastCheckedHref = window.location.href;
  let lastFlexySyncedHref = null;

  // Handle YouTube SPA Navigation events
  window.addEventListener('yt-navigate-start', (event) => {
    lastDislikeBtn = null;
    lastFlexySyncedHref = null;
    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy?.hasAttribute('flexy-chat-collapsed_')) {
      flexy.removeAttribute('flexy-chat-collapsed_');
    }
    const targetUrl = event?.detail?.url;
    safeRun(
      'redirectShortsIfActive',
      Libertad.redirectShortsIfActive,
      currentSettings,
      targetUrl,
    );
    safeRun(
      'redirectHomeToSubscriptions',
      Libertad.redirectHomeToSubscriptions,
      currentSettings,
      targetUrl,
    );
    safeRun('updateZenBanner', Libertad.updateZenBanner, currentSettings);
    safeRun('resetSponsorNavigation', Libertad.resetSponsorNavigation);
    safeRun('resetUntranslateNavigation', Libertad.resetUntranslateNavigation);
  });

  window.addEventListener('yt-navigate-finish', () => {
    lastDislikeBtn = null;
    lastCheckedHref = window.location.href;
    lastFlexySyncedHref = window.location.href;
    syncAllModules();
  });

  window.addEventListener('popstate', () => {
    lastDislikeBtn = null;
    lastCheckedHref = window.location.href;
    lastFlexySyncedHref = null;
    safeRun(
      'redirectShortsIfActive',
      Libertad.redirectShortsIfActive,
      currentSettings,
    );
    safeRun(
      'redirectHomeToSubscriptions',
      Libertad.redirectHomeToSubscriptions,
      currentSettings,
    );
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
        safeRun(
          'redirectShortsIfActive',
          Libertad.redirectShortsIfActive,
          currentSettings,
        );
        safeRun(
          'redirectHomeToSubscriptions',
          Libertad.redirectHomeToSubscriptions,
          currentSettings,
        );
      }

      const isHome = currentPath === '/' || currentPath === '';
      if (isHome) {
        safeRun('updateZenBanner', Libertad.updateZenBanner, currentSettings);
      }
      if (currentSettings.hideExplore) {
        safeRun('cleanExplore', Libertad.cleanExplore, currentSettings);
      }

      if (currentPath === '/watch') {
        if (
          lastFlexySyncedHref !== currentHref &&
          document.querySelector('ytd-watch-flexy')
        ) {
          lastFlexySyncedHref = currentHref;
          safeRun('cleanSidebar', Libertad.cleanSidebar, currentSettings);
        }
        if (currentSettings.hideAutoplay) {
          safeRun('cleanAutoplay', Libertad.cleanAutoplay, currentSettings);
        }
        if (currentSettings.hideLiveChat) {
          safeRun('cleanLiveChat', Libertad.cleanLiveChat, currentSettings);
        }
        if (currentSettings.showDislikes && Libertad.findDislikeButton) {
          const hasBadge =
            lastDislikeBtn?.isConnected &&
            lastDislikeBtn.querySelector('.libertad-dislike-badge');
          if (!hasBadge) {
            const dislikeBtn = safeRun(
              'findDislikeButton',
              Libertad.findDislikeButton,
            );
            if (dislikeBtn) {
              lastDislikeBtn = dislikeBtn;
              if (!dislikeBtn.querySelector('.libertad-dislike-badge')) {
                safeRun(
                  'updateDislikeCount',
                  Libertad.updateDislikeCount,
                  currentSettings,
                );
              }
            }
          }
        }
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateTitles !== false
        ) {
          safeRun(
            'updateWatchTitle',
            Libertad.updateWatchTitle,
            currentSettings,
          );
        }
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateDescription !== false
        ) {
          safeRun(
            'restoreOriginalDescription',
            Libertad.restoreOriginalDescription,
            currentSettings,
          );
        }
        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateChapters !== false
        ) {
          safeRun(
            'restoreOriginalChapters',
            Libertad.restoreOriginalChapters,
            currentSettings,
          );
        }
        if (currentSettings.skipSponsors && Libertad.getActiveVideoId) {
          const activeVid = safeRun(
            'getActiveVideoId',
            Libertad.getActiveVideoId,
          );
          const currentSponsorVid =
            typeof Libertad.getCurrentSponsorVideoId === 'function'
              ? Libertad.getCurrentSponsorVideoId()
              : null;
          if (activeVid && activeVid !== currentSponsorVid) {
            safeRun(
              'updateSponsorSegments',
              Libertad.updateSponsorSegments,
              currentSettings,
            );
          }
          safeRun(
            'bindVideoSponsorListener',
            Libertad.bindVideoSponsorListener,
            currentSettings,
          );
          const segments =
            typeof Libertad.getCurrentSponsorSegments === 'function'
              ? Libertad.getCurrentSponsorSegments()
              : [];
          const hasContainer = Libertad.hasActiveSponsorContainer
            ? Libertad.hasActiveSponsorContainer()
            : false;
          if (segments.length > 0 && !hasContainer) {
            safeRun(
              'renderSponsorProgressBar',
              Libertad.renderSponsorProgressBar,
            );
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
          (!isWatch || !currentSettings.hideSidebar)
        ) {
          safeRun(
            'debouncedUntranslateFeed',
            Libertad.debouncedUntranslateFeed,
            currentSettings,
          );
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
