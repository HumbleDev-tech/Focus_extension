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

    // High-performance regex fast paths (avoids URL object heap allocation)
    const fastV = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (fastV) return fastV[1];

    const fastPath = str.match(
      /(?:youtu\.be\/|\/(?:shorts|live|embed|v)\/)([a-zA-Z0-9_-]{11})/,
    );
    if (fastPath) return fastPath[1];

    // Fallback parser via standard URL
    try {
      const url = new URL(str, window.location.origin);
      if (url.hostname.includes('youtu.be')) {
        const m = url.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
        if (m) return m[1];
      }
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const match = url.pathname.match(
        /\/(?:shorts|live|embed|v)\/([a-zA-Z0-9_-]{11})/,
      );
      if (match) {
        return match[1];
      }
    } catch (_) {}

    return null;
  }

  // Format number with localized compact notation (e.g. 1.5K in EN, 1,5 mil in ES)
  function formatNumber(num, userLang) {
    if (typeof num !== 'number' || !Number.isFinite(num)) return '';
    const lang =
      userLang === 'es' || isSpanishLocale(userLang)
        ? 'es-ES'
        : userLang === 'pt' || isPortugueseLocale(userLang)
          ? 'pt-BR'
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

  // Detect all Spanish regional variants (es, es-419, es-ES, es-MX, es-AR, etc.)
  function isSpanishLocale(langStr) {
    if (!langStr || typeof langStr !== 'string') return false;
    const clean = langStr.trim().toLowerCase();
    return clean === 'es' || clean.startsWith('es-') || clean.startsWith('es_');
  }

  // Detect all Portuguese regional variants (pt, pt-BR, pt-PT, pt-AO, pt-MZ, etc.)
  function isPortugueseLocale(langStr) {
    if (!langStr || typeof langStr !== 'string') return false;
    const clean = langStr.trim().toLowerCase();
    return clean === 'pt' || clean.startsWith('pt-') || clean.startsWith('pt_');
  }

  globalThis.Libertad.parseYouTubeVideoId = parseYouTubeVideoId;
  globalThis.Libertad.formatNumber = formatNumber;
  globalThis.Libertad.isSpanishLocale = isSpanishLocale;
  globalThis.Libertad.isPortugueseLocale = isPortugueseLocale;
})();
