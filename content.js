/**
 * Libertad - YouTube Content Orchestrator
 * Central lifecycle entry point connecting modular engines:
 * Cache, Utils, Styles, Shorts, Subscriptions, Dislikes, Sponsors, and Untranslate.
 */
(function () {
  'use strict';

  const Libertad = globalThis.Libertad || {};

  // The service worker re-injects the content bundle after an extension
  // update. Without this, the stale instance would keep its listeners
  // attached and the tab would keep running pre-update code until the user
  // manually reloads. The previous instance is torn down first so the new
  // one takes over cleanly (see utils.js destroyPreviousInstance).
  if (window.__LIBERTAD_CONTENT_INITIALIZED) {
    // Stop the stale orchestrator first so it stops reacting to events, then
    // release the stale modules so the fresh instance starts from a clean DOM.
    safeRun('teardownPreviousContent', window.__LIBERTAD_CONTENT_TEARDOWN);
    safeRun('destroyPreviousInstance', Libertad.destroyPreviousInstance);
  }
  window.__LIBERTAD_CONTENT_INITIALIZED = true;

  // Settings hydration state: irreversible module actions (redirects, network
  // fetches) must wait until storage has been consulted at least once.
  let settingsHydrated = false;

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
          hydrated: settingsHydrated,
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
  const onAgentReady = () => {
    broadcastAgentSettings();
  };

  window.addEventListener('libertad-agent-ready', onAgentReady);

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

  // Initialize registered plugin modules at document_start. Bootstrap init is
  // explicitly marked as pre-hydration: modules only perform reversible,
  // FOUC-critical DOM work; irreversible actions wait for the hydrated pass.
  safeRun('broadcastInit', Libertad.broadcastInit, currentSettings, {
    hydrated: false,
  });

  // Synchronize agent-facing state (style/DOM cleaners are owned by the styles plugin)
  function syncAllModules() {
    broadcastAgentSettings();
  }

  // Module DOM work is delegated to registered plugins via lifecycle events.

  // Load saved settings from storage with local priority and sync fallback
  const applyLoadedSettings = (saved) => {
    settingsHydrated = true;
    // Internal UI keys (profiles_orphaned, paused snapshot, welcome flag) live
    // in the same storage area but are not settings: they must never reach
    // the modules, the agent, or the sessionStorage mirror.
    const cleanSaved =
      typeof stripInternalKeys === 'function'
        ? stripInternalKeys(saved)
        : saved;
    if (cleanSaved && Object.keys(cleanSaved).length > 0) {
      currentSettings = { ...currentSettings, ...cleanSaved };
      try {
        sessionStorage.setItem(
          'libertad_settings',
          JSON.stringify(currentSettings),
        );
      } catch (_) {}
    }
    safeRun('broadcastInit', Libertad.broadcastInit, currentSettings, {
      hydrated: true,
    });
    syncAllModules();
  };

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(null, (localSaved) => {
      // The emptiness check must run on the cleaned payload: local storage
      // frequently holds nothing but internal UI keys (the welcome flag, the
      // archived profiles, the pause snapshot). Deciding on the raw object
      // would skip the sync fallback and silently load the defaults instead
      // of the settings the user synced to this device.
      const cleanLocal = stripInternalKeys(localSaved);
      if (cleanLocal && Object.keys(cleanLocal).length > 0) {
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
  const onStorageChanged = (changes, areaName) => {
    // Only react to local storage events (fallback to sync only if local is unsupported)
    if (areaName !== 'local' && chrome.storage?.local) return;

    settingsHydrated = true;

    for (const key in changes) {
      if (
        typeof INTERNAL_STORAGE_KEYS !== 'undefined' &&
        INTERNAL_STORAGE_KEYS.includes(key)
      ) {
        continue;
      }
      currentSettings[key] = changes[key].newValue;
    }

    try {
      sessionStorage.setItem(
        'libertad_settings',
        JSON.stringify(currentSettings),
      );
    } catch (_) {}

    // Style/DOM cleaners are owned by the styles plugin via broadcastSettingsChange below.

    broadcastAgentSettings();
    safeRun(
      'broadcastSettingsChange',
      Libertad.broadcastSettingsChange,
      currentSettings,
      changes,
    );
  };

  chrome.storage.onChanged.addListener(onStorageChanged);

  let lastCheckedHref = window.location.href;

  // Handle YouTube SPA Navigation events
  const onNavigateStart = (event) => {
    const targetUrl = event?.detail?.url;
    safeRun(
      'broadcastNavigation',
      Libertad.broadcastNavigation,
      targetUrl || window.location.href,
      currentSettings,
      'start',
    );
  };

  const onNavigateFinish = () => {
    lastCheckedHref = window.location.href;
    safeRun(
      'broadcastNavigation',
      Libertad.broadcastNavigation,
      window.location.href,
      currentSettings,
      'finish',
    );
    syncAllModules();
  };

  const onPopState = () => {
    lastCheckedHref = window.location.href;
    safeRun(
      'broadcastNavigation',
      Libertad.broadcastNavigation,
      window.location.href,
      currentSettings,
      'finish',
    );
    syncAllModules();
  };

  window.addEventListener('yt-navigate-start', onNavigateStart);
  window.addEventListener('yt-navigate-finish', onNavigateFinish);
  window.addEventListener('popstate', onPopState);

  // High-performance cooperative background scheduler: keeps non-urgent DOM passes off the render frame budget
  let isIdleScheduled = false;
  let idleTaskHandle = null;
  const scheduleIdleTask = (callback) => {
    if (isIdleScheduled) return;
    isIdleScheduled = true;
    const runTask = () => {
      isIdleScheduled = false;
      idleTaskHandle = null;
      callback();
    };
    if (typeof window.requestIdleCallback === 'function') {
      idleTaskHandle = window.requestIdleCallback(runTask, { timeout: 150 });
    } else {
      idleTaskHandle = setTimeout(runTask, 30);
    }
    return idleTaskHandle;
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
        // Delegated module DOM mutations for all registered modules
        // (styles plugin owns cleanExplore/cleanSidebar/cleanAutoplay/cleanLiveChat)
        safeRun(
          'broadcastDomMutation',
          Libertad.broadcastDomMutation,
          currentSettings,
        );
      });
    });
  });

  const observeTarget = document.body || document.documentElement;
  observer.observe(observeTarget, {
    childList: true,
    subtree: true,
  });

  // Teardown: releases the orchestrator's own listeners, observer and pending
  // idle task, so a re-injected instance can take over without duplicating
  // DOM passes or reacting twice to the same storage event.
  function teardownContent() {
    observer.disconnect();
    window.removeEventListener('libertad-agent-ready', onAgentReady);
    window.removeEventListener('yt-navigate-start', onNavigateStart);
    window.removeEventListener('yt-navigate-finish', onNavigateFinish);
    window.removeEventListener('popstate', onPopState);
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.removeListener(onStorageChanged);
    }
    if (idleTaskHandle !== null) {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleTaskHandle);
      } else {
        clearTimeout(idleTaskHandle);
      }
      idleTaskHandle = null;
    }
    isIdleScheduled = false;
  }

  window.__LIBERTAD_CONTENT_TEARDOWN = teardownContent;
})();
