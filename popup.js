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
  const profileButtons = document.querySelectorAll('.profile-btn');
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
    activeProfile: 'profile1',
    profiles: JSON.parse(JSON.stringify(DEFAULT_PROFILES)),
  };

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

  // Load state from chrome.storage.sync
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      let migratedProfiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
      if (saved.profiles && typeof saved.profiles === 'object') {
        migratedProfiles = {
          profile1: {
            ...DEFAULT_PROFILES.profile1,
            ...saved.profiles.profile1,
            toggles: {
              ...DEFAULT_PROFILES.profile1.toggles,
              ...(saved.profiles.profile1?.toggles || {}),
            },
          },
          profile2: {
            ...DEFAULT_PROFILES.profile2,
            ...saved.profiles.profile2,
            toggles: {
              ...DEFAULT_PROFILES.profile2.toggles,
              ...(saved.profiles.profile2?.toggles || {}),
            },
          },
          profile3: {
            ...DEFAULT_PROFILES.profile3,
            ...saved.profiles.profile3,
            toggles: {
              ...DEFAULT_PROFILES.profile3.toggles,
              ...(saved.profiles.profile3?.toggles || {}),
            },
          },
        };
      } else {
        const existingToggles = {};
        TOGGLE_KEYS.forEach((k) => {
          if (saved[k] !== undefined) existingToggles[k] = !!saved[k];
        });
        if (Object.keys(existingToggles).length > 0) {
          migratedProfiles.profile1.toggles = {
            ...migratedProfiles.profile1.toggles,
            ...existingToggles,
          };
          migratedProfiles.profile1.preset = saved.preset || 'custom';
        }
      }

      const activeProf =
        saved.activeProfile && migratedProfiles[saved.activeProfile]
          ? saved.activeProfile
          : 'profile1';

      state = {
        ...DEFAULT_SETTINGS,
        ...saved,
        activeProfile: activeProf,
        profiles: migratedProfiles,
      };

      // Hydrate state toggle keys from active profile
      const activeToggles = state.profiles[state.activeProfile]?.toggles || {};
      TOGGLE_KEYS.forEach((k) => {
        if (activeToggles[k] !== undefined) {
          state[k] = !!activeToggles[k];
        }
      });
      state.preset =
        state.profiles[state.activeProfile]?.preset ||
        state.preset ||
        'extreme';

      if (!state.lang) state.lang = 'auto';
      if (!state.theme) state.theme = 'auto';
      if (state.scale === '115') {
        state.scale = '120';
      } else if (state.scale === '125') {
        state.scale = '140';
      } else if (!state.scale) {
        state.scale = 'auto';
      }
      let savedTab = 'focus';
      try {
        savedTab = localStorage.getItem('libertad_active_tab') || 'focus';
      } catch (_) {}
      state.activeTab = savedTab;
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

    // Profile buttons active state, labels, and accessible tooltips
    profileButtons.forEach((btn) => {
      const profId = btn.getAttribute('data-profile');
      const isActive = profId === state.activeProfile;
      btn.classList.toggle('active', isActive);

      const nameEl = btn.querySelector('.profile-name');
      if (nameEl && profId !== activeRenamingProfile) {
        const displayName = getProfileDisplayName(profId);
        nameEl.textContent = displayName;

        const slotTag = profId.replace('profile', 'P');
        const tooltipText = isActive
          ? `${slotTag}: ${displayName} (${t('statusEngineActive') || 'ACTIVE'}) • ${t('renameTooltip')}`
          : `${slotTag}: ${displayName} • ${t('clickToActivate')}`;
        btn.setAttribute('title', tooltipText);
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
        !state.redirectHomeToSubscriptions &&
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

  // Save current state to storage (excluding local popup UI keys)
  function saveState(partialPatch) {
    if (partialPatch && typeof partialPatch === 'object') {
      chrome.storage.sync.set(partialPatch, () => {
        renderUI();
      });
      return;
    }
    const syncPayload = { ...state };
    delete syncPayload.activeTab;
    chrome.storage.sync.set(syncPayload, () => {
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

  // Tab navigation clicks (Enfoque, Limpieza UI, Extras) - local UI only
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenTab = btn.getAttribute('data-tab');
      if (!chosenTab) return;
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
      'Profile'
    );
  }

  function restoreProfileActions(btn) {
    const actions = btn.querySelector('.profile-actions');
    if (!actions) return;
    actions.innerHTML = `
      <span class="profile-edit-btn" role="button" tabindex="0" title="${t('renameTooltip') || 'Rename'}">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      </span>
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
    input.maxLength = 14;
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
            state.profiles[profileId] = { ...DEFAULT_PROFILES[profileId] };
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
    state.activeProfile = profileId;
    const profile = state.profiles[profileId];

    if (profile.toggles) {
      TOGGLE_KEYS.forEach((key) => {
        if (profile.toggles[key] !== undefined) {
          state[key] = !!profile.toggles[key];
        }
      });
    }
    state.preset = profile.preset || 'custom';
    saveState();
  }

  profileButtons.forEach((btn) => {
    const profId = btn.getAttribute('data-profile');

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
        e.target.closest('.profile-edit-btn')
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
  });

  // Preset button clicks (applies baseline to the active profile)
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenPreset = btn.getAttribute('data-preset');
      if (PRESET_MAP[chosenPreset]) {
        state.preset = chosenPreset;
        const config = PRESET_MAP[chosenPreset];
        TOGGLE_KEYS.forEach((key) => {
          if (config[key] !== undefined) {
            state[key] = config[key];
          }
        });
        if (state.profiles?.[state.activeProfile]) {
          state.profiles[state.activeProfile].preset = chosenPreset;
          if (!state.profiles[state.activeProfile].toggles) {
            state.profiles[state.activeProfile].toggles = {};
          }
          TOGGLE_KEYS.forEach((key) => {
            if (config[key] !== undefined) {
              state.profiles[state.activeProfile].toggles[key] = config[key];
            }
          });
        }
        saveState();
      }
    });
  });

  // Individual toggle changes (saves strictly to the active profile)
  TOGGLE_KEYS.forEach((key) => {
    if (!toggles[key]) return;
    toggles[key].addEventListener('change', (e) => {
      state[key] = e.target.checked;
      state.preset = 'custom';
      if (state.profiles?.[state.activeProfile]) {
        state.profiles[state.activeProfile].preset = 'custom';
        if (!state.profiles[state.activeProfile].toggles) {
          state.profiles[state.activeProfile].toggles = {};
        }
        state.profiles[state.activeProfile].toggles[key] = e.target.checked;
      }
      saveState({
        [key]: state[key],
        preset: state.preset,
        profiles: state.profiles,
      });
    });
  });

  // Power Modules: Dislikes toggle
  toggles.showDislikes?.addEventListener('change', (e) => {
    state.showDislikes = e.target.checked;
    saveState({ showDislikes: state.showDislikes });
  });

  // Power Modules: Untranslate Suite
  toggles.untranslateMaster?.addEventListener('change', (e) => {
    state.untranslateMaster = e.target.checked;
    const untranslateSubContainer = document.getElementById(
      'untranslateSubOptions',
    );
    if (untranslateSubContainer) {
      untranslateSubContainer.classList.toggle(
        'is-collapsed',
        !state.untranslateMaster,
      );
    }
    saveState({ untranslateMaster: state.untranslateMaster });
  });

  toggles.untranslateTitles?.addEventListener('change', (e) => {
    state.untranslateTitles = e.target.checked;
    saveState({ untranslateTitles: state.untranslateTitles });
  });

  toggles.untranslateAudio?.addEventListener('change', (e) => {
    state.untranslateAudio = e.target.checked;
    saveState({ untranslateAudio: state.untranslateAudio });
  });

  toggles.untranslateDescription?.addEventListener('change', (e) => {
    state.untranslateDescription = e.target.checked;
    saveState({ untranslateDescription: state.untranslateDescription });
  });

  toggles.untranslateCaptions?.addEventListener('change', (e) => {
    state.untranslateCaptions = e.target.checked;
    saveState({ untranslateCaptions: state.untranslateCaptions });
  });

  toggles.untranslateChapters?.addEventListener('change', (e) => {
    state.untranslateChapters = e.target.checked;
    saveState({ untranslateChapters: state.untranslateChapters });
  });

  // Power Modules: Skip sponsors toggle
  toggles.skipSponsors?.addEventListener('change', (e) => {
    state.skipSponsors = e.target.checked;
    const sponsorSubContainer = document.getElementById('sponsorSubOptions');
    if (sponsorSubContainer) {
      sponsorSubContainer.classList.toggle('is-collapsed', !state.skipSponsors);
    }
    saveState({ skipSponsors: state.skipSponsors });
  });

  // Power Modules: SponsorBlock sub-options
  toggles.sponsorSkipSponsors?.addEventListener('change', (e) => {
    state.sponsorSkipSponsors = e.target.checked;
    saveState({ sponsorSkipSponsors: state.sponsorSkipSponsors });
  });
  toggles.sponsorSkipSelfpromo?.addEventListener('change', (e) => {
    state.sponsorSkipSelfpromo = e.target.checked;
    saveState({ sponsorSkipSelfpromo: state.sponsorSkipSelfpromo });
  });
  toggles.sponsorSkipInteraction?.addEventListener('change', (e) => {
    state.sponsorSkipInteraction = e.target.checked;
    saveState({ sponsorSkipInteraction: state.sponsorSkipInteraction });
  });
  toggles.sponsorSkipIntro?.addEventListener('change', (e) => {
    state.sponsorSkipIntro = e.target.checked;
    saveState({ sponsorSkipIntro: state.sponsorSkipIntro });
  });
  toggles.sponsorSkipOutro?.addEventListener('change', (e) => {
    state.sponsorSkipOutro = e.target.checked;
    saveState({ sponsorSkipOutro: state.sponsorSkipOutro });
  });
  toggles.sponsorSkipMusicOfftopic?.addEventListener('change', (e) => {
    state.sponsorSkipMusicOfftopic = e.target.checked;
    saveState({ sponsorSkipMusicOfftopic: state.sponsorSkipMusicOfftopic });
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
      activeProfile: 'profile1',
      profiles: JSON.parse(JSON.stringify(DEFAULT_PROFILES)),
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
