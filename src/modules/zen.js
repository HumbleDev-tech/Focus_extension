/**
 * Libertad - Zen Mode Plugin
 * Manages intentional focus card rendering on YouTube Home feed.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  const ZEN_CONTAINER_ID = 'libertad-zen-container';
  let lastZenTargetContainer = null;
  let currentModuleSettings = null;

  const ZEN_TEXTS = {
    es: {
      status: 'ENFOQUE ACTIVO',
      title: 'Modo Intencional Activo',
      desc: 'Recomendaciones de feed suprimidas. Realiza una búsqueda arriba para encontrar contenido específico.',
    },
    pt: {
      status: 'FOCO ATIVO',
      title: 'Modo Intencional Ativo',
      desc: 'Recomendações de feed suprimidas. Faça uma pesquisa acima para encontrar conteúdo específico.',
    },
    en: {
      status: 'FOCUS ACTIVE',
      title: 'Intentional Mode Active',
      desc: 'Feed recommendations suppressed. Use the search bar above to find specific content.',
    },
  };

  function resolveLanguage(settings) {
    const isSpanish =
      settings.lang === 'es' ||
      ((!settings.lang || settings.lang === 'auto') &&
        typeof navigator !== 'undefined' &&
        (globalThis.Libertad.isSpanishLocale
          ? globalThis.Libertad.isSpanishLocale(navigator.language)
          : navigator.language?.toLowerCase().startsWith('es')));
    const isPortuguese =
      settings.lang === 'pt' ||
      ((!settings.lang || settings.lang === 'auto') &&
        typeof navigator !== 'undefined' &&
        (globalThis.Libertad.isPortugueseLocale
          ? globalThis.Libertad.isPortugueseLocale(navigator.language)
          : navigator.language?.toLowerCase().startsWith('pt')));
    return isSpanish ? 'es' : isPortuguese ? 'pt' : 'en';
  }

  function resolveTheme(settings) {
    let resolvedTheme = settings.theme || 'auto';
    if (resolvedTheme === 'auto') {
      const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.body?.hasAttribute('dark') ||
        Boolean(document.querySelector('ytd-app[dark]')) ||
        Boolean(document.querySelector('html[dark]')) ||
        (typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
      resolvedTheme = isDark ? 'dark' : 'light';
    }
    return resolvedTheme;
  }

  function resolveScale(settings) {
    let resolvedScale = settings.scale || 'auto';
    if (resolvedScale === 'auto') {
      const screenW =
        typeof window !== 'undefined' && window.screen
          ? window.screen.width || 1920
          : 1920;
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const effectiveW = screenW * dpr;
      if (screenW >= 3440 || (effectiveW >= 3840 && dpr < 1.5)) {
        resolvedScale = '140';
      } else if (screenW >= 2400 || (effectiveW >= 2560 && dpr <= 1.25)) {
        resolvedScale = '120';
      } else {
        resolvedScale = '100';
      }
    }
    return resolvedScale;
  }

  function applyZenAttributes(el, theme, scale, lang) {
    if (!el) return;
    el.dataset.theme = theme;
    el.dataset.scale = scale;
    el.dataset.lang = lang;
  }

  function buildCardHtml(texts) {
    return `
      <div class="libertad-zen-card">
        <div class="libertad-zen-brand">
          <span class="libertad-zen-brand-title">LIBERTAD</span>
          <div class="libertad-zen-status">
            <span class="libertad-zen-dot"></span>
            <span>${texts.status}</span>
          </div>
        </div>
        <div class="libertad-zen-icon-wrapper">
          <svg class="libertad-zen-svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <circle cx="12" cy="12" r="2.5"/>
          </svg>
        </div>
        <div class="libertad-zen-title">${texts.title}</div>
        <p class="libertad-zen-desc">${texts.desc}</p>
      </div>
    `;
  }

  function findTargetContainer() {
    if (lastZenTargetContainer?.isConnected) {
      return lastZenTargetContainer;
    }
    const container =
      document.querySelector(
        'ytd-browse[page-subtype="home"]:not([hidden]) #primary',
      ) ||
      document.querySelector('ytd-browse[page-subtype="home"]:not([hidden])') ||
      document.querySelector('ytd-browse:not([hidden]) #primary') ||
      document.querySelector('ytd-browse[page-subtype="home"] #primary') ||
      document.querySelector('ytd-browse #primary') ||
      document.querySelector('ytd-browse[page-subtype="home"]') ||
      document.querySelector('ytd-browse');
    if (container) {
      lastZenTargetContainer = container;
    }
    return container;
  }

  function updateZenBanner(settings) {
    const activeSettings = settings || currentModuleSettings;
    if (!activeSettings || typeof activeSettings !== 'object') return;

    const isHomePage =
      window.location.pathname === '/' || window.location.pathname === '';
    const existing = document.getElementById(ZEN_CONTAINER_ID);

    // If home is redirected to subscriptions, or not on home, or hideHomeFeed is disabled
    if (
      activeSettings.redirectHomeToSubscriptions ||
      !isHomePage ||
      !activeSettings.hideHomeFeed
    ) {
      lastZenTargetContainer = null;
      if (existing) existing.remove();
      return;
    }

    const langKey = resolveLanguage(activeSettings);
    const resolvedTheme = resolveTheme(activeSettings);
    const resolvedScale = resolveScale(activeSettings);
    const texts = ZEN_TEXTS[langKey] || ZEN_TEXTS.en;

    const targetContainer = findTargetContainer();
    if (!targetContainer) {
      return;
    }

    if (existing) {
      const langChanged = existing.dataset.lang !== langKey;
      applyZenAttributes(existing, resolvedTheme, resolvedScale, langKey);
      if (langChanged || !existing.firstElementChild) {
        existing.innerHTML = buildCardHtml(texts);
      }
      if (existing.parentElement !== targetContainer) {
        targetContainer.prepend(existing);
      }
    } else {
      const zen = document.createElement('div');
      zen.id = ZEN_CONTAINER_ID;
      applyZenAttributes(zen, resolvedTheme, resolvedScale, langKey);
      zen.innerHTML = buildCardHtml(texts);
      targetContainer.prepend(zen);
    }
  }

  function isHomeTarget(url) {
    if (!url || typeof url !== 'string') {
      return (
        window.location.pathname === '/' || window.location.pathname === ''
      );
    }
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.pathname === '/' || parsed.pathname === '';
    } catch (_) {
      const clean = url.split('?')[0].split('#')[0];
      return clean === '/' || clean === '' || clean.endsWith('.youtube.com/');
    }
  }

  const zenModule = {
    init(settings) {
      currentModuleSettings = settings;
      updateZenBanner(settings);
      if (
        typeof document !== 'undefined' &&
        document.readyState === 'loading'
      ) {
        document.addEventListener(
          'DOMContentLoaded',
          () => {
            updateZenBanner(currentModuleSettings);
          },
          { once: true },
        );
      }
    },

    onNavigate(url, settings, phase) {
      currentModuleSettings = settings;
      const isTargetHome = isHomeTarget(url);

      if (
        !isTargetHome ||
        settings?.redirectHomeToSubscriptions ||
        !settings?.hideHomeFeed
      ) {
        const existing = document.getElementById(ZEN_CONTAINER_ID);
        if (existing) existing.remove();
        lastZenTargetContainer = null;
        return;
      }

      if (phase === 'finish' || phase === 'mutation') {
        updateZenBanner(settings);
      }
    },

    onSettingsChange(settings, _changes) {
      currentModuleSettings = settings;
      updateZenBanner(settings);
    },

    onDomMutation(settings) {
      const activeSettings = settings || currentModuleSettings;
      if (!activeSettings?.hideHomeFeed) return;
      const isHome =
        window.location.pathname === '/' || window.location.pathname === '';
      if (!isHome) return;

      const existing = document.getElementById(ZEN_CONTAINER_ID);
      if (
        existing?.isConnected &&
        lastZenTargetContainer?.isConnected &&
        existing.parentElement === lastZenTargetContainer
      ) {
        return;
      }

      updateZenBanner(activeSettings);
    },

    destroy() {
      const existing = document.getElementById(ZEN_CONTAINER_ID);
      if (existing) existing.remove();
      lastZenTargetContainer = null;
      currentModuleSettings = null;
    },
  };

  // Self-register in the plugin engine
  if (typeof globalThis.Libertad.registerModule === 'function') {
    globalThis.Libertad.registerModule('zen', zenModule);
  }

  // Backward compatibility facade
  globalThis.Libertad.updateZenBanner = updateZenBanner;
})();
