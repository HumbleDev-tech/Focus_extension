/**
 * Libertad - Core Constants & Single Source of Truth
 * Shared configuration schema, presets, and toggle keys across Service Worker, Content Scripts, and Popup.
 */

const TOGGLE_KEYS = [
  'hideHomeFeed',
  'hideSidebar',
  'hideComments',
  'hideShorts',
  'hideEndScreens',
  'hideVoiceSearch',
  'hideCreateButton',
  'hideNotifications',
  'hideAskAi',
  'hideDownload',
  'hideThanksClips',
  'hideJoinButton',
  'hideShare',
  'hideMerchShelf',
];

const DEFAULT_SETTINGS = {
  preset: 'balanced', // 'off', 'basic', 'balanced', 'extreme', 'custom'
  theme: 'dark', // 'dark', 'light', 'oled'
  lang: 'auto', // 'auto', 'en', 'es'
  scale: 'auto', // 'auto', '100', '120', '140'
  activeTab: 'focus', // 'focus', 'cleaner', 'extras'
  hideHomeFeed: false,
  hideSidebar: true,
  hideComments: true,
  hideShorts: true,
  hideEndScreens: true,
  hideVoiceSearch: true,
  hideCreateButton: true,
  hideNotifications: true,
  hideAskAi: true,
  hideDownload: true,
  hideThanksClips: true,
  hideJoinButton: true,
  hideShare: false,
  hideMerchShelf: true,
  showDislikes: true,
  untranslateTitles: true,
  customConfig: {
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    hideVoiceSearch: true,
    hideCreateButton: true,
    hideNotifications: true,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: true,
    hideJoinButton: true,
    hideShare: false,
    hideMerchShelf: true,
  },
};

const PRESET_MAP = {
  off: {
    hideHomeFeed: false,
    hideSidebar: false,
    hideComments: false,
    hideShorts: false,
    hideEndScreens: false,
    hideVoiceSearch: false,
    hideCreateButton: false,
    hideNotifications: false,
    hideAskAi: false,
    hideDownload: false,
    hideThanksClips: false,
    hideJoinButton: false,
    hideShare: false,
    hideMerchShelf: false,
    descKey: 'descOff',
  },
  basic: {
    hideHomeFeed: false,
    hideSidebar: false,
    hideComments: true,
    hideShorts: false,
    hideEndScreens: true,
    hideVoiceSearch: false,
    hideCreateButton: false,
    hideNotifications: false,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: false,
    hideJoinButton: false,
    hideShare: false,
    hideMerchShelf: true,
    descKey: 'descBasic',
  },
  balanced: {
    hideHomeFeed: false,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    hideVoiceSearch: true,
    hideCreateButton: true,
    hideNotifications: true,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: true,
    hideJoinButton: true,
    hideShare: false,
    hideMerchShelf: true,
    descKey: 'descBalanced',
  },
  extreme: {
    hideHomeFeed: true,
    hideSidebar: true,
    hideComments: true,
    hideShorts: true,
    hideEndScreens: true,
    hideVoiceSearch: true,
    hideCreateButton: true,
    hideNotifications: true,
    hideAskAi: true,
    hideDownload: true,
    hideThanksClips: true,
    hideJoinButton: true,
    hideShare: true,
    hideMerchShelf: true,
    descKey: 'descExtreme',
  },
  custom: {
    descKey: 'descCustom',
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.TOGGLE_KEYS = TOGGLE_KEYS;
  globalThis.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  globalThis.PRESET_MAP = PRESET_MAP;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TOGGLE_KEYS, DEFAULT_SETTINGS, PRESET_MAP };
}
