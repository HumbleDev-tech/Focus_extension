# Changelog

## [1.3.1]
- **Decisive Initial Preset UX:** Set `BALANCED` as the default and clearly badged `RECOMMENDED` (`RECOMENDADO`) in both the welcome onboarding flow and default configuration, ensuring new users immediately experience distraction removal.
- **Switch Cannibalization Transparency:** When `Direct to Subscriptions` (`redirectHomeSubscriptions`) is active, the `Home Feed` card is visually attenuated and tagged with `[OVERRIDDEN BY REDIRECT]` / `[ANULADO POR REDIRECCIÓN]` to clarify functional priority.
- **Dynamic "CUSTOM" Feedback:** Added an explicit `CUSTOM` active preset pill to the preset track (expanding seamlessly into a 5-column layout) and a header status indicator whenever manual toggle adjustments deviate from established presets.
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

