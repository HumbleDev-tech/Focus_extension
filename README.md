<p align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Libertad Logo" />
</p>

<h1 align="center">Libertad for YouTube — Focus & Distraction-Free</h1>

<p align="center">
  <strong>Reclaim your attention. Watch what you actually chose to watch — without feeds, shorts, or clickbait pulling you in.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue.svg?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg?style=flat-square" alt="Version 1.0.0" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Telemetry-Zero-brightgreen.svg?style=flat-square" alt="Zero Telemetry" />
  <img src="https://img.shields.io/badge/Dependencies-Vanilla%20JS-orange.svg?style=flat-square" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Languages-EN%20%7C%20ES%20%7C%20PT-lightgrey.svg?style=flat-square" alt="Languages" />
</p>

<!-- ================================================================= -->
<!-- SCREENSHOT PLACEHOLDER: Hero / Watch Focus View                  -->
<!-- (Replace this comment with: <p align="center"><img src="assets/..." width="100%" /></p>) -->
<!-- ================================================================= -->

---

## Table of Contents

* [Why Libertad?](#why-libertad)
* [Focus Presets](#focus-presets)
* [Granular Features](#granular-features)
* [Extra Utilities (Dislikes, SponsorBlock, Untranslate)](#extra-utilities)
* [Themes & Ergonomics](#themes--ergonomics)
* [Installation (Developer Mode)](#installation-developer-mode)
* [Development](#development)
* [Project Structure](#project-structure)
* [Privacy](#privacy)
* [Acknowledgements](#acknowledgements)
* [Support](#support)
* [License](#license)

---

## Why Libertad?

YouTube is a great place to learn, research, and listen to music, but the modern interface is packed with recommendation traps, endless Shorts, notification badges, and clutter engineered to keep you clicking.

I built **Libertad** to get that focus back. It lets you watch what you searched for without having algorithms dictate what you see next.

* **Fast and zero bloat:** 100% pure Vanilla JavaScript. No React, no heavy frameworks, no npm runtime dependencies. It loads instantly and consumes almost no memory.
* **Easy presets:** One click switches between clean passthrough, basic clutter cleanup, balanced daily focus, or a minimalist Zen mode (replaces the homepage with a simple search prompt).
* **Power utilities included:** Restores public dislikes, auto-skips sponsored segments (with an interactive Undo/Unskip button), and neutralizes forced auto-translated titles and synthetic AI audio dubs.
* **Private by design:** Zero telemetry, zero trackers, and minimal permissions. Everything stays in your browser.

---

## Focus Presets

Choose a curated mode directly from the top preset bar, or customize any of the 31 switches to fit your workflow:

| Feature / Element | OFF | BASIC | BALANCED *(Default)* | EXTREME *(Zen)* |
| :--- | :---: | :---: | :---: | :---: |
| **Home Feed (Zen Prompt)** | Shown | Shown | Shown | **Minimal Search** |
| **Direct to Subscriptions** | Off | Off | Off | Off |
| **Related Sidebar & Up Next** | Shown | Shown | **Hidden** | **Hidden** |
| **Shorts (Feeds, Nav & Redirects)** | Shown | **Hidden** | **Hidden** | **Hidden** |
| **End Screen Cards** | Shown | **Hidden** | **Hidden** | **Hidden** |
| **Comments Stream** | Shown | Shown | Shown | **Hidden** |
| **Header (Voice, Create, Bell)** | Shown | Shown | **Hidden** | **Hidden** |
| **Search Suggestions & Filter Chips** | Shown | Shown | Shown | **Hidden** |
| **Player Overlays & Watermarks** | Shown | **Hidden** | **Hidden** | **Hidden** |
| **Autoplay & Miniplayer** | Shown | Shown | **Hidden** | **Hidden** |
| **Promotional (Ask AI, Download, Merch)** | Shown | **Hidden** | **Hidden** | **Hidden** |
| **Monetization (Join, Thanks, Clips)** | Shown | Shown | **Hidden** | **Hidden** |
| **Social Actions (Share, Save, 3-Dots)** | Shown | Shown | Shown | **Hidden** |
| **Video Metrics (Likes, Views, Subs)** | Shown | Shown | Shown | **Hidden** |
| **Feeds (Live Chat, Trending, More from YT)** | Shown | Shown | **Hidden** | **Hidden** |

> **Note:** Toggling any individual switch automatically preserves your custom setup under the **CUSTOM** preset.

<!-- ================================================================= -->
<!-- SCREENSHOT PLACEHOLDER: Preset Bar & Navigation Tabs             -->
<!-- ================================================================= -->

---

## Granular Features

Controls are neatly organized into two main tabs inside the popup:

* **Focus Shield:** High-impact blockers for algorithmic distractions (Home feed / Zen search prompt, Subscriptions redirect, related sidebar with video auto-centering, comments, shorts eradication with standard player redirect, and end-screen cards).
* **UI Cleaner:** 25 modular toggles grouped by area to strip clutter:
  * *Header & Search:* Voice search mic, create button, notifications bell, autocomplete suggestions, feed filter chips.
  * *Player Controls & Overlays:* Autoplay switch, up-next tiles, channel watermarks, paid promo banners, miniplayer.
  * *Action Bar & Social:* Ask AI button, download button, thanks/clips, join button, share, save to playlist, like/dislike counts, subscribe button, subscriber count, views/date, 3-dots overflow menu.
  * *Feeds & Navigation:* Merch shelves, live chat & replay, trending/explore links, "More from YouTube" sections.

<!-- ================================================================= -->
<!-- SCREENSHOT PLACEHOLDER: UI Cleaner & Focus Shield Tabs           -->
<!-- ================================================================= -->

---

## Extra Utilities

In the **Extras** tab, Libertad bundles three community-backed power modules:

1. **Restore Dislikes:** Connects to the [Return YouTube Dislike API](https://returnyoutubedislikeapi.com) to show public dislike counts directly in the native action bar with compact formatting (`1.2K`, `50M`).
2. **SponsorBlock Integration:** Automatically skips sponsored segments, intros, and subscribe reminders using [SponsorBlock](https://sponsor.ajay.app).
   * Renders color-coded segments directly on the player timeline.
   * Includes an on-screen **"Unskip" / "Deshacer"** toast button so you can easily undo any skip with a single click.
3. **Untranslate & Original Audio Suite:**
   * Stops YouTube from forcing synthetic multilingual AI audio dubs, locking playback to the creator's authentic voice.
   * Restores original, non-translated video titles, descriptions, and timeline chapters.

<!-- ================================================================= -->
<!-- SCREENSHOT PLACEHOLDER: Dislikes, SponsorBlock & Player Extras    -->
<!-- ================================================================= -->

---

## Themes & Ergonomics

* **Themes:** Auto (follows your system dark/light mode), Dark, Light, and a true **OLED Black (`#000000`)** mode.
* **UI Scaling:** Auto DPI detection, plus manual overrides for **1x** (standard), **1.2x** (1440p), and **1.4x** (4K / ultrawide).
* **Languages:** Fully localized in **English (EN)**, **Spanish (ES)**, and **Portuguese (PT)** with auto-detection.

<!-- ================================================================= -->
<!-- SCREENSHOT PLACEHOLDER: Themes (Dark, Light, OLED) & Settings     -->
<!-- ================================================================= -->

---

## Installation (Developer Mode)

Works on any Chromium-based browser (Chrome, Brave, Edge, Opera, Vivaldi):

1. Clone or download this repository:
   ```bash
   git clone https://github.com/HumbleDev-tech/Focus_extension.git
   ```
2. Open your browser extensions page:
   * **Chrome / Brave:** `chrome://extensions/`
   * **Edge:** `edge://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `Focus_extension` directory.
5. Pin **Libertad** to your toolbar and head over to [YouTube](https://www.youtube.com).

---

## Development

Code formatting and quality checks are handled by [Biome](https://biomejs.dev):

```bash
# Check formatting and linting
npm run check

# Auto-format files
npm run format

# Run linter only
npm run lint

# Build a clean .zip package for the Chrome Web Store
npm run pack
```

---

## Project Structure

```text
Focus_extension/
├── _locales/              # Extension translations (en, es, pt_BR, pt_PT)
├── icons/                 # Brand iconography (16, 48, 128px)
├── src/
│   ├── core/              # LRU cache & helper utilities
│   ├── injected/          # Isolated agent running in MAIN world (Anti-AI dubbing & player API)
│   └── modules/           # Dislikes, sponsors, untranslate, styles, shorts, subscriptions
├── background.js          # Service worker with 2-level persistent caching
├── constants.js           # Single source of truth for presets and toggle definitions
├── content.js             # SPA navigation router and module orchestrator
├── popup.html             # Tri-tab control surface with settings drawer
├── popup.css              # Themeable CSS design system
├── popup.js               # Popup interactions and auto-system detection
├── theme-init.js          # Synchronous anti-FOUC theme bootstrapper
└── pack.py                # Automated packaging script
```

---

## Privacy

Libertad is strictly privacy-first:

* **Zero Telemetry:** No analytics, no behavioral loggers, no tracking scripts.
* **On-Device Storage:** All preferences stay inside your browser's private `chrome.storage.sync`.
* **Minimal Permissions:** Only requests access to `storage` and YouTube domains. API requests (Dislikes, SponsorBlock, oEmbed) only transmit public video IDs when those specific features are turned on.

Read our complete [Privacy Policy](PRIVACY.md).

---

## Acknowledgements

Big thanks to the open-source projects and community initiatives that make this possible:

* **[Return YouTube Dislike](https://returnyoutubedislike.com):** For the public API powering the dislike counter.
* **[SponsorBlock](https://sponsor.ajay.app):** For the community-driven sponsorship timestamps (licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)).
* **[Feather Icons](https://feathericons.com) / [Lucide](https://lucide.dev):** For the clean SVG icons used across the popup.
* **[Biome](https://biomejs.dev):** For fast, reliable linting and formatting.
* **Distraction-Free Community:** Inspired by the philosophy of tools like *Unhook* and open-source untranslate scripts.

---

## Support

Libertad is 100% free and open-source. If this extension saves you hours of distraction, helps you study, or makes YouTube a calmer place to use, buying me a coffee is a huge motivation to keep maintaining it:

☕ **[Support on Ko-fi](https://ko-fi.com/humbledevtech)**

Every contribution helps keep this project independent and actively maintained.

---

## License

Open-source software released under the **[MIT License](LICENSE)**.  
Created and maintained by **[HumbleDev-tech](https://github.com/HumbleDev-tech)**.
