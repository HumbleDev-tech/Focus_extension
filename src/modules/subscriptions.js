/**
 * Libertad - Subscriptions Redirect Engine
 * Redirects YouTube home page (/) directly to /feed/subscriptions when enabled.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  let isInterceptorBound = false;
  let currentModuleSettings = null;

  function redirectHomeToSubscriptions(settings, targetUrl) {
    const activeSettings = settings || currentModuleSettings;
    if (!activeSettings?.redirectHomeToSubscriptions) return false;
    const rawUrl = targetUrl || window.location.href;
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      if (parsed.pathname === '/' || parsed.pathname === '') {
        window.location.replace('/feed/subscriptions');
        return true;
      }
    } catch (_) {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        window.location.replace('/feed/subscriptions');
        return true;
      }
    }
    return false;
  }

  // Intercept clicks on Home links (logo, drawer) to route natively via SPA
  function setupSubscriptionsLinkInterceptor(getSettings) {
    if (isInterceptorBound) return;
    isInterceptorBound = true;

    document.addEventListener(
      'click',
      (e) => {
        const settings =
          typeof getSettings === 'function'
            ? getSettings()
            : currentModuleSettings;
        if (!settings?.redirectHomeToSubscriptions) return;

        const anchor =
          e.target && typeof e.target.closest === 'function'
            ? e.target.closest('a')
            : null;
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;
        try {
          const parsed = new URL(href, window.location.origin);
          const isYouTube =
            parsed.hostname === window.location.hostname ||
            parsed.hostname.endsWith('youtube.com');
          if (
            isYouTube &&
            (parsed.pathname === '/' || parsed.pathname === '')
          ) {
            anchor.setAttribute('href', '/feed/subscriptions');
          }
        } catch (_) {
          if (
            href === '/' ||
            href === '' ||
            href.startsWith('/?') ||
            href.startsWith('/#') ||
            href === 'https://www.youtube.com/' ||
            href === 'https://youtube.com/'
          ) {
            anchor.setAttribute('href', '/feed/subscriptions');
          }
        }
      },
      { capture: true },
    );
  }

  const subscriptionsModule = {
    init(settings) {
      currentModuleSettings = settings;
      setupSubscriptionsLinkInterceptor(() => currentModuleSettings);
      redirectHomeToSubscriptions(settings);
    },

    onNavigate(url, settings, _phase) {
      currentModuleSettings = settings;
      redirectHomeToSubscriptions(settings, url);
    },

    onSettingsChange(newSettings, _changes) {
      currentModuleSettings = newSettings;
      if (newSettings?.redirectHomeToSubscriptions) {
        redirectHomeToSubscriptions(newSettings);
      }
    },

    onDomMutation(settings) {
      if (settings?.redirectHomeToSubscriptions) {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
          redirectHomeToSubscriptions(settings);
        }
      }
    },

    destroy() {
      currentModuleSettings = null;
    },
  };

  // Self-register in the plugin engine
  if (typeof globalThis.Libertad.registerModule === 'function') {
    globalThis.Libertad.registerModule('subscriptions', subscriptionsModule);
  }

  globalThis.Libertad.redirectHomeToSubscriptions = redirectHomeToSubscriptions;
  globalThis.Libertad.setupSubscriptionsLinkInterceptor =
    setupSubscriptionsLinkInterceptor;
})();
