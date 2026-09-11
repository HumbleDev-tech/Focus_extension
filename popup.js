/**
 * Libertad - Popup Interaction Controller
 * Handles presets, custom configuration memory, dynamic themes (Dark, Light, OLED),
 * bilingual internationalization (English, Spanish), tab navigation, and UI cleaner toggles.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const presetDesc = document.getElementById('presetDesc');
  const themeButtons = document.querySelectorAll('.theme-btn');
  const langButtons = document.querySelectorAll('.lang-btn');
  const scaleButtons = document.querySelectorAll('.scale-btn');
  const tabButtons = document.querySelectorAll('.tab-nav-btn');
  const tabPanels = {
    focus: document.getElementById('tabPanelFocus'),
    cleaner: document.getElementById('tabPanelCleaner'),
  };
  const i18nElements = document.querySelectorAll('[data-i18n]');
  const resetBtn = document.getElementById('resetBtn');

  // Toggle Checkboxes
  const toggles = {
    // Focus Shields
    hideHomeFeed: document.getElementById('toggleHomeFeed'),
    hideSidebar: document.getElementById('toggleSidebar'),
    hideComments: document.getElementById('toggleComments'),
    hideShorts: document.getElementById('toggleShorts'),
    hideEndScreens: document.getElementById('toggleEndScreens'),
    // Cleaner Shields
    hideVoiceSearch: document.getElementById('toggleVoiceSearch'),
    hideAskAi: document.getElementById('toggleAskAi'),
    hideDownload: document.getElementById('toggleDownload'),
    hideThanksClips: document.getElementById('toggleThanksClips'),
    hideShare: document.getElementById('toggleShare'),
    // Auxiliary Modules
    showDislikes: document.getElementById('toggleDislikes'),
    untranslateTitles: document.getElementById('toggleUntranslate'),
  };

  const TOGGLE_KEYS = [
    'hideHomeFeed',
    'hideSidebar',
    'hideComments',
    'hideShorts',
    'hideEndScreens',
    'hideVoiceSearch',
    'hideAskAi',
    'hideDownload',
    'hideThanksClips',
    'hideShare',
  ];

  // Preset Configurations
  const PRESET_MAP = {
    off: {
      hideHomeFeed: false,
      hideSidebar: false,
      hideComments: false,
      hideShorts: false,
      hideEndScreens: false,
      hideVoiceSearch: false,
      hideAskAi: false,
      hideDownload: false,
      hideThanksClips: false,
      hideShare: false,
      descKey: 'descOff',
    },
    basic: {
      hideHomeFeed: false,
      hideSidebar: false,
      hideComments: true,
      hideShorts: false,
      hideEndScreens: true,
      hideVoiceSearch: false,
      hideAskAi: true,
      hideDownload: true,
      hideThanksClips: false,
      hideShare: false,
      descKey: 'descBasic',
    },
    balanced: {
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      hideVoiceSearch: true,
      hideAskAi: true,
      hideDownload: true,
      hideThanksClips: true,
      hideShare: false,
      descKey: 'descBalanced',
    },
    extreme: {
      hideHomeFeed: true,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      hideVoiceSearch: true,
      hideAskAi: true,
      hideDownload: true,
      hideThanksClips: true,
      hideShare: true,
      descKey: 'descExtreme',
    },
    custom: {
      descKey: 'descCustom',
    },
  };

  // Auto-detect optimal UI scale based on monitor resolution & DPI
  function detectDefaultScale() {
    const screenW = window.screen ? window.screen.width || 1920 : 1920;
    const dpr = window.devicePixelRatio || 1;
    const effectiveW = screenW * dpr;

    // 4K monitors (3840+ px physical or ultrawide >= 3440px) with low/medium OS scaling
    if (screenW >= 3440 || (effectiveW >= 3840 && dpr < 1.5)) {
      return '125';
    }
    // 27" 1440p monitors (2560x1440) or large 2K displays
    if (screenW >= 2400 || (effectiveW >= 2560 && dpr <= 1.25)) {
      return '115';
    }
    // Standard 1080p, 13"-15" laptops, and compact displays
    return '100';
  }

  // State
  let state = {
    theme: 'dark',
    lang: navigator.language?.startsWith('es') ? 'es' : 'en',
    scale: 'auto',
    activeTab: 'focus',
    preset: 'balanced',
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    hideVoiceSearch: true,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: true,
    hideShare: false,
    showDislikes: true,
    untranslateTitles: true,
    customConfig: {
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      hideVoiceSearch: true,
      hideAskAi: true,
      hideDownload: true,
      hideThanksClips: true,
      hideShare: false,
    },
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
      state = { ...state, ...saved };
      if (!state.lang || state.lang === 'auto') {
        state.lang = navigator.language?.startsWith('es') ? 'es' : 'en';
      }
      if (!state.scale || state.scale === 'auto') {
        state.scale = detectDefaultScale();
      }
      if (!state.activeTab) {
        state.activeTab = 'focus';
      }
      if (!state.customConfig) {
        state.customConfig = {};
      }
      const defaultCleaner = {
        hideVoiceSearch: true,
        hideAskAi: true,
        hideDownload: true,
        hideThanksClips: true,
        hideShare: false,
      };
      let needsMigration = false;
      for (const [k, v] of Object.entries(defaultCleaner)) {
        if (state[k] === undefined) {
          state[k] = v;
          needsMigration = true;
        }
        if (state.customConfig[k] === undefined) {
          state.customConfig[k] = v;
          needsMigration = true;
        }
      }
      if (needsMigration) {
        chrome.storage.sync.set(state);
      }
    }
    applyThemeAndScale();
    renderUI();
  });

  // Apply visual theme and UI zoom to root
  function applyThemeAndScale() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const activeScale =
      state.scale && state.scale !== 'auto'
        ? state.scale
        : detectDefaultScale();
    document.documentElement.setAttribute('data-scale', activeScale);
  }

  // Render all interactive elements and localized strings
  function renderUI() {
    // Internationalization update
    i18nElements.forEach((el) => {
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

  // Tab navigation clicks
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

  // Individual toggle changes (both Focus and Cleaner tabs)
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

  // Dislikes toggle
  toggles.showDislikes?.addEventListener('change', (e) => {
    state.showDislikes = e.target.checked;
    saveState();
  });

  // Untranslate titles toggle
  toggles.untranslateTitles?.addEventListener('change', (e) => {
    state.untranslateTitles = e.target.checked;
    saveState();
  });

  // Reset to default
  resetBtn.addEventListener('click', () => {
    const currentScale = state.scale || detectDefaultScale();
    state = {
      theme: state.theme || 'dark',
      lang: state.lang || 'en',
      scale: currentScale,
      activeTab: 'focus',
      preset: 'balanced',
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      hideVoiceSearch: true,
      hideAskAi: true,
      hideDownload: true,
      hideThanksClips: true,
      hideShare: false,
      showDislikes: true,
      untranslateTitles: true,
      customConfig: {
        hideHomeFeed: false,
        hideSidebar: true,
        hideComments: true,
        hideShorts: true,
        hideEndScreens: true,
        hideVoiceSearch: true,
        hideAskAi: true,
        hideDownload: true,
        hideThanksClips: true,
        hideShare: false,
      },
    };
    saveState();
  });
});
