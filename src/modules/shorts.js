/**
 * Libertad - Shorts Eradication & Redirection Engine
 * Redirects /shorts/ to /watch?v= when hideShorts is enabled.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  let isInterceptorBound = false;
  let currentModuleSettings = null;
  let moduleHydrated = true;
  // Kept at module scope so destroy() can detach the document listeners.
  let interceptHandler = null;

  function getShortsVideoId(url) {
    if (typeof globalThis.Libertad?.parseYouTubeVideoId === 'function') {
      return globalThis.Libertad.parseYouTubeVideoId(url);
    }
    const m = (url || '').match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function redirectShortsIfActive(settings, targetUrl) {
    const activeSettings = settings || currentModuleSettings;
    if (!activeSettings?.hideShorts) return;
    const rawUrl = targetUrl || window.location.href;
    let path = window.location.pathname;
    try {
      path = new URL(rawUrl, window.location.origin).pathname;
    } catch (_) {}

    if (path.startsWith('/shorts')) {
      const videoId =
        getShortsVideoId(rawUrl) ||
        path.split('/shorts/')[1]?.split(/[?&#/]/)[0];
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
        const dest = activeSettings?.redirectHomeToSubscriptions
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
    if (isInterceptorBound) return;
    isInterceptorBound = true;

    const handleIntercept = (e) => {
      const settings =
        typeof getSettings === 'function'
          ? getSettings()
          : currentModuleSettings;
      if (!settings?.hideShorts) return;

      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const anchor =
        path.find((el) => el?.tagName === 'A') ||
        (e.target && typeof e.target.closest === 'function'
          ? e.target.closest('a')
          : null);
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // 1. Specific Shorts video: /shorts/12345678901 -> /watch?v=12345678901 (preserving query params & hash)
      const match = href.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        try {
          const parsed = new URL(href, window.location.origin);
          parsed.pathname = '/watch';
          parsed.searchParams.set('v', match[1]);
          anchor.setAttribute(
            'href',
            parsed.pathname + parsed.search + (parsed.hash || ''),
          );
        } catch (_) {
          anchor.setAttribute('href', `/watch?v=${match[1]}`);
        }
        return;
      }

      // 2. Channel Shorts tab: /@user/shorts -> /@user/videos
      const channelShortsMatch = href.match(
        /^(\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+))\/shorts(?:\/.*)?$/,
      );
      if (channelShortsMatch) {
        anchor.setAttribute('href', `${channelShortsMatch[1]}/videos`);
        return;
      }

      // 3. Navigation drawer / sidebar Shorts root: /shorts or /shorts/ -> redirect to Subscriptions or Home
      try {
        const parsed = new URL(href, window.location.origin);
        if (
          parsed.hostname === window.location.hostname ||
          parsed.hostname.endsWith('youtube.com')
        ) {
          if (parsed.pathname === '/shorts' || parsed.pathname === '/shorts/') {
            const dest = settings?.redirectHomeToSubscriptions
              ? '/feed/subscriptions'
              : '/';
            anchor.setAttribute('href', dest);
          }
        }
      } catch (_) {
        if (
          href === '/shorts' ||
          href === '/shorts/' ||
          href.startsWith('/shorts?') ||
          href.startsWith('/shorts#')
        ) {
          const dest = settings?.redirectHomeToSubscriptions
            ? '/feed/subscriptions'
            : '/';
          anchor.setAttribute('href', dest);
        }
      }
    };

    document.addEventListener('click', handleIntercept, { capture: true });
    document.addEventListener('auxclick', handleIntercept, { capture: true });
    interceptHandler = handleIntercept;
  }

  // Dynamic DOM cleaner for individual Shorts filter chips in feeds, search, and watch related bar
  function cleanShortsChips(settings) {
    const activeSettings = settings || currentModuleSettings;
    if (!activeSettings?.hideShorts) {
      const hidden = document.querySelectorAll(
        '[data-libertad-shorts-chip="true"]',
      );
      for (let i = 0; i < hidden.length; i++) {
        hidden[i].removeAttribute('data-libertad-shorts-chip');
        hidden[i].classList.remove('libertad-force-hide');
        hidden[i].style.removeProperty('display');
      }
      const examined = document.querySelectorAll(
        '[data-libertad-shorts-checked]',
      );
      for (let i = 0; i < examined.length; i++) {
        examined[i].removeAttribute('data-libertad-shorts-checked');
      }
      return;
    }

    const candidateSelector = [
      'ytd-feed-filter-chip-bar-renderer yt-chip-cloud-chip-renderer',
      'yt-related-chip-cloud-renderer yt-chip-cloud-chip-renderer',
      'yt-chip-cloud-renderer yt-chip-cloud-chip-renderer',
      'iron-selector#chips > *',
      '#chips > *',
      'yt-chip-cloud-chip-renderer',
      'yt-chip-cloud-chip-view-model',
      'chip-shape',
      'yt-chip-shape',
      'ytd-feed-filter-chip-bar-renderer [role="tab"]',
      'yt-related-chip-cloud-renderer [role="tab"]',
      'yt-chip-cloud-renderer [role="tab"]',
      'iron-selector#chips [role="tab"]',
    ].join(', ');
    const chips = document.querySelectorAll(candidateSelector);

    for (let i = 0; i < chips.length; i++) {
      const chip = chips[i];
      if (chip.getAttribute('data-libertad-shorts-chip') === 'true') {
        continue;
      }
      // Memoized skip: same raw label as the previous examination. Cheap
      // property read, and YouTube recycling a node with new text re-triggers it.
      const rawSnapshot = (chip.textContent || '').trim();
      if (
        rawSnapshot &&
        chip.getAttribute('data-libertad-shorts-checked') === rawSnapshot
      ) {
        continue;
      }
      let rawText = (chip.textContent || '')
        .replace(/[\s\u200B\u00A0\u202F\r\n\t]+/g, ' ')
        .trim()
        .toLowerCase();
      if (!rawText && chip.shadowRoot) {
        rawText = (chip.shadowRoot.textContent || '')
          .replace(/[\s\u200B\u00A0\u202F\r\n\t]+/g, ' ')
          .trim()
          .toLowerCase();
      }
      const innerLabel = chip.querySelector(
        '#text, yt-formatted-string, span, .yt-core-attributed-string',
      );
      const labelText = (innerLabel?.textContent || '')
        .replace(/[\s\u200B\u00A0\u202F\r\n\t]+/g, ' ')
        .trim()
        .toLowerCase();
      const aria = (
        chip.getAttribute('aria-label') ||
        chip.getAttribute('title') ||
        innerLabel?.getAttribute('title') ||
        innerLabel?.getAttribute('aria-label') ||
        ''
      )
        .trim()
        .toLowerCase();

      if (
        rawText === 'shorts' ||
        rawText === '#shorts' ||
        labelText === 'shorts' ||
        labelText === '#shorts' ||
        aria === 'shorts' ||
        aria === '#shorts'
      ) {
        const target =
          chip.closest(
            'yt-chip-cloud-chip-renderer, yt-chip-cloud-chip-view-model, iron-selector#chips > *, #chips > *',
          ) ||
          chip.closest('chip-shape, yt-chip-shape, [role="tab"]') ||
          chip;
        target.setAttribute('data-libertad-shorts-chip', 'true');
        target.classList.add('libertad-force-hide');
        target.style.setProperty('display', 'none', 'important');
        if (chip !== target) {
          chip.setAttribute('data-libertad-shorts-chip', 'true');
          chip.classList.add('libertad-force-hide');
          chip.style.setProperty('display', 'none', 'important');
        }
      } else if (rawSnapshot) {
        chip.setAttribute('data-libertad-shorts-checked', rawSnapshot);
      }
    }

    // Additional deep check: text elements inside chip clouds
    const textNodes = document.querySelectorAll(
      'ytd-feed-filter-chip-bar-renderer yt-formatted-string, yt-related-chip-cloud-renderer yt-formatted-string, iron-selector#chips yt-formatted-string, yt-chip-cloud-renderer yt-formatted-string, ytd-feed-filter-chip-bar-renderer span, yt-related-chip-cloud-renderer span, iron-selector#chips span, yt-chip-cloud-renderer span',
    );
    for (let j = 0; j < textNodes.length; j++) {
      const node = textNodes[j];
      const t = (node.textContent || '')
        .replace(/[\s\u200B\u00A0\u202F\r\n\t]+/g, ' ')
        .trim()
        .toLowerCase();
      if (t === 'shorts' || t === '#shorts') {
        const parentChip = node.closest(
          'yt-chip-cloud-chip-renderer, yt-chip-cloud-chip-view-model, chip-shape, yt-chip-shape, iron-selector#chips > *, #chips > *, [role="tab"]',
        );
        if (
          parentChip &&
          parentChip.getAttribute('data-libertad-shorts-chip') !== 'true'
        ) {
          parentChip.setAttribute('data-libertad-shorts-chip', 'true');
          parentChip.classList.add('libertad-force-hide');
          parentChip.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  // Coalesce mutation bursts: the chip scan is document-wide, so one pass per
  // ~400 ms window is plenty (init/navigation scans stay immediate).
  let chipsScanTimer = null;
  let pendingChipsSettings = null;

  function scheduleChipsScan(settings) {
    pendingChipsSettings = settings;
    if (chipsScanTimer) return;
    chipsScanTimer = setTimeout(() => {
      chipsScanTimer = null;
      if (pendingChipsSettings) {
        cleanShortsChips(pendingChipsSettings);
      }
      pendingChipsSettings = null;
    }, 400);
  }

  const shortsModule = {
    init(settings, ctx) {
      moduleHydrated = !(ctx && ctx.hydrated === false);
      currentModuleSettings = settings;
      setupShortsLinkInterceptor(() => currentModuleSettings);
      if (moduleHydrated) {
        redirectShortsIfActive(settings);
      }
      cleanShortsChips(settings);
    },

    onNavigate(url, settings, _phase) {
      currentModuleSettings = settings;
      if (!moduleHydrated) return;
      redirectShortsIfActive(settings, url);
      cleanShortsChips(settings);
    },

    onSettingsChange(newSettings, _changes) {
      moduleHydrated = true;
      currentModuleSettings = newSettings;
      if (chipsScanTimer) {
        pendingChipsSettings = newSettings;
      }
      if (newSettings?.hideShorts) {
        redirectShortsIfActive(newSettings);
      }
      cleanShortsChips(newSettings);
    },

    onDomMutation(settings) {
      if (!moduleHydrated) return;
      if (
        settings?.hideShorts &&
        window.location.pathname.startsWith('/shorts')
      ) {
        redirectShortsIfActive(settings);
      }
      if (settings?.hideShorts) {
        scheduleChipsScan(settings);
      }
    },

    destroy() {
      moduleHydrated = false;
      currentModuleSettings = null;
      if (chipsScanTimer) {
        clearTimeout(chipsScanTimer);
        chipsScanTimer = null;
      }
      pendingChipsSettings = null;
      cleanShortsChips({ hideShorts: false });
      if (interceptHandler) {
        document.removeEventListener('click', interceptHandler, {
          capture: true,
        });
        document.removeEventListener('auxclick', interceptHandler, {
          capture: true,
        });
        interceptHandler = null;
      }
      isInterceptorBound = false;
    },
  };

  // Self-register in the plugin engine
  if (typeof globalThis.Libertad.registerModule === 'function') {
    globalThis.Libertad.registerModule('shorts', shortsModule);
  }

  globalThis.Libertad.setupShortsLinkInterceptor = setupShortsLinkInterceptor;
  globalThis.Libertad.redirectShortsIfActive = redirectShortsIfActive;
  globalThis.Libertad.cleanShortsChips = cleanShortsChips;
})();
