/**
 * Libertad - Return YouTube Dislikes Engine
 * Integrates with community API to restore public dislike count badges.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  const BoundedCache =
    globalThis.Libertad.BoundedCache ||
    class {
      constructor() {
        this.map = new Map();
      }
      get(k) {
        return this.map.get(k);
      }
      set(k, v) {
        this.map.set(k, v);
      }
      has(k) {
        return this.map.has(k);
      }
      clear() {
        this.map.clear();
      }
    };

  const dislikeCache = new BoundedCache(200);
  const inFlightDislikes = new Set();

  let dislikePollTimer = null;
  let dislikePollAttempts = 0;

  // Find modern YouTube dislike button with multi-strategy fallbacks
  function findDislikeButton() {
    // Strategy 1: Direct explicit view-model and segmented button selectors
    const explicit = document.querySelector(
      'segmented-like-dislike-button-view-model dislike-button-view-model button, ' +
        'dislike-button-view-model button, ' +
        '#segmented-dislike-button button, ' +
        '#segmented-dislike-button, ' +
        'ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button, ' +
        'like-button-view-model + dislike-button-view-model button, ' +
        'like-button-view-model ~ * button, ' +
        '#top-level-buttons-computed #dislike-button button, ' +
        '#top-level-buttons-computed ytd-toggle-button-renderer:nth-child(2) button',
    );
    if (
      explicit &&
      !explicit.closest(
        '#comments, ytd-comments, ytd-comment-thread-renderer, #shorts-container',
      )
    ) {
      return explicit;
    }

    // Strategy 2: Segmented container structure (Second button in container is always Dislike)
    const segmented = document.querySelector(
      'segmented-like-dislike-button-view-model, ' +
        'ytd-segmented-like-dislike-button-renderer, ' +
        '.ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper',
    );
    if (
      segmented &&
      !segmented.closest(
        '#comments, ytd-comments, ytd-comment-thread-renderer, #shorts-container',
      )
    ) {
      const buttons = segmented.querySelectorAll('button');
      if (buttons.length >= 2) {
        return buttons[1];
      }
    }

    // Strategy 3: Accessibility / I18N aria-label / title inside primary watch actions container
    const actions = document.querySelector(
      'ytd-watch-metadata #actions, ' +
        '#actions.ytd-watch-metadata, ' +
        '#top-level-buttons-computed, ' +
        'ytd-menu-renderer.ytd-watch-metadata, ' +
        '#actions #top-row',
    );
    if (actions) {
      const buttons = actions.querySelectorAll('button');
      for (let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        if (
          b.closest('#comments, ytd-comments, ytd-comment-thread-renderer')
        ) {
          continue;
        }
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const title = (b.getAttribute('title') || '').toLowerCase();
        if (
          aria.includes('dislike') ||
          aria.includes('no me gusta') ||
          aria.includes('não gostei') ||
          aria.includes("n'aime pas") ||
          title.includes('dislike') ||
          title.includes('no me gusta') ||
          title.includes('não gostei')
        ) {
          return b;
        }
      }

      // SVG path signature fallback (thumbs-down icon path)
      for (let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        if (
          b.closest('#comments, ytd-comments, ytd-comment-thread-renderer')
        ) {
          continue;
        }
        const path = b.querySelector('path');
        if (path) {
          const d = (path.getAttribute('d') || '').toLowerCase();
          if (
            d.startsWith('m17') ||
            d.startsWith('m3.25') ||
            d.startsWith('m8.482') ||
            d.includes('4-9v2h5.72') ||
            d.includes('4-9v-7')
          ) {
            return b;
          }
        }
      }
    }

    return null;
  }

  // Inject or update the dislike badge
  function injectDislikeBadge(button, formattedCount, videoId) {
    if (!button || !formattedCount) return;

    if (!button.hasAttribute('data-libertad-orig-aria')) {
      const origAria = button.getAttribute('aria-label');
      if (origAria) {
        button.setAttribute('data-libertad-orig-aria', origAria);
      }
    }

    button.classList.remove('yt-spec-button-shape-next--icon-button');
    button.classList.add('yt-spec-button-shape-next--icon-leading');

    let textWrapper = button.querySelector(
      '.yt-spec-button-shape-next__button-text-content',
    );
    if (!textWrapper) {
      textWrapper = button.querySelector('.libertad-dislike-badge');
    }

    if (!textWrapper) {
      textWrapper = document.createElement('div');
      textWrapper.className =
        'yt-spec-button-shape-next__button-text-content libertad-dislike-badge';
      const touchFeedback = button.querySelector('yt-touch-feedback-shape');
      if (touchFeedback) {
        button.insertBefore(textWrapper, touchFeedback);
      } else {
        button.appendChild(textWrapper);
      }
    } else {
      textWrapper.classList.add('libertad-dislike-badge');
    }

    if (videoId) {
      textWrapper.setAttribute('data-video-id', videoId);
      button.setAttribute('data-libertad-dislike-vid', videoId);
    }

    if (textWrapper.textContent !== formattedCount) {
      textWrapper.textContent = formattedCount;
    }
    button.setAttribute('aria-label', `Dislike (${formattedCount})`);
  }

  function removeDislikeBadge() {
    const badges = document.querySelectorAll('.libertad-dislike-badge');
    badges.forEach((b) => {
      const btn = b.closest('button');
      if (btn) {
        btn.classList.remove('yt-spec-button-shape-next--icon-leading');
        btn.classList.add('yt-spec-button-shape-next--icon-button');
        btn.removeAttribute('data-libertad-dislike-vid');
        const defaultAria = btn.getAttribute('data-libertad-orig-aria');
        if (defaultAria) {
          btn.setAttribute('aria-label', defaultAria);
        }
      }
      b.remove();
    });
  }

  // SPA Lifecycle Reset
  function resetDislikesNavigation() {
    if (dislikePollTimer) {
      clearInterval(dislikePollTimer);
      dislikePollTimer = null;
    }
    inFlightDislikes.clear();
    removeDislikeBadge();
  }

  // Polling helper to guarantee injection as soon as YouTube renders the watch action buttons
  function pollForDislikeButton(settings, targetVideoId) {
    if (dislikePollTimer) {
      clearInterval(dislikePollTimer);
      dislikePollTimer = null;
    }

    if (!settings?.showDislikes || settings?.hideLikeDislike) {
      return;
    }

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const vid = targetVideoId || parseId(window.location.href);
    if (!vid) return;

    // Eagerly trigger API fetch so data is ready in cache
    updateDislikeCount(settings);

    dislikePollAttempts = 0;
    dislikePollTimer = setInterval(() => {
      dislikePollAttempts++;
      const currentVid = parseId(window.location.href);

      // Abort if route changed or max polling attempts (12 seconds) reached
      if (currentVid !== vid || dislikePollAttempts > 40) {
        clearInterval(dislikePollTimer);
        dislikePollTimer = null;
        return;
      }

      const btn = findDislikeButton();
      if (btn) {
        const badge = btn.querySelector('.libertad-dislike-badge');
        if (badge && badge.getAttribute('data-video-id') === vid) {
          clearInterval(dislikePollTimer);
          dislikePollTimer = null;
          return;
        }

        updateDislikeCount(settings);
      }
    }, 300);
  }

  // Dislike restoration logic: eagerly fetches API count and injects whenever button is ready
  function updateDislikeCount(settings) {
    if (!settings?.showDislikes || settings?.hideLikeDislike) {
      removeDislikeBadge();
      return;
    }

    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };

    const videoId = parseId(window.location.href);
    if (!videoId) {
      removeDislikeBadge();
      return;
    }

    // Fast path: if already cached, inject if button is in DOM
    const dislikeButton = findDislikeButton();
    if (dislikeCache.has(videoId)) {
      const cached = dislikeCache.get(videoId);
      if (cached) {
        if (dislikeButton) {
          injectDislikeBadge(dislikeButton, cached, videoId);
        }
      } else {
        removeDislikeBadge();
      }
      return;
    }

    // Eagerly fetch from background service worker without waiting for button DOM
    if (inFlightDislikes.has(videoId)) return;
    if (!chrome.runtime?.id) return;
    inFlightDislikes.add(videoId);

    const fetchPromise = new Promise((resolve) => {
      try {
        if (!chrome.runtime?.id) {
          resolve(null);
          return;
        }
        chrome.runtime.sendMessage(
          { action: 'FETCH_DISLIKES', videoId },
          (res) => {
            if (!chrome.runtime?.id || chrome.runtime.lastError) {
              resolve(null);
              return;
            }
            if (res?.success && res.data) {
              resolve({ ok: true, data: res.data });
            } else if (res?.notFound) {
              resolve({ ok: false, notFound: true });
            } else {
              resolve({ ok: false, transient: true });
            }
          },
        );
      } catch (_) {
        resolve(null);
      }
    });

    fetchPromise
      .then((result) => {
        inFlightDislikes.delete(videoId);
        const currentVideoId = parseId(window.location.href);
        if (
          result?.ok &&
          result.data &&
          typeof result.data.dislikes === 'number'
        ) {
          const formatNum =
            globalThis.Libertad.formatNumber ||
            function (n) {
              return n.toString();
            };
          const formatted = formatNum(result.data.dislikes, settings?.lang);
          dislikeCache.set(videoId, formatted);
          if (currentVideoId === videoId) {
            const currentBtn = findDislikeButton();
            if (currentBtn) {
              injectDislikeBadge(currentBtn, formatted, videoId);
            }
          }
        } else if (result?.notFound) {
          // Explicit 404 from community API: safe to cache as false to avoid repeated lookups
          dislikeCache.set(videoId, false);
          if (currentVideoId === videoId) {
            removeDislikeBadge();
          }
        } else {
          // Transient failure (network error, timeout, 5xx): do NOT poison cache!
          // Remove any stale badge belonging to an older video
          if (currentVideoId === videoId) {
            const badge = document.querySelector('.libertad-dislike-badge');
            if (
              badge &&
              badge.getAttribute('data-video-id') !== currentVideoId
            ) {
              removeDislikeBadge();
            }
          }
        }
      })
      .catch(() => {
        inFlightDislikes.delete(videoId);
        // Fail silently without poisoning cache
      });
  }

  globalThis.Libertad.findDislikeButton = findDislikeButton;
  globalThis.Libertad.injectDislikeBadge = injectDislikeBadge;
  globalThis.Libertad.removeDislikeBadge = removeDislikeBadge;
  globalThis.Libertad.resetDislikesNavigation = resetDislikesNavigation;
  globalThis.Libertad.pollForDislikeButton = pollForDislikeButton;
  globalThis.Libertad.updateDislikeCount = updateDislikeCount;
})();
