# Changelog

## [1.4.3]
- **Cooperative Background Scheduler & Frame-Budget Protection:** Replaced synchronous DOM scanning in `requestAnimationFrame` with a non-blocking background scheduler powered by `requestIdleCallback` (with a 16ms fallback). Mutation bursts are coalesced using task deduplication, keeping main-thread execution strictly under 0.2ms to eliminate UI stutter and micro-freezes on low-end laptops and notebooks.
- **Dual-Layer Player & Layout Resize Coordination:** Restored debounced native window resize dispatching in `schedulePlayerResize` and `scheduleChatResize` paired with direct main-world Polymer `ytd-watch-flexy.handleResize_()` coordination via `agent.js`. Reconnected `cleanSidebar` execution in `applyStyles` to guarantee immediate HTML5 video player and column recalibration when toggling the related sidebar, eliminating video shrinking, letterboxing, and misaligned recommendation cards.
- **CSS-Driven Live Chat Cleaning & Revert Isolation:** Replaced 8 repetitive inline `style.setProperty` overrides in `cleanLiveChat` with a single high-performance `.libertad-force-hide` atomic CSS utility. Isolated state tracking attributes (`[data-libertad-hidden-chat]` vs `[data-libertad-explore]`) to prevent state collisions and implemented full clean restoration in `cleanExplore`.
- **Decoupled DOM Cleanup Execution:** Decoupled `cleanLiveChat` and `cleanExplore` from generic stylesheet application to run independently and throttled on relevant DOM mutations only, keeping `cleanSidebar` explicitly connected to stylesheet updates for instantaneous player dimension synchronization.
- **Single-Pass Dislike Button Resolution:** Consolidated 6 sequential cascading DOM queries in `dislikes.js` into a unified composite selector query, while strictly scoping candidate buttons away from comment sections (`!btn.closest('#comments, ytd-comments, ytd-comment-thread-renderer')`) to eliminate incorrect button targeting.
- **Main-World Agent Exponential Backoff & Memoization:** Replaced fixed 500ms polling intervals in `src/injected/agent.js` with a 3-attempt exponential backoff strategy (400ms, 1000ms, 2000ms) synchronized with YouTube player state transitions (`onStateChange === 1`), and memoized `getPlayerResponse()` by video ID to eliminate deep object traversals. Added `popstate` navigation cache invalidation and timer cleanup.
- **Amortized Untranslate Node Pruning & Recycled DOM Handling:** Decoupled $O(N^2)$ synchronous disconnected node pruning in `untranslate.js` into amortized 2000ms batches (`schedulePruneDisconnectedNodes`). Added recycled DOM node detection (`libertadPendingId` vs current href) to prevent stale title overwrites during fast virtualized scrolling, and ensured pruning timers are cleaned up on SPA navigation.
- **SponsorBlock Progress Bar Rendering Throttling:** Throttled `renderSponsorProgressBar` in `sponsors.js` to a 1000ms cadence when the progress bar element is disconnected from the DOM, eliminating redundant DOM lookups on every 250ms playback heartbeat.
- **Modern CSS Selector Consolidation:** Optimized `:has()` query complexity across `styles.js` by grouping multiple selectors with `:is()` and streamlining the multi-clause `:not(:has(...))` rule in `hideExplore` for faster CSS evaluation.
- **App-Root CSS Invalidation Elimination:** Removed the global `ytd-page-manager:has(ytd-watch-flexy...)` selector in `styles.js`, replacing it with direct `#page-manager > ytd-browse[hidden]` attribute rules to prevent Chromium Blink from invalidating the entire YouTube DOM tree on watch page mutations.
- **Autoplay Suppression Idempotency & Agent Coordination:** Added a non-blocking `document.documentElement.dataset.libertadAutonav` coordination flag between `agent.js` and `content.js`. Once verified as suppressed for the active video URL, `cleanAutoplay` returns immediately with 0ms and zero DOM queries, resetting cleanly on SPA navigation.
- **Context-Gated Explore Cleaner:** Guarded `cleanExplore` in `content.js` and `styles.js` so it only runs when the drawer sidebar is open or on feed routes (`/`, `/feed/*`). Added unexamined-section filtering (`ytd-guide-section-renderer:not([data-libertad-explore])`) to bypass keyword scans on subsequent DOM mutations.
- **Live Chat False-Trigger Elimination & O(1) Parent Traversal:** Replaced the broad `yt-video-metadata-carousel-view-model` query in `hasChatTriggers` with dedicated chat-specific teaser selectors, and replaced downward `:has()` queries in `directSelectors` with direct `.closest()` upward lookups, avoiding heavy DOM scans on standard video watch pages.
- **In-Stream Ad Check Deduplication:** Deduplicated consecutive `isAdPlaying()` calls between `onTimeUpdate` and `checkVideoSponsors` in `sponsors.js`, passing the validated ad state down to avoid repeated DOM lookups on every 250ms playback tick.
- **Audio Switching Loop Eradication & Playback Idempotency:** Introduced a strict per-video lock (`audioSwitchAttemptedVideoId`) in `agent.js` ensuring programmatic audio track enforcement runs at most once per video, eliminating YouTube MSE re-buffering loops. Removed blind `tracks[0]` fallbacks to prevent accidental overrides of user audio selections, and decoupled simultaneous `onStateChange(1)` and `video.playing` events with a 250ms enforcement throttle without `force = true`.
- **SponsorBlock Seeking Storm Eradication & Pipeline Guard:** Added synchronous `video.seeking` and `isProgrammaticSkip` early abort guards in `checkVideoSponsors` to prevent concurrent seek execution during asynchronous media pipeline transitions. Enforced `lastSkippedSegmentUuid` verification before seeking to eliminate stuttering and frame bursts, and unified `<video>` element resolution with a universal fallback helper (`getVideoElement`).
- **Zero-Latency Agent-to-Content Title Hydration:** Hydrated `titlesCache` immediately upon receiving `libertad-agent-metadata` and in `applyWatchTitle` within `untranslate.js`, enabling `updateWatchTitle` to resolve titles synchronously from memory and eliminating redundant `/oembed` network requests on watch page navigation.

---

## [1.4.2]
- **HTML5 Player & Flexy Dimensions Calibration:** Fixed player container and HTML5 `<video>` element desynchronization when hiding the sidebar (`hideSidebar`), enforcing Polymer flexy CSS variable resets (`--ytd-watch-flexy-sidebar-width: 0px !important;`, etc.) and centered 1100px layouts strictly scoped to `:not([theater]):not([fullscreen])` to prevent letterboxing and regressions in Theater or Fullscreen modes.
- **Reactive Native Player Resizing:** Added debounced staggered player recalibration (`schedulePlayerResize` / `cleanSidebar` via native `window.dispatchEvent`) on SPA navigations, watch page mounting, and storage toggle changes, recalculating video canvas dimensions smoothly without layout thrashing.
- **Isolated Mutation Guard:** Protected `/watch` page DOM observation with single-sync URL tracking (`lastFlexySyncedHref`), eliminating redundant resize event loops and layout thrashing across video playback.

---

## [1.4.1]
- **Ad-Safe SponsorBlock Playback:** Added native in-stream ad detection (`.ad-showing`, `.ad-interrupting`) to prevent timeline skips during ads, eliminating player state desynchronization and unexpected skipping on advertisements.
- **Zero-Overhead Playback Heartbeat:** Optimized `sponsors.js` playback engine to cache the active video ID in memory and throttle DOM checks, eliminating redundant lookups (`getElementById`, `querySelector`, regex) on every 250ms `timeupdate` tick.
- **Blink DOM Memory Recycling:** Eradicated detached DOM node retention in `untranslate.js` by explicitly invoking `feedIntersectionObserver.unobserve(node)` when elements disconnect or resolve during infinite scrolling, unblocking Blink's C++ garbage collector.
- **Protected 1:1 Chapter Title Mapping:** Hardened YouTube chapter title restoration in `untranslate.js` by scoping queries to individual `ytd-macro-markers-list-item-renderer` containers, preventing node duplication and index drift when `<h4>` and `#title` tags are nested.
- **Scoped Live Chat Mutation Scans:** Restricted button candidate queries in `cleanLiveChat` strictly to active action bars and side panels (`#secondary`, `#panels`, `#chat`, `#teaser-carousel`), eliminating V8 Long Tasks caused by querying the full document on comment mutations.
- **Service Worker Session Cache Coherence:** Decoupled L1 in-memory eviction from L2 storage removals in `background.js`, eliminating ghost entries in session key indexes and keeping L2 cache persistence predictable.
- **Preset Single Source of Truth Alignment:** Eliminated residual legacy fallbacks to `'basic'` across `popup.js`, `background.js`, and `content.js`, ensuring `'balanced'` is uniformly enforced as the default preset on initialization, profile resets, and config restorations.
- **Defensive Zen Banner Guard:** Added strict object parameter validation to `updateZenBanner` in `styles.js` to guarantee null-safe execution.
- **Clean Browser Startup Lifecycle:** Removed redundant programmatic tab injection in `chrome.runtime.onStartup`, allowing Chromium's native declarative manifest loader to handle restored tabs cleanly without double script parsing.
- **Service Worker Cache Serialization & Negative Caching:** Prevented concurrent write collisions in `recordSessionKey` via an asynchronous promise queue and added negative caching for 404 responses in Dislikes and oEmbed endpoints to reduce external network traffic.

---

## [1.4.0]
- **Decisive Initial Preset UX:** Set `BALANCED` as the default and clearly badged `RECOMMENDED` (`RECOMENDADO`) in both the welcome onboarding flow and default configuration, ensuring new users immediately experience distraction removal.
- **Switch Cannibalization Transparency:** When `Direct to Subscriptions` (`redirectHomeToSubscriptions`) is active, the `Home Feed` card is visually attenuated and tagged with `[OVERRIDDEN BY REDIRECT]` / `[ANULADO POR REDIRECCIÓN]` to clarify functional priority.
- **Account Avatar / Profile Picture Removal:** Added a dedicated micro-toggle (`hideAccountAvatar` / `chipAccountAvatar`) under Header & Search to hide the user profile photo button (`#avatar-btn`) from the YouTube top masthead, active in the Extreme preset for complete anonymous Zen mode, restoring the UI Cleaner suite to 28 micro-toggles and 48 total extension controls.
- **Eradication of Search Suggestions:** Completely removed the Search Box Autocomplete Suggestions toggle (`hideSearchSuggestions` / `chipSearchSuggestions`), eliminated associated CSS rules (`.sbdd_b`, `yt-searchbox-suggestions`, etc.), and added automated storage sanitation in `background.js` to purge legacy keys.
- **Zero-Defect Automated Test Suite:** Integrated a full parity check suite (`test/parity-check.js`, `npm test`) running 48 toggle validations, 127 i18n keys across all 3 languages, DOM ID integrity, and automated lint checks before release packaging.
- **Preset-Aware Data Migration:** Resolved a migration flaw where existing users on Balanced or Extreme presets had newly introduced cleaner options (`hidePlayOnTv`, `hideSubtitles`) inadvertently defaulted to false; migration now correctly applies the user's active preset template.
- **Update Tab Re-injection:** Extended instant programmatic script injection to trigger on extension updates as well as initial installs, preventing `Extension context invalidated` errors on pre-existing YouTube tabs.
- **Robust Onboarding Language Detection:** Aligned `welcome.js` locale resolution with the popup's hierarchical detection engine (`chrome.i18n.getUILanguage()`, `navigator.languages`, and regional dialect prefixes), ensuring new users always see onboarding in their preferred language.
- **Persistent Pause Snapshot:** Migrated `libertad_paused_snapshot` storage to `chrome.storage.local` with backward-compatible `localStorage` fallback, guaranteeing custom configurations are preserved across browser session cleanups and sync events.
- **Seamless Video Transitions (Anti-Ghost Skips):** Eliminated a race condition in SponsorBlock during rapid continuous playback (playlists, queue, and autoplay) where segments from a preceding video could linger and prematurely skip the start of the next video; playback heartbeat and media events now enforce strict video ID validation and purge previous segments at frame zero.
- **SponsorBlock Color Alignment:** Added subtle, minimalist color accents to each SponsorBlock category chip corresponding to its exact colored segment on the YouTube player progress bar (Green for Sponsors, Yellow for Self-Promo, Purple for Reminders, Cyan for Intros, Blue for Outros, and Orange for Off-Topic).

---

## [1.3.0]
- **Streamlined Onboarding Experience:** Added lightweight, trilingual (ES, EN, PT) first-run setup (`welcome.html`) guiding users on pinning the extension and selecting their initial focus preset, launched cleanly only upon first install.
- **Instant Tab Injection:** Enabled programmatic injection in `background.js` via the `scripting` API to activate content scripts immediately on pre-existing YouTube tabs upon installation, eliminating manual page reloads.
- **Interactive Master Status Pill:** Converted header status indicator into an accessible quick Pause/Resume toggle that snapshots custom configurations (`libertad_paused_snapshot`) upon pause and restores them cleanly upon resume without resetting preset state.
- **Contextual Non-YouTube Banner:** Added proactive detection in popup with a direct launch action when opened outside YouTube tabs.
- **UI Cleaner Polarity Clarity:** Added localized explanatory subheaders across EN, ES, and PT in the Cleaner view clarifying that active chips hide interface elements.
- **Agent Guard Rails:** Strengthened `src/injected/agent.js` with settings-aware abort guards, ensuring original audio and caption logic cleanly halt when the extension is paused or untranslate options are turned off.
- **UI Cleaner Additions:** Added dedicated controls to hide "Play on TV" (Cast) and "Subtitles" (CC toggle) from player controls and menus, expanding customizable toggles to 28.
- **Live Chat & Replay Teaser Suppression:** Unified Live Chat cleaning to eliminate both active chat streams and companion "Live chat replay" teaser cards adjacent to the description on stream recordings (VODs), allowing descriptions to expand smoothly.
- **Performance & Zero-Flash Engine:** Overhauled stylesheet injection and DOM observation architecture with debounced event batching and 0ms CSS-first rules, preventing layout shifts and lowering background resource usage.
- **Multi-Language Resilience:** Hardened UI Cleaner selectors and heuristics across English, Spanish, and Portuguese to ensure consistent behavior regardless of the YouTube interface language.
- **Preset Matrix & Profiles:** Synchronized all focus presets (Minimal, Work, Study, Zen, Off) and profile configurations to fully support the expanded cleaner suite.

---

## [1.2.0]
- **Profiles & Presets:** Profiles now save your extra tools (Dislikes and Sponsors), and the OFF mode turns everything off.
- **UI Cleaner:** Added a cleaner for sidebar Explore, unified Live Chat to also remove Chat Replays, and corrected the Like/Dislike icon shape.
- **Interface & Languages:** Improved text fitting and button scaling across all languages (ES, EN, PT) so labels never clip.
- **Fixes & Improvements:** More reliable original audio, smoother dislike counter, and better video player alignment.
- **Subtle Update Badge:** Added a clean 24-hour update indicator next to the version in the popup.

---

## [1.1.0]
- **Focus Profiles:** Create and switch between up to 3 custom focus setups.
- **New Tools:** Added SponsorBlock skipping, dislike counter, and anti-AI dubbing.
- **Display:** Added OLED pure-black mode and adjustable interface scaling.

---

## [1.0.0]
- Initial release of Libertad for YouTube.
- Block distractions: home feed, Shorts, comments, and recommendations.
- 100% private: Zero analytics, zero data collection.

