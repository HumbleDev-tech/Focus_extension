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
  const profileSectionWrapper = document.getElementById(
    'profileSectionWrapper',
  );
  const profileTrack = document.getElementById('profileTrack');
  const profileCountTag = document.getElementById('profileCountTag');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const presetTagLabel = document.getElementById('presetTagLabel');
  const profileCreatePanel = document.getElementById('profileCreatePanel');
  const profileCreateInput = document.getElementById('profileCreateInput');
  const confirmCreateProfileBtn = document.getElementById(
    'confirmCreateProfileBtn',
  );
  const cancelCreateProfileBtn = document.getElementById(
    'cancelCreateProfileBtn',
  );
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
  const footerVersionLink = document.getElementById('footerVersionLink');
  const versionBadgeNew = document.getElementById('versionBadgeNew');

  // Populate dynamic manifest version & manage NEW badge lifecycle (24h TTL)
  const CHANGELOG_URL =
    'https://github.com/HumbleDev-tech/Focus_extension/blob/main/CHANGELOG.md';
  const BADGE_STORAGE_KEY = 'libertad_ver_badge';
  const BADGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)

  let manifestVersion = '1.2.0';
  if (
    footerVersion &&
    typeof chrome !== 'undefined' &&
    chrome.runtime?.getManifest
  ) {
    try {
      const manifest = chrome.runtime.getManifest();
      if (manifest?.version) {
        manifestVersion = manifest.version;
        footerVersion.textContent = `v${manifest.version}`;
      }
    } catch (_) {}
  }

  let badgeRecord = null;
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY);
    if (raw) badgeRecord = JSON.parse(raw);
  } catch (_) {}

  if (!badgeRecord || badgeRecord.version !== manifestVersion) {
    badgeRecord = {
      version: manifestVersion,
      firstSeen: Date.now(),
      dismissed: false,
    };
    try {
      localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badgeRecord));
    } catch (_) {}
  }

  const isBadgeExpired =
    typeof badgeRecord.firstSeen === 'number' &&
    Date.now() - badgeRecord.firstSeen > BADGE_TTL_MS;

  const shouldShowBadge = !badgeRecord.dismissed && !isBadgeExpired;

  if (versionBadgeNew) {
    versionBadgeNew.style.display = shouldShowBadge ? 'inline-flex' : 'none';
  }

  if (footerVersionLink) {
    footerVersionLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (badgeRecord && !badgeRecord.dismissed) {
        badgeRecord.dismissed = true;
        try {
          localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badgeRecord));
        } catch (_) {}
      }
      if (versionBadgeNew) {
        versionBadgeNew.style.display = 'none';
      }
      if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
        chrome.tabs.create({ url: CHANGELOG_URL });
      } else {
        window.open(CHANGELOG_URL, '_blank', 'noopener,noreferrer');
      }
    });
  }

  // Toggle Checkboxes (Macro shields, cleaner chips, and power modules)
  const toggles = {
    // Focus Macro Shields
    hideHomeFeed: document.getElementById('toggleHomeFeed'),
    redirectHomeToSubscriptions: document.getElementById(
      'toggleRedirectHomeSubscriptions',
    ),
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
    hidePlayOnTv: document.getElementById('togglePlayOnTv'),
    hideSubtitles: document.getElementById('toggleSubtitles'),
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
    hideExplore: document.getElementById('toggleExplore'),
    hideTrending: document.getElementById('toggleTrending'),
    hideMoreFromYoutube: document.getElementById('toggleMoreFromYoutube'),
    // Power Modules
    showDislikes: document.getElementById('toggleDislikes'),
    untranslateMaster: document.getElementById('toggleUntranslateMaster'),
    untranslateTitles: document.getElementById('toggleUntranslateTitles'),
    untranslateAudio: document.getElementById('toggleUntranslateAudio'),
    untranslateDescription: document.getElementById('toggleUntranslateDesc'),
    untranslateCaptions: document.getElementById('toggleUntranslateCaptions'),
    untranslateChapters: document.getElementById('toggleUntranslateChapters'),
    skipSponsors: document.getElementById('toggleSponsors'),
    sponsorSkipSponsors: document.getElementById('toggleSubSponsors'),
    sponsorSkipSelfpromo: document.getElementById('toggleSubSelfpromo'),
    sponsorSkipInteraction: document.getElementById('toggleSubInteraction'),
    sponsorSkipIntro: document.getElementById('toggleSubIntro'),
    sponsorSkipOutro: document.getElementById('toggleSubOutro'),
    sponsorSkipMusicOfftopic: document.getElementById('toggleSubMusicOfftopic'),
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

  // Auto-detect system color scheme (dark or light)
  function detectSystemTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light';
  }

  // Detect all Spanish regional variants (es, es-419, es-ES, es-MX, es-AR, etc.)
  function isSpanishLocale(langStr) {
    if (!langStr || typeof langStr !== 'string') return false;
    const clean = langStr.trim().toLowerCase();
    return clean === 'es' || clean.startsWith('es-') || clean.startsWith('es_');
  }

  // Detect all Portuguese regional variants (pt, pt-BR, pt-PT, pt-AO, pt-MZ, etc.)
  function isPortugueseLocale(langStr) {
    if (!langStr || typeof langStr !== 'string') return false;
    const clean = langStr.trim().toLowerCase();
    return clean === 'pt' || clean.startsWith('pt-') || clean.startsWith('pt_');
  }

  // Auto-detect system language with full support for Spanish and Portuguese regional variants
  function detectSystemLang() {
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
        const uiLang = chrome.i18n.getUILanguage();
        if (uiLang) {
          if (isSpanishLocale(uiLang)) return 'es';
          if (isPortugueseLocale(uiLang)) return 'pt';
        }
      }
      if (typeof navigator !== 'undefined') {
        if (navigator.language) {
          if (isSpanishLocale(navigator.language)) return 'es';
          if (isPortugueseLocale(navigator.language)) return 'pt';
        }
        if (Array.isArray(navigator.languages)) {
          for (let i = 0; i < navigator.languages.length; i++) {
            const l = navigator.languages[i];
            if (isSpanishLocale(l)) return 'es';
            if (isPortugueseLocale(l)) return 'pt';
          }
        }
      }
    } catch (_) {}
    return 'en';
  }

  // State initialized with single source of truth defaults
  let state = {
    ...DEFAULT_SETTINGS,
    theme: 'auto',
    lang: 'auto',
    scale: 'auto',
    activeProfile: null,
    profiles: {},
  };

  // Synchronous cache hydration from localStorage for 0ms instantaneous render
  try {
    const cachedPopupState = localStorage.getItem('libertad_popup_state');
    if (cachedPopupState) {
      const parsed = JSON.parse(cachedPopupState);
      if (parsed && typeof parsed === 'object') {
        state = { ...state, ...parsed };
      }
    }
    const savedTab = localStorage.getItem('libertad_active_tab');
    if (savedTab && tabPanels[savedTab]) {
      state.activeTab = savedTab;
    }
  } catch (_) {}

  function getEffectiveLang() {
    return !state.lang || state.lang === 'auto'
      ? detectSystemLang()
      : state.lang;
  }

  // Helper for safe translation
  function t(key) {
    if (typeof getTranslation === 'function') {
      return getTranslation(key, getEffectiveLang());
    }
    return key;
  }

  // Instant zero-latency render before storage.sync finishes
  applyThemeAndScale();
  renderUI();

  // Load state from chrome.storage.sync and reconcile
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      const loadedProfiles = {};
      if (saved.profiles && typeof saved.profiles === 'object') {
        Object.keys(saved.profiles).forEach((pId) => {
          const pData = saved.profiles[pId];
          if (pData && typeof pData === 'object' && pData.name) {
            loadedProfiles[pId] = {
              id: pId,
              name: pData.name,
              nameKey: pData.nameKey,
              isCustomName: pData.isCustomName !== false,
              preset: pData.preset || 'custom',
              toggles: { ...(pData.toggles || {}) },
            };
          }
        });
      }

      const profKeys = Object.keys(loadedProfiles);
      const activeProf =
        saved.activeProfile && loadedProfiles[saved.activeProfile]
          ? saved.activeProfile
          : profKeys.length > 0
            ? profKeys[0]
            : null;

      state = {
        ...DEFAULT_SETTINGS,
        ...saved,
        activeProfile: activeProf,
        profiles: loadedProfiles,
      };

      if (state.activeProfile && state.profiles[state.activeProfile]) {
        const activeToggles =
          state.profiles[state.activeProfile]?.toggles || {};
        ALL_TOGGLE_KEYS.forEach((k) => {
          if (activeToggles[k] !== undefined) {
            state[k] = !!activeToggles[k];
          } else if (saved[k] !== undefined) {
            state[k] = !!saved[k];
          } else if (DEFAULT_SETTINGS[k] !== undefined) {
            state[k] = DEFAULT_SETTINGS[k];
          }
        });
        state.preset = state.profiles[state.activeProfile]?.preset || 'basic';
      } else {
        state.preset = saved.preset || 'basic';
        ALL_TOGGLE_KEYS.forEach((k) => {
          if (saved[k] !== undefined) {
            state[k] = !!saved[k];
          } else if (PRESET_MAP[state.preset]?.[k] !== undefined) {
            state[k] = !!PRESET_MAP[state.preset][k];
          }
        });
      }

      if (!state.lang) state.lang = 'auto';
      if (!state.theme) state.theme = 'auto';
      const VALID_SCALES = ['auto', '100', '120', '140'];
      if (state.scale === '115') {
        state.scale = '120';
      } else if (state.scale === '125') {
        state.scale = '140';
      } else if (!VALID_SCALES.includes(state.scale)) {
        state.scale = 'auto';
      }
      let savedTab = 'focus';
      try {
        savedTab = localStorage.getItem('libertad_active_tab') || 'focus';
      } catch (_) {}
      state.activeTab = savedTab;

      try {
        const snapshot = { ...state };
        delete snapshot.activeTab;
        localStorage.setItem('libertad_popup_state', JSON.stringify(snapshot));
      } catch (_) {}
    }
    applyThemeAndScale();
    renderUI();
  });

  // Apply visual theme and UI zoom to root
  function applyThemeAndScale() {
    const effectiveTheme =
      !state.theme || state.theme === 'auto'
        ? detectSystemTheme()
        : state.theme;
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    try {
      localStorage.setItem('libertad_theme', state.theme || 'auto');
    } catch (_) {}

    const effectiveScale =
      !state.scale || state.scale === 'auto'
        ? detectDefaultScale()
        : state.scale;
    document.documentElement.setAttribute('data-scale', effectiveScale);
    try {
      localStorage.setItem('libertad_scale', state.scale || 'auto');
    } catch (_) {}
  }

  // Dynamic system theme listener for real-time OS preference changes
  if (window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (!state.theme || state.theme === 'auto') {
          applyThemeAndScale();
        }
      });
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

    if (saveProfileBtn) {
      saveProfileBtn.setAttribute(
        'title',
        t('saveProfileBtnTooltip') || 'Save current settings as a profile',
      );
    }
    if (confirmCreateProfileBtn) {
      confirmCreateProfileBtn.setAttribute(
        'title',
        t('createConfirmTooltip') || 'Save profile (Enter)',
      );
    }
    if (cancelCreateProfileBtn) {
      cancelCreateProfileBtn.setAttribute(
        'title',
        t('createCancelTooltip') || 'Cancel (Esc)',
      );
    }

    // Theme buttons active state
    themeButtons.forEach((btn) => {
      const btnTheme = btn.getAttribute('data-theme');
      if (btnTheme === (state.theme || 'auto')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Language buttons active state
    langButtons.forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === (state.lang || 'auto')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Scale buttons active state
    scaleButtons.forEach((btn) => {
      const btnScale = btn.getAttribute('data-scale');
      if (btnScale === (state.scale || 'auto')) {
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

    // Synchronize Untranslate Suite sub-options container
    const untranslateSubContainer = document.getElementById(
      'untranslateSubOptions',
    );
    if (untranslateSubContainer) {
      untranslateSubContainer.classList.toggle(
        'is-collapsed',
        !state.untranslateMaster,
      );
    }

    // Synchronize SponsorBlock sub-options container
    const sponsorSubContainer = document.getElementById('sponsorSubOptions');
    if (sponsorSubContainer) {
      sponsorSubContainer.classList.toggle('is-collapsed', !state.skipSponsors);
    }

    // Update chip toggle active styles
    chipLabels.forEach((chip) => {
      const forId = chip.getAttribute('for');
      const input = document.getElementById(forId);
      if (input) {
        chip.classList.toggle('active', input.checked);
      }
    });

    // Update dynamic Untranslate count badge
    const untranslateCountBadge = document.getElementById(
      'untranslateCountBadge',
    );
    if (untranslateCountBadge) {
      let count = 0;
      if (state.untranslateTitles) count++;
      if (state.untranslateAudio) count++;
      if (state.untranslateDescription) count++;
      if (state.untranslateCaptions) count++;
      if (state.untranslateChapters) count++;
      const currentLang = getEffectiveLang();
      if (count === 0) {
        untranslateCountBadge.textContent =
          currentLang === 'es'
            ? '0/5 (SOLO VER)'
            : currentLang === 'pt'
              ? '0/5 (APENAS VER)'
              : '0/5 (VIEW ONLY)';
      } else if (count === 5) {
        untranslateCountBadge.textContent =
          currentLang === 'es'
            ? '5/5 (TODAS)'
            : currentLang === 'pt'
              ? '5/5 (TODAS)'
              : '5/5 (ALL)';
      } else {
        untranslateCountBadge.textContent = `${count}/5 ${
          currentLang === 'es'
            ? 'ACTIVAS'
            : currentLang === 'pt'
              ? 'ATIVAS'
              : 'ACTIVE'
        }`;
      }
    }

    // Update dynamic SponsorBlock count badge
    const countBadge = document.getElementById('sponsorCountBadge');
    if (countBadge) {
      let count = 0;
      if (state.sponsorSkipSponsors) count++;
      if (state.sponsorSkipSelfpromo) count++;
      if (state.sponsorSkipInteraction) count++;
      if (state.sponsorSkipIntro) count++;
      if (state.sponsorSkipOutro) count++;
      if (state.sponsorSkipMusicOfftopic) count++;
      const currentLang = getEffectiveLang();
      if (count === 0) {
        countBadge.textContent =
          currentLang === 'es'
            ? '0/6 (SOLO VER)'
            : currentLang === 'pt'
              ? '0/6 (APENAS VER)'
              : '0/6 (VIEW ONLY)';
      } else if (count === 6) {
        countBadge.textContent =
          currentLang === 'es'
            ? '6/6 (TODAS)'
            : currentLang === 'pt'
              ? '6/6 (TODAS)'
              : '6/6 (ALL)';
      } else {
        countBadge.textContent = `${count}/6 ${
          currentLang === 'es'
            ? 'ACTIVAS'
            : currentLang === 'pt'
              ? 'ATIVAS'
              : 'ACTIVE'
        }`;
      }
    }

    // Render dynamic profiles bar
    renderProfiles();

    // Preset buttons active state (only illuminated when in Base Preset mode)
    presetButtons.forEach((btn) => {
      const p = btn.getAttribute('data-preset');
      if (!state.activeProfile && p === state.preset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Preset / Profile description
    if (state.activeProfile && state.profiles[state.activeProfile]) {
      const profName = getProfileDisplayName(state.activeProfile);
      presetDesc.textContent = `${profName}: ${t('profileActiveDesc')}`;
    } else if (PRESET_MAP[state.preset]) {
      presetDesc.textContent = t(PRESET_MAP[state.preset].descKey);
    } else {
      presetDesc.textContent = t('descCustom');
    }

    // Status pill
    const hasActiveToggle = ALL_TOGGLE_KEYS.some((k) => !!state[k]);
    const isOff = state.preset === 'off' || !hasActiveToggle;
    const effectivePreset = isOff ? 'off' : state.preset;
    statusPill.setAttribute('data-preset', effectivePreset);
    if (isOff) {
      statusPill.classList.add('is-off');
      statusText.textContent = t('statusOff');
    } else {
      statusPill.classList.remove('is-off');
      if (state.activeProfile && state.profiles[state.activeProfile]) {
        const profName = getProfileDisplayName(state.activeProfile);
        statusText.textContent = profName.toUpperCase();
      } else {
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
  }

  // Save current state to storage (excluding local popup UI keys) with optimistic local caching
  function saveState(partialPatch) {
    if (partialPatch && typeof partialPatch === 'object') {
      Object.assign(state, partialPatch);
      try {
        const snapshot = { ...state };
        delete snapshot.activeTab;
        localStorage.setItem('libertad_popup_state', JSON.stringify(snapshot));
      } catch (_) {}
      renderUI();
      chrome.storage.sync.set(partialPatch);
      return;
    }
    const syncPayload = { ...state };
    delete syncPayload.activeTab;
    try {
      localStorage.setItem('libertad_popup_state', JSON.stringify(syncPayload));
    } catch (_) {}
    renderUI();
    chrome.storage.sync.set(syncPayload);
  }

  // Settings Drawer toggle button
  if (settingsToggleBtn && settingsDrawer) {
    settingsToggleBtn.addEventListener('click', () => {
      const isOpen = settingsDrawer.classList.toggle('open');
      settingsToggleBtn.classList.toggle('active', isOpen);
    });
  }

  // Tab navigation clicks (Enfoque, Limpieza UI, Extras) - local UI only
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenTab = btn.getAttribute('data-tab');
      if (!chosenTab) return;
      hideCreateProfilePanel();
      resetDeleteConfirm();
      cancelProfileRename();
      state.activeTab = chosenTab;
      try {
        localStorage.setItem('libertad_active_tab', chosenTab);
      } catch (_) {}
      renderUI();
    });
  });

  // Theme button clicks
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenTheme = btn.getAttribute('data-theme');
      state.theme = chosenTheme;
      applyThemeAndScale();
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
      if (state.scale === chosenScale) return;
      state.scale = chosenScale;
      applyThemeAndScale();
      saveState();
    });
  });

  // Profile switching and inline rename
  let activeRenamingProfile = null;

  function getProfileDisplayName(profileId) {
    const profileData = state.profiles?.[profileId];
    if (!profileData) {
      return t(`profile${profileId.slice(-1)}Default`) || 'Profile';
    }
    return (
      (profileData.nameKey && !profileData.isCustomName
        ? t(profileData.nameKey)
        : profileData.name) ||
      t(`profile${profileId.slice(-1)}Default`) ||
      profileData.name ||
      'Profile'
    );
  }

  function renderProfiles() {
    const profileIds = Object.keys(state.profiles || {});
    const count = profileIds.length;

    if (profileCountTag) {
      profileCountTag.textContent = `${count}/3`;
    }

    if (count === 0) {
      if (profileSectionWrapper) profileSectionWrapper.style.display = 'none';
      if (presetTagLabel) {
        presetTagLabel.setAttribute('data-i18n', 'quickModeLabel');
        presetTagLabel.textContent = t('quickModeLabel');
      }
      if (saveProfileBtn) saveProfileBtn.style.display = 'inline-flex';
      state.activeProfile = null;
      return;
    }

    if (profileSectionWrapper) profileSectionWrapper.style.display = 'flex';
    if (presetTagLabel) {
      presetTagLabel.setAttribute('data-i18n', 'basePresetsLabel');
      presetTagLabel.textContent = t('basePresetsLabel');
    }
    if (saveProfileBtn) {
      saveProfileBtn.style.display = 'none';
    }

    if (state.activeProfile && !state.profiles[state.activeProfile]) {
      state.activeProfile = profileIds.length > 0 ? profileIds[0] : null;
    }

    if (!profileTrack) return;
    profileTrack.innerHTML = '';

    profileIds.forEach((profId) => {
      const isActive = profId === state.activeProfile;
      const displayName = getProfileDisplayName(profId);

      const btn = document.createElement('div');
      btn.className = `profile-btn${isActive ? ' active' : ''}`;
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('data-profile', profId);

      const tooltipText = isActive
        ? `${displayName} (${t('statusEngineActive') || 'ACTIVE'}) • ${t('renameTooltip')}`
        : `${displayName} • ${t('clickToActivate')}`;
      btn.setAttribute('title', tooltipText);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'profile-name';
      nameSpan.textContent = displayName;
      btn.appendChild(nameSpan);

      const actionsSpan = document.createElement('span');
      actionsSpan.className = 'profile-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'profile-edit-btn';
      editBtn.setAttribute('title', t('renameTooltip') || 'Rename');
      editBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      `;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'profile-delete-btn';
      deleteBtn.setAttribute('title', t('deleteProfileTooltip') || 'Delete');
      deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      actionsSpan.appendChild(editBtn);
      actionsSpan.appendChild(deleteBtn);
      btn.appendChild(actionsSpan);

      attachProfileChipEvents(btn, profId);
      profileTrack.appendChild(btn);
    });

    if (count < 3) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'add-profile-btn';
      addBtn.setAttribute('title', t('newProfileBtn'));
      addBtn.textContent = t('newProfileBtn');
      addBtn.addEventListener('click', () => {
        toggleCreateProfilePanel();
      });
      profileTrack.appendChild(addBtn);
    }
  }

  let activeDeletingProfile = null;
  let deleteConfirmTimer = null;

  function resetDeleteConfirm() {
    if (deleteConfirmTimer) {
      clearTimeout(deleteConfirmTimer);
      deleteConfirmTimer = null;
    }
    if (activeDeletingProfile && profileTrack) {
      const prevBtn = profileTrack.querySelector(
        `.profile-btn[data-profile="${activeDeletingProfile}"] .profile-delete-btn`,
      );
      if (prevBtn) {
        prevBtn.classList.remove('is-confirm');
        prevBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      }
      activeDeletingProfile = null;
    }
  }

  function handleProfileDelete(profId, deleteBtn) {
    if (!deleteBtn) return;
    cancelProfileRename();
    if (
      activeDeletingProfile !== profId ||
      !deleteBtn.classList.contains('is-confirm')
    ) {
      resetDeleteConfirm();
      activeDeletingProfile = profId;
      deleteBtn.classList.add('is-confirm');
      deleteBtn.textContent = t('deleteConfirm') || 'Delete?';
      deleteConfirmTimer = setTimeout(() => {
        resetDeleteConfirm();
      }, 3000);
      return;
    }

    resetDeleteConfirm();

    if (state.profiles?.[profId]) {
      delete state.profiles[profId];
    }
    const remainingKeys = Object.keys(state.profiles || {});
    if (state.activeProfile === profId) {
      state.activeProfile = remainingKeys.length > 0 ? remainingKeys[0] : null;
    }

    if (state.activeProfile && state.profiles[state.activeProfile]) {
      switchProfile(state.activeProfile);
    } else {
      state.activeProfile = null;
      saveState();
    }
  }

  function toggleCreateProfilePanel() {
    const existingCount = Object.keys(state.profiles || {}).length;
    if (existingCount >= 3) return;
    if (!profileCreatePanel || !profileCreateInput) return;
    if (profileCreatePanel.style.display !== 'none') {
      hideCreateProfilePanel();
      return;
    }
    resetDeleteConfirm();
    cancelProfileRename();
    profileCreatePanel.style.display = 'block';
    profileCreateInput.value = '';
    profileCreateInput.placeholder =
      t('profileCreatePlaceholder') || 'Profile name...';
    if (confirmCreateProfileBtn) {
      confirmCreateProfileBtn.setAttribute(
        'title',
        t('createConfirmTooltip') || 'Save profile (Enter)',
      );
    }
    if (cancelCreateProfileBtn) {
      cancelCreateProfileBtn.setAttribute(
        'title',
        t('createCancelTooltip') || 'Cancel (Esc)',
      );
    }
    profileCreateInput.focus();
  }

  function hideCreateProfilePanel() {
    if (!profileCreatePanel) return;
    profileCreatePanel.style.display = 'none';
  }

  function submitCreateProfile() {
    if (!profileCreateInput) return;
    const val = profileCreateInput.value
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');

    const existingCount = Object.keys(state.profiles || {}).length;
    if (existingCount >= 3) {
      hideCreateProfilePanel();
      return;
    }

    const finalName =
      val.length > 0
        ? val.slice(0, 20)
        : `${t('profileHeader') || 'Profile'} ${existingCount + 1}`;

    let newSlotId = 'profile1';
    if (state.profiles?.profile1) {
      if (!state.profiles.profile2) newSlotId = 'profile2';
      else if (!state.profiles.profile3) newSlotId = 'profile3';
      else newSlotId = `profile_${Date.now()}`;
    }

    const currentToggles = {};
    ALL_TOGGLE_KEYS.forEach((k) => {
      currentToggles[k] = !!state[k];
    });

    if (!state.profiles) state.profiles = {};
    state.profiles[newSlotId] = {
      id: newSlotId,
      name: finalName,
      preset: state.preset || 'basic',
      toggles: currentToggles,
      isCustomName: true,
    };

    state.activeProfile = newSlotId;
    hideCreateProfilePanel();
    saveState();
  }

  saveProfileBtn?.addEventListener('click', () => {
    toggleCreateProfilePanel();
  });
  confirmCreateProfileBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    submitCreateProfile();
  });
  cancelCreateProfileBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    hideCreateProfilePanel();
  });
  profileCreateInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCreateProfile();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hideCreateProfilePanel();
    }
  });

  function restoreProfileActions(btn) {
    const actions = btn.querySelector('.profile-actions');
    if (!actions) return;
    actions.innerHTML = `
      <button type="button" class="profile-edit-btn" title="${t('renameTooltip') || 'Rename'}">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      </button>
      <button type="button" class="profile-delete-btn" title="${t('deleteProfileTooltip') || 'Delete'}">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
  }

  function cancelProfileRename() {
    if (!activeRenamingProfile) return;
    const profId = activeRenamingProfile;
    activeRenamingProfile = null;
    const btn = document.querySelector(
      `.profile-btn[data-profile="${profId}"]`,
    );
    if (btn) {
      btn.classList.remove('is-editing');
      const nameEl = btn.querySelector('.profile-name');
      if (nameEl) {
        nameEl.textContent = getProfileDisplayName(profId);
      }
      restoreProfileActions(btn);
    }
    renderUI();
  }

  function startProfileRename(profileId) {
    resetDeleteConfirm();
    hideCreateProfilePanel();
    if (activeRenamingProfile === profileId) {
      cancelProfileRename();
      return;
    }
    cancelProfileRename();

    const btn = document.querySelector(
      `.profile-btn[data-profile="${profileId}"]`,
    );
    if (!btn) return;
    const nameEl = btn.querySelector('.profile-name');
    if (!nameEl) return;

    activeRenamingProfile = profileId;
    btn.classList.add('is-editing');

    const currentName = getProfileDisplayName(profileId);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'profile-name-input';
    input.value = currentName;
    input.maxLength = 20;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    nameEl.textContent = '';
    nameEl.appendChild(input);

    let actionsContainer = btn.querySelector('.profile-actions');
    if (!actionsContainer) {
      actionsContainer = document.createElement('span');
      actionsContainer.className = 'profile-actions';
      btn.appendChild(actionsContainer);
    }
    actionsContainer.innerHTML = `
      <span class="profile-action-btn profile-action-confirm" role="button" tabindex="0" title="${t('renameSaveTooltip') || 'Save'}">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <span class="profile-action-btn profile-action-cancel" role="button" tabindex="0" title="${t('renameCancelTooltip') || 'Cancel'}">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    `;

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    let committed = false;
    function finishRename(save) {
      if (committed) return;
      committed = true;
      activeRenamingProfile = null;
      btn.classList.remove('is-editing');

      if (save) {
        const val = input.value
          .replace(/[\r\n\t]/g, ' ')
          .trim()
          .replace(/\s+/g, ' ');
        if (val.length > 0 && val !== currentName) {
          if (!state.profiles[profileId]) {
            state.profiles[profileId] = { id: profileId, name: val };
          }
          state.profiles[profileId].name = val;
          state.profiles[profileId].isCustomName = true;
          delete state.profiles[profileId].nameKey;
          saveState();
        }
      }

      nameEl.textContent = getProfileDisplayName(profileId);
      restoreProfileActions(btn);
      renderUI();
    }

    const confirmBtn = actionsContainer.querySelector(
      '.profile-action-confirm',
    );
    const cancelBtn = actionsContainer.querySelector('.profile-action-cancel');

    confirmBtn?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    confirmBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      finishRename(true);
    });

    cancelBtn?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    cancelBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      finishRename(false);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishRename(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finishRename(false);
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!committed) {
          finishRename(false);
        }
      }, 120);
    });
  }

  function switchProfile(profileId) {
    if (!state.profiles?.[profileId]) return;
    hideCreateProfilePanel();
    resetDeleteConfirm();
    cancelProfileRename();
    state.activeProfile = profileId;
    const profile = state.profiles[profileId];

    if (profile.toggles) {
      ALL_TOGGLE_KEYS.forEach((key) => {
        if (profile.toggles[key] !== undefined) {
          state[key] = !!profile.toggles[key];
        } else if (DEFAULT_SETTINGS[key] !== undefined) {
          state[key] = DEFAULT_SETTINGS[key];
        }
      });
    }
    state.preset = profile.preset || 'custom';
    saveState();
  }

  function attachProfileChipEvents(btn, profId) {
    btn.addEventListener('click', (e) => {
      if (
        e.target.closest('.profile-name-input') ||
        e.target.closest('.profile-action-btn')
      ) {
        return;
      }

      if (e.target.closest('.profile-edit-btn')) {
        e.stopPropagation();
        if (activeRenamingProfile === profId) {
          cancelProfileRename();
        } else {
          startProfileRename(profId);
        }
        return;
      }

      const delBtn = e.target.closest('.profile-delete-btn');
      if (delBtn) {
        e.stopPropagation();
        handleProfileDelete(profId, delBtn);
        return;
      }

      if (activeRenamingProfile) {
        cancelProfileRename();
        if (profId !== state.activeProfile) {
          switchProfile(profId);
        }
        return;
      }

      if (state.activeProfile === profId) return;
      switchProfile(profId);
    });

    btn.addEventListener('dblclick', (e) => {
      if (
        e.target.closest('.profile-name-input') ||
        e.target.closest('.profile-action-btn') ||
        e.target.closest('.profile-edit-btn') ||
        e.target.closest('.profile-delete-btn')
      ) {
        return;
      }
      e.preventDefault();
      startProfileRename(profId);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.target.closest('.profile-name-input')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeRenamingProfile) {
          cancelProfileRename();
        }
        if (state.activeProfile !== profId) {
          switchProfile(profId);
        }
      }
    });
  }

  // Preset button clicks (switches to base preset mode without modifying saved profiles)
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenPreset = btn.getAttribute('data-preset');
      if (PRESET_MAP[chosenPreset]) {
        hideCreateProfilePanel();
        resetDeleteConfirm();
        cancelProfileRename();
        state.preset = chosenPreset;
        // Deactivate active profile, keeping its saved memory 100% intact
        state.activeProfile = null;
        const config = PRESET_MAP[chosenPreset];
        ALL_TOGGLE_KEYS.forEach((key) => {
          if (config[key] !== undefined) {
            state[key] = config[key];
          }
        });
        saveState();
      }
    });
  });

  // Universal toggle change handler for Profile and Base modes
  function handleToggleChange(key, checked) {
    state[key] = checked;
    state.preset = 'custom';
    if (state.activeProfile && state.profiles?.[state.activeProfile]) {
      state.profiles[state.activeProfile].preset = 'custom';
      if (!state.profiles[state.activeProfile].toggles) {
        state.profiles[state.activeProfile].toggles = {};
      }
      state.profiles[state.activeProfile].toggles[key] = checked;
    }
    saveState({
      [key]: state[key],
      preset: state.preset,
      profiles: state.profiles,
      activeProfile: state.activeProfile,
    });
  }

  // Individual UI cleaner and distraction toggle changes
  TOGGLE_KEYS.forEach((key) => {
    if (!toggles[key]) return;
    toggles[key].addEventListener('change', (e) => {
      handleToggleChange(key, e.target.checked);
    });
  });

  // Power Modules: Dislikes toggle
  toggles.showDislikes?.addEventListener('change', (e) => {
    handleToggleChange('showDislikes', e.target.checked);
  });

  // Power Modules: Untranslate Suite
  toggles.untranslateMaster?.addEventListener('change', (e) => {
    handleToggleChange('untranslateMaster', e.target.checked);
    const untranslateSubContainer = document.getElementById(
      'untranslateSubOptions',
    );
    if (untranslateSubContainer) {
      untranslateSubContainer.classList.toggle(
        'is-collapsed',
        !state.untranslateMaster,
      );
    }
  });

  toggles.untranslateTitles?.addEventListener('change', (e) => {
    handleToggleChange('untranslateTitles', e.target.checked);
  });

  toggles.untranslateAudio?.addEventListener('change', (e) => {
    handleToggleChange('untranslateAudio', e.target.checked);
  });

  toggles.untranslateDescription?.addEventListener('change', (e) => {
    handleToggleChange('untranslateDescription', e.target.checked);
  });

  toggles.untranslateCaptions?.addEventListener('change', (e) => {
    handleToggleChange('untranslateCaptions', e.target.checked);
  });

  toggles.untranslateChapters?.addEventListener('change', (e) => {
    handleToggleChange('untranslateChapters', e.target.checked);
  });

  // Power Modules: Skip sponsors toggle
  toggles.skipSponsors?.addEventListener('change', (e) => {
    handleToggleChange('skipSponsors', e.target.checked);
    const sponsorSubContainer = document.getElementById('sponsorSubOptions');
    if (sponsorSubContainer) {
      sponsorSubContainer.classList.toggle('is-collapsed', !state.skipSponsors);
    }
  });

  // Power Modules: SponsorBlock sub-options
  toggles.sponsorSkipSponsors?.addEventListener('change', (e) => {
    handleToggleChange('sponsorSkipSponsors', e.target.checked);
  });
  toggles.sponsorSkipSelfpromo?.addEventListener('change', (e) => {
    handleToggleChange('sponsorSkipSelfpromo', e.target.checked);
  });
  toggles.sponsorSkipInteraction?.addEventListener('change', (e) => {
    handleToggleChange('sponsorSkipInteraction', e.target.checked);
  });
  toggles.sponsorSkipIntro?.addEventListener('change', (e) => {
    handleToggleChange('sponsorSkipIntro', e.target.checked);
  });
  toggles.sponsorSkipOutro?.addEventListener('change', (e) => {
    handleToggleChange('sponsorSkipOutro', e.target.checked);
  });
  toggles.sponsorSkipMusicOfftopic?.addEventListener('change', (e) => {
    handleToggleChange('sponsorSkipMusicOfftopic', e.target.checked);
  });

  // Reset configuration button (with 2-step confirmation)
  let resetConfirmTimer = null;
  resetBtn?.addEventListener('click', () => {
    if (!resetBtn.classList.contains('is-confirm-stage')) {
      resetBtn.classList.add('is-confirm-stage');
      resetBtn.textContent = t('resetConfirm');
      if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
      resetConfirmTimer = setTimeout(() => {
        resetBtn.classList.remove('is-confirm-stage');
        resetBtn.textContent = t('resetBtn');
        resetConfirmTimer = null;
      }, 3500);
      return;
    }

    if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
    resetConfirmTimer = null;
    resetBtn.classList.remove('is-confirm-stage');

    state = {
      ...DEFAULT_SETTINGS,
      theme: 'auto',
      lang: 'auto',
      scale: 'auto',
      activeProfile: null,
      profiles: {},
      preset: 'basic',
    };
    applyThemeAndScale();
    saveState();

    resetBtn.classList.add('is-success');
    const currentLang = getEffectiveLang();
    resetBtn.textContent =
      currentLang === 'es'
        ? 'REINICIADO'
        : currentLang === 'pt'
          ? 'REDEFINIDO'
          : 'CONFIG RESTORED';
    setTimeout(() => {
      resetBtn.classList.remove('is-success');
      resetBtn.textContent = t('resetBtn');
    }, 1200);
  });

  // Global outside click listener to auto-dismiss delete confirmation
  document.addEventListener('click', (e) => {
    if (activeDeletingProfile && !e.target.closest('.profile-delete-btn')) {
      resetDeleteConfirm();
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
