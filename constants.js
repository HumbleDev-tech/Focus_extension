/**
 * Libertad - Core Constants & Single Source of Truth
 * Shared configuration schema, presets, profiles, and toggle keys across Service Worker, Content Scripts, and Popup.
 */

const TOGGLE_KEYS = [
  // Focus Shield (Macro Distraction Blockers)
  'hideHomeFeed',
  'redirectHomeToSubscriptions',
  'hideSidebar',
  'hideComments',
  'hideShorts',
  'hideEndScreens',
  // UI Cleaner: Header & Search
  'hideVoiceSearch',
  'hideCreateButton',
  'hideNotifications',
  'hideSearchSuggestions',
  'hideFilterChips',
  // UI Cleaner: Player Controls & Overlays
  'hideAutoplay',
  'hideUpNext',
  'hideWatermark',
  'hidePaidPromo',
  'hideMiniplayer',
  // UI Cleaner: Action Bar & Social
  'hideAskAi',
  'hideDownload',
  'hideThanksClips',
  'hideJoinButton',
  'hideShare',
  'hideSave',
  'hideLikeDislike',
  'hideSubscribeButton',
  'hideSubscriberCount',
  'hideViewsDate',
  'hideMoreActions',
  // UI Cleaner: Feeds & Navigation
  'hideMerchShelf',
  'hideLiveChat',
  'hideTrending',
  'hideMoreFromYoutube',
];

const POWER_MODULE_KEYS = [
  'showDislikes',
  'untranslateMaster',
  'untranslateTitles',
  'untranslateAudio',
  'untranslateDescription',
  'untranslateCaptions',
  'untranslateChapters',
  'skipSponsors',
  'sponsorSkipSponsors',
  'sponsorSkipSelfpromo',
  'sponsorSkipInteraction',
  'sponsorSkipIntro',
  'sponsorSkipOutro',
  'sponsorSkipMusicOfftopic',
];

const POWER_MODULE_DEFAULTS = {
  showDislikes: true,
  untranslateMaster: true,
  untranslateTitles: true,
  untranslateAudio: true,
  untranslateDescription: true,
  untranslateCaptions: true,
  untranslateChapters: true,
  skipSponsors: true,
  sponsorSkipSponsors: true,
  sponsorSkipSelfpromo: false,
  sponsorSkipInteraction: true,
  sponsorSkipIntro: false,
  sponsorSkipOutro: false,
  sponsorSkipMusicOfftopic: false,
};

const POWER_MODULE_OFF = {
  showDislikes: false,
  untranslateMaster: false,
  untranslateTitles: false,
  untranslateAudio: false,
  untranslateDescription: false,
  untranslateCaptions: false,
  untranslateChapters: false,
  skipSponsors: false,
  sponsorSkipSponsors: false,
  sponsorSkipSelfpromo: false,
  sponsorSkipInteraction: false,
  sponsorSkipIntro: false,
  sponsorSkipOutro: false,
  sponsorSkipMusicOfftopic: false,
};

const ALL_TOGGLE_KEYS = [...TOGGLE_KEYS, ...POWER_MODULE_KEYS];

const PRESET_MAP = {
  off: {
    hideHomeFeed: false,
    redirectHomeToSubscriptions: false,
    hideSidebar: false,
    hideComments: false,
    hideShorts: false,
    hideEndScreens: false,
    hideVoiceSearch: false,
    hideCreateButton: false,
    hideNotifications: false,
    hideSearchSuggestions: false,
    hideFilterChips: false,
    hideAutoplay: false,
    hideUpNext: false,
    hideWatermark: false,
    hidePaidPromo: false,
    hideMiniplayer: false,
    hideAskAi: false,
    hideDownload: false,
    hideThanksClips: false,
    hideJoinButton: false,
    hideShare: false,
    hideSave: false,
    hideLikeDislike: false,
    hideSubscribeButton: false,
    hideSubscriberCount: false,
    hideViewsDate: false,
    hideMoreActions: false,
    hideMerchShelf: false,
    hideLiveChat: false,
    hideTrending: false,
    hideMoreFromYoutube: false,
    ...POWER_MODULE_OFF,
    descKey: 'descOff',
  },
  basic: {
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
    hideTrending: false,
    hideMoreFromYoutube: false,
    ...POWER_MODULE_DEFAULTS,
    descKey: 'descBasic',
  },
  balanced: {
    hideHomeFeed: false,
    redirectHomeToSubscriptions: false,
    hideSidebar: true,
    hideComments: false,
    hideShorts: true,
    hideEndScreens: true,
    hideVoiceSearch: true,
    hideCreateButton: true,
    hideNotifications: true,
    hideSearchSuggestions: false,
    hideFilterChips: false,
    hideAutoplay: true,
    hideUpNext: true,
    hideWatermark: true,
    hidePaidPromo: true,
    hideMiniplayer: true,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: true,
    hideJoinButton: true,
    hideShare: false,
    hideSave: false,
    hideLikeDislike: false,
    hideSubscribeButton: false,
    hideSubscriberCount: false,
    hideViewsDate: false,
    hideMoreActions: false,
    hideMerchShelf: true,
    hideLiveChat: true,
    hideTrending: true,
    hideMoreFromYoutube: true,
    ...POWER_MODULE_DEFAULTS,
    descKey: 'descBalanced',
  },
  extreme: {
    hideHomeFeed: true,
    redirectHomeToSubscriptions: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    hideVoiceSearch: true,
    hideCreateButton: true,
    hideNotifications: true,
    hideSearchSuggestions: true,
    hideFilterChips: true,
    hideAutoplay: true,
    hideUpNext: true,
    hideWatermark: true,
    hidePaidPromo: true,
    hideMiniplayer: true,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: true,
    hideJoinButton: true,
    hideShare: true,
    hideSave: true,
    hideLikeDislike: true,
    hideSubscribeButton: true,
    hideSubscriberCount: true,
    hideViewsDate: true,
    hideMoreActions: true,
    hideMerchShelf: true,
    hideLiveChat: true,
    hideTrending: true,
    hideMoreFromYoutube: true,
    ...POWER_MODULE_DEFAULTS,
    descKey: 'descExtreme',
  },
  custom: {
    descKey: 'descCustom',
  },
};

function extractToggles(config) {
  const result = {};
  for (let i = 0; i < ALL_TOGGLE_KEYS.length; i++) {
    const key = ALL_TOGGLE_KEYS[i];
    if (config[key] !== undefined) {
      result[key] = !!config[key];
    }
  }
  return result;
}

const DEFAULT_PROFILES = {};

const DEFAULT_SETTINGS = {
  activeProfile: null,
  profiles: DEFAULT_PROFILES,
  preset: 'basic',
  theme: 'auto',
  lang: 'auto',
  scale: 'auto',
  activeTab: 'focus',
  ...extractToggles(PRESET_MAP.basic),
};

if (typeof globalThis !== 'undefined') {
  globalThis.TOGGLE_KEYS = TOGGLE_KEYS;
  globalThis.POWER_MODULE_KEYS = POWER_MODULE_KEYS;
  globalThis.POWER_MODULE_DEFAULTS = POWER_MODULE_DEFAULTS;
  globalThis.POWER_MODULE_OFF = POWER_MODULE_OFF;
  globalThis.ALL_TOGGLE_KEYS = ALL_TOGGLE_KEYS;
  globalThis.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  globalThis.PRESET_MAP = PRESET_MAP;
  globalThis.DEFAULT_PROFILES = DEFAULT_PROFILES;
  globalThis.extractToggles = extractToggles;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOGGLE_KEYS,
    POWER_MODULE_KEYS,
    POWER_MODULE_DEFAULTS,
    POWER_MODULE_OFF,
    ALL_TOGGLE_KEYS,
    DEFAULT_SETTINGS,
    PRESET_MAP,
    DEFAULT_PROFILES,
    extractToggles,
  };
}
