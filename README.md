# Libertad — YouTube Focus & Distraction Free

> **Reclaim your attention.** A modern, distraction-free Chrome extension for YouTube that eliminates algorithmic traps, hides unwanted noise, and brings peace to your workflow.

---

## ✨ Features

- **⚡ Instant Focus Presets**:
  - **Off**: Standard YouTube experience.
  - **Basic**: Hides comments and video endscreen overlays.
  - **Balanced**: Hides sidebar recommendations, comments, shorts, and endscreens.
  - **Extreme (Zen)**: Zero clutter. Home feed, sidebar, comments, and shorts are completely removed. Displays a peaceful Zen prompt to encourage intentional searching.
- **🛠️ Granular Custom Controls**:
  - Toggle individual components (Home Feed, Related Sidebar, Comments, Shorts, Endscreens).
- **👎 Return YouTube Dislikes**:
  - Restores dislike counts directly on the video action bar using the official Return YouTube Dislike API.
- **🚀 Ultra-fast & Zero-Flicker**:
  - Injects dynamic CSS at `document_start` to prevent content flashing (FOUC).
  - Listens to YouTube SPA navigation events (`yt-navigate-finish`) for seamless single-page application browsing.
- **🎨 Modern Dark UI**:
  - Sleek, glassmorphism-inspired popup interface built with pure vanilla CSS and micro-interactions.

---

## 📦 How to Install (Developer Mode)

1. Open your Chromium browser (Google Chrome, Brave, Microsoft Edge).
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select this directory (`Focus_extension`).
5. Pin **Libertad** to your browser toolbar and open [YouTube](https://www.youtube.com).

---

## 🔒 Privacy & Permissions

Libertad values your privacy:
- Operates 100% locally in your browser.
- No analytics, tracking, or personal data collection.
- Permissions requested:
  - `storage`: Saves your custom focus preferences locally.
  - `activeTab` & `scripting`: Dynamically applies visual styles to YouTube.
  - `returnyoutubedislikeapi.com`: Fetches public dislike statistics for the active video.

---

## 📄 License
MIT License.
