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

    // Base utility rules for zero-overhead, declarative DOM hiding
    rules.push(`
      .libertad-force-hide {
        display: none !important;
      }
    `);

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
        #page-manager > ytd-browse[hidden] {
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

        ytd-watch-flexy:not([theater]):not([fullscreen]) {
          --ytd-watch-flexy-sidebar-width: 0px !important;
          --ytd-watch-flexy-sidebar-min-width: 0px !important;
          --ytd-watch-flexy-fixed-side-menu-width: 0px !important;
          --ytd-watch-flexy-side-menu-margin: 0px !important;
          --ytd-watch-flexy-space-between-player-and-sidebar: 0px !important;
        }

        ytd-watch-flexy:not([theater]):not([fullscreen]) #columns.ytd-watch-flexy {
          width: 100% !important;
          max-width: 1100px !important;
          margin: 0 auto !important;
          justify-content: center !important;
        }

        ytd-watch-flexy:not([theater]):not([fullscreen]) #primary.ytd-watch-flexy {
          max-width: 1100px !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding-right: 0 !important;
        }

        ytd-watch-flexy:not([theater]):not([fullscreen]) #player-container-outer.ytd-watch-flexy,
        ytd-watch-flexy:not([theater]):not([fullscreen]) #player-container.ytd-watch-flexy {
          max-width: 100% !important;
          min-width: 0 !important;
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

        /* Modern Shorts Lockup & Feeds/Search/Channel Grid Cards (Consolidated single-pass :has matching) */
        ytm-shorts-lockup-view-model,
        ytm-shorts-lockup-view-model-v2,
        ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2),
        ytd-rich-item-renderer:has(a[href*="/shorts/"]:is(#thumbnail, #video-title-link)),
        ytd-video-renderer:has(a[href*="/shorts/"]:is(#thumbnail, #video-title-link, #video-title)),
        ytd-grid-video-renderer:has(a[href*="/shorts/"]:is(#thumbnail, #video-title)),
        ytd-compact-video-renderer:has(a#thumbnail[href*="/shorts/"]),
        yt-lockup-view-model:has(a[href*="/shorts/"]),
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
        ytd-masthead ytd-button-renderer:has([aria-label*="criar" i]),
        ytd-masthead yt-button-view-model:has([aria-label*="criar" i]),
        ytd-masthead yt-button-shape:has([aria-label*="criar" i]),
        ytd-masthead ytd-topbar-menu-button-renderer:has([aria-label*="create" i]),
        ytd-masthead ytd-topbar-menu-button-renderer:has([aria-label*="crear" i]),
        ytd-masthead ytd-topbar-menu-button-renderer:has([aria-label*="criar" i]) {
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

    // Google Account Avatar / Profile Picture in Masthead
    if (settings.hideAccountAvatar) {
      rules.push(`
        ytd-masthead #avatar-btn,
        ytd-masthead button#avatar-btn,
        ytd-masthead ytd-topbar-menu-button-renderer:has(#avatar-btn),
        ytd-masthead ytd-topbar-menu-button-renderer:has(yt-img-shadow#avatar),
        ytd-masthead ytd-topbar-menu-button-renderer:has(yt-avatar-shape),
        ytd-masthead yt-img-shadow#avatar,
        ytd-masthead yt-avatar-shape,
        ytd-masthead #end #buttons > :last-child:has(yt-img-shadow#avatar) {
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
        [component-id*="conversational_ai"],
        [target-id*="conversational"],
        #conversational-ai,
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-button-view-model, yt-button-shape, ytd-button-renderer):has(
          :is(
            yt-icon[icon*="sparkle"],
            [aria-label*="ask" i],
            [aria-label*="pregunt" i],
            [aria-label*="pergunt" i],
            [aria-label*="demander" i],
            [aria-label*="fragen" i],
            [aria-label*="chiedi" i]
          )
        ) {
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
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-button-view-model, yt-button-shape, ytd-button-renderer):has(
          :is(
            yt-icon[icon*="download"],
            a[href*="premium"],
            [aria-label*="download" i],
            [aria-label*="descarg" i],
            [aria-label*="baixar" i],
            [aria-label*="télécharger" i],
            [aria-label*="herunterladen" i],
            [aria-label*="scarica" i]
          )
        ),
        :is(ytd-menu-service-item-renderer, ytd-menu-navigation-item-renderer, tp-yt-paper-item, yt-list-item-view-model):has(
          :is(
            yt-icon[icon*="download"],
            a[href*="premium"],
            [aria-label*="download" i],
            [aria-label*="descarg" i],
            [aria-label*="baixar" i],
            [aria-label*="télécharger" i],
            [aria-label*="herunterladen" i],
            [aria-label*="scarica" i]
          )
        ) {
          display: none !important;
        }
      `);
    }

    // Thanks, Clips, and Remix Buttons (Scoped strictly to watch metadata)
    if (settings.hideThanksClips) {
      rules.push(`
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-button-view-model, yt-button-shape, ytd-button-renderer, button):has(
          :is(
            yt-icon[icon*="super-thanks"],
            yt-icon[icon*="clip"],
            yt-icon[icon*="remix"],
            [aria-label*="thank" i],
            [aria-label*="gracia" i],
            [aria-label*="valeu" i],
            [aria-label*="merci" i],
            [aria-label*="dank" i],
            [aria-label*="grazie" i],
            [aria-label*="clip" i],
            [aria-label*="remix" i]
          )
        ) {
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
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-button-view-model, yt-button-shape, ytd-button-renderer):has(
          :is(
            yt-icon[icon*="share"],
            [aria-label*="share" i],
            [aria-label*="compart" i],
            [aria-label*="partager" i],
            [aria-label*="teilen" i],
            [aria-label*="condividi" i]
          )
        ) {
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
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-button-view-model, yt-button-shape, ytd-button-renderer):has(
          :is(
            yt-icon[icon*="sponsor"],
            [aria-label*="unirse" i],
            [aria-label*="join" i],
            [aria-label*="membro" i],
            [aria-label*="rejoindre" i],
            [aria-label*="mitglied" i]
          )
        ),
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
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-button-view-model, yt-button-shape, ytd-button-renderer, button):has(
          :is(
            yt-icon[icon*="playlist-add"],
            yt-icon[icon*="bookmark"],
            [aria-label*="save" i],
            [aria-label*="guardar" i],
            [aria-label*="salvar" i],
            [aria-label*="playlist" i],
            [aria-label*="enregistrer" i],
            [aria-label*="speichern" i],
            [aria-label*="salva" i],
            [title*="save" i],
            [title*="guardar" i],
            [title*="salvar" i],
            [title*="playlist" i]
          )
        ),

        /* Overflow Menu when items don't fit horizontally */
        :is(ytd-menu-service-item-renderer, ytd-menu-navigation-item-renderer, ytd-menu-popup-renderer yt-list-item-view-model, ytd-menu-popup-renderer tp-yt-paper-item):has(
          :is(
            yt-icon[icon*="playlist-add"],
            yt-icon[icon*="bookmark"],
            [aria-label*="save" i],
            [aria-label*="guardar" i],
            [aria-label*="salvar" i],
            [aria-label*="playlist" i],
            [aria-label*="enregistrer" i],
            [aria-label*="speichern" i],
            [title*="save" i],
            [title*="guardar" i],
            [title*="salvar" i],
            [title*="playlist" i]
          )
        ) {
          display: none !important;
        }
      `);
    }

    // Like & Dislike Social Block
    if (settings.hideLikeDislike) {
      rules.push(`
        segmented-like-dislike-button-view-model,
        ytd-segmented-like-dislike-button-renderer,
        #top-level-buttons-computed > segmented-like-dislike-button-view-model,
        #top-level-buttons-computed > ytd-segmented-like-dislike-button-renderer,
        #segmented-like-button,
        #segmented-dislike-button,
        like-button-view-model,
        dislike-button-view-model,
        #like-button,
        #dislike-button,
        ytd-like-button-renderer,
        ytd-toggle-button-renderer:has(#like-button),
        ytd-toggle-button-renderer:has(#dislike-button),
        reel-action-bar-view-model #like-button,
        reel-action-bar-view-model #dislike-button,
        reel-action-bar-view-model like-button-view-model,
        reel-action-bar-view-model dislike-button-view-model,
        ytd-reel-player-overlay-renderer #like-button,
        ytd-reel-player-overlay-renderer #dislike-button,
        ytd-reel-player-overlay-renderer like-button-view-model,
        ytd-reel-player-overlay-renderer dislike-button-view-model,
        ytm-like-button-renderer,
        ytm-segmented-like-dislike-button-renderer {
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
        #description-inner #info-container,
        #description-inline-expander #info-container,
        ytd-text-inline-expander #info-container {
          display: none !important;
        }
      `);
    }

    // 3-Dots Overflow Menu & Report Actions (Action Bar More actions button + Report option)
    if (settings.hideMoreActions) {
      rules.push(`
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) ytd-menu-renderer > yt-icon-button.dropdown-trigger,
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) ytd-menu-renderer > yt-button-shape,
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) ytd-menu-renderer #top-level-buttons-computed ~ :is(yt-button-shape, yt-icon-button, ytd-button-renderer),
        :is(ytd-watch-metadata, watch-metadata-view-model, #actions) :is(yt-icon-button, button, yt-button-shape):has(
          :is(
            [aria-label*="más acciones" i],
            [aria-label*="more actions" i],
            [aria-label*="otras acciones" i],
            [aria-label*="mais ac" i],
            [aria-label*="plus d'actions" i],
            [aria-label*="weitere aktionen" i]
          )
        ),
        :is(ytd-menu-service-item-renderer, ytd-menu-popup-renderer tp-yt-paper-item, ytd-menu-popup-renderer yt-list-item-view-model):has(
          :is(
            yt-icon[icon*="report"],
            yt-icon[icon*="flag"],
            [aria-label*="report" i],
            [aria-label*="denunciar" i],
            [aria-label*="notificar" i],
            [aria-label*="signaler" i],
            [aria-label*="melden" i]
          )
        ) {
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

    // Play on TV (Remote Control / Cast Button and Overlays)
    if (settings.hidePlayOnTv) {
      rules.push(`
        .ytp-remote-button,
        button[data-tooltip-target-id="ytp-remote-button"],
        .ytp-button.ytp-remote-button,
        ytd-remote-control-panel-renderer,
        .ytp-remote-dialog,
        .ytp-remote-control-overlay,
        yt-remote-control-panel-renderer {
          display: none !important;
        }
      `);
    }

    // Subtitles / Closed Captions (CC) Button & Overlays
    if (settings.hideSubtitles) {
      rules.push(`
        .ytp-subtitles-button,
        button[data-tooltip-target-id="ytp-subtitles-button"],
        .ytp-subtitles-button-icon,
        #ytp-caption-window-container,
        .caption-window,
        .ytp-caption-window-bottom,
        .ytp-caption-window-rollup {
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

    // Left Drawer Explore Section
    if (settings.hideExplore) {
      rules.push(`
        /* Full Explore Section in Navigation Drawer (Language-Independent & Tagged) */
        ytd-guide-section-renderer[data-libertad-explore="true"],
        ytd-guide-section-renderer:has(#guide-section-title [href*="/feed/explore"]),
        ytd-guide-section-renderer:has(#guide-section-title [href*="/feed/trending"]),

        /* Individual Explore Entries in Guide */
        ytd-guide-entry-renderer:has(a[href*="/feed/explore"]),
        ytd-guide-entry-renderer:has(a[href*="/feed/trending"]),
        ytd-guide-entry-renderer:has(a[href*="/gaming"]),
        ytd-guide-entry-renderer:has(a[href*="/podcasts"]),
        ytd-guide-entry-renderer:has(a[href*="/feed/podcasts"]),
        ytd-guide-entry-renderer:has(a[href*="/feed/storefront"]),
        ytd-guide-entry-renderer:has(a[href*="/feed/courses_destination"]),
        ytd-guide-entry-renderer:has(a[href*="/channel/UCEgdi0XIXXZ-qJOFPf4JSKw"]),
        ytd-guide-entry-renderer:has(a[href*="/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ"]),
        ytd-guide-entry-renderer:has(a[href*="/channel/UCYfdidRxbB8Qhf0Nx7ioOYw"]),
        ytd-guide-entry-renderer:has(a[href*="/channel/UC1x8rV_f-2yPpzlN0JWZXIQ"]),
        ytd-guide-entry-renderer:has(a[href*="/channel/UC4R8F_QCY98548AqZ6dNXGQ"]),
        ytd-guide-entry-renderer:has(a[href*="/channel/UCOpNcN46UbXVtpKMrmU4Abg"]),

        /* Mini Guide Explore Entries */
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/explore"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/trending"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/gaming"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/podcasts"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/podcasts"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/storefront"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/courses_destination"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/channel/UCEgdi0XIXXZ-qJOFPf4JSKw"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/channel/UCYfdidRxbB8Qhf0Nx7ioOYw"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/channel/UC1x8rV_f-2yPpzlN0JWZXIQ"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/channel/UC4R8F_QCY98548AqZ6dNXGQ"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/channel/UCOpNcN46UbXVtpKMrmU4Abg"]),
        ytd-mini-guide-entry-renderer[aria-label*="Explor" i],

        /* Feed Filter Chip Bar & Mobile Explore Items */
        ytd-feed-filter-chip-bar-renderer yt-chip-cloud-chip-renderer:has(a[href*="/feed/explore"]),
        ytd-feed-filter-chip-bar-renderer yt-chip-cloud-chip-renderer:has(a[href*="/feed/trending"]),
        ytd-feed-filter-chip-bar-renderer [aria-label*="Explore" i],
        ytd-feed-filter-chip-bar-renderer [aria-label*="Explorar" i],
        yt-chip-cloud-chip-renderer:has([title*="Explore" i]),
        yt-chip-cloud-chip-renderer:has([title*="Explorar" i]),
        ytm-pivot-bar-item-renderer:has(a[href*="/feed/explore"]),
        ytm-pivot-bar-item-renderer:has(a[href*="/feed/trending"]) {
          display: none !important;
        }
      `);
    }

    // Left Drawer Trending Links
    if (settings.hideTrending) {
      rules.push(`
        ytd-guide-entry-renderer:has(a[href*="/feed/trending"]),
        ytd-mini-guide-entry-renderer:has(a[href*="/feed/trending"]),
        ytd-guide-entry-renderer:has(a[title*="Trending" i]),
        ytd-guide-entry-renderer:has(a[title*="Tendencias" i]),
        ytd-guide-entry-renderer:has(a[title*="Em alta" i]) {
          display: none !important;
        }
      `);
    }

    // Left Drawer "More from YouTube" Links
    if (settings.hideMoreFromYoutube) {
      rules.push(`
        ytd-guide-section-renderer:has(a[href*="premium"]):not(:has(a[href*="/feed/subscriptions"])),
        ytd-guide-section-renderer:has(a[href*="studio.youtube.com"]):not(:has(a[href*="/feed/subscriptions"])) {
          display: none !important;
        }
      `);
    }

    // Live Chat & Chat Replay (Full Stream & Replay Suppression)
    if (settings.hideLiveChat) {
      rules.push(`
        [data-libertad-hidden-chat="true"],
        #chat,
        #chat.ytd-watch-flexy,
        #chat-container,
        #chat-container.ytd-watch-flexy,
        ytd-watch-flexy #chat,
        ytd-watch-flexy #chat-container,
        ytd-watch-flexy[flexy-chat-collapsed_] #chat,
        ytd-watch-flexy[chat-collapsed] #chat,
        ytd-watch-flexy[flexy-chat-collapsed_] #chat-container,
        ytd-watch-flexy[chat-collapsed] #chat-container,
        ytd-live-chat-frame,
        ytd-live-chat-frame[collapsed],
        iframe#chatframe,
        iframe[src*="live_chat"],
        ytd-live-chat-renderer,
        yt-live-chat-renderer,
        ytd-engagement-panel-section-list-renderer[target-id*="chat"],
        ytd-engagement-panel-section-list-renderer[target-id="chat-container"],
        ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat"],
        ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat-replay"],
        ytd-engagement-panel-section-list-renderer[target-id*="live-chat"],
        ytd-engagement-panel-section-list-renderer[target-id*="chat-replay"],
        ytd-engagement-panel-section-list-renderer:has(iframe[src*="live_chat"]),
        ytd-engagement-panel-section-list-renderer:has(ytd-live-chat-frame),
        ytd-engagement-panel-section-list-renderer:has(#chat),
        ytd-engagement-panel-section-list-renderer:has(#show-hide-button),
        #panels:has(ytd-live-chat-frame),
        #panels:has([target-id*="chat"]),
        #panels:has([target-id*="live-chat"]),
        #panels:has([target-id*="chat-replay"]),
        #panels:has(iframe[src*="live_chat"]),
        #panels:has(#chat),
        #panels-full-bleed-container:has(#chat),
        #panels-full-bleed-container:has(ytd-live-chat-frame),
        #show-hide-button,
        ytd-live-chat-frame #show-hide-button,
        ytd-button-renderer#show-hide-button,
        ytd-toggle-button-renderer#show-hide-button,
        ytd-item-section-renderer:has(#show-hide-button),
        ytd-item-section-renderer:has(ytd-live-chat-frame),
        ytd-item-section-renderer:has(#chat),
        ytd-item-section-renderer:has([target-id*="chat"]),
        .ytp-live-chat-button,
        [target-id="chat-container"],
        [target-id="engagement-panel-live-chat-replay"],
        [target-id="engagement-panel-live-chat"],
        [target-id*="chat-replay"],
        [target-id*="live-chat"],
        ytd-button-renderer[target-id*="chat"],
        ytd-button-renderer[target-id*="live-chat"],
        ytd-button-renderer[target-id*="chat-replay"],
        ytd-button-renderer:has([target-id*="chat"]),
        ytd-button-renderer:has([target-id*="live-chat"]),
        ytd-button-renderer:has([target-id*="chat-replay"]),
        yt-button-shape:has([target-id*="chat"]),
        yt-button-shape:has([target-id*="live-chat"]),
        yt-button-shape:has([target-id*="chat-replay"]),
        yt-button-view-model:has([target-id*="chat"]),
        yt-button-view-model:has([target-id*="live-chat"]),
        yt-button-view-model:has([target-id*="chat-replay"]),
        button[aria-label*="live chat" i],
        button[aria-label*="chat replay" i],
        button[aria-label*="repetición del chat" i],
        button[aria-label*="repetición de chat" i],
        button[aria-label*="reprise do chat" i],
        button[aria-label*="chat en vivo" i],
        button[aria-label*="chat ao vivo" i],
        ytd-button-renderer:has(button[aria-label*="live chat" i]),
        ytd-button-renderer:has(button[aria-label*="chat replay" i]),
        ytd-button-renderer:has(button[aria-label*="repetición del chat" i]),
        ytd-button-renderer:has(button[aria-label*="repetición de chat" i]),
        ytd-button-renderer:has(button[aria-label*="reprise do chat" i]),
        ytd-button-renderer:has(button[aria-label*="chat en vivo" i]),
        ytd-button-renderer:has(button[aria-label*="chat ao vivo" i]),
        yt-button-shape:has(button[aria-label*="live chat" i]),
        yt-button-shape:has(button[aria-label*="chat replay" i]),
        yt-button-shape:has(button[aria-label*="repetición del chat" i]),
        yt-button-shape:has(button[aria-label*="repetición de chat" i]),
        yt-button-shape:has(button[aria-label*="reprise do chat" i]),
        yt-button-shape:has(button[aria-label*="chat en vivo" i]),
        yt-button-shape:has(button[aria-label*="chat ao vivo" i]),
        yt-button-view-model:has(button[aria-label*="live chat" i]),
        yt-button-view-model:has(button[aria-label*="chat replay" i]),
        yt-button-view-model:has(button[aria-label*="repetición del chat" i]),
        yt-button-view-model:has(button[aria-label*="repetición de chat" i]),
        yt-button-view-model:has(button[aria-label*="reprise do chat" i]),
        yt-button-view-model:has(button[aria-label*="chat en vivo" i]),
        yt-button-view-model:has(button[aria-label*="chat ao vivo" i]),
        yt-chip-cloud-chip-renderer:has([aria-label*="live chat" i]),
        yt-chip-cloud-chip-renderer:has([aria-label*="chat replay" i]),
        yt-chip-cloud-chip-renderer:has([aria-label*="repetición del chat" i]),
        yt-chip-cloud-chip-renderer:has([aria-label*="repetición de chat" i]),
        yt-chip-cloud-chip-renderer:has([aria-label*="chat en vivo" i]),
        yt-chip-cloud-chip-renderer:has([aria-label*="chat ao vivo" i]),
        tp-yt-paper-tab:has([aria-label*="live chat" i]),
        tp-yt-paper-tab:has([aria-label*="chat replay" i]),
        tp-yt-paper-tab:has([aria-label*="repetición del chat" i]),
        tp-yt-paper-tab:has([aria-label*="chat en vivo" i]),
        tp-yt-paper-tab:has([aria-label*="chat ao vivo" i]),
        yt-tab-shape:has([aria-label*="live chat" i]),
        yt-tab-shape:has([aria-label*="chat replay" i]),
        yt-tab-shape:has([aria-label*="repetición del chat" i]),
        yt-tab-shape:has([aria-label*="chat en vivo" i]),
        yt-tab-shape:has([aria-label*="chat ao vivo" i]),

        /* Live Chat Replay Teaser / Companion Box beside video description */
        #teaser-carousel:has(yt-text-carousel-item-view-model),
        #teaser-carousel:has([aria-label*="chat" i]),
        #teaser-carousel:has([aria-label*="repetición" i]),
        #teaser-carousel:has([aria-label*="reprise" i]),
        #teaser-carousel:has(button[aria-label*="chat" i]),
        #teaser-carousel:has([class*="ytTextCarouselItemViewModel"]),
        ytd-watch-metadata #teaser-carousel:has(yt-text-carousel-item-view-model),
        ytd-watch-metadata #teaser-carousel:has([aria-label*="chat" i]),
        ytd-watch-metadata #teaser-carousel:has([aria-label*="repetición" i]),
        ytd-watch-metadata #teaser-carousel:has([aria-label*="reprise" i]),
        watch-metadata-view-model #teaser-carousel:has(yt-text-carousel-item-view-model),
        watch-metadata-view-model #teaser-carousel:has([aria-label*="chat" i]),
        watch-metadata-view-model #teaser-carousel:has([aria-label*="repetición" i]),
        watch-metadata-view-model #teaser-carousel:has([aria-label*="reprise" i]),
        yt-video-metadata-carousel-view-model[aria-label*="chat" i],
        yt-video-metadata-carousel-view-model[aria-label*="repetición" i],
        yt-video-metadata-carousel-view-model[aria-label*="reprise" i],
        yt-video-metadata-carousel-view-model:has(yt-text-carousel-item-view-model),
        yt-video-metadata-carousel-view-model:has([aria-label*="chat" i]),
        yt-video-metadata-carousel-view-model:has([aria-label*="repetición" i]),
        yt-video-metadata-carousel-view-model:has([aria-label*="reprise" i]),
        yt-video-metadata-carousel-view-model:has([class*="ytTextCarouselItemViewModel"]),
        .ytVideoMetadataCarouselViewModelHost[aria-label*="chat" i],
        .ytVideoMetadataCarouselViewModelHost[aria-label*="repetición" i],
        .ytVideoMetadataCarouselViewModelHost[aria-label*="reprise" i],
        .ytVideoMetadataCarouselViewModelHost:has(yt-text-carousel-item-view-model),
        .ytVideoMetadataCarouselViewModelHost:has([class*="ytTextCarouselItemViewModel"]),
        yt-carousel-item-view-model:has(yt-text-carousel-item-view-model),
        yt-carousel-item-view-model:has([aria-label*="chat" i]),
        yt-carousel-item-view-model:has([aria-label*="repetición" i]),
        yt-carousel-item-view-model:has([aria-label*="reprise" i]),
        yt-carousel-item-view-model:has([class*="ytTextCarouselItemViewModel"]),
        yt-text-carousel-item-view-model,
        .ytTextCarouselItemViewModelHost {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        ytd-watch-flexy:not([theater]) {
          --ytd-watch-flexy-chat-width: 0px !important;
          --ytd-watch-flexy-chat-max-height: 0px !important;
        }

        /* Auto-expand theater player when live chat is suppressed to eliminate black bars/crop */
        ytd-watch-flexy[theater] #player-theater-container,
        ytd-watch-flexy[theater] #full-bleed-container,
        ytd-watch-flexy[theater] #player-container,
        ytd-watch-flexy[theater] #player-full-bleed-container,
        ytd-watch-flexy[theater] #movie_player,
        ytd-watch-flexy[theater] .html5-video-player {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
        }

        ytd-watch-flexy[theater] {
          --ytd-watch-flexy-chat-width: 0px !important;
          --ytd-watch-flexy-chat-max-height: 0px !important;
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
        #dislike-button button,
        segmented-like-dislike-button-view-model button:nth-of-type(2),
        segmented-like-dislike-button-view-model .ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > :nth-child(2) button,
        button[data-libertad-dislike-vid],
        button:has(.libertad-dislike-badge) {
          width: auto !important;
          min-width: 48px !important;
          padding-left: 8px !important;
          padding-right: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: visible !important;
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
          opacity: 1 !important;
          visibility: visible !important;
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

  let cachedStylesheetKey = '';
  let cachedStylesheetCss = '';
  let lastZenTargetContainer = null;

  function getStylesheetKey(settings) {
    if (!settings || typeof settings !== 'object') return '';
    let key = `${settings.theme || 'auto'}_${settings.scale || 'auto'}_${settings.lang || 'auto'}|`;
    const keysToTrack =
      typeof ALL_TOGGLE_KEYS !== 'undefined' && Array.isArray(ALL_TOGGLE_KEYS)
        ? ALL_TOGGLE_KEYS
        : typeof TOGGLE_KEYS !== 'undefined' && Array.isArray(TOGGLE_KEYS)
          ? TOGGLE_KEYS
          : Object.keys(settings);
    for (let i = 0; i < keysToTrack.length; i++) {
      key += settings[keysToTrack[i]] ? '1' : '0';
    }
    return key;
  }

  // Inject or update the active stylesheet (avoids re-parsing if CSS is unchanged)
  function applyStyles(settings) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    const currentKey = getStylesheetKey(settings);
    if (currentKey !== cachedStylesheetKey || !cachedStylesheetCss) {
      cachedStylesheetCss = buildStylesheet(settings);
      cachedStylesheetKey = currentKey;
      if (styleEl.textContent !== cachedStylesheetCss) {
        styleEl.textContent = cachedStylesheetCss;
      }
    } else if (styleEl.textContent !== cachedStylesheetCss) {
      styleEl.textContent = cachedStylesheetCss;
    }
    updateZenBanner(settings);
    cleanSidebar(settings);
  }

  // Show a calm, intentional screen on YouTube home if home feed is disabled
  function updateZenBanner(settings) {
    if (!settings || typeof settings !== 'object') return;

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
      lastZenTargetContainer = null;
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

      let targetContainer = lastZenTargetContainer?.isConnected
        ? lastZenTargetContainer
        : null;

      if (!targetContainer) {
        targetContainer =
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
        if (targetContainer) {
          lastZenTargetContainer = targetContainer;
        }
      }

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
      lastZenTargetContainer = null;
      if (existing) {
        existing.remove();
      }
    }
  }

  let chatResizeTimer = null;
  function scheduleChatResize() {
    if (chatResizeTimer) clearTimeout(chatResizeTimer);
    chatResizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(
        new CustomEvent('libertad-agent-cmd', {
          detail: { action: 'RESIZE_PLAYER' },
        }),
      );
      chatResizeTimer = null;
    }, 80);
  }

  let lastNonChatWatchUrl = null;
  let lastAutoplayHandledUrl = null;

  function resetStylesNavigation() {
    lastNonChatWatchUrl = null;
    lastAutoplayHandledUrl = null;
  }

  // Dynamic DOM cleaner for Live Chat & Replay elements (handles Shadow DOM, dynamic Lit/Polymer elements, and localized button text)
  function cleanLiveChat(settings) {
    const isWatch =
      window.location.pathname.startsWith('/watch') ||
      window.location.pathname.startsWith('/live') ||
      Boolean(document.querySelector('ytd-watch-flexy'));

    if (!isWatch) {
      return;
    }

    if (lastNonChatWatchUrl === window.location.href) {
      const quickChat = document.querySelector('ytd-live-chat-frame, #chat');
      if (
        !quickChat ||
        (quickChat.id === 'chat' && quickChat.childElementCount === 0)
      ) {
        return;
      }
      lastNonChatWatchUrl = null;
    }

    const flexy = document.querySelector('ytd-watch-flexy');

    if (!settings?.hideLiveChat) {
      // Revert any previously hidden elements
      const hiddenElements = document.querySelectorAll(
        '[data-libertad-hidden-chat="true"]',
      );
      for (let i = 0; i < hiddenElements.length; i++) {
        hiddenElements[i].removeAttribute('data-libertad-hidden-chat');
        hiddenElements[i].classList.remove('libertad-force-hide');
        hiddenElements[i].style.removeProperty('display');
        hiddenElements[i].style.removeProperty('height');
        hiddenElements[i].style.removeProperty('min-height');
        hiddenElements[i].style.removeProperty('max-height');
        hiddenElements[i].style.removeProperty('margin');
        hiddenElements[i].style.removeProperty('padding');
        hiddenElements[i].style.removeProperty('border');
        hiddenElements[i].style.removeProperty('visibility');
      }
      const checkedElements = document.querySelectorAll(
        '[data-libertad-chat-checked="true"]',
      );
      for (let i = 0; i < checkedElements.length; i++) {
        checkedElements[i].removeAttribute('data-libertad-chat-checked');
      }
      if (flexy) {
        flexy.removeAttribute('flexy-chat-collapsed_');
        scheduleChatResize();
      }
      return;
    }

    // Check if an actual populated live chat or chat replay exists on the page
    const liveChatFrame = document.querySelector(
      'ytd-live-chat-frame, iframe#chatframe, iframe[src*="live_chat"], ytd-engagement-panel-section-list-renderer[target-id*="chat"], [target-id*="engagement-panel-live-chat"], .ytp-live-chat-button',
    );
    const chatContainer = document.querySelector('#chat');
    const hasPopulatedChat = Boolean(
      liveChatFrame || (chatContainer && chatContainer.childElementCount > 0),
    );

    // Quick exit if this is a regular video without live chat or chat replay triggers
    const hasChatTriggers =
      hasPopulatedChat ||
      Boolean(
        document.querySelector(
          '[target-id*="live-chat"], [target-id*="chat-replay"], .ytp-live-chat-button, ytd-button-renderer[target-id*="chat"], yt-button-view-model:has(button[aria-label*="chat" i]), #teaser-carousel, yt-text-carousel-item-view-model, .ytTextCarouselItemViewModelHost, yt-video-metadata-carousel-view-model[aria-label*="chat" i], yt-video-metadata-carousel-view-model[aria-label*="repetición" i], yt-video-metadata-carousel-view-model[aria-label*="reprise" i]',
        ),
      );

    if (!hasChatTriggers) {
      lastNonChatWatchUrl = window.location.href;
      return;
    }

    let didMutateChat = false;

    // 1. If live chat frame is currently open and not collapsed, trigger native collapse so YouTube updates its layout
    if (hasPopulatedChat) {
      const isAlreadyCollapsed =
        flexy?.hasAttribute('flexy-chat-collapsed_') ||
        document.querySelector('ytd-live-chat-frame[collapsed]');

      if (!isAlreadyCollapsed) {
        const chatFrame = document.querySelector('ytd-live-chat-frame, #chat');
        if (chatFrame) {
          const nativeHideBtn = chatFrame.querySelector(
            '#show-hide-button button, ytd-toggle-button-renderer#show-hide-button button, #show-hide-button',
          );
          if (
            nativeHideBtn &&
            !nativeHideBtn.hasAttribute('data-libertad-clicked')
          ) {
            const btnAria = (
              nativeHideBtn.getAttribute('aria-label') || ''
            ).toLowerCase();
            const btnText = (nativeHideBtn.textContent || '')
              .trim()
              .toLowerCase();
            const isHideAction =
              btnAria.includes('hide') ||
              btnAria.includes('ocultar') ||
              btnAria.includes('fechar') ||
              btnText.includes('hide') ||
              btnText.includes('ocultar') ||
              btnText.includes('fechar') ||
              (!btnAria.includes('show') &&
                !btnAria.includes('mostrar') &&
                !btnText.includes('show') &&
                !btnText.includes('mostrar'));

            if (isHideAction) {
              nativeHideBtn.setAttribute('data-libertad-clicked', 'true');
              try {
                nativeHideBtn.click();
                didMutateChat = true;
              } catch (_) {}
            }
          }
        }
      }

      // Mark flexy as chat-collapsed so YouTube's layout engine expands player (only on streams with actual chat)
      if (flexy && !flexy.hasAttribute('flexy-chat-collapsed_')) {
        flexy.setAttribute('flexy-chat-collapsed_', '');
        didMutateChat = true;
      }
    }

    // 2. Direct container cleanup
    const directSelectors = [
      '#chat',
      '#chat.ytd-watch-flexy',
      '#chat-container',
      '#chat-container.ytd-watch-flexy',
      'ytd-watch-flexy #chat',
      'ytd-watch-flexy #chat-container',
      'ytd-watch-flexy[flexy-chat-collapsed_] #chat',
      'ytd-watch-flexy[chat-collapsed] #chat',
      'ytd-live-chat-frame',
      'ytd-live-chat-frame[collapsed]',
      'iframe#chatframe',
      'iframe[src*="live_chat"]',
      '#show-hide-button',
      'ytd-live-chat-frame #show-hide-button',
      'ytd-button-renderer#show-hide-button',
      'ytd-toggle-button-renderer#show-hide-button',
      '.ytp-live-chat-button',
      '[target-id*="chat"]',
      '[target-id="chat-container"]',
      '[target-id="engagement-panel-live-chat"]',
      '[target-id="engagement-panel-live-chat-replay"]',
      '[target-id*="chat-replay"]',
      '[target-id*="live-chat"]',
      '#teaser-carousel:has(yt-text-carousel-item-view-model)',
      '#teaser-carousel:has([aria-label*="chat" i])',
      '#teaser-carousel:has([aria-label*="repetición" i])',
      '#teaser-carousel:has([aria-label*="reprise" i])',
      'yt-video-metadata-carousel-view-model:has(yt-text-carousel-item-view-model)',
      'yt-video-metadata-carousel-view-model[aria-label*="chat" i]',
      'yt-video-metadata-carousel-view-model[aria-label*="repetición" i]',
      'yt-video-metadata-carousel-view-model[aria-label*="reprise" i]',
      'yt-text-carousel-item-view-model',
      '.ytTextCarouselItemViewModelHost',
    ];

    const directNodes = document.querySelectorAll(directSelectors.join(','));
    for (let i = 0; i < directNodes.length; i++) {
      const node = directNodes[i];
      if (node.getAttribute('data-libertad-hidden-chat') !== 'true') {
        node.setAttribute('data-libertad-hidden-chat', 'true');
        node.classList.add('libertad-force-hide');
        const parentPanel = node.closest(
          'ytd-item-section-renderer, ytd-engagement-panel-section-list-renderer',
        );
        if (
          parentPanel &&
          parentPanel.getAttribute('data-libertad-hidden-chat') !== 'true'
        ) {
          parentPanel.setAttribute('data-libertad-hidden-chat', 'true');
          parentPanel.classList.add('libertad-force-hide');
        }
        didMutateChat = true;
      }
    }

    // 2.1 Teaser and companion carousel cleanup beside video description
    const teaserCards = document.querySelectorAll(
      '#teaser-carousel, yt-video-metadata-carousel-view-model, yt-carousel-item-view-model, .ytVideoMetadataCarouselViewModelHost',
    );
    for (let i = 0; i < teaserCards.length; i++) {
      const card = teaserCards[i];
      if (card.getAttribute('data-libertad-hidden-chat') === 'true') {
        continue;
      }
      const cardText = (card.textContent || '').toLowerCase();
      const cardAria = (card.getAttribute('aria-label') || '').toLowerCase();
      const isChatTeaser =
        Boolean(card.querySelector('yt-text-carousel-item-view-model')) ||
        cardText.includes('chat replay') ||
        cardText.includes('repetición del chat') ||
        cardText.includes('reprise do chat') ||
        cardText.includes('live chat') ||
        cardText.includes('see what others said') ||
        cardText.includes('mira lo que dijeron') ||
        cardText.includes('veja o que as pessoas disseram') ||
        cardAria.includes('chat') ||
        cardAria.includes('repetición') ||
        cardAria.includes('reprise');

      if (isChatTeaser) {
        card.setAttribute('data-libertad-hidden-chat', 'true');
        card.classList.add('libertad-force-hide');
        const parentCarousel = card.closest('#teaser-carousel');
        if (
          parentCarousel &&
          parentCarousel.getAttribute('data-libertad-hidden-chat') !== 'true'
        ) {
          parentCarousel.setAttribute('data-libertad-hidden-chat', 'true');
          parentCarousel.classList.add('libertad-force-hide');
        }
        didMutateChat = true;
      }
    }

    // 3. Scan candidate buttons, chips, tabs, and action items scoped strictly to action bars & sidebars
    const chatContainerScope = document.querySelectorAll(
      '#secondary, #panels, #chat, #chat-container, ytd-watch-metadata #actions, #teaser-carousel, ytd-engagement-panel-section-list-renderer[target-id*="chat"]',
    );
    const candidates = [];
    if (chatContainerScope.length > 0) {
      const candidateTagSelector =
        'ytd-button-renderer, yt-button-shape, yt-button-view-model, yt-chip-cloud-chip-renderer, tp-yt-paper-tab, yt-tab-shape';
      const seenNodes = new Set();
      for (let c = 0; c < chatContainerScope.length; c++) {
        const container = chatContainerScope[c];
        if (container.matches?.(candidateTagSelector)) {
          if (!seenNodes.has(container)) {
            seenNodes.add(container);
            candidates.push(container);
          }
        }
        const scopedElements = container.querySelectorAll(candidateTagSelector);
        for (let s = 0; s < scopedElements.length; s++) {
          const el = scopedElements[s];
          if (!seenNodes.has(el)) {
            seenNodes.add(el);
            candidates.push(el);
          }
        }
      }
    }

    const chatKeywords = [
      'chat replay',
      'repetición del chat',
      'repetición de chat',
      'repetir chat',
      'reprise do chat',
      'reprise chat',
      'live chat replay',
      'repetición del chat en vivo',
      'reprise do chat ao vivo',
      'mostrar repetición del chat',
      'show chat replay',
      'hide chat replay',
      'ocultar repetición del chat',
      'live chat',
      'chat vivo',
      'chat en vivo',
      'chat ao vivo',
      'mostrar chat',
      'show live chat',
      'hide live chat',
      'ocultar chat',
    ];

    for (let i = 0; i < candidates.length; i++) {
      const node = candidates[i];
      if (
        node.getAttribute('data-libertad-hidden-chat') === 'true' ||
        node.getAttribute('data-libertad-chat-checked') === 'true'
      ) {
        continue;
      }

      // Never touch buttons or items inside comments or video cards
      if (
        node.closest(
          '#comments, ytd-comments, ytd-comment-thread-renderer, ytd-rich-grid-renderer, ytd-video-renderer',
        )
      ) {
        node.setAttribute('data-libertad-chat-checked', 'true');
        continue;
      }

      const targetId = (node.getAttribute('target-id') || '').toLowerCase();
      if (targetId.includes('live-chat') || targetId.includes('chat-replay')) {
        node.setAttribute('data-libertad-hidden-chat', 'true');
        node.classList.add('libertad-force-hide');
        didMutateChat = true;
        continue;
      }

      // Check attributes and text content of node and its shadow root if present
      const shadowBtn = node.shadowRoot
        ? node.shadowRoot.querySelector('button, [role="button"]')
        : null;
      const lightBtn = node.querySelector('button, [role="button"]');
      const innerBtn = shadowBtn || lightBtn;

      const aria = (
        innerBtn?.getAttribute('aria-label') ||
        node.getAttribute('aria-label') ||
        ''
      ).toLowerCase();
      const title = (
        innerBtn?.getAttribute('title') ||
        node.getAttribute('title') ||
        ''
      ).toLowerCase();
      const text = (innerBtn?.textContent || node.textContent || '')
        .trim()
        .toLowerCase();

      let match = false;
      for (let k = 0; k < chatKeywords.length; k++) {
        const kw = chatKeywords[k];
        if (
          aria.includes(kw) ||
          title.includes(kw) ||
          text === kw ||
          text.includes(kw)
        ) {
          match = true;
          break;
        }
      }

      if (match) {
        node.setAttribute('data-libertad-hidden-chat', 'true');
        node.classList.add('libertad-force-hide');
        didMutateChat = true;
      } else {
        node.setAttribute('data-libertad-chat-checked', 'true');
      }
    }

    // 4. Only dispatch resize if we actually hid or collapsed an active stream chat, and debounce it!
    if (didMutateChat && hasPopulatedChat) {
      scheduleChatResize();
    }
  }

  // Resilient DOM tagger for Explore sidebar section in any language
  function cleanExplore(settings) {
    if (!settings?.hideExplore) {
      const hiddenExplore = document.querySelectorAll(
        '[data-libertad-explore]',
      );
      for (let i = 0; i < hiddenExplore.length; i++) {
        hiddenExplore[i].removeAttribute('data-libertad-explore');
        hiddenExplore[i].classList.remove('libertad-force-hide');
        hiddenExplore[i].style.removeProperty('display');
      }
      return;
    }

    const isWatch =
      window.location.pathname.startsWith('/watch') ||
      window.location.pathname.startsWith('/live');
    if (isWatch) {
      const isGuideOpen = Boolean(
        document.querySelector(
          'ytd-app[guide-persistent-and-visible], ytd-guide-renderer[opened]',
        ),
      );
      if (!isGuideOpen) {
        return;
      }
    }

    try {
      const untreatedSections = document.querySelectorAll(
        'ytd-guide-section-renderer:not([data-libertad-explore])',
      );
      if (untreatedSections.length === 0) {
        return;
      }

      const exploreKeywords = [
        'explore',
        'explorar',
        'explorer',
        'entdecken',
        'esplora',
        'verken',
        'utforska',
        'oppdag',
        'odkrywaj',
        'keşfet',
      ];
      for (let i = 0; i < untreatedSections.length; i++) {
        const sec = untreatedSections[i];

        // Strict guard against Home, Subscriptions, or Library
        if (
          sec.querySelector(
            'a[href="/"], a[href*="/feed/subscriptions"], a[href*="/feed/you"], a[href*="premium"]',
          )
        ) {
          sec.setAttribute('data-libertad-explore', 'preserved');
          continue;
        }

        const titleEl = sec.querySelector(
          '#guide-section-title, yt-formatted-string#title',
        );
        const titleText = (titleEl?.textContent || '').trim().toLowerCase();
        if (exploreKeywords.some((kw) => titleText.startsWith(kw))) {
          sec.setAttribute('data-libertad-explore', 'true');
          sec.classList.add('libertad-force-hide');
        } else {
          sec.setAttribute('data-libertad-explore', 'checked');
        }
      }
    } catch (_) {}
  }

  // Physical DOM switch sync for Autoplay suppression
  function cleanAutoplay(settings) {
    if (
      !settings?.hideAutoplay ||
      settings.isOff ||
      settings.preset === 'off'
    ) {
      return;
    }
    const currentUrl = window.location.href;
    if (lastAutoplayHandledUrl === currentUrl) {
      return;
    }
    if (document.documentElement?.dataset?.libertadAutonav === 'suppressed') {
      lastAutoplayHandledUrl = currentUrl;
      return;
    }
    try {
      const autonavBtn = document.querySelector('.ytp-autonav-toggle-button');
      if (autonavBtn) {
        if (autonavBtn.getAttribute('aria-checked') === 'true') {
          autonavBtn.click();
        }
        lastAutoplayHandledUrl = currentUrl;
      }
    } catch (_) {}
  }

  // Dynamic player dimension calibrator when toggling or navigating with hideSidebar
  let playerResizeTimer = null;
  function schedulePlayerResize() {
    if (playerResizeTimer) clearTimeout(playerResizeTimer);
    playerResizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(
        new CustomEvent('libertad-agent-cmd', {
          detail: { action: 'RESIZE_PLAYER' },
        }),
      );
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(
          new CustomEvent('libertad-agent-cmd', {
            detail: { action: 'RESIZE_PLAYER' },
          }),
        );
        playerResizeTimer = null;
      }, 180);
    }, 40);
  }

  function cleanSidebar(_settings) {
    const isWatch =
      window.location.pathname.startsWith('/watch') ||
      window.location.pathname.startsWith('/live') ||
      Boolean(document.querySelector('ytd-watch-flexy'));

    if (!isWatch) return;

    schedulePlayerResize();
  }

  globalThis.Libertad.buildStylesheet = buildStylesheet;
  globalThis.Libertad.applyStyles = applyStyles;
  globalThis.Libertad.updateZenBanner = updateZenBanner;
  globalThis.Libertad.cleanLiveChat = cleanLiveChat;
  globalThis.Libertad.cleanExplore = cleanExplore;
  globalThis.Libertad.cleanAutoplay = cleanAutoplay;
  globalThis.Libertad.cleanSidebar = cleanSidebar;
  globalThis.Libertad.resetStylesNavigation = resetStylesNavigation;
})();
