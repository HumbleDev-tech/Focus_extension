/**
 * Libertad - Style & Zen Engine
 * Injects dynamic CSS rules and renders Zen Mode intentional home interface.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  const STYLE_ID = 'libertad-focus-styles';
  const ZEN_CONTAINER_ID = 'libertad-zen-container';

  // Build high-efficiency CSS rules based on settings
  function buildStylesheet(settings) {
    const rules = [];

    // Home feed
    if (settings.hideHomeFeed) {
      rules.push(`
        /* Suppress home feed recommendation items and skeletons */
        ytd-browse[page-subtype="home"] #contents,
        ytd-browse[page-subtype="home"] #chips-wrapper,
        ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
        ytd-browse[page-subtype="home"] #home-page-skeleton,
        ytd-browse[page-subtype="home"] [id*="skeleton"],
        ytd-browse[page-subtype="home"] .ytd-ghost-grid {
          display: none !important;
        }

        /* Strictly ensure inactive or hidden browse pages never force display or disrupt watch view */
        ytd-browse[hidden],
        ytd-browse[page-subtype="home"][hidden],
        ytd-page-manager:has(ytd-watch-flexy:not([hidden])) ytd-browse,
        ytd-page-manager:has(ytd-watch-flexy) ytd-browse[hidden] {
          display: none !important;
        }

        /* Center Zen card ONLY on active, visible home feed */
        ytd-browse[page-subtype="home"]:not([hidden]) {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
        }
        ytd-browse[page-subtype="home"]:not([hidden]) ytd-two-column-browse-results-renderer {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        ytd-browse[page-subtype="home"]:not([hidden]) #primary {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          float: none !important;
          padding: 0 !important;
        }
        ytd-browse[page-subtype="home"]:not([hidden]) #secondary {
          display: none !important;
        }
      `);
    }

    // Related / Sidebar
    if (settings.hideSidebar) {
      rules.push(`
        #secondary.ytd-watch-flexy,
        #secondary-inner.ytd-watch-flexy,
        #related.ytd-watch-flexy,
        #related,
        ytd-watch-flexy #related,
        ytd-watch-next-secondary-results-renderer {
          display: none !important;
        }
        ytd-watch-flexy:not([theater]):not([fullscreen]) #primary.ytd-watch-flexy {
          max-width: 1100px !important;
          margin: 0 auto !important;
        }
      `);
    }

    // Comments
    if (settings.hideComments) {
      rules.push(`
        #comments,
        ytd-comments,
        ytd-engagement-panel-section-list-renderer[target-id*="comments"],
        ytd-engagement-panel-section-list-renderer:has(#comments),
        #engagement-panel-comments-section {
          display: none !important;
        }
      `);
    }

    // Shorts (Shelves, sidebars, header/navigation links, channel tabs, and shorts player)
    if (settings.hideShorts) {
      rules.push(`
        /* Channel Shorts Tab */
        yt-tab-shape[tab-title="Shorts" i],
        yt-tab-group-shape yt-tab-shape[tab-title="Shorts" i],
        ytd-tabbed-page-header yt-tab-shape[tab-title="Shorts" i],
        yt-tab-shape:has(div[aria-label*="Shorts" i]),
        yt-tab-shape:has(a[href*="/shorts"]),
        tp-yt-paper-tab:has(a[href*="/shorts"]),
        tp-yt-paper-tab:has([title*="Shorts" i]),
        ytd-c4-tabbed-header-renderer tp-yt-paper-tab:has(a[href*="/shorts"]),

        /* Shelves and Containers */
        ytd-reel-shelf-renderer,
        ytd-rich-shelf-renderer[is-shorts],
        ytd-rich-section-renderer:has(ytd-reel-shelf-renderer),
        ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),

        /* Navigation Drawer & Guide */
        ytd-guide-entry-renderer:has(a[title*="Shorts" i]),
        ytd-guide-entry-renderer:has(a[href*="/shorts"]),
        ytd-mini-guide-entry-renderer[aria-label*="Shorts" i],
        ytd-mini-guide-entry-renderer:has(a[href*="/shorts"]),
        yt-list-item-view-model:has(a[href*="/shorts"]),
        a[title="Shorts"],

        /* Modern Shorts Lockup & Feeds/Search/Channel Grid Cards (Strictly scoped to video targets) */
        ytm-shorts-lockup-view-model,
        ytm-shorts-lockup-view-model-v2,
        ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model),
        ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model-v2),
        ytd-rich-item-renderer:has(a#thumbnail[href*="/shorts/"]),
        ytd-rich-item-renderer:has(a#video-title-link[href*="/shorts/"]),
        ytd-video-renderer:has(a#thumbnail[href*="/shorts/"]),
        ytd-video-renderer:has(a#video-title-link[href*="/shorts/"]),
        ytd-video-renderer:has(a#video-title[href*="/shorts/"]),
        ytd-grid-video-renderer:has(a#thumbnail[href*="/shorts/"]),
        ytd-grid-video-renderer:has(a#video-title[href*="/shorts/"]),
        ytd-compact-video-renderer:has(a#thumbnail[href*="/shorts/"]),
        yt-lockup-view-model:has(a[href*="/shorts/"][class*="thumbnail"]),
        yt-lockup-view-model:has(a.yt-lockup-metadata-view-model-wiz__title[href*="/shorts/"]),
        ytd-reel-item-renderer,

        /* Standalone Player */
        ytd-shorts,
        #shorts-container,
        ytd-reel-video-renderer {
          display: none !important;
        }
      `);
    }

    // Video Endscreens & Cards
    if (settings.hideEndScreens) {
      rules.push(`
        .ytp-ce-element,
        .ytp-endscreen-content,
        .ytp-cards-teaser,
        .ytp-cards-button {
          display: none !important;
        }
      `);
    }

    // Voice Search Microphone (Strictly scoped to masthead and searchbox)
    if (settings.hideVoiceSearch) {
      rules.push(`
        #voice-search-button,
        ytd-searchbox #voice-search-button,
        yt-searchbox #voice-search-button,
        ytd-masthead #voice-search-button,
        ytd-voice-search-dialog-renderer,
        ytd-masthead [class*="VoiceSearchButton"],
        ytd-masthead [class*="voice-search-button"],
        ytd-masthead [class*="voiceSearch"],
        ytd-masthead yt-icon-button:has(yt-icon[icon*="mic"]),
        ytd-masthead yt-icon-button:has(yt-icon[icon*="voice"]),
        ytd-masthead yt-button-shape:has(yt-icon[icon*="mic"]),
        ytd-masthead button:has(yt-icon[icon*="mic"]),
        ytd-masthead yt-icon-button:has([aria-label*="voice" i]),
        ytd-masthead yt-icon-button:has([aria-label*="voz" i]),
        ytd-masthead button[aria-label*="voice" i],
        ytd-masthead button[aria-label*="voz" i],
        ytd-masthead button[title*="voice" i],
        ytd-masthead button[title*="voz" i] {
          display: none !important;
        }
      `);
    }

    // Create / Upload Button in Masthead
    if (settings.hideCreateButton) {
      rules.push(`
        ytd-masthead ytd-topbar-menu-button-renderer:has(yt-icon[icon*="create"]),
        ytd-masthead ytd-topbar-menu-button-renderer:has(yt-icon[icon*="add_video"]),
        ytd-masthead #buttons > :has(yt-icon[icon*="create"]),
        ytd-masthead #buttons > :has(yt-icon[icon*="add_video"]),
        ytd-masthead yt-button-shape:has(yt-icon[icon*="create"]),
        ytd-masthead yt-button-view-model:has(yt-icon[icon*="create"]),
        ytd-masthead ytd-button-renderer:has([aria-label*="create" i]),
        ytd-masthead yt-button-view-model:has([aria-label*="create" i]),
        ytd-masthead yt-button-shape:has([aria-label*="create" i]),
        ytd-masthead ytd-button-renderer:has([aria-label*="crear" i]),
        ytd-masthead yt-button-view-model:has([aria-label*="crear" i]),
        ytd-masthead yt-button-shape:has([aria-label*="crear" i]),
        ytd-masthead ytd-topbar-menu-button-renderer:has([aria-label*="create" i]),
        ytd-masthead ytd-topbar-menu-button-renderer:has([aria-label*="crear" i]) {
          display: none !important;
        }
      `);
    }

    // Notification Bell in Masthead
    if (settings.hideNotifications) {
      rules.push(`
        ytd-notification-topbar-button-renderer,
        notification-topbar-button-view-model,
        ytd-masthead yt-icon-button:has(yt-icon[icon*="bell"]),
        ytd-masthead yt-button-shape:has(yt-icon[icon*="bell"]),
        ytd-masthead [id*="notification-preference"],
        ytd-masthead #notification-button,
        ytd-masthead [aria-label*="notification" i],
        ytd-masthead yt-icon-button:has([aria-label*="notif" i]) {
          display: none !important;
        }
      `);
    }

    // Ask AI Assistant Button (Scoped strictly to watch metadata and conversational AI elements)
    if (settings.hideAskAi) {
      rules.push(`
        ytd-conversational-ai-view-model,
        conversational-ai-button-view-model,
        watch-metadata-view-model conversational-ai-button-view-model,
        watch-metadata-view-model [target-id*="conversational"],
        [component-id*="conversational_ai"],
        [target-id*="conversational_ai"],
        [target-id*="conversational-ai"],
        #conversational-ai,
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="sparkle"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="sparkle"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="sparkle"]),
        #actions yt-button-view-model:has(yt-icon[icon*="sparkle"]),
        #actions yt-button-shape:has(yt-icon[icon*="sparkle"]),
        #actions ytd-button-renderer:has(yt-icon[icon*="sparkle"]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="ask" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="pregunt" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="ask" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="pregunt" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="ask" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="pregunt" i]),
        #actions yt-button-view-model:has([aria-label*="ask" i]),
        #actions yt-button-view-model:has([aria-label*="pregunt" i]) {
          display: none !important;
        }
      `);
    }

    // Promotional Premium Download Button (Scoped strictly to watch metadata and overflow menus)
    if (settings.hideDownload) {
      rules.push(`
        download-button-view-model,
        ytd-download-button-renderer,
        watch-metadata-view-model download-button-view-model,
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="download"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="download"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="download"]),
        #actions yt-button-view-model:has(yt-icon[icon*="download"]),
        #actions yt-button-shape:has(yt-icon[icon*="download"]),
        #actions ytd-button-renderer:has(yt-icon[icon*="download"]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="download" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="descarg" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="download" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="descarg" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="download" i]),
        ytd-watch-metadata ytd-button-renderer:has(a[href*="premium"]),
        ytd-menu-service-item-renderer:has([aria-label*="descarg" i]),
        ytd-menu-service-item-renderer:has([aria-label*="download" i]),
        ytd-menu-navigation-item-renderer:has([aria-label*="descarg" i]),
        ytd-menu-navigation-item-renderer:has([aria-label*="download" i]),
        ytd-menu-navigation-item-renderer:has(a[href*="premium"]),
        ytd-menu-popup-renderer ytd-menu-service-item-renderer:has(yt-icon[icon*="download"]),
        ytd-menu-popup-renderer ytd-menu-navigation-item-renderer:has(yt-icon[icon*="download"]),
        ytd-menu-popup-renderer tp-yt-paper-item:has(yt-icon[icon*="download"]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="descarg" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="download" i]) {
          display: none !important;
        }
      `);
    }

    // Thanks, Clips, and Remix Buttons (Scoped strictly to watch metadata)
    if (settings.hideThanksClips) {
      rules.push(`
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="super-thanks"]),
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="clip"]),
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="remix"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="super-thanks"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="clip"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="remix"]),
        #actions yt-button-view-model:has(yt-icon[icon*="super-thanks"]),
        #actions yt-button-view-model:has(yt-icon[icon*="clip"]),
        #actions yt-button-view-model:has(yt-icon[icon*="remix"]),
        #actions yt-button-shape:has(yt-icon[icon*="super-thanks"]),
        #actions yt-button-shape:has(yt-icon[icon*="clip"]),
        #actions yt-button-shape:has(yt-icon[icon*="remix"]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="thank" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="gracia" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="thank" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="gracia" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="thank" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="gracia" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="clip" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="clip" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="clip" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="remix" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="remix" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="remix" i]),
        #actions yt-button-view-model:has([aria-label*="thank" i]),
        #actions yt-button-view-model:has([aria-label*="gracia" i]),
        #actions yt-button-view-model:has([aria-label*="clip" i]),
        #actions yt-button-view-model:has([aria-label*="remix" i]),
        #actions button[aria-label*="thank" i],
        #actions button[aria-label*="gracia" i],
        #actions button[aria-label*="clip" i],
        #actions button[aria-label*="remix" i],
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="super-thanks"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="clip"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="remix"]) {
          display: none !important;
        }
      `);
    }

    // Share Button (Scoped strictly to watch metadata)
    if (settings.hideShare) {
      rules.push(`
        share-button-view-model,
        ytd-share-target-renderer,
        watch-metadata-view-model share-button-view-model,
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="share"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="share"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="share"]),
        #actions yt-button-view-model:has(yt-icon[icon*="share"]),
        #actions yt-button-shape:has(yt-icon[icon*="share"]),
        #actions ytd-button-renderer:has(yt-icon[icon*="share"]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="share" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="compart" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="share" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="compart" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="share" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="compart" i]),
        #actions yt-button-view-model:has([aria-label*="share" i]),
        #actions yt-button-view-model:has([aria-label*="compart" i]) {
          display: none !important;
        }
      `);
    }

    // Channel Memberships / Join Button
    if (settings.hideJoinButton) {
      rules.push(`
        #sponsor-button,
        ytd-sponsor-button-renderer,
        sponsor-button-view-model,
        watch-metadata-view-model sponsor-button-view-model,
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="sponsor"]),
        #actions ytd-button-renderer:has(yt-icon[icon*="sponsor"]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="unirse" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="join" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="unirse" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="join" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="unirse" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="join" i]),
        ytd-watch-metadata #sponsor-button {
          display: none !important;
        }
      `);
    }

    // Merchandise, Shopping & Products Shelves
    if (settings.hideMerchShelf) {
      rules.push(`
        ytd-merch-shelf-renderer,
        merch-shelf-view-model,
        ytd-shopping-item-card-list-renderer,
        ytd-vertical-product-shelf-renderer,
        ytd-rich-shelf-renderer:has(ytd-shopping-item-card-list-renderer),
        ytd-engagement-panel-section-list-renderer[target-id*="shopping"],
        ytd-engagement-panel-section-list-renderer:has(#shopping),
        #shopping-panel,
        [target-id*="shopping"],
        [target-id*="merch"],
        ytd-product-shelf-renderer {
          display: none !important;
        }
      `);
    }

    // Save / Add to Playlist Button
    if (settings.hideSave) {
      rules.push(`
        /* Watch Metadata Top-level (Modern & Legacy) */
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="playlist-add"]),
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="bookmark"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="playlist-add"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="bookmark"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="playlist-add"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="bookmark"]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="save" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="guardar" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="playlist" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="save" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="guardar" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="playlist" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="save" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="guardar" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="playlist" i]),
        ytd-watch-metadata yt-button-view-model:has([title*="save" i]),
        ytd-watch-metadata yt-button-view-model:has([title*="guardar" i]),
        ytd-watch-metadata yt-button-shape:has([title*="save" i]),
        ytd-watch-metadata yt-button-shape:has([title*="guardar" i]),
        ytd-watch-metadata ytd-button-renderer:has([title*="save" i]),
        ytd-watch-metadata ytd-button-renderer:has([title*="guardar" i]),

        /* Modern watch-metadata-view-model Container */
        watch-metadata-view-model yt-button-view-model:has([aria-label*="save" i]),
        watch-metadata-view-model yt-button-view-model:has([aria-label*="guardar" i]),
        watch-metadata-view-model yt-button-view-model:has([aria-label*="playlist" i]),
        watch-metadata-view-model yt-button-shape:has([aria-label*="save" i]),
        watch-metadata-view-model yt-button-shape:has([aria-label*="guardar" i]),
        watch-metadata-view-model yt-button-shape:has([aria-label*="playlist" i]),
        watch-metadata-view-model :has(yt-icon[icon*="playlist-add"]),
        watch-metadata-view-model :has(yt-icon[icon*="bookmark"]),
        watch-metadata-view-model yt-button-view-model:has([title*="save" i]),
        watch-metadata-view-model yt-button-view-model:has([title*="guardar" i]),
        watch-metadata-view-model yt-button-shape:has([title*="save" i]),
        watch-metadata-view-model yt-button-shape:has([title*="guardar" i]),

        /* Actions Bar & Direct Button Shapes */
        #actions yt-button-view-model:has([aria-label*="save" i]),
        #actions yt-button-view-model:has([aria-label*="guardar" i]),
        #actions yt-button-view-model:has([aria-label*="playlist" i]),
        #actions yt-button-shape:has([aria-label*="save" i]),
        #actions yt-button-shape:has([aria-label*="guardar" i]),
        #actions yt-button-shape:has([aria-label*="playlist" i]),
        #actions ytd-button-renderer:has([aria-label*="save" i]),
        #actions ytd-button-renderer:has([aria-label*="guardar" i]),
        #actions ytd-button-renderer:has([aria-label*="playlist" i]),
        #actions yt-button-view-model:has([title*="save" i]),
        #actions yt-button-view-model:has([title*="guardar" i]),
        #actions yt-button-shape:has([title*="save" i]),
        #actions yt-button-shape:has([title*="guardar" i]),
        #actions ytd-button-renderer:has([title*="save" i]),
        #actions ytd-button-renderer:has([title*="guardar" i]),
        #actions button[aria-label*="save" i],
        #actions button[aria-label*="guardar" i],
        #actions button[aria-label*="playlist" i],
        #actions button[title*="save" i],
        #actions button[title*="guardar" i],
        #actions yt-button-view-model:has(yt-icon[icon*="playlist-add"]),
        #actions yt-button-shape:has(yt-icon[icon*="playlist-add"]),
        #actions ytd-button-renderer:has(yt-icon[icon*="playlist-add"]),
        #actions yt-button-view-model:has(yt-icon[icon*="bookmark"]),
        #actions yt-button-shape:has(yt-icon[icon*="bookmark"]),
        #actions ytd-button-renderer:has(yt-icon[icon*="bookmark"]),

        /* Overflow Menu (3-dots popup) when items don't fit horizontally */
        ytd-menu-service-item-renderer:has([aria-label*="guardar" i]),
        ytd-menu-service-item-renderer:has([aria-label*="save" i]),
        ytd-menu-service-item-renderer:has([aria-label*="playlist" i]),
        ytd-menu-service-item-renderer:has(yt-formatted-string[title*="guardar" i]),
        ytd-menu-service-item-renderer:has(yt-formatted-string[title*="save" i]),
        ytd-menu-service-item-renderer:has(yt-formatted-string[title*="playlist" i]),
        ytd-menu-service-item-renderer:has(yt-icon[icon*="playlist-add"]),
        ytd-menu-service-item-renderer:has(yt-icon[icon*="bookmark"]),
        ytd-menu-navigation-item-renderer:has([aria-label*="guardar" i]),
        ytd-menu-navigation-item-renderer:has([aria-label*="save" i]),
        ytd-menu-navigation-item-renderer:has([aria-label*="playlist" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="guardar" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="save" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="playlist" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([title*="guardar" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([title*="save" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([title*="playlist" i]),
        ytd-menu-popup-renderer tp-yt-paper-item:has(yt-icon[icon*="playlist-add"]),
        ytd-menu-popup-renderer tp-yt-paper-item:has(yt-icon[icon*="bookmark"]),
        ytd-menu-popup-renderer tp-yt-paper-item:has([aria-label*="guardar" i]),
        ytd-menu-popup-renderer tp-yt-paper-item:has([aria-label*="save" i]),
        ytd-menu-popup-renderer tp-yt-paper-item:has([aria-label*="playlist" i]) {
          display: none !important;
        }
      `);
    }

    // Like & Dislike Social Block
    if (settings.hideLikeDislike) {
      rules.push(`
        segmented-like-dislike-button-view-model,
        ytd-segmented-like-dislike-button-renderer,
        #segmented-like-button,
        #segmented-dislike-button,
        like-button-view-model,
        dislike-button-view-model,
        #dislike-button,
        #like-button {
          display: none !important;
        }
      `);
    }

    // Channel Subscriber Count
    if (settings.hideSubscriberCount) {
      rules.push(`
        #owner-sub-count,
        ytd-video-owner-renderer #owner-sub-count,
        yt-formatted-string#owner-sub-count {
          display: none !important;
        }
      `);
    }

    // Channel Subscribe Button
    if (settings.hideSubscribeButton) {
      rules.push(`
        #subscribe-button,
        #subscribe-button-shape,
        ytd-subscribe-button-renderer,
        subscribe-button-view-model,
        ytd-watch-metadata subscribe-button-view-model,
        ytd-channel-header-renderer subscribe-button-view-model,
        ytd-c4-tabbed-header-renderer subscribe-button-view-model {
          display: none !important;
        }
      `);
    }

    // Video Views Count & Upload Date
    if (settings.hideViewsDate) {
      rules.push(`
        #info-container.ytd-watch-info-text,
        ytd-watch-info-text #info-container,
        #view-count.ytd-video-view-count-renderer,
        watch-metadata-view-model #view-count,
        watch-metadata-view-model #date,
        watch-metadata-view-model .view-count,
        #description-inner #info-container {
          display: none !important;
        }
      `);
    }

    // 3-Dots Overflow Menu & Report Actions (Action Bar More actions button + Report option)
    if (settings.hideMoreActions) {
      rules.push(`
        ytd-watch-metadata #actions ytd-menu-renderer > yt-icon-button.dropdown-trigger,
        ytd-watch-metadata #actions ytd-menu-renderer > yt-button-shape,
        ytd-watch-metadata #actions ytd-menu-renderer #top-level-buttons-computed ~ yt-button-shape,
        ytd-watch-metadata #actions ytd-menu-renderer #top-level-buttons-computed ~ yt-icon-button,
        ytd-watch-metadata #actions ytd-menu-renderer #top-level-buttons-computed ~ ytd-button-renderer,
        ytd-watch-metadata #actions yt-icon-button[aria-label*="más acciones" i],
        ytd-watch-metadata #actions yt-icon-button[aria-label*="more actions" i],
        ytd-watch-metadata #actions yt-icon-button[aria-label*="otras acciones" i],
        ytd-watch-metadata #actions button[aria-label*="más acciones" i],
        ytd-watch-metadata #actions button[aria-label*="more actions" i],
        ytd-watch-metadata #actions button[aria-label*="otras acciones" i],
        ytd-watch-metadata #actions yt-button-shape:has(button[aria-label*="más acciones" i]),
        ytd-watch-metadata #actions yt-button-shape:has(button[aria-label*="more actions" i]),
        ytd-watch-metadata #actions yt-button-shape:has(button[aria-label*="otras acciones" i]),
        ytd-menu-service-item-renderer:has(yt-icon[icon*="report"]),
        ytd-menu-service-item-renderer:has(yt-icon[icon*="flag"]),
        ytd-menu-service-item-renderer:has([aria-label*="report" i]),
        ytd-menu-service-item-renderer:has([aria-label*="denunciar" i]),
        ytd-menu-service-item-renderer:has([aria-label*="notificar" i]),
        ytd-menu-popup-renderer tp-yt-paper-item:has(yt-icon[icon*="report"]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="report" i]),
        ytd-menu-popup-renderer yt-list-item-view-model:has([aria-label*="denunciar" i]) {
          display: none !important;
        }
      `);
    }

    // Autoplay Player Switch
    if (settings.hideAutoplay) {
      rules.push(`
        .ytp-autonav-toggle-button-container,
        .ytp-button[data-tooltip-target-id*="autonav"],
        .ytp-autonav-toggle-button {
          display: none !important;
        }
      `);
    }

    // Up Next Countdown Screen
    if (settings.hideUpNext) {
      rules.push(`
        .ytp-upnext,
        .ytp-upnext-autoplay-icon,
        .ytp-upnext-container {
          display: none !important;
        }
      `);
    }

    // Video Player Channel Watermark
    if (settings.hideWatermark) {
      rules.push(`
        .annotation-type-custom.iv-branding,
        .iv-branding,
        .ytp-featured-watermark {
          display: none !important;
        }
      `);
    }

    // Paid Promotion Banner Overlay
    if (settings.hidePaidPromo) {
      rules.push(`
        .ytp-paid-content-overlay {
          display: none !important;
        }
      `);
    }

    // Miniplayer Button in Player Controls
    if (settings.hideMiniplayer) {
      rules.push(`
        .ytp-miniplayer-button {
          display: none !important;
        }
      `);
    }

    // Search Box Autocomplete Suggestions
    if (settings.hideSearchSuggestions) {
      rules.push(`
        .sbdd_b,
        .sbsb_a,
        yt-searchbox-suggestions,
        .gstl_50,
        ytd-searchbox .sbdd_a {
          display: none !important;
        }
      `);
    }

    // Search and Feed Filter Chips
    if (settings.hideFilterChips) {
      rules.push(`
        ytd-feed-filter-chip-bar-renderer,
        #chips-wrapper.ytd-feed-filter-chip-bar-renderer,
        ytd-feed-filter-chip-bar-renderer iron-selector#chips {
          display: none !important;
        }
      `);
    }

    // Left Drawer Trending & Explore Section
    if (settings.hideTrending) {
      rules.push(`
        ytd-guide-section-renderer:has(a[href*="/feed/trending"]),
        ytd-guide-entry-renderer:has(a[href*="/feed/trending"]),
        ytd-guide-entry-renderer:has(a[href*="/feed/explore"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/trending"]) {
          display: none !important;
        }
      `);
    }

    // Left Drawer "More from YouTube" Links
    if (settings.hideMoreFromYoutube) {
      rules.push(`
        ytd-guide-section-renderer:has(a[href*="premium"]),
        ytd-guide-section-renderer:has(a[href*="studio.youtube.com"]) {
          display: none !important;
        }
      `);
    }

    // Live Chat & Live Chat Replay
    if (settings.hideLiveChat) {
      rules.push(`
        #chat,
        #chat-container,
        ytd-live-chat-frame {
          display: none !important;
        }
      `);
    }

    // Dislike Button Fix & Expansion (Only injected when dislikes are active and not suppressed)
    if (settings.showDislikes && !settings.hideLikeDislike) {
      rules.push(`
        /* Ensure Dislike button container allows text expansion and proper padding */
        ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button,
        segmented-like-dislike-button-view-model dislike-button-view-model button,
        dislike-button-view-model button,
        #segmented-dislike-button button,
        #dislike-button button {
          width: auto !important;
          min-width: 48px !important;
          padding-left: 8px !important;
          padding-right: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .libertad-dislike-badge {
          display: inline-flex !important;
          align-items: center !important;
          font-family: "Roboto", "Segoe UI", Arial, sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1 !important;
          color: inherit !important;
          margin-left: 6px !important;
          pointer-events: none !important;
          white-space: nowrap !important;
        }
      `);
    }

    // Libertad UI Elements styling
    rules.push(`
      #libertad-zen-container {
        --zen-scale: 1;
        --zen-bg: #131722;
        --zen-border: rgba(255, 255, 255, 0.08);
        --zen-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        --zen-text-primary: #f0f3f6;
        --zen-text-secondary: #9aa4b2;
        --zen-accent: #38bdf8;
        --zen-accent-glow: rgba(56, 189, 248, 0.35);
        --zen-accent-soft: rgba(56, 189, 248, 0.08);
        --zen-accent-border: rgba(56, 189, 248, 0.28);
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 56vh !important;
        text-align: center !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: var(--zen-text-primary);
        padding: calc(40px * var(--zen-scale)) calc(20px * var(--zen-scale));
        box-sizing: border-box !important;
        align-self: center !important;
        flex: 1 1 100% !important;
        animation: libertadFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes libertadFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Scale Adaptations */
      #libertad-zen-container[data-scale="100"] {
        --zen-scale: 1;
      }
      #libertad-zen-container[data-scale="120"] {
        --zen-scale: 1.2;
      }
      #libertad-zen-container[data-scale="140"] {
        --zen-scale: 1.4;
      }

      /* Theme Adaptations */
      #libertad-zen-container[data-theme="dark"] {
        --zen-bg: #131722;
        --zen-border: rgba(255, 255, 255, 0.08);
        --zen-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        --zen-text-primary: #f0f3f6;
        --zen-text-secondary: #9aa4b2;
        --zen-accent: #38bdf8;
        --zen-accent-glow: rgba(56, 189, 248, 0.35);
        --zen-accent-soft: rgba(56, 189, 248, 0.08);
        --zen-accent-border: rgba(56, 189, 248, 0.28);
      }
      #libertad-zen-container[data-theme="oled"] {
        --zen-bg: #040508;
        --zen-border: #171a21;
        --zen-shadow: 0 8px 32px rgba(0, 0, 0, 0.85);
        --zen-text-primary: #ffffff;
        --zen-text-secondary: #a1a1aa;
        --zen-accent: #38bdf8;
        --zen-accent-glow: rgba(56, 189, 248, 0.45);
        --zen-accent-soft: rgba(56, 189, 248, 0.1);
        --zen-accent-border: rgba(56, 189, 248, 0.32);
      }
      #libertad-zen-container[data-theme="light"] {
        --zen-bg: #ffffff;
        --zen-border: #cbd5e1;
        --zen-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        --zen-text-primary: #0f172a;
        --zen-text-secondary: #475569;
        --zen-accent: #0284c7;
        --zen-accent-glow: rgba(2, 132, 199, 0.25);
        --zen-accent-soft: rgba(2, 132, 199, 0.08);
        --zen-accent-border: rgba(2, 132, 199, 0.28);
      }

      .libertad-zen-card {
        background: var(--zen-bg);
        border: 1px solid var(--zen-border);
        border-radius: calc(8px * var(--zen-scale));
        padding: calc(28px * var(--zen-scale)) calc(36px * var(--zen-scale)) calc(30px * var(--zen-scale));
        max-width: calc(440px * var(--zen-scale));
        width: 100%;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        box-shadow: var(--zen-shadow);
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        position: relative;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .libertad-zen-brand {
        display: flex;
        align-items: center;
        gap: calc(10px * var(--zen-scale));
        margin-bottom: calc(18px * var(--zen-scale));
      }
      .libertad-zen-brand-title {
        font-family: ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, monospace;
        font-size: calc(11px * var(--zen-scale));
        font-weight: 700;
        letter-spacing: 1.5px;
        color: var(--zen-text-primary);
      }
      .libertad-zen-status {
        display: inline-flex;
        align-items: center;
        gap: calc(5px * var(--zen-scale));
        padding: calc(2px * var(--zen-scale)) calc(8px * var(--zen-scale));
        border-radius: calc(12px * var(--zen-scale));
        background: var(--zen-accent-soft);
        border: 1px solid var(--zen-accent-border);
        font-family: ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, monospace;
        font-size: calc(9.5px * var(--zen-scale));
        font-weight: 700;
        letter-spacing: 0.8px;
        color: var(--zen-accent);
      }
      .libertad-zen-dot {
        width: calc(4.5px * var(--zen-scale));
        height: calc(4.5px * var(--zen-scale));
        border-radius: 50%;
        background: var(--zen-accent);
        box-shadow: 0 0 calc(4px * var(--zen-scale)) var(--zen-accent-glow);
      }
      .libertad-zen-icon-wrapper {
        color: var(--zen-accent);
        margin-bottom: calc(15px * var(--zen-scale));
        display: flex;
        align-items: center;
        justify-content: center;
        width: calc(44px * var(--zen-scale));
        height: calc(44px * var(--zen-scale));
        background: var(--zen-accent-soft);
        border: 1px solid var(--zen-accent-border);
        border-radius: calc(6px * var(--zen-scale));
        box-shadow: 0 0 calc(16px * var(--zen-scale)) var(--zen-accent-glow);
      }
      .libertad-zen-svg {
        display: block;
        width: calc(24px * var(--zen-scale));
        height: calc(24px * var(--zen-scale));
      }
      .libertad-zen-title {
        font-size: calc(17px * var(--zen-scale));
        font-weight: 600;
        letter-spacing: -0.2px;
        margin: 0 0 calc(8px * var(--zen-scale)) 0;
        color: var(--zen-text-primary);
      }
      .libertad-zen-desc {
        font-size: calc(13px * var(--zen-scale));
        line-height: 1.5;
        color: var(--zen-text-secondary);
        margin: 0;
        max-width: calc(380px * var(--zen-scale));
      }
      .libertad-sponsor-toast {
        --toast-scale: 1;
        position: absolute;
        bottom: calc(64px * var(--toast-scale));
        right: calc(24px * var(--toast-scale));
        background: rgba(13, 17, 23, 0.92);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #f0f3f6;
        font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
        font-size: calc(10.5px * var(--toast-scale));
        line-height: 1.2;
        font-weight: 600;
        letter-spacing: 0.4px;
        padding: calc(6px * var(--toast-scale)) calc(10px * var(--toast-scale));
        border-radius: calc(6px * var(--toast-scale));
        z-index: 9999;
        pointer-events: auto;
        box-shadow: 0 calc(6px * var(--toast-scale)) calc(20px * var(--toast-scale)) rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        gap: calc(8px * var(--toast-scale));
        user-select: none;
        animation: libertadToastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .libertad-sponsor-toast[data-scale="100"] {
        --toast-scale: 1;
      }
      .libertad-sponsor-toast[data-scale="120"] {
        --toast-scale: 1.2;
      }
      .libertad-sponsor-toast[data-scale="140"] {
        --toast-scale: 1.4;
      }
      .libertad-sponsor-toast[data-theme="light"] {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(15, 23, 42, 0.15);
        color: #0f172a;
        box-shadow: 0 calc(6px * var(--toast-scale)) calc(20px * var(--toast-scale)) rgba(0, 0, 0, 0.12);
      }
      .libertad-sponsor-toast[data-theme="oled"] {
        background: #000000;
        border: 1px solid rgba(56, 189, 248, 0.4);
        color: #ffffff;
        box-shadow: 0 calc(6px * var(--toast-scale)) calc(20px * var(--toast-scale)) rgba(0, 0, 0, 0.65);
      }
      .libertad-sponsor-toast-dot {
        width: calc(6.5px * var(--toast-scale));
        height: calc(6.5px * var(--toast-scale));
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 0 calc(5px * var(--toast-scale)) currentColor;
      }
      .libertad-sponsor-toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
        flex-shrink: 0;
      }
      .libertad-sponsor-toast[data-theme="light"] .libertad-sponsor-toast-icon {
        color: #0284c7;
      }
      .libertad-sponsor-toast-icon svg {
        width: calc(12px * var(--toast-scale));
        height: calc(12px * var(--toast-scale));
      }
      .libertad-sponsor-toast-label {
        font-weight: 700;
        text-transform: uppercase;
      }
      .libertad-sponsor-toast-duration {
        font-size: calc(9.5px * var(--toast-scale));
        font-weight: 500;
        opacity: 0.65;
        font-family: inherit;
      }
      .libertad-sponsor-toast-unskip {
        background: rgba(56, 189, 248, 0.14);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38bdf8;
        border-radius: calc(4px * var(--toast-scale));
        padding: calc(3px * var(--toast-scale)) calc(7px * var(--toast-scale));
        font-family: inherit;
        font-size: calc(9.5px * var(--toast-scale));
        line-height: 1;
        font-weight: 700;
        letter-spacing: 0.5px;
        cursor: pointer;
        outline: none;
        display: flex;
        align-items: center;
        gap: calc(4px * var(--toast-scale));
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
      }
      .libertad-sponsor-toast-unskip svg {
        width: calc(10px * var(--toast-scale));
        height: calc(10px * var(--toast-scale));
      }
      .libertad-sponsor-toast-unskip:hover {
        background: #38bdf8;
        color: #0b0f17;
        border-color: #38bdf8;
        transform: translateY(-0.5px);
      }
      .libertad-sponsor-toast[data-theme="light"] .libertad-sponsor-toast-unskip {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.3);
        color: #0284c7;
      }
      .libertad-sponsor-toast[data-theme="light"] .libertad-sponsor-toast-unskip:hover {
        background: #0284c7;
        color: #ffffff;
        border-color: #0284c7;
      }
      @keyframes libertadToastIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .libertad-sponsor-bar-container {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 4px !important;
        pointer-events: none !important;
        z-index: 55 !important;
        overflow: visible !important;
      }
      .libertad-sponsor-bar-segment {
        position: absolute !important;
        top: 0 !important;
        bottom: 0 !important;
        height: 100% !important;
        min-height: 4px !important;
        min-width: 2px !important;
        border-radius: 1px !important;
        pointer-events: none !important;
        opacity: 0.95 !important;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.6) !important;
        z-index: 56 !important;
      }
    `);

    return rules.join('\n');
  }

  // Inject or update the active stylesheet (avoids re-parsing if CSS is unchanged)
  function applyStyles(settings) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    const newCss = buildStylesheet(settings);
    if (styleEl.textContent !== newCss) {
      styleEl.textContent = newCss;
    }
    updateZenBanner(settings);
  }

  // Show a calm, intentional screen on YouTube home if home feed is disabled
  function updateZenBanner(settings) {
    function applyZenAttributes(el, theme, scale, lang) {
      if (!el) return;
      el.dataset.theme = theme;
      el.dataset.scale = scale;
      el.dataset.lang = lang;
    }

    const isHomePage =
      window.location.pathname === '/' || window.location.pathname === '';
    const existing = document.getElementById(ZEN_CONTAINER_ID);

    // If home is redirected to subscriptions, zen banner is not needed
    if (settings.redirectHomeToSubscriptions && isHomePage) {
      if (existing) existing.remove();
      return;
    }

    if (settings.hideHomeFeed && isHomePage) {
      // 1. Resolve Language
      const isSpanish =
        settings.lang === 'es' ||
        ((!settings.lang || settings.lang === 'auto') &&
          typeof navigator !== 'undefined' &&
          (globalThis.Libertad.isSpanishLocale
            ? globalThis.Libertad.isSpanishLocale(navigator.language)
            : navigator.language?.toLowerCase().startsWith('es')));
      const isPortuguese =
        settings.lang === 'pt' ||
        ((!settings.lang || settings.lang === 'auto') &&
          typeof navigator !== 'undefined' &&
          (globalThis.Libertad.isPortugueseLocale
            ? globalThis.Libertad.isPortugueseLocale(navigator.language)
            : navigator.language?.toLowerCase().startsWith('pt')));
      const langKey = isSpanish ? 'es' : isPortuguese ? 'pt' : 'en';

      // 2. Resolve Theme
      let resolvedTheme = settings.theme || 'auto';
      if (resolvedTheme === 'auto') {
        const isDark =
          document.documentElement.hasAttribute('dark') ||
          document.body?.hasAttribute('dark') ||
          Boolean(document.querySelector('ytd-app[dark]')) ||
          Boolean(document.querySelector('html[dark]')) ||
          (typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
        resolvedTheme = isDark ? 'dark' : 'light';
      }

      // 3. Resolve Scale
      let resolvedScale = settings.scale || 'auto';
      if (resolvedScale === 'auto') {
        const screenW =
          typeof window !== 'undefined' && window.screen
            ? window.screen.width || 1920
            : 1920;
        const dpr =
          typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const effectiveW = screenW * dpr;
        if (screenW >= 3440 || (effectiveW >= 3840 && dpr < 1.5)) {
          resolvedScale = '140';
        } else if (screenW >= 2400 || (effectiveW >= 2560 && dpr <= 1.25)) {
          resolvedScale = '120';
        } else {
          resolvedScale = '100';
        }
      }

      const statusText = isSpanish
        ? 'ENFOQUE ACTIVO'
        : isPortuguese
          ? 'FOCO ATIVO'
          : 'FOCUS ACTIVE';
      const titleText = isSpanish
        ? 'Modo Intencional Activo'
        : isPortuguese
          ? 'Modo Intencional Ativo'
          : 'Intentional Mode Active';
      const descText = isSpanish
        ? 'Recomendaciones de feed suprimidas. Realiza una búsqueda arriba para encontrar contenido específico.'
        : isPortuguese
          ? 'Recomendações de feed suprimidas. Faça uma pesquisa acima para encontrar conteúdo específico.'
          : 'Feed recommendations suppressed. Use the search bar above to find specific content.';

      const cardHtml = `
        <div class="libertad-zen-card">
          <div class="libertad-zen-brand">
            <span class="libertad-zen-brand-title">LIBERTAD</span>
            <div class="libertad-zen-status">
              <span class="libertad-zen-dot"></span>
              <span>${statusText}</span>
            </div>
          </div>
          <div class="libertad-zen-icon-wrapper">
            <svg class="libertad-zen-svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
              <circle cx="12" cy="12" r="2.5"/>
            </svg>
          </div>
          <div class="libertad-zen-title">${titleText}</div>
          <p class="libertad-zen-desc">${descText}</p>
        </div>
      `;

      const targetContainer =
        document.querySelector(
          'ytd-browse[page-subtype="home"]:not([hidden]) #primary',
        ) ||
        document.querySelector(
          'ytd-browse[page-subtype="home"]:not([hidden])',
        ) ||
        document.querySelector('ytd-browse:not([hidden]) #primary') ||
        document.querySelector('ytd-browse[page-subtype="home"] #primary') ||
        document.querySelector('ytd-browse #primary') ||
        document.querySelector('ytd-browse[page-subtype="home"]') ||
        document.querySelector('ytd-browse');

      if (!targetContainer) {
        return;
      }

      if (existing) {
        const langChanged = existing.dataset.lang !== langKey;
        applyZenAttributes(existing, resolvedTheme, resolvedScale, langKey);
        if (langChanged || !existing.firstElementChild) {
          existing.innerHTML = cardHtml;
        }
        if (existing.parentElement !== targetContainer) {
          targetContainer.prepend(existing);
        }
      } else {
        const zen = document.createElement('div');
        zen.id = ZEN_CONTAINER_ID;
        applyZenAttributes(zen, resolvedTheme, resolvedScale, langKey);
        zen.innerHTML = cardHtml;
        targetContainer.prepend(zen);
      }
    } else {
      if (existing) {
        existing.remove();
      }
    }
  }

  globalThis.Libertad.buildStylesheet = buildStylesheet;
  globalThis.Libertad.applyStyles = applyStyles;
  globalThis.Libertad.updateZenBanner = updateZenBanner;
})();
