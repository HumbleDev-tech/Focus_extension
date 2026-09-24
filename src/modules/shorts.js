/**
 * Libertad - Shorts Eradication & Redirection Engine
 * Redirects /shorts/ to /watch?v= when hideShorts is enabled.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  function redirectShortsIfActive(settings, targetUrl) {
    if (!settings?.hideShorts) return;
    const rawUrl = targetUrl || window.location.href;
    let path = window.location.pathname;
    try {
      path = new URL(rawUrl, window.location.origin).pathname;
    } catch (_) {}

    if (path.startsWith('/shorts')) {
      const parseId =
        globalThis.Libertad.parseYouTubeVideoId ||
        function (u) {
          const m = u.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
          return m ? m[1] : null;
        };
      const videoId =
        parseId(rawUrl) || path.split('/shorts/')[1]?.split(/[?&#/]/)[0];
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        try {
          const parsedUrl = new URL(rawUrl, window.location.origin);
          parsedUrl.pathname = '/watch';
          parsedUrl.searchParams.set('v', videoId);
          window.location.replace(
            parsedUrl.pathname + parsedUrl.search + (parsedUrl.hash || ''),
          );
        } catch (_) {
          window.location.replace(`/watch?v=${videoId}`);
        }
      } else if (path === '/shorts' || path === '/shorts/') {
        const dest = settings?.redirectHomeToSubscriptions
          ? '/feed/subscriptions'
          : '/';
        window.location.replace(dest);
      }
      return;
    }

    // Intercept channel shorts URLs (e.g. /@channel/shorts, /channel/ID/shorts)
    const channelShortsMatch = path.match(
      /^(\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+))\/shorts(?:\/.*)?$/,
    );
    if (channelShortsMatch) {
      window.location.replace(`${channelShortsMatch[1]}/videos`);
    }
  }

  // Intercept clicks on Shorts links across YouTube feeds and drawers to route natively via SPA
  function setupShortsLinkInterceptor(getSettings) {
    document.addEventListener(
      'click',
      (e) => {
        const settings =
          typeof getSettings === 'function' ? getSettings() : null;
        if (!settings?.hideShorts) return;

        const anchor =
          e.target && typeof e.target.closest === 'function'
            ? e.target.closest('a')
            : null;
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        const match = href.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (match) {
          anchor.setAttribute('href', `/watch?v=${match[1]}`);
          return;
        }

        const channelShortsMatch = href.match(
          /^(\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+))\/shorts(?:\/.*)?$/,
        );
        if (channelShortsMatch) {
          anchor.setAttribute('href', `${channelShortsMatch[1]}/videos`);
        }
      },
      { capture: true },
    );
  }

  globalThis.Libertad.setupShortsLinkInterceptor = setupShortsLinkInterceptor;
  globalThis.Libertad.redirectShortsIfActive = redirectShortsIfActive;
})();
