/**
 * Libertad - Popup Interaction Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const presetDesc = document.getElementById('presetDesc');

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
      desc: 'Default YouTube state. All algorithmic feeds and recommendations visible.'
    },
    basic: {
      hideHomeFeed: false,
      hideSidebar: false,
      hideComments: true,
      hideShorts: false,
      hideEndScreens: true,
      desc: 'Suppresses comments and endscreen interactive video overlays.'
    },
    balanced: {
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      desc: 'Suppresses sidebar recommendations, comments, shorts feeds, and endscreens.'
    },
    extreme: {
      hideHomeFeed: true,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      desc: 'Zero clutter. Suppresses home feed, sidebar, comments, and shorts. Focus reticle active.'
    }
  };

  // State
  let state = {
    preset: 'balanced',
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    showDislikes: true,
    untranslateTitles: true
  };

  // Load state from chrome.storage.sync
  chrome.storage.sync.get(null, (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      state = { ...state, ...saved };
    }
    renderUI();
  });

  // Render UI to reflect current state
  function renderUI() {
    // Checkboxes
    toggles.hideHomeFeed.checked = !!state.hideHomeFeed;
    toggles.hideSidebar.checked = !!state.hideSidebar;
    toggles.hideComments.checked = !!state.hideComments;
    toggles.hideShorts.checked = !!state.hideShorts;
    toggles.hideEndScreens.checked = !!state.hideEndScreens;
    toggles.showDislikes.checked = !!state.showDislikes;
    toggles.untranslateTitles.checked = !!state.untranslateTitles;

    // Detect matched preset
    const detectedPreset = detectMatchingPreset();
    state.preset = detectedPreset || 'custom';

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
      presetDesc.textContent = PRESET_MAP[state.preset].desc;
    } else {
      presetDesc.textContent = 'Custom parameter matrix active.';
    }

    // Status pill
    const isOff = state.preset === 'off' || (!state.hideHomeFeed && !state.hideSidebar && !state.hideComments && !state.hideShorts && !state.hideEndScreens);
    if (isOff) {
      statusPill.classList.add('is-off');
      statusText.textContent = 'OFF';
    } else {
      statusPill.classList.remove('is-off');
      statusText.textContent = state.preset.toUpperCase();
    }
  }

  // Detect if current custom toggles match any preset
  function detectMatchingPreset() {
    for (const [key, config] of Object.entries(PRESET_MAP)) {
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

  // Preset button clicks
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenPreset = btn.getAttribute('data-preset');
      if (PRESET_MAP[chosenPreset]) {
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
    state = {
      preset: 'balanced',
      hideHomeFeed: false,
      hideSidebar: true,
      hideComments: true,
      hideShorts: true,
      hideEndScreens: true,
      showDislikes: true,
      untranslateTitles: true
    };
    saveState();
  });
});
