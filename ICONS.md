# Iconography

Libertad keeps a single visual language for its UI: **every UI icon shipped in the extension is a verbatim copy of [Lucide](https://lucide.dev)** (current version). There is no icon library, icon font, CDN, or runtime dependency — the SVGs live inline in the markup and in JavaScript templates.

## The rule

1. Go to [lucide.dev](https://lucide.dev), find the icon, click **Copy SVG**.
2. Keep the outer `<svg>` attributes already used by the project (`viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`) and paste the child elements **as-is**; keep the local `width`/`height` and the file's 2-space indentation.
3. Never redraw, adapt, or mix icon generations (classic Feather, older Lucide). If an existing icon's artwork no longer matches current Lucide, replace it with the current artwork.
4. Follow the local close-tag style: `popup.html` closes children as `></path>` (the closing tag on the same line), `popup.js` templates match their surrounding block, and long paths follow the existing wrapping style of the file.

## Exceptions (do not replace)

- The PNG logo in [`icons/`](icons/) — project identity.
- The Zen-mode sun glyph in [`src/modules/zen.js`](src/modules/zen.js) — project identity (logo motif).
- The GitHub brand mark in [`popup.html`](popup.html) and [`welcome.html`](welcome.html) — a third-party brand logo, not a UI icon.
- YouTube's own `yt-icon` elements — not ours to restyle.

## Inventory (Lucide name ↔ usage)

| Icon | Where |
|---|---|
| `settings` | Header gear |
| `shield` | Focus Shield section |
| `house` | Home Feed toggle |
| `list-video` | Redirect home → Subscriptions |
| `panel-right` | Sidebar toggle |
| `message-square` | Comments toggle |
| `monitor-up` | End Screens toggle |
| `mic` | Voice Mic |
| `bell` | Bell Alerts / Reminders |
| `square-dot` | Watermark |
| `badge-dollar-sign` | Paid Promo |
| `picture-in-picture-2` | Miniplayer |
| `tv-minimal-play` | Play on TV |
| `captions` | Subtitles chip |
| `ellipsis` | 3-Dots Menu |
| `thumbs-up` / `thumbs-down` | Like / Dislike |
| `sparkle` | Ask AI |
| `pen` | Profile rename (`popup.js`) |
| `dollar-sign` | Sponsors |
| `megaphone` | Self-Promo |
| `file-text` | Untranslate · Description; welcome changelog link |
| `globe` | Untranslate master toggle |
| `languages` | Untranslate · Captions |
| `list` | Untranslate · Chapters |
| `puzzle` | `welcome.html` pin guide |

Other toggles and chips reuse the same set: `circle-alert`, `circle-plus`, `circle-play`, `skip-forward`, `maximize`, `download`, `scissors`, `user`, `user-plus`, `share-2`, `bookmark`, `filter`, `coffee`, `check`, `x`, `zap`, `music`, `compass`, `volume-2`, `shopping-bag`, `layout-grid`, `trending-up`, `award`, `type`, `eye`, `eye-off`, `play`, `square-square`, `pin`.

## Building icons in JavaScript

- Prefer inline template strings with the same markup as the HTML files (see the profile-row buttons in [`popup.js`](popup.js)).
- When creating SVG nodes programmatically, use `document.createElementNS('http://www.w3.org/2000/svg', tag)` plus `setAttribute`; see [`src/modules/sponsors.js`](src/modules/sponsors.js) for an example.
- Never fetch SVGs from a remote source at runtime.
