/**
 * Libertad - Subscriptions Redirect Engine
 * Redirects YouTube home page (/) directly to /feed/subscriptions when enabled.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  function redirectHomeToSubscriptions(settings, targetUrl) {
    if (!settings?.redirectHomeToSubscriptions) return false;
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
    document.addEventListener(
      'click',
      (e) => {
        const settings =
          typeof getSettings === 'function' ? getSettings() : null;
        if (!settings?.redirectHomeToSubscriptions) return;

        const anchor =
          e.target && typeof e.target.closest === 'function'
            ? e.target.closest('a')
            : null;
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (
          href === '/' ||
          href === '' ||
          href === 'https://www.youtube.com/' ||
          href === 'https://youtube.com/'
        ) {
          anchor.setAttribute('href', '/feed/subscriptions');
        }
      },
      { capture: true },
    );
  }

  globalThis.Libertad.redirectHomeToSubscriptions = redirectHomeToSubscriptions;
  globalThis.Libertad.setupSubscriptionsLinkInterceptor =
    setupSubscriptionsLinkInterceptor;
})();
