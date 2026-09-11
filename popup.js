/**
 * Libertad - Popup Interaction Controller
 * Handles presets, custom configuration memory, dynamic themes (Dark, Light, OLED),
 * and bilingual internationalization (English, Spanish).
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
  const i18nElements = document.querySelectorAll('[data-i18n]');

  const customAccordionBtn = document.getElementById('customAccordionBtn');
  const togglesList = document.getElementById('togglesList');
  const resetBtn = document.getElementById('resetBtn');

  // Toggle Checkboxes
  const toggles = {
    hideHomeFeed: document.getElementById('toggleHomeFeed'),
    hideSidebar: document.getElementById('toggleSidebar'),
    hideComments: document.getElementById('toggleComments'),
    hideShorts: document.getElementById('toggleShorts'),
    hideEndScreens: document.getElementById('toggleEndScreens'),
    showDislikes: document.getElementById('toggleDislikes'),
    untranslateTitles: document.getElementById('toggleUntranslate')
  };

  // Preset Configurations
  const PRESET_MAP = {
    off: {
      hideHomeFeed: false,
      hideSidebar: false,
      hideComments: false,
      hideShorts: false,
      hideEndScreens: false,
      descKey: 'descOff'
    },
    basic: {
      hideHomeFeed: false,
      hideSidebar: false,
      hideComments: true,
      hideShorts: false,
      hideEndScreens: true,
      descKey: 'descBasic'
    },
    balanced: {
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      descKey: 'descBalanced'
    },
    extreme: {
      hideHomeFeed: true,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      descKey: 'descExtreme'
    },
    custom: {
      descKey: 'descCustom'
    }
  };

  // Auto-detect optimal UI scale based on monitor resolution & DPI
  function detectDefaultScale() {
    const screenW = window.screen ? (window.screen.width || 1920) : 1920;
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
    lang: (navigator.language && navigator.language.startsWith('es')) ? 'es' : 'en',
    scale: 'auto',
    preset: 'balanced',
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    showDislikes: true,
    untranslateTitles: true,
    customConfig: {
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true
    }
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
        state.lang = (navigator.language && navigator.language.startsWith('es')) ? 'es' : 'en';
      }
      if (!state.scale || state.scale === 'auto') {
        state.scale = detectDefaultScale();
      }
      if (!state.customConfig) {
        state.customConfig = {
          hideHomeFeed: state.hideHomeFeed,
          hideSidebar: state.hideSidebar,
          hideComments: state.hideComments,
          hideShorts: state.hideShorts,
          hideEndScreens: state.hideEndScreens
        };
      }
    } else {
      state.scale = detectDefaultScale();
    }
    renderUI();
  });

  // Render UI to reflect current state
  function renderUI() {
    // Apply Theme
    const activeTheme = state.theme || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    themeButtons.forEach((btn) => {
      if (btn.getAttribute('data-theme') === activeTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Apply Language
    const activeLang = state.lang || 'en';
    langButtons.forEach((btn) => {
      if (btn.getAttribute('data-lang') === activeLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Apply Scale
    const activeScale = state.scale || detectDefaultScale();
    document.documentElement.setAttribute('data-scale', activeScale);
    scaleButtons.forEach((btn) => {
      if (btn.getAttribute('data-scale') === activeScale) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update all elements with data-i18n
    i18nElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // Checkboxes
    toggles.hideHomeFeed.checked = !!state.hideHomeFeed;
    toggles.hideSidebar.checked = !!state.hideSidebar;
    toggles.hideComments.checked = !!state.hideComments;
    toggles.hideShorts.checked = !!state.hideShorts;
    toggles.hideEndScreens.checked = !!state.hideEndScreens;
    toggles.showDislikes.checked = !!state.showDislikes;
    toggles.untranslateTitles.checked = !!state.untranslateTitles;

    // Detect matched preset if not explicitly custom
    if (state.preset !== 'custom') {
      const detectedPreset = detectMatchingPreset();
      if (detectedPreset) {
        state.preset = detectedPreset;
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
    const isOff = state.preset === 'off' || (!state.hideHomeFeed && !state.hideSidebar && !state.hideComments && !state.hideShorts && !state.hideEndScreens);
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
        custom: 'presetCustom'
      };
      const pKey = presetKeyMap[state.preset];
      statusText.textContent = pKey ? t(pKey) : state.preset.toUpperCase();
    }
  }

  // Detect if current custom toggles match any preset
  function detectMatchingPreset() {
    for (const [key, config] of Object.entries(PRESET_MAP)) {
      if (key === 'custom') continue;
      if (
        config.hideHomeFeed === state.hideHomeFeed &&
        config.hideSidebar === state.hideSidebar &&
        config.hideComments === state.hideComments &&
        config.hideShorts === state.hideShorts &&
        config.hideEndScreens === state.hideEndScreens
      ) {
        return key;
      }
    }
    return null;
  }

  // Save current state to storage
  function saveState() {
    chrome.storage.sync.set(state, () => {
      renderUI();
    });
  }

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
          state.customConfig = {
            hideHomeFeed: state.hideHomeFeed,
            hideSidebar: state.hideSidebar,
            hideComments: state.hideComments,
            hideShorts: state.hideShorts,
            hideEndScreens: state.hideEndScreens
          };
        }
        // Restore custom preferences
        state.hideHomeFeed = !!state.customConfig.hideHomeFeed;
        state.hideSidebar = !!state.customConfig.hideSidebar;
        state.hideComments = !!state.customConfig.hideComments;
        state.hideShorts = !!state.customConfig.hideShorts;
        state.hideEndScreens = !!state.customConfig.hideEndScreens;
        saveState();
      } else if (PRESET_MAP[chosenPreset]) {
        state.preset = chosenPreset;
        state.hideHomeFeed = PRESET_MAP[chosenPreset].hideHomeFeed;
        state.hideSidebar = PRESET_MAP[chosenPreset].hideSidebar;
        state.hideComments = PRESET_MAP[chosenPreset].hideComments;
        state.hideShorts = PRESET_MAP[chosenPreset].hideShorts;
        state.hideEndScreens = PRESET_MAP[chosenPreset].hideEndScreens;
        saveState();
      }
    });
  });

  // Individual toggle changes
  ['hideHomeFeed', 'hideSidebar', 'hideComments', 'hideShorts', 'hideEndScreens'].forEach((key) => {
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
  toggles.showDislikes.addEventListener('change', (e) => {
    state.showDislikes = e.target.checked;
    saveState();
  });

  // Untranslate titles toggle
  toggles.untranslateTitles.addEventListener('change', (e) => {
    state.untranslateTitles = e.target.checked;
    saveState();
  });

  // Accordion toggle with a11y support
  function toggleAccordion() {
    const isCollapsed = customAccordionBtn.classList.toggle('collapsed');
    togglesList.classList.toggle('collapsed');
    customAccordionBtn.setAttribute('aria-expanded', String(!isCollapsed));
  }

  customAccordionBtn.addEventListener('click', toggleAccordion);
  customAccordionBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAccordion();
    }
  });

  // Reset to default
  resetBtn.addEventListener('click', () => {
    const currentScale = state.scale || detectDefaultScale();
    state = {
      theme: state.theme || 'dark',
      lang: state.lang || 'en',
      scale: currentScale,
      preset: 'balanced',
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      showDislikes: true,
      untranslateTitles: true,
      customConfig: {
        hideHomeFeed: false,
        hideSidebar: true,
        hideComments: true,
        hideShorts: true,
        hideEndScreens: true
      }
    };
    saveState();
  });
});
