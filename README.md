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

### 1. Instant Focus Presets
Switch between curated focus profiles with a single click or create your own:

| Preset | Home Feed | Related Sidebar | Comments | Shorts | End Screens | Center Player |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **OFF** | Shown | Shown | Shown | Shown | Shown | No |
| **BASIC** | Shown | Shown | **Hidden** | Shown | **Hidden** | No |
| **BALANCED** | Shown | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Yes** |
| **EXTREME (Zen)** | **Hidden (Zen)** | **Hidden** | **Hidden** | **Hidden** | **Hidden** | **Yes** |
| **CUSTOM** | *Saved* | *Saved* | *Saved* | *Saved* | *Saved* | *Conditional* |

* **Off**: Clean passthrough mode; leaves YouTube unaltered.
* **Basic**: Removes common watch clutter (comments and end-screen cards).
* **Balanced** *(Recommended)*: Keeps search and navigation accessible while eliminating rabbit holes (sidebar recommendations, shorts, and comments).
* **Extreme (Zen Mode)**: Complete distraction elimination. Replaces the algorithmic homepage with an intentional, centered search prompt.
* **Custom**: Automatically remembers and persists your individual fine-tuned toggle preferences.

---

### 2. Granular Distraction Shields (Fine-Tuning)

Every interface component can be independently controlled:

* **Home Feed & Zen Mode**: Suppresses the infinite video recommendation grid on the homepage (`/`). When enabled, displays an intentional, minimalist search prompt that encourages purposeful searches rather than passive scrolling.
* **Related Sidebar & Auto-Centering**: Removes watch-next suggestions and algorithmically recommended videos beside the player. Automatically centers the main video player in theater style to prevent awkward whitespace.
* **Comments Section**: Hides the entire comment stream across all video watch pages to avoid engagement traps and toxic comment sections.
* **Shorts Eradication**: Strips Shorts shelves, navigation drawer links, mini-guide buttons, and feed entries across the entire YouTube interface.
* **End Screen Cards**: Suppresses popup overlay cards, subscribe buttons, and teaser cards that obstruct the final seconds of videos.

---

### 3. Auxiliary Power Modules

* **Restore YouTube Dislikes**:
  * Seamlessly connects to the community-driven [Return YouTube Dislike API](https://returnyoutubedislikeapi.com).
  * Injects public dislike metrics directly into the native YouTube action bar with localized formatting (`1.4K`, `25M`).
  * Features an in-memory cache to prevent redundant network requests and maximize responsiveness.

* **Title Untranslation Engine**:
  * Reverses YouTube's forced automatic translations, restoring the creator's original video title in the original language.
  * Operates across both watch pages and video feeds using an asynchronous queue with bounded concurrency (`MAX_CONCURRENT_FEED_FETCHES = 8`).

---

### 4. Interface & Ergonomics

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

## Building & Packaging

The repository includes automated packaging scripts to build clean distribution `.zip` archives ready for upload to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):

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
