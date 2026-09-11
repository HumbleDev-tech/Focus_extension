# Libertad - YouTube Focus & Distraction Free

A high-performance, distraction-free browser extension for YouTube. Eliminates algorithmic recommendation loops, suppresses interface clutter, and restores intentionality to video viewing.

---

## Features

- **Instant Focus Presets**:
  - **Off**: Default YouTube experience without interference.
  - **Basic**: Suppresses comments and endscreen interactive cards.
  - **Balanced**: Suppresses sidebar recommendations, comments, shorts feeds, and endscreens.
  - **Extreme (Zen)**: Complete distraction elimination. Home feed, sidebar, comments, and shorts are fully disabled. Activates an intentional search prompt on the homepage.
- **Granular Component Controls**:
  - Independent toggles for Home Feed, Related Sidebar, Comments, Shorts, and Endscreens.
- **Return YouTube Dislikes**:
  - Restores public dislike metrics directly into the native video action bar via the community API.
- **Title Untranslation**:
  - Prevents automated local translation of video titles, maintaining the original creator title across watch and feed pages.
- **High-Performance Injection**:
  - Dynamic stylesheet injection at `document_start` to prevent Flash of Unstyled Content (FOUC).
  - Listens to YouTube SPA navigation lifecycle events (`yt-navigate-finish`) for seamless client-side routing.
- **Industrial Minimalist Interface**:
  - High-contrast, tactile popup interface engineered with pure CSS, zero external dependencies, and low memory overhead.

---

## Installation (Developer Mode)

1. Open a Chromium-based browser (Google Chrome, Brave, Microsoft Edge).
2. Navigate to `chrome://extensions/`.
3. Toggle **Developer mode** in the top right corner.
4. Select **Load unpacked** and choose this directory (`Focus_extension`).
5. Pin **Libertad** to the toolbar and open [YouTube](https://www.youtube.com).

---

## Privacy and Permissions

Libertad operates entirely on-device with zero telemetry:
- **No telemetry or logging**: Zero analytical scripts, advertising trackers, or telemetry endpoints.
- **Local synchronization**: Preference configurations are stored exclusively within `chrome.storage.sync`.
- **Permissions breakdown**:
  - `storage`: Preserves user configuration across browser sessions.
  - Host permissions (`*.youtube.com`, `returnyoutubedislikeapi.com`): Enables stylesheet rules and requests dislike counts directly.

---

## License

MIT License.
