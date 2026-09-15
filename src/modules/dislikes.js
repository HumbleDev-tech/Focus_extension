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
  let isFetchingDislikes = false;

  // Find modern YouTube dislike button
  function findDislikeButton() {
    return (
      document.querySelector(
        'ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button',
      ) ||
      document.querySelector(
        'segmented-like-dislike-button-view-model dislike-button-view-model button',
      ) ||
      document.querySelector('dislike-button-view-model button') ||
      document.querySelector('#segmented-dislike-button button') ||
      document.querySelector(
        'like-button-view-model + dislike-button-view-model button',
      ) ||
      document.querySelector('#dislike-button button')
    );
  }

  // Inject or update the dislike badge
  function injectDislikeBadge(button, formattedCount) {
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
      button.appendChild(textWrapper);
    } else {
      textWrapper.classList.add('libertad-dislike-badge');
    }

    if (textWrapper.textContent !== formattedCount) {
      textWrapper.textContent = formattedCount;
    }
    button.setAttribute('aria-label', `Dislike (${formattedCount})`);
  }

  function removeDislikeBadge() {
    const badges = document.querySelectorAll('.libertad-dislike-badge');
    badges.forEach((b) => {
      b.remove();
    });
  }

  // Dislike restoration logic
  function updateDislikeCount(settings) {
    if (!settings?.showDislikes) {
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

    const dislikeButton = findDislikeButton();
    if (!dislikeButton) return;

    if (dislikeCache.has(videoId)) {
      injectDislikeBadge(dislikeButton, dislikeCache.get(videoId));
      return;
    }

    if (isFetchingDislikes) return;
    if (!chrome.runtime?.id) return;
    isFetchingDislikes = true;

    const fetchPromise = new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'FETCH_DISLIKES', videoId },
        (res) => {
          if (!chrome.runtime.lastError && res && res.success && res.data) {
            resolve(res.data);
          } else {
            resolve(null);
          }
        },
      );
    });

    fetchPromise
      .then((data) => {
        isFetchingDislikes = false;
        if (data && typeof data.dislikes === 'number') {
          const formatNum =
            globalThis.Libertad.formatNumber ||
            function (n) {
              return n.toString();
            };
          const formatted = formatNum(data.dislikes, settings.lang);
          dislikeCache.set(videoId, formatted);
          const currentBtn = findDislikeButton();
          if (currentBtn) {
            injectDislikeBadge(currentBtn, formatted);
          }
        } else {
          dislikeCache.set(videoId, null);
        }
      })
      .catch(() => {
        isFetchingDislikes = false;
        dislikeCache.set(videoId, null);
      });
  }

  globalThis.Libertad.findDislikeButton = findDislikeButton;
  globalThis.Libertad.injectDislikeBadge = injectDislikeBadge;
  globalThis.Libertad.removeDislikeBadge = removeDislikeBadge;
  globalThis.Libertad.updateDislikeCount = updateDislikeCount;
})();
