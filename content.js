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

  // Initialize registered plugin modules at document_start
  safeRun('broadcastInit', Libertad.broadcastInit, currentSettings);

  // Apply styles immediately at document_start
  safeRun('applyStyles', Libertad.applyStyles, currentSettings);

  // Synchronize all modules with current settings
  function syncAllModules() {
    safeRun('applyStyles', Libertad.applyStyles, currentSettings);
    safeRun('cleanLiveChat', Libertad.cleanLiveChat, currentSettings);
    safeRun('cleanExplore', Libertad.cleanExplore, currentSettings);
    safeRun('cleanAutoplay', Libertad.cleanAutoplay, currentSettings);
    safeRun('cleanSidebar', Libertad.cleanSidebar, currentSettings);
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
    broadcastAgentSettings();
  }

  // Initial load and DOMContentLoaded events
  if (document.readyState !== 'loading') {
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
  }
  document.addEventListener('DOMContentLoaded', () => {
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
  });
  window.addEventListener('load', () => {
    safeRun('untranslateFeed', Libertad.untranslateFeed, currentSettings);
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
    safeRun('broadcastInit', Libertad.broadcastInit, currentSettings);
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
        applyLoadedSettings(null);
      }
    });
  } else if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync.get(null, (syncSaved) => {
      applyLoadedSettings(syncSaved);
    });
  } else {
    applyLoadedSettings(null);
  }

  // Listen for storage changes in real time with granular key diffing
  chrome.storage.onChanged.addListener((changes, areaName) => {
    // Only react to local storage events (fallback to sync only if local is unsupported)
    if (areaName !== 'local' && chrome.storage?.local) return;

    let stylesChanged = false;
    let titleChanged = false;

    for (const key in changes) {
      currentSettings[key] = changes[key].newValue;
      if (key === 'showDislikes' || key === 'hideLikeDislike') {
        stylesChanged = true;
      }
      if (key.startsWith('untranslate')) {
        titleChanged = true;
      }
      if (key === 'hideShorts' || key === 'redirectHomeToSubscriptions') {
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

    broadcastAgentSettings();
    safeRun(
      'broadcastSettingsChange',
      Libertad.broadcastSettingsChange,
      currentSettings,
      changes,
    );
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
  });

  let lastCheckedHref = window.location.href;
  let lastFlexySyncedHref = null;

  // Handle YouTube SPA Navigation events
  window.addEventListener('yt-navigate-start', (event) => {
    lastFlexySyncedHref = null;
    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy?.hasAttribute('flexy-chat-collapsed_')) {
      flexy.removeAttribute('flexy-chat-collapsed_');
    }
    const targetUrl = event?.detail?.url;
    safeRun('resetUntranslateNavigation', Libertad.resetUntranslateNavigation);
    safeRun('resetStylesNavigation', Libertad.resetStylesNavigation);
    safeRun(
      'broadcastNavigation',
      Libertad.broadcastNavigation,
      targetUrl || window.location.href,
      currentSettings,
      'start',
    );
  });

  window.addEventListener('yt-navigate-finish', () => {
    lastCheckedHref = window.location.href;
    lastFlexySyncedHref = window.location.href;
    safeRun('resetStylesNavigation', Libertad.resetStylesNavigation);
    safeRun(
      'broadcastNavigation',
      Libertad.broadcastNavigation,
      window.location.href,
      currentSettings,
      'finish',
    );
    syncAllModules();
  });

  window.addEventListener('popstate', () => {
    lastCheckedHref = window.location.href;
    lastFlexySyncedHref = null;
    safeRun('resetStylesNavigation', Libertad.resetStylesNavigation);
    safeRun(
      'broadcastNavigation',
      Libertad.broadcastNavigation,
      window.location.href,
      currentSettings,
      'finish',
    );
    syncAllModules();
  });

  // High-performance cooperative background scheduler: keeps non-urgent DOM passes off the render frame budget
  let isIdleScheduled = false;
  const scheduleIdleTask = (callback) => {
    if (isIdleScheduled) return;
    isIdleScheduled = true;
    const runTask = () => {
      isIdleScheduled = false;
      callback();
    };
    if (typeof window.requestIdleCallback === 'function') {
      return window.requestIdleCallback(runTask, { timeout: 150 });
    }
    return setTimeout(runTask, 30);
  };

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

    // Immediate Frame Phase: strictly for critical navigation redirects and fast route tracking
    window.requestAnimationFrame(() => {
      isCheckingMutation = false;

      const currentHref = window.location.href;
      const hrefChanged = currentHref !== lastCheckedHref;
      lastCheckedHref = currentHref;

      if (hrefChanged) {
        safeRun(
          'broadcastNavigation',
          Libertad.broadcastNavigation,
          currentHref,
          currentSettings,
          'mutation',
        );
      }

      // Deferred Idle Phase: non-blocking execution of heavier DOM cleaners and feed analyzers
      scheduleIdleTask(() => {
        const activePath = window.location.pathname;
        const activeHref = window.location.href;

        // Delegated module DOM mutations for all registered modules
        safeRun(
          'broadcastDomMutation',
          Libertad.broadcastDomMutation,
          currentSettings,
        );

        if (currentSettings.hideExplore) {
          const isWatch =
            activePath === '/watch' || activePath.startsWith('/live');
          const isGuideOpen = Boolean(
            document.querySelector(
              'ytd-app[guide-persistent-and-visible], ytd-guide-renderer[opened]',
            ),
          );
          if (!isWatch || isGuideOpen) {
            safeRun('cleanExplore', Libertad.cleanExplore, currentSettings);
          }
        }

        if (activePath === '/watch') {
          if (
            lastFlexySyncedHref !== activeHref &&
            document.querySelector('ytd-watch-flexy')
          ) {
            lastFlexySyncedHref = activeHref;
            safeRun('cleanSidebar', Libertad.cleanSidebar, currentSettings);
          }
          if (currentSettings.hideAutoplay) {
            safeRun('cleanAutoplay', Libertad.cleanAutoplay, currentSettings);
          }
          if (currentSettings.hideLiveChat) {
            safeRun('cleanLiveChat', Libertad.cleanLiveChat, currentSettings);
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
        }

        if (
          currentSettings.untranslateMaster !== false &&
          currentSettings.untranslateTitles !== false
        ) {
          const isWatch = activePath === '/watch';
          const isHome = activePath === '/' || activePath === '';
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
  });

  const observeTarget = document.body || document.documentElement;
  observer.observe(observeTarget, {
    childList: true,
    subtree: true,
  });
})();
