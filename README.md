<p align="center">
  <img src="icons/icon128.png" width="96" height="96" alt="Libertad Logo" />
</p>

<h1 align="center">Libertad — YouTube Focus & Distraction-Free</h1>

<p align="center">
  <strong>Reclaim your attention. Break algorithmic recommendation loops and experience YouTube with intention.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue.svg?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Telemetry-Zero%20%2F%20None-brightgreen.svg?style=flat-square" alt="Zero Telemetry" />
  <img src="https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-orange.svg?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/Language-EN%20%7C%20ES-lightgrey.svg?style=flat-square" alt="Languages" />
</p>

---

## Overview

Modern video platforms are engineered around algorithmic feedback loops designed to maximize watch time rather than viewer intention. **Libertad** is an ultra-lightweight, high-performance browser extension built with pure vanilla web standards. It gives you complete control over YouTube's user interface, eliminating clutter, recommendations, and manipulative engagement mechanics.

Whether you need a distraction-free environment for research and study, or a minimalist aesthetic tailored to OLED displays, Libertad lets you watch what you chose to watch—and nothing else.

---

## Key Features

### 1. Dual-Tab Ergonomic Navigation
Libertad organizes controls into two purpose-built workspaces without vertical clutter:
* **🛡️ Focus Shield**: Core presets and distraction-elimination shields for algorithmic feeds and comment sections.
* **🧹 UI Cleaner**: Surgical removal of promotional, experimental, and secondary action buttons across YouTube's header and video player.

---

### 2. Instant Focus Presets (Integrated Matrix)
Switch between curated focus profiles with a single click or tailor your own:

| Preset | Home Feed | Sidebar | Comments | Shorts | Voice Search | Create (+) | Notifications | Ask AI | Download | Thanks/Clips | Join | Share | Merch |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **OFF** | Shown | Shown | Shown | Shown | Shown | Shown | Shown | Shown | Shown | Shown | Shown | Shown | Shown |
| **BASIC** | Shown | Shown | **Hidden** | Shown | Shown | Shown | Shown | **Hidden** | **Hidden** | Shown | Shown | Shown | **Hidden** |
| **BALANCED** | Shown | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | Shown | **Hidden** |
| **EXTREME** | **Zen** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Hidden** |
| **CUSTOM** | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* |

* **Off**: Clean passthrough mode; leaves YouTube unaltered.
* **Basic**: Removes common watch clutter (comments, end-screens, promotional download buttons, AI popups, and product shelves).
* **Balanced** *(Recommended)*: Eliminates recommendation loops and bloat buttons (sidebar recommendations, shorts, comments, voice search mic, create button, notifications bell, channel memberships, and clutter buttons).
* **Extreme (Zen Mode)**: Complete distraction and clutter elimination. Replaces the homepage with an intentional search prompt and strips all auxiliary action and sharing buttons.
* **Custom**: Automatically remembers and persists your individual fine-tuned preferences across all switches in both tabs.

---

### 3. Granular Distraction Shields (Focus Tab)

* **Home Feed & Zen Mode**: Suppresses the infinite video recommendation grid on the homepage (`/`). When enabled, displays an intentional, minimalist search prompt that encourages purposeful searches rather than passive scrolling.
* **Related Sidebar & Auto-Centering**: Removes watch-next suggestions and algorithmically recommended videos beside the player. Automatically centers the main video player in theater style to prevent awkward whitespace.
* **Comments Section**: Hides the entire comment stream across all video watch pages to avoid engagement traps and toxic comment sections.
* **Shorts Eradication**: Strips Shorts shelves, navigation drawer links, mini-guide buttons, and feed entries across the entire YouTube interface.
* **End Screen Cards**: Suppresses popup overlay cards, subscribe buttons, and teaser cards that obstruct the final seconds of videos.

---

### 4. YouTube De-Bloating & Action Cleaner (Cleaner Tab)

* **Header Voice Search Mic**: Removes the microphone icon beside the search bar for a clean, minimalist header.
* **Create / Upload Button**: Suppresses the video creation and live broadcast button (`+`) in YouTube's top masthead bar.
* **Notifications Bell**: Suppresses the notification bell and alert badges to prevent anxiety and notification-driven rabbit holes.
* **Ask AI Assistant Button**: Suppresses YouTube's experimental conversational AI button on video watch pages.
* **Promotional Download Button**: Suppresses the download button that prompts users to purchase YouTube Premium.
* **Engagement Clutter (Thanks, Clips & Remix)**: Strips monetization and remixing action buttons from the primary video control bar.
* **Channel Memberships (Join Button)**: Suppresses the promotional "Join" / "Unirse" button beside the Subscribe button.
* **Video Share Button**: Suppresses the share button for an ultra-focused, cinema-grade watch experience.
* **Merch & Products**: Suppresses shopping carousels, affiliate product shelves, and store banners below videos.

---

### 5. Auxiliary Power Modules

* **Restore YouTube Dislikes**:
  * Seamlessly connects to the community-driven [Return YouTube Dislike API](https://returnyoutubedislikeapi.com).
  * Injects public dislike metrics directly into the native YouTube action bar with localized formatting (`1.4K`, `25M`).
  * Features an in-memory cache to prevent redundant network requests and maximize responsiveness.

* **Title Untranslation Engine**:
  * Reverses YouTube's forced automatic translations, restoring the creator's original video title in the original language.
  * Operates across both watch pages and video feeds using an asynchronous queue with bounded concurrency (`MAX_CONCURRENT_FEED_FETCHES = 8`).

---

### 6. Interface & Ergonomics

* **Tri-Theme Engine**:
  * **Dark**: Industrial graphite palette with high readability.
  * **Light**: Clean, high-contrast laboratory aesthetic.
  * **OLED**: Pure `#000000` pitch black engineered for OLED displays and maximum power efficiency.
* **UI Display Scaling**:
  * One-touch zoom controls for popup comfort: **1x** (Standard), **1.15x** (Optimized for 27" 1440p displays), and **1.25x** (Optimized for 4K / high-DPI displays).
* **Bilingual Localization (i18n)**:
  * Full runtime translation between **English (EN)** and **Spanish (ES)** for all popup controls and tooltips, alongside native Chrome `_locales` support.

---

## Technical Architecture & Performance

* **Zero External Runtime Dependencies**: Built with 100% pure Vanilla JavaScript, modern HTML5, and CSS variables. Zero npm bloat, zero bundlers required.
* **Instant Injection (`document_start`)**: Stylesheet rules are injected dynamically at DOM initialization to eliminate Flash of Unstyled Content (FOUC).
* **SPA Lifecycle Integration**: Listens directly to YouTube's internal single-page navigation events (`yt-navigate-finish`) to ensure styles and modules stay synchronized across client-side page transitions.
* **Local-First Storage**: User settings and custom toggle states are persisted via `chrome.storage.sync`, synchronizing seamlessly across all logged-in browser instances.
* **Manifest V3 Compliant**: Built strictly adhering to the latest Chrome Extension security standards.

---

## Installation (Developer Mode)

To install and test Libertad locally in any Chromium-based browser (Google Chrome, Brave, Edge, Opera, Vivaldi):

1. Clone or download this repository:
   ```bash
   git clone https://github.com/HumbleDev-tech/Focus_extension.git
   ```
2. Open your browser and navigate to the extensions management page:
   * **Chrome / Brave**: `chrome://extensions/`
   * **Edge**: `edge://extensions/`
3. Enable **Developer mode** via the toggle switch in the top-right corner.
4. Click **Load unpacked** and select the root directory of this repository (`Focus_extension`).
5. Pin **Libertad** to your browser toolbar and open [YouTube](https://www.youtube.com).

---

## Development & Quality Checks

This project uses **[Biome](https://biomejs.dev)** for ultra-fast linting, formatting, and accessibility checks:

```bash
# Check formatting, linter rules, and syntax standards
npm run check

# Automatically format all source files
npm run format

# Run linter only
npm run lint
```

---

## Building & Packaging

The repository includes automated packaging scripts to build clean distribution `.zip` archives ready for upload to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):

### Using npm:
```bash
npm run pack
```

### Using Python:
```bash
python3 pack.py
```

### Using Bash:
```bash
./pack.sh
```

The script automatically filters out git metadata, editor files, and temporary artifacts, outputting `libertad-extension.zip`.

---

## Privacy & Security

Libertad is built on strict privacy-first principles:

* **Zero Telemetry**: Contains no tracking scripts, analytics, or behavioral loggers.
* **On-Device Execution**: All preferences and configurations are stored locally or synced strictly within your browser's private `chrome.storage.sync`.
* **Minimal Permissions**: Requests only the permissions strictly necessary to function (`storage` and YouTube host access).

Read our full [Privacy Policy](PRIVACY.md) for complete details.

---

## License

This project is open-source software licensed under the **[MIT License](LICENSE)**.  
Created and maintained by **[HumbleDev-tech](https://github.com/HumbleDev-tech)**.
