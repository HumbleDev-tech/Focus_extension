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

  // --- Libertad Plugin Registry Engine ---
  const registeredModules = new Map();

  function safeRun(moduleName, fn, ...args) {
    if (typeof fn !== 'function') return undefined;
    try {
      return fn(...args);
    } catch (err) {
      console.warn(`[Libertad] Module fault isolated in [${moduleName}]:`, err);
      return undefined;
    }
  }

  function registerModule(name, definition) {
    if (!name || typeof definition !== 'object') return;
    registeredModules.set(name, definition);
  }

  function getModule(name) {
    return registeredModules.get(name);
  }

  function getAllModules() {
    return Array.from(registeredModules.values());
  }

  function broadcastInit(settings) {
    for (const [name, mod] of registeredModules) {
      if (typeof mod.init === 'function') {
        safeRun(name, mod.init.bind(mod), settings);
      }
    }
  }

  function broadcastNavigation(url, settings, phase) {
    for (const [name, mod] of registeredModules) {
      if (typeof mod.onNavigate === 'function') {
        safeRun(name, mod.onNavigate.bind(mod), url, settings, phase);
      }
    }
  }

  function broadcastSettingsChange(settings, changes) {
    for (const [name, mod] of registeredModules) {
      if (typeof mod.onSettingsChange === 'function') {
        safeRun(name, mod.onSettingsChange.bind(mod), settings, changes);
      }
    }
  }

  function broadcastDomMutation(settings) {
    for (const [name, mod] of registeredModules) {
      if (typeof mod.onDomMutation === 'function') {
        safeRun(name, mod.onDomMutation.bind(mod), settings);
      }
    }
  }

  function broadcastDestroy() {
    for (const [name, mod] of registeredModules) {
      if (typeof mod.destroy === 'function') {
        safeRun(name, mod.destroy.bind(mod));
      }
    }
  }

  globalThis.Libertad.parseYouTubeVideoId = parseYouTubeVideoId;
  globalThis.Libertad.formatNumber = formatNumber;
  globalThis.Libertad.isSpanishLocale = isSpanishLocale;
  globalThis.Libertad.isPortugueseLocale = isPortugueseLocale;

  globalThis.Libertad.safeRun = safeRun;
  globalThis.Libertad.registerModule = registerModule;
  globalThis.Libertad.getModule = getModule;
  globalThis.Libertad.getAllModules = getAllModules;
  globalThis.Libertad.broadcastInit = broadcastInit;
  globalThis.Libertad.broadcastNavigation = broadcastNavigation;
  globalThis.Libertad.broadcastSettingsChange = broadcastSettingsChange;
  globalThis.Libertad.broadcastDomMutation = broadcastDomMutation;
  globalThis.Libertad.broadcastDestroy = broadcastDestroy;
})();
