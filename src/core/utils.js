/**
 * Libertad - Core Utility Helpers
 * URL parsers and internationalized formatting utilities.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  // Canonical YouTube 11-character Video ID parser
  function parseYouTubeVideoId(input) {
    if (!input || typeof input !== 'string') return null;
    const str = input.trim();
    if (!str) return null;

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    try {
      const url = new URL(str, window.location.origin);
      // youtu.be/ID
      if (url.hostname.includes('youtu.be')) {
        const m = url.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
        if (m) return m[1];
      }
      // ?v=ID
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      // /shorts/ID, /live/ID, /embed/ID, /v/ID
      const match = url.pathname.match(
        /\/(?:shorts|live|embed|v)\/([a-zA-Z0-9_-]{11})/,
      );
      if (match) {
        return match[1];
      }
    } catch (_) {
      const match =
        str.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
        str.match(/\/(?:shorts|live|embed|v)\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Format number with localized compact notation (e.g. 1.5K in EN, 1,5 mil in ES)
  function formatNumber(num, userLang) {
    if (typeof num !== 'number' || !Number.isFinite(num)) return '';
    const lang =
      userLang === 'es'
        ? 'es-ES'
        : userLang === 'en'
          ? 'en-US'
          : typeof navigator !== 'undefined' && navigator.language
            ? navigator.language
            : 'en-US';
    try {
      return new Intl.NumberFormat(lang, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(num);
    } catch (_) {
      if (num >= 1000000)
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      return num.toString();
    }
  }

  globalThis.Libertad.parseYouTubeVideoId = parseYouTubeVideoId;
  globalThis.Libertad.formatNumber = formatNumber;
})();
