# Changelog

## [1.4.6]
- **Dynamic YouTube Tab Injection Parity (`zen.js`):** Synchronized the dynamic script injection manifest in `background.js` (`injectYouTubeTabs`) with `manifest.json`, ensuring `src/modules/zen.js` is automatically loaded into existing YouTube tabs upon extension installation or update without requiring a manual page refresh.
- **Automated Manifest & Service Worker Script Parity Check:** Added pre-flight automated parity testing in `test/parity-check.js` (Step 11) to guarantee 1:1 parity between declared content scripts in `manifest.json` and background worker dynamic script arrays, preventing module desynchronization regressions.
- **Dislike Polling Debounce & Mutation Thrashing Elimination:** Introduced video ID scoped polling guards (`currentPollingVid`) in `dislikes.js` (`pollForDislikeButton`), preventing YouTube DOM mutations during watch page load from repeatedly clearing and restarting the 300ms polling interval. Eliminates CPU spikes and significantly accelerates dislike count badge injection.
- **Transient Network & Rate-Limit Cache Hardening (Untranslate):** Refactored `fetchOriginalTitle` in `untranslate.js` to restrict negative caching (`titlesCache.set(videoId, false)`) strictly to confirmed HTTP 404/403/401 responses. Prevents transient HTTP 429 (Rate Limit) errors and network drops during fast feed scrolling from permanently poisoning the in-memory title cache for the duration of the session.

---

## [1.4.5]
- **Unified Plugin Registry Engine & Fault Isolation:** Implemented the central `registerModule` lifecycle interface (`init`, `onNavigate`, `onSettingsChange`, `onDomMutation`, `destroy`) in `src/core/utils.js` wrapped in `safeRun` exception barriers, isolating runtime errors to individual modules and decoupling `content.js` into an autonomous orchestrator.
- **Autonomous Subscriptions & Shorts Plugin Migration:** Migrated `subscriptions.js` and `shorts.js` to self-contained plugin modules governed by the `registerModule` lifecycle contract (`init`, `onNavigate`, `onSettingsChange`, `onDomMutation`). Eradicated 7 redundant execution blocks and direct function references in `content.js`, delegating early route evaluation and click interception entirely to autonomous lifecycle events.
- **Encapsulated SponsorBlock Plugin & Idle DOM Decoupling:** Migrated `sponsors.js` to an autonomous plugin module registered via `registerModule`. Purged 35 lines of invasive state inspection and manual container checks from `content.js`'s idle `MutationObserver`, moving segment synchronizations, listener bindings, and visual progress bar rendering into local lexical scopes evaluated directly within `onDomMutation`, `onNavigate`, and `onSettingsChange`.
- **Double Dispatch Elimination & SPA Lifecycle Sanity:** Eliminated redundant dual-execution flows and competing polling timers between `syncAllModules`, `yt-navigate-finish`, `popstate`, and `chrome.storage.onChanged`. Activated `broadcastInit` on settings load and generalized `broadcastDomMutation` across live streams (`/live/*`) and watch routes without main-thread blocking.
- **Native Dislike Button Resolution & Hierarchy Traversal:** Hardened `findDislikeButton` in `dislikes.js` with recursive native button resolution (`getNativeButton`), ensuring direct interaction with interactive `<button>` elements instead of outer Polymer container wrappers (`#segmented-dislike-button`, `dislike-button-view-model`).
- **YouTube Native Template Cloning (`cloneNode`) & Dual Class Parity:** Refactored `injectDislikeBadge` in `dislikes.js` to dynamically clone the text container template from the paired Like button (`cloneNode(true)`), inheriting YouTube's native typography, vertical alignment, and light/dark theme styles. Implemented dual-class support for both kebab-case (`yt-spec-button-shape-next--icon-leading`) and modern compiled camelCase (`ytSpecButtonShapeNextIconLeading`) classes to prevent 36px icon button clipping.
- **Segmented Button Container Expansion & CSS Resilience:** Updated `styles.js` with comprehensive layout rules (`overflow: visible !important; width: auto !important; max-width: none !important;`) on `segmented-like-dislike-button-view-model`, `.ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper`, and `dislike-button-view-model`, preventing parent container clipping and guaranteeing persistent dislike count visibility.
- **AI Agent Governance & Modular Isolation Protocol:** Established mandatory operational rules in `AGENTS.md` enforcing read-only audit procedures, surgical single-module edit boundaries to protect orchestrators, zero debug console logging in production, and automated pre-flight test and lint parity verification.
- **AdBlocker-Compatible Active Visibility & SSAI Hardening:** Hardened `isAdPlaying` in `sponsors.js` with active visibility validation (`checkVisibility` with geometry and computed display fallback) for modern YouTube Server-Side Ad Injection (SSAI) and overlay markers (`.video-ads.ytp-ad-module`, `.ytp-ad-player-overlay`, `.ytp-ad-text`). Eliminates catastrophic false positives where cosmetic adblocker rules (`display: none !important`) or recycled DOM nodes permanently disabled SponsorBlock.
- **Player-Scoped Ad Detection & Playback Heartbeat Optimization:** Scoped in-stream ad overlay queries (`.ytp-ad-player-overlay`, `.ytp-ad-text`) strictly to `#movie_player` instead of the global `document` tree, bypassed computed visibility checks on empty `.video-ads.ytp-ad-module` containers, and gated playback heartbeat ad verification behind active segment presence (`currentSponsorSegments.length > 0`) to eliminate unnecessary DOM traversal on videos without sponsors.
- **Synchronized Seeking State Machine & Demuxer Protection:** Made `seekVideoPlayer` return a boolean execution status and synchronized `checkVideoSponsors` to only mark segments as skipped and display toasts when the seek actually executes. Added strict HTML5 `video.readyState >= 2` (`HAVE_CURRENT_DATA`) validation and duration sanity checks (`Number.isFinite(video.duration) && video.duration > 0`), while triggering immediate evaluation on native `playing` events to achieve zero-latency intro sponsor skips.
- **Enhanced Zero-Reload SPA Shorts Interceptor:** Upgraded `setupShortsLinkInterceptor` in `shorts.js` to preserve URL query parameters (`?t=...`, share tokens) and URL hashes, added SPA routing for navigation drawer `/shorts` root links directly to user feed destinations, and bound `auxclick` in the DOM capture phase to sanitize links before middle-click tab creation.
- **Dynamic Manifest Version Binding & Hardcoded Version Elimination:** Decoupled popup footer version rendering from hardcoded static strings in `popup.html` and `popup.js`, establishing `chrome.runtime.getManifest().version` as the single dynamic source of truth. Added defensive guards to version badge lifecycle evaluation to prevent invalid badge states when manifest version data is unavailable.
- **Autonomous Zen Mode Plugin & Style Engine Decoupling:** Migrated intentional home feed banner rendering (`updateZenBanner`) out of `styles.js` into an autonomous, self-contained plugin module (`src/modules/zen.js`) registered under the `registerModule` lifecycle engine. Fully encapsulated DOM container lookups, theme, scale, and multi-language resolutions into local lexical closures.
- **Zero-Latency SPA Route Teardown & Fast DOM Initialization:** Optimized `zen.js` navigation flow to evaluate incoming destination URLs during `yt-navigate-start` (`phase === 'start'`), dismantling the intentional home banner in 0ms on video clicks and eliminating the 300ms transition lag while YouTube loads the player. Attached a resilient, one-shot `DOMContentLoaded` mounting hook with `readyState` validation to render immediately upon HTML parsing without waiting for deferred idle task scheduling.
- **Release Pre-Flight Parity & Version Synchronization:** Synchronized static version representation across `popup.html` and `popup.js` with `manifest.json` (`v1.4.5`), preserving runtime dynamic hydration via `chrome.runtime.getManifest()` while ensuring 100% compliance with automated pre-flight packaging checks in `pack.py`.

---

## [1.4.4]
- **Zero-Latency SPA Video ID Synchronization:** Inverted the resolution priority in `getActiveVideoId` (`sponsors.js`) to parse `window.location.href` directly in memory ($O(1)$) prior to querying DOM attributes (`<ytd-watch-flexy video-id="...">`). Eliminates race conditions during rapid SPA navigations where SponsorBlock was receiving stale video IDs from the preceding video.
- **SponsorBlock Transient Failure & Poison Cache Elimination:** Eradicated negative caching of empty arrays (`sponsorCache.set(videoId, [])`) on transient network drops, request timeouts, and Service Worker disconnects. Prevents temporary fetch failures from permanently blinding the client cache to valid sponsor segments for the remainder of the tab session.
- **Selective Sponsor Action Type Filtering:** Enforced strict `actionTypes=['skip']` query filtering at the Service Worker level (`background.js`) and added defensive client-side filtering (`!s.actionType || s.actionType === 'skip'`) in `sponsors.js`. Guarantees non-skip community segments (such as Point of Interest / Highlight `poi` and audio `mute`) do not trigger destructive timeline jumps.
- **Resilient Background / Paused Video Rendering:** Bound native media `play` and `playing` lifecycle events in `bindVideoSponsorListener` to trigger `renderSponsorProgressBar()`, ensuring sponsor segment visual markers render immediately when background or un-autoplayed videos commence playback, while preserving ad-safe playback gates (`#movie_player.ad-showing`, `ad-interrupting`).

---

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

