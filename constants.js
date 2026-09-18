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
    descKey: 'descExtreme',
  },
  custom: {
    descKey: 'descCustom',
  },
};

function extractToggles(config) {
  const result = {};
  for (let i = 0; i < TOGGLE_KEYS.length; i++) {
    const key = TOGGLE_KEYS[i];
    result[key] = !!config[key];
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
  // Active toggle values matching basic preset default
  ...extractToggles(PRESET_MAP.basic),
  // Power Modules
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

if (typeof globalThis !== 'undefined') {
  globalThis.TOGGLE_KEYS = TOGGLE_KEYS;
  globalThis.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  globalThis.PRESET_MAP = PRESET_MAP;
  globalThis.DEFAULT_PROFILES = DEFAULT_PROFILES;
  globalThis.extractToggles = extractToggles;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOGGLE_KEYS,
    DEFAULT_SETTINGS,
    PRESET_MAP,
    DEFAULT_PROFILES,
    extractToggles,
  };
}
