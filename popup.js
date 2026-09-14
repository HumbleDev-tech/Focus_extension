/**
 * Libertad - Popup Interaction Controller
 * Handles global presets, custom configuration memory, dynamic themes (Dark, Light, OLED),
 * bilingual internationalization (English, Spanish), 3-tab navigation, interactive chip toggles,
 * power modules (Dislikes, Untranslate), and settings drawer.
 * Strict Rule: No emojis anywhere in code, logs, or UI bindings.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Core UI Elements
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const presetDesc = document.getElementById('presetDesc');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsDrawer = document.getElementById('settingsDrawer');
  const themeButtons = document.querySelectorAll('.theme-btn');
  const langButtons = document.querySelectorAll('.lang-btn');
  const scaleButtons = document.querySelectorAll('.scale-btn');
  const tabButtons = document.querySelectorAll('.tab-nav-btn');
  const tabPanels = {
    focus: document.getElementById('tabPanelFocus'),
    cleaner: document.getElementById('tabPanelCleaner'),
    extras: document.getElementById('tabPanelExtras'),
  };
  const i18nElements = document.querySelectorAll('[data-i18n]');
  const resetBtn = document.getElementById('resetBtn');
  const footerVersion = document.getElementById('footerVersion');

  // Populate dynamic manifest version
  if (
    footerVersion &&
    typeof chrome !== 'undefined' &&
    chrome.runtime?.getManifest
  ) {
    try {
      const manifest = chrome.runtime.getManifest();
      if (manifest?.version) {
        footerVersion.textContent = `v${manifest.version}`;
      }
    } catch (_) {}
  }

  // Toggle Checkboxes (Macro shields, cleaner chips, and power modules)
  const toggles = {
    // Focus Macro Shields
    hideHomeFeed: document.getElementById('toggleHomeFeed'),
    hideSidebar: document.getElementById('toggleSidebar'),
    hideComments: document.getElementById('toggleComments'),
    hideShorts: document.getElementById('toggleShorts'),
    hideEndScreens: document.getElementById('toggleEndScreens'),
    // Cleaner: Header & Search
    hideVoiceSearch: document.getElementById('toggleVoiceSearch'),
    hideCreateButton: document.getElementById('toggleCreateButton'),
    hideNotifications: document.getElementById('toggleNotifications'),
    hideSearchSuggestions: document.getElementById('toggleSearchSuggestions'),
    hideFilterChips: document.getElementById('toggleFilterChips'),
    // Cleaner: Player & Overlays
    hideAutoplay: document.getElementById('toggleAutoplay'),
    hideUpNext: document.getElementById('toggleUpNext'),
    hideWatermark: document.getElementById('toggleWatermark'),
    hidePaidPromo: document.getElementById('togglePaidPromo'),
    hideMiniplayer: document.getElementById('toggleMiniplayer'),
    // Cleaner: Action Bar & Social
    hideAskAi: document.getElementById('toggleAskAi'),
    hideDownload: document.getElementById('toggleDownload'),
    hideThanksClips: document.getElementById('toggleThanksClips'),
    hideJoinButton: document.getElementById('toggleJoinButton'),
    hideShare: document.getElementById('toggleShare'),
    hideSave: document.getElementById('toggleSave'),
    hideLikeDislike: document.getElementById('toggleLikeDislike'),
    hideSubscribeButton: document.getElementById('toggleSubscribeButton'),
    hideSubscriberCount: document.getElementById('toggleSubscriberCount'),
    hideViewsDate: document.getElementById('toggleViewsDate'),
    hideMoreActions: document.getElementById('toggleMoreActions'),
    // Cleaner: Feeds & Navigation
    hideMerchShelf: document.getElementById('toggleMerchShelf'),
    hideLiveChat: document.getElementById('toggleLiveChat'),
    hideTrending: document.getElementById('toggleTrending'),
    hideMoreFromYoutube: document.getElementById('toggleMoreFromYoutube'),
    // Power Modules
    showDislikes: document.getElementById('toggleDislikes'),
    untranslateTitles: document.getElementById('toggleUntranslate'),
    skipSponsors: document.getElementById('toggleSponsors'),
  };

  const chipLabels = document.querySelectorAll('.chip-toggle');

  // Auto-detect optimal UI scale based on monitor resolution & DPI
  function detectDefaultScale() {
    const screenW = window.screen ? window.screen.width || 1920 : 1920;
    const dpr = window.devicePixelRatio || 1;
    const effectiveW = screenW * dpr;

    if (screenW >= 3440 || (effectiveW >= 3840 && dpr < 1.5)) {
      return '140';
    }
    if (screenW >= 2400 || (effectiveW >= 2560 && dpr <= 1.25)) {
      return '120';
    }
    return '100';
  }

  // State initialized with single source of truth defaults
  let state = {
    ...DEFAULT_SETTINGS,
    lang: navigator.language?.startsWith('es') ? 'es' : 'en',
    scale: 'auto',
    customConfig: { ...DEFAULT_SETTINGS.customConfig },
  };

  // Helper for safe translation
  function t(key) {
    if (typeof getTranslation === 'function') {
      return getTranslation(key, state.lang);
    }
    return key;
  }

  // Load state from chrome.storage.sync
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      state = {
        ...DEFAULT_SETTINGS,
        ...saved,
        customConfig: {
          ...DEFAULT_SETTINGS.customConfig,
          ...(saved.customConfig || {}),
        },
      };
      if (!state.lang || state.lang === 'auto') {
        state.lang = navigator.language?.startsWith('es') ? 'es' : 'en';
      }
      if (state.scale === '115') {
        state.scale = '120';
      } else if (state.scale === '125') {
        state.scale = '140';
      } else if (!state.scale || state.scale === 'auto') {
        state.scale = detectDefaultScale();
      }
      if (!state.activeTab) {
        state.activeTab = 'focus';
      }
    }
    applyThemeAndScale();
    renderUI();
  });

  // Apply visual theme and UI zoom to root
  function applyThemeAndScale() {
    document.documentElement.setAttribute('data-theme', state.theme);
    try {
      localStorage.setItem('libertad_theme', state.theme);
    } catch (_) {}
    const activeScale =
      state.scale && state.scale !== 'auto'
        ? state.scale
        : detectDefaultScale();
    document.documentElement.setAttribute('data-scale', activeScale);
    try {
      localStorage.setItem('libertad_scale', activeScale);
    } catch (_) {}
  }

  // Render all interactive elements and localized strings
  function renderUI() {
    // Internationalization update
    i18nElements.forEach((el) => {
      if (el === resetBtn && resetBtn.classList.contains('is-success')) {
        return;
      }
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // Theme buttons active state
    themeButtons.forEach((btn) => {
      if (btn.getAttribute('data-theme') === state.theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Language buttons active state
    langButtons.forEach((btn) => {
      if (btn.getAttribute('data-lang') === state.lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Scale buttons active state
    const currentScale =
      state.scale && state.scale !== 'auto'
        ? state.scale
        : detectDefaultScale();
    scaleButtons.forEach((btn) => {
      if (btn.getAttribute('data-scale') === currentScale) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Tab buttons and panels
    tabButtons.forEach((btn) => {
      const tab = btn.getAttribute('data-tab');
      btn.classList.toggle('active', tab === state.activeTab);
    });
    Object.entries(tabPanels).forEach(([key, panel]) => {
      if (panel) {
        panel.classList.toggle('active', key === state.activeTab);
      }
    });

    // Toggle checkboxes
    for (const [key, el] of Object.entries(toggles)) {
      if (el) {
        el.checked = !!state[key];
      }
    }

    // Update chip toggle active styles
    chipLabels.forEach((chip) => {
      const forId = chip.getAttribute('for');
      const input = document.getElementById(forId);
      if (input) {
        chip.classList.toggle('active', input.checked);
      }
    });

    // Preset buttons active state
    presetButtons.forEach((btn) => {
      const p = btn.getAttribute('data-preset');
      if (p === state.preset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Preset description
    if (PRESET_MAP[state.preset]) {
      presetDesc.textContent = t(PRESET_MAP[state.preset].descKey);
    } else {
      presetDesc.textContent = t('descCustom');
    }

    // Status pill
    const isOff =
      state.preset === 'off' ||
      (!state.hideHomeFeed &&
        !state.hideSidebar &&
        !state.hideComments &&
        !state.hideShorts &&
        !state.hideEndScreens);
    const effectivePreset = isOff ? 'off' : state.preset;
    statusPill.setAttribute('data-preset', effectivePreset);
    if (isOff) {
      statusPill.classList.add('is-off');
      statusText.textContent = t('statusOff');
    } else {
      statusPill.classList.remove('is-off');
      const presetKeyMap = {
        off: 'presetOff',
        basic: 'presetBasic',
        balanced: 'presetBalanced',
        extreme: 'presetExtreme',
        custom: 'presetCustom',
      };
      const pKey = presetKeyMap[state.preset];
      statusText.textContent = pKey ? t(pKey) : state.preset.toUpperCase();
    }
  }

  // Save current state to storage
  function saveState() {
    chrome.storage.sync.set(state, () => {
      renderUI();
    });
  }

  // Settings Drawer toggle button
  if (settingsToggleBtn && settingsDrawer) {
    settingsToggleBtn.addEventListener('click', () => {
      const isOpen = settingsDrawer.classList.toggle('open');
      settingsToggleBtn.classList.toggle('active', isOpen);
    });
  }

  // Tab navigation clicks (Enfoque, Limpieza UI, Extras)
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenTab = btn.getAttribute('data-tab');
      state.activeTab = chosenTab;
      saveState();
    });
  });

  // Theme button clicks
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenTheme = btn.getAttribute('data-theme');
      state.theme = chosenTheme;
      document.documentElement.setAttribute('data-theme', chosenTheme);
      try {
        localStorage.setItem('libertad_theme', chosenTheme);
      } catch (_) {}
      saveState();
    });
  });

  // Language button clicks
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenLang = btn.getAttribute('data-lang');
      state.lang = chosenLang;
      saveState();
    });
  });

  // Scale button clicks
  scaleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenScale = btn.getAttribute('data-scale');
      state.scale = chosenScale;
      document.documentElement.setAttribute('data-scale', chosenScale);
      try {
        localStorage.setItem('libertad_scale', chosenScale);
      } catch (_) {}
      saveState();
    });
  });

  // Preset button clicks
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenPreset = btn.getAttribute('data-preset');
      if (chosenPreset === 'custom') {
        state.preset = 'custom';
        if (!state.customConfig) {
          state.customConfig = {};
          TOGGLE_KEYS.forEach((key) => {
            state.customConfig[key] = state[key];
          });
        }
        // Restore custom preferences
        TOGGLE_KEYS.forEach((key) => {
          if (state.customConfig[key] !== undefined) {
            state[key] = !!state.customConfig[key];
          }
        });
        saveState();
      } else if (PRESET_MAP[chosenPreset]) {
        state.preset = chosenPreset;
        const config = PRESET_MAP[chosenPreset];
        TOGGLE_KEYS.forEach((key) => {
          if (config[key] !== undefined) {
            state[key] = config[key];
          }
        });
        saveState();
      }
    });
  });

  // Individual toggle changes (Focus switches and Cleaner chips)
  TOGGLE_KEYS.forEach((key) => {
    if (!toggles[key]) return;
    toggles[key].addEventListener('change', (e) => {
      state[key] = e.target.checked;
      if (!state.customConfig) {
        state.customConfig = {};
      }
      state.customConfig[key] = e.target.checked;
      state.preset = 'custom';
      saveState();
    });
  });

  // Power Modules: Dislikes toggle
  toggles.showDislikes?.addEventListener('change', (e) => {
    state.showDislikes = e.target.checked;
    saveState();
  });

  // Power Modules: Untranslate titles toggle
  toggles.untranslateTitles?.addEventListener('change', (e) => {
    state.untranslateTitles = e.target.checked;
    saveState();
  });

  // Power Modules: Skip sponsors toggle
  toggles.skipSponsors?.addEventListener('change', (e) => {
    state.skipSponsors = e.target.checked;
    saveState();
  });

  // Reset configuration button
  resetBtn?.addEventListener('click', () => {
    const currentScale = state.scale || detectDefaultScale();
    state = {
      ...DEFAULT_SETTINGS,
      theme: state.theme || DEFAULT_SETTINGS.theme,
      lang: state.lang || 'en',
      scale: currentScale,
      customConfig: { ...DEFAULT_SETTINGS.customConfig },
    };
    saveState();

    if (resetBtn) {
      resetBtn.classList.add('is-success');
      resetBtn.textContent =
        state.lang === 'es' ? 'CONFIG REINICIADA' : 'CONFIG RESTORED';
      setTimeout(() => {
        resetBtn.classList.remove('is-success');
        resetBtn.textContent = t('resetBtn');
      }, 1200);
    }
  });

  // Safe external navigation via chrome.tabs.create
  document.querySelectorAll('a.drawer-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('href');
      if (url && typeof chrome !== 'undefined' && chrome.tabs?.create) {
        chrome.tabs.create({ url });
      } else if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
});
