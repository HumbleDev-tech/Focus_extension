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
        ytd-browse[page-subtype="home"] #contents,
        ytd-browse[page-subtype="home"] #chips-wrapper,
        ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
          display: none !important;
        }
      `);
    }

    // Related / Sidebar
    if (settings.hideSidebar) {
      rules.push(`
        #secondary.ytd-watch-flexy,
        #related.ytd-watch-flexy,
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
        ytd-comments {
          display: none !important;
        }
      `);
    }

    // Shorts (Shelves, sidebars, header/navigation links, and shorts player)
    if (settings.hideShorts) {
      rules.push(`
        ytd-reel-shelf-renderer,
        ytd-rich-shelf-renderer[is-shorts],
        ytd-rich-section-renderer:has(ytd-reel-shelf-renderer),
        ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
        ytd-guide-entry-renderer:has(a[title="Shorts"]),
        ytd-guide-entry-renderer:has(a[href^="/shorts"]),
        ytd-mini-guide-entry-renderer[aria-label="Shorts"],
        a[title="Shorts"],
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
        ytd-watch-metadata yt-button-view-model:has(yt-icon[icon*="playlist-add"]),
        ytd-watch-metadata yt-button-shape:has(yt-icon[icon*="playlist-add"]),
        #actions yt-button-view-model:has(yt-icon[icon*="playlist-add"]),
        #actions yt-button-shape:has(yt-icon[icon*="playlist-add"]),
        watch-metadata-view-model :has(yt-icon[icon*="playlist-add"]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="save" i]),
        ytd-watch-metadata yt-button-view-model:has([aria-label*="guardar" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="save" i]),
        ytd-watch-metadata yt-button-shape:has([aria-label*="guardar" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="save" i]),
        ytd-watch-metadata ytd-button-renderer:has([aria-label*="guardar" i]),
        #actions yt-button-view-model:has([aria-label*="save" i]),
        #actions yt-button-view-model:has([aria-label*="guardar" i]),
        #actions ytd-button-renderer:has(yt-icon[icon*="playlist-add"]),
        ytd-watch-metadata ytd-button-renderer:has(yt-icon[icon*="playlist-add"]) {
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
        ytd-subscribe-button-renderer {
          display: none !important;
        }
      `);
    }

    // Video Views Count & Upload Date
    if (settings.hideViewsDate) {
      rules.push(`
        #info-container.ytd-watch-info-text,
        ytd-watch-info-text #info-container,
        #view-count.ytd-video-view-count-renderer {
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 52vh;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: var(--yt-spec-text-primary, #f1f1f1);
        padding: 40px 20px;
        animation: libertadFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes libertadFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .libertad-zen-card {
        background: var(--yt-spec-brand-background-primary, #0e1219);
        border: 1px solid var(--yt-spec-10-percent-layer, rgba(255, 255, 255, 0.1));
        border-radius: 6px;
        padding: 32px 36px;
        max-width: 440px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .libertad-zen-badge {
        font-family: ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 1.2px;
        color: var(--yt-spec-call-to-action, #065fd4);
        background: rgba(6, 95, 212, 0.08);
        border: 1px solid rgba(6, 95, 212, 0.28);
        border-radius: 3px;
        padding: 2px 8px;
        margin-bottom: 16px;
        text-transform: uppercase;
      }
      html[dark] .libertad-zen-badge {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.08);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .libertad-zen-icon-wrapper {
        color: var(--yt-spec-call-to-action, #065fd4);
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: rgba(6, 95, 212, 0.06);
        border: 1px solid rgba(6, 95, 212, 0.2);
        border-radius: 4px;
        box-shadow: 0 0 16px rgba(6, 95, 212, 0.12);
      }
      html[dark] .libertad-zen-icon-wrapper {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.06);
        border: 1px solid rgba(56, 189, 248, 0.2);
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.12);
      }
      .libertad-zen-svg {
        display: block;
      }
      .libertad-zen-title {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.2px;
        margin: 0 0 8px 0;
        color: var(--yt-spec-text-primary, #ffffff);
      }
      .libertad-zen-desc {
        font-size: 13px;
        line-height: 1.5;
        color: var(--yt-spec-text-secondary, #8b949e);
        margin: 0;
      }
      .libertad-sponsor-toast {
        position: absolute;
        bottom: 64px;
        right: 24px;
        background: rgba(13, 17, 23, 0.94);
        border: 1px solid #38bdf8;
        color: #38bdf8;
        font-family: var(--font-mono, ui-monospace, monospace);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.6px;
        padding: 6px 12px;
        border-radius: 4px;
        z-index: 9999;
        pointer-events: auto;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.65);
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .libertad-sponsor-toast-unskip {
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid #38bdf8;
        color: #38bdf8;
        border-radius: 3px;
        padding: 2px 7px;
        font-family: inherit;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        cursor: pointer;
        outline: none;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .libertad-sponsor-toast-unskip:hover {
        background: #38bdf8;
        color: #0d1117;
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

  // Inject or update the active stylesheet
  function applyStyles(settings) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildStylesheet(settings);
    updateZenBanner(settings);
  }

  // Show a calm, intentional screen on YouTube home if home feed is disabled
  function updateZenBanner(settings) {
    const isHomePage =
      window.location.pathname === '/' || window.location.pathname === '';
    const existing = document.getElementById(ZEN_CONTAINER_ID);

    // If home is redirected to subscriptions, zen banner is not needed
    if (settings.redirectHomeToSubscriptions && isHomePage) {
      if (existing) existing.remove();
      return;
    }

    if (settings.hideHomeFeed && isHomePage) {
      const isSpanish =
        settings.lang === 'es' ||
        (!settings.lang &&
          typeof navigator !== 'undefined' &&
          navigator.language?.startsWith('es'));
      const badgeText = isSpanish
        ? 'SISTEMA // ENFOQUE_ACTIVO'
        : 'SYSTEM // FOCUS_ENGAGED';
      const titleText = isSpanish
        ? 'Modo Intencional Activo'
        : 'Intentional Mode Active';
      const descText = isSpanish
        ? 'Recomendaciones de feed suprimidas. Realiza una búsqueda arriba para encontrar contenido específico.'
        : 'Feed recommendations suppressed. Execute a search query above to locate specific content.';

      const cardHtml = `
        <div class="libertad-zen-card">
          <div class="libertad-zen-badge">${badgeText}</div>
          <div class="libertad-zen-icon-wrapper">
            <svg class="libertad-zen-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
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

      if (existing) {
        const langKey = isSpanish ? 'es' : 'en';
        if (existing.dataset.lang !== langKey) {
          existing.dataset.lang = langKey;
          existing.innerHTML = cardHtml;
        }
      } else {
        const targetContainer =
          document.querySelector('ytd-browse[page-subtype="home"] #primary') ||
          document.querySelector('ytd-browse[page-subtype="home"]') ||
          document.querySelector('ytd-page-manager');
        if (targetContainer) {
          const zen = document.createElement('div');
          zen.id = ZEN_CONTAINER_ID;
          zen.dataset.lang = isSpanish ? 'es' : 'en';
          zen.innerHTML = cardHtml;
          targetContainer.prepend(zen);
        }
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
