/**
 * Libertad - SponsorBlock Skipping Engine & Visual Timeline
 * Real-time segment skipping and visual progress bar markers.
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

  const SPONSOR_CATEGORY_COLORS = {
    sponsor: '#00d406',
    selfpromo: '#fbc02d',
    interaction: '#cc00ff',
    intro: '#00d8d8',
    outro: '#0268ed',
    preview: '#008fd6',
    music_offtopic: '#ff9900',
  };

  const sponsorCache = new BoundedCache(200);
  const ignoredSegmentUuids = new Set();
  let currentSponsorVideoId = null;
  let currentSponsorSegments = [];
  let currentSponsorVideoDuration = 0;
  let lastSkippedSegmentUuid = null;
  let lastRenderedSponsorKey = '';
  let activeSponsorSettings = null;
  let activeProgressBar = null;
  let activeSponsorContainer = null;
  let lastKnownPlaybackTime = 0;
  let isProgrammaticSkip = false;
  let programmaticSkipTimer = null;

  function resetSponsorNavigation() {
    currentSponsorVideoId = null;
    currentSponsorSegments = [];
    currentSponsorVideoDuration = 0;
    lastSkippedSegmentUuid = null;
    lastRenderedSponsorKey = '';
    activeProgressBar = null;
    activeSponsorContainer = null;
    lastKnownPlaybackTime = 0;
    isProgrammaticSkip = false;
    if (programmaticSkipTimer) {
      clearTimeout(programmaticSkipTimer);
      programmaticSkipTimer = null;
    }
    ignoredSegmentUuids.clear();
    const playerContainer =
      document.querySelector('#movie_player') ||
      document.querySelector('.html5-video-player');
    const toast = playerContainer?.querySelector('.libertad-sponsor-toast');
    if (toast) {
      if (toast.fadeTimeout) clearTimeout(toast.fadeTimeout);
      if (toast.removeTimeout) clearTimeout(toast.removeTimeout);
      toast.remove();
    }
    renderSponsorProgressBar();
  }

  function getActiveVideoId() {
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.getVideoData === 'function') {
      const data = moviePlayer.getVideoData();
      if (data?.video_id && /^[a-zA-Z0-9_-]{11}$/.test(data.video_id)) {
        return data.video_id;
      }
    }
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      const attrId = watchFlexy.getAttribute('video-id');
      if (attrId && /^[a-zA-Z0-9_-]{11}$/.test(attrId)) {
        return attrId;
      }
    }
    const parseId =
      globalThis.Libertad.parseYouTubeVideoId ||
      function (u) {
        const m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      };
    return parseId(window.location.href);
  }

  function seekVideoPlayer(video, targetTime) {
    if (video && Number.isFinite(targetTime)) {
      const activeVid = getActiveVideoId();
      if (
        activeVid &&
        currentSponsorVideoId &&
        activeVid !== currentSponsorVideoId
      ) {
        return;
      }
      isProgrammaticSkip = true;
      const maxTime =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.max(0, video.duration - 0.1)
          : targetTime;
      const safeTarget = Math.min(targetTime, maxTime);
      video.currentTime = safeTarget;
      if (programmaticSkipTimer) clearTimeout(programmaticSkipTimer);
      programmaticSkipTimer = setTimeout(() => {
        isProgrammaticSkip = false;
        programmaticSkipTimer = null;
      }, 500);
    }
  }

  function dismissSponsorToast() {
    const playerContainer = getMainPlayerContainer();
    if (!playerContainer) return;
    const toast = playerContainer.querySelector('.libertad-sponsor-toast');
    if (toast) {
      if (toast.fadeTimeout) {
        clearTimeout(toast.fadeTimeout);
        toast.fadeTimeout = null;
      }
      if (toast.removeTimeout) {
        clearTimeout(toast.removeTimeout);
        toast.removeTimeout = null;
      }
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      toast.removeTimeout = setTimeout(() => {
        toast.remove();
        toast.removeTimeout = null;
      }, 250);
    }
  }

  function showSponsorSkipToast(seg, video, settings) {
    const playerContainer =
      document.querySelector('#movie_player') ||
      document.querySelector('.html5-video-player');
    if (!playerContainer) return;

    let toast = playerContainer.querySelector('.libertad-sponsor-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'libertad-sponsor-toast';
      playerContainer.appendChild(toast);
    }

    if (toast.fadeTimeout) {
      clearTimeout(toast.fadeTimeout);
      toast.fadeTimeout = null;
    }
    if (toast.removeTimeout) {
      clearTimeout(toast.removeTimeout);
      toast.removeTimeout = null;
    }

    // Resolve Theme (dark, light, oled)
    let resolvedTheme = settings?.theme || 'auto';
    if (resolvedTheme === 'auto') {
      const isSystemDark = window.matchMedia?.(
        '(prefers-color-scheme: dark)',
      )?.matches;
      const isYtDark =
        document.documentElement.hasAttribute('dark') ||
        document.body?.classList?.contains('dark-theme');
      resolvedTheme = isYtDark || isSystemDark ? 'dark' : 'light';
    }
    toast.dataset.theme = resolvedTheme;

    // Resolve Scale (100, 120, 140)
    let resolvedScale = settings?.scale || 'auto';
    if (resolvedScale === 'auto') {
      const screenW = window.screen ? window.screen.width || 1920 : 1920;
      const dpr = window.devicePixelRatio || 1;
      const effectiveW = screenW * dpr;
      if (screenW >= 3440 || (effectiveW >= 3840 && dpr < 1.5)) {
        resolvedScale = '140';
      } else if (screenW >= 2400 || (effectiveW >= 2560 && dpr <= 1.25)) {
        resolvedScale = '120';
      } else {
        resolvedScale = '100';
      }
    }
    toast.dataset.scale = resolvedScale;

    const category = typeof seg === 'object' && seg ? seg.category : seg;
    const isEs =
      settings?.lang === 'es' ||
      ((!settings?.lang || settings?.lang === 'auto') &&
        typeof navigator !== 'undefined' &&
        (globalThis.Libertad.isSpanishLocale
          ? globalThis.Libertad.isSpanishLocale(navigator.language)
          : navigator.language?.toLowerCase().startsWith('es')));
    const isPt =
      settings?.lang === 'pt' ||
      ((!settings?.lang || settings?.lang === 'auto') &&
        typeof navigator !== 'undefined' &&
        (globalThis.Libertad.isPortugueseLocale
          ? globalThis.Libertad.isPortugueseLocale(navigator.language)
          : navigator.language?.toLowerCase().startsWith('pt')));

    const CATEGORY_LABELS = {
      sponsor: {
        en: 'SPONSOR SKIPPED',
        es: 'PATROCINIO SALTADO',
        pt: 'PATROCÍNIO PULADO',
      },
      selfpromo: {
        en: 'SELF-PROMO SKIPPED',
        es: 'AUTO-PROMOCIÓN SALTADA',
        pt: 'AUTO-PROMOÇÃO PULADA',
      },
      interaction: {
        en: 'REMINDER SKIPPED',
        es: 'RECORDATORIO SALTADO',
        pt: 'LEMBRETE PULADO',
      },
      intro: {
        en: 'INTRO SKIPPED',
        es: 'INTRO SALTADA',
        pt: 'INTRO PULADA',
      },
      outro: {
        en: 'OUTRO SKIPPED',
        es: 'OUTRO SALTADA',
        pt: 'FINAL PULADO',
      },
      preview: {
        en: 'PREVIEW SKIPPED',
        es: 'ANTICIPO SALTADO',
        pt: 'PRÉVIA PULADA',
      },
      music_offtopic: {
        en: 'NON-MUSIC SKIPPED',
        es: 'NO-MÚSICA SALTADA',
        pt: 'OFF-TOPIC PULADO',
      },
    };

    const categoryKey = CATEGORY_LABELS[category] ? category : 'sponsor';
    const langKey = isEs ? 'es' : isPt ? 'pt' : 'en';
    const label = CATEGORY_LABELS[categoryKey][langKey];
    const unskipText = isEs ? 'DESHACER' : isPt ? 'DESFAZER' : 'UNSKIP';

    toast.textContent = '';

    // Category Dot
    const catColor =
      SPONSOR_CATEGORY_COLORS[category] || SPONSOR_CATEGORY_COLORS.sponsor;
    const dot = document.createElement('span');
    dot.className = 'libertad-sponsor-toast-dot';
    dot.style.backgroundColor = catColor;
    dot.style.color = catColor;
    toast.appendChild(dot);

    // Skip Icon (Fast-forward)
    const iconSpan = document.createElement('span');
    iconSpan.className = 'libertad-sponsor-toast-icon';
    iconSpan.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 4 15 12 5 20 5 4" fill="currentColor"></polygon>
        <line x1="19" y1="5" x2="19" y2="19"></line>
      </svg>
    `;
    toast.appendChild(iconSpan);

    // Main Category Label
    const textSpan = document.createElement('span');
    textSpan.className = 'libertad-sponsor-toast-label';
    textSpan.textContent = label;
    toast.appendChild(textSpan);

    // Duration Badge
    if (
      seg &&
      typeof seg.start === 'number' &&
      typeof seg.end === 'number' &&
      seg.end > seg.start
    ) {
      const durationSec = Math.round(seg.end - seg.start);
      if (durationSec > 0) {
        const durationSpan = document.createElement('span');
        durationSpan.className = 'libertad-sponsor-toast-duration';
        durationSpan.textContent = `· ${durationSec}s`;
        toast.appendChild(durationSpan);
      }
    }

    // Unskip Button
    if (seg && typeof seg.start === 'number' && video) {
      const unskipBtn = document.createElement('button');
      unskipBtn.type = 'button';
      unskipBtn.className = 'libertad-sponsor-toast-unskip';
      unskipBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
        </svg>
        <span>${unskipText}</span>
      `;
      unskipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        unskipBtn.blur();
        if (toast.fadeTimeout) {
          clearTimeout(toast.fadeTimeout);
          toast.fadeTimeout = null;
        }
        if (toast.removeTimeout) {
          clearTimeout(toast.removeTimeout);
          toast.removeTimeout = null;
        }
        if (seg.uuid) ignoredSegmentUuids.add(seg.uuid);
        seekVideoPlayer(video, Math.max(0, seg.start - 0.2));
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(6px)';
        toast.removeTimeout = setTimeout(() => {
          toast.remove();
          toast.removeTimeout = null;
        }, 250);
      });
      toast.appendChild(unskipBtn);
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    toast.fadeTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      toast.removeTimeout = setTimeout(() => {
        toast.remove();
        toast.removeTimeout = null;
      }, 300);
    }, 4000);
  }

  function getMainPlayerContainer() {
    return (
      document.querySelector('#movie_player') ||
      document.querySelector('ytd-watch-flexy #movie_player') ||
      document.querySelector('ytd-watch-flexy') ||
      document.querySelector('.html5-video-player')
    );
  }

  function getMainPlayerProgressBar() {
    if (activeProgressBar?.isConnected) {
      return activeProgressBar;
    }
    const player = getMainPlayerContainer();
    if (!player) return null;
    const bar =
      player.querySelector('.ytp-progress-bar') ||
      player.querySelector('.ytp-progress-bar-container') ||
      document.querySelector('.ytp-progress-bar') ||
      document.querySelector('.ytp-progress-bar-container');
    activeProgressBar = bar || null;
    return bar;
  }

  function renderSponsorProgressBar() {
    const progressBar = getMainPlayerProgressBar();
    if (!progressBar) return;

    let container =
      (activeSponsorContainer?.isConnected ? activeSponsorContainer : null) ||
      progressBar.querySelector('.libertad-sponsor-bar-container');
    if (!currentSponsorSegments.length) {
      if (container) container.remove();
      activeSponsorContainer = null;
      lastRenderedSponsorKey = '';
      return;
    }

    const video = document.querySelector('video.html5-main-video');
    const duration =
      currentSponsorVideoDuration ||
      (video && Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : 0);

    if (!duration || duration <= 0) {
      return;
    }

    const renderKey = `${currentSponsorVideoId}_${duration}_${currentSponsorSegments.length}`;
    if (renderKey === lastRenderedSponsorKey && container) {
      activeSponsorContainer = container;
      return;
    }

    if (!container) {
      container = document.createElement('div');
      container.className = 'libertad-sponsor-bar-container';
      progressBar.appendChild(container);
    }
    activeSponsorContainer = container;

    container.textContent = '';
    for (const seg of currentSponsorSegments) {
      const startPercent = Math.max(
        0,
        Math.min(100, (seg.start / duration) * 100),
      );
      const endPercent = Math.max(0, Math.min(100, (seg.end / duration) * 100));
      const widthPercent = Math.max(0.2, endPercent - startPercent);

      const segmentEl = document.createElement('div');
      segmentEl.className = 'libertad-sponsor-bar-segment';
      segmentEl.style.left = `${startPercent.toFixed(3)}%`;
      segmentEl.style.width = `${widthPercent.toFixed(3)}%`;
      segmentEl.style.backgroundColor =
        SPONSOR_CATEGORY_COLORS[seg.category] ||
        SPONSOR_CATEGORY_COLORS.sponsor;
      segmentEl.dataset.category = seg.category;
      segmentEl.title = `${seg.category.toUpperCase()} (${Math.round(seg.start)}s - ${Math.round(seg.end)}s)`;

      container.appendChild(segmentEl);
    }

    lastRenderedSponsorKey = renderKey;
  }

  function shouldSkipCategory(category, settings) {
    if (!settings?.skipSponsors) return false;
    if (category === 'outro') {
      return !!settings.sponsorSkipOutro;
    }
    if (category === 'intro' || category === 'preview') {
      return !!settings.sponsorSkipIntro;
    }
    if (category === 'interaction') {
      return settings.sponsorSkipInteraction !== false;
    }
    if (category === 'selfpromo') {
      return !!settings.sponsorSkipSelfpromo;
    }
    if (category === 'music_offtopic') {
      return !!settings.sponsorSkipMusicOfftopic;
    }
    return settings.sponsorSkipSponsors !== false;
  }

  function checkVideoSponsors(video, settings) {
    const conf = settings || activeSponsorSettings;
    if (!conf?.skipSponsors || !currentSponsorSegments.length || !video) {
      return;
    }

    // Strict Guard: Never evaluate segments unless they verifiably match the active video
    const activeVid = getActiveVideoId();
    if (
      !activeVid ||
      !currentSponsorVideoId ||
      activeVid !== currentSponsorVideoId
    ) {
      return;
    }

    const currentTime = video.currentTime;
    for (const seg of currentSponsorSegments) {
      if (seg.uuid && ignoredSegmentUuids.has(seg.uuid)) {
        continue;
      }
      if (!shouldSkipCategory(seg.category, conf)) {
        continue;
      }
      if (currentTime >= seg.start - 0.1 && currentTime < seg.end - 0.1) {
        seekVideoPlayer(video, seg.end + 0.05);
        if (lastSkippedSegmentUuid !== seg.uuid) {
          lastSkippedSegmentUuid = seg.uuid;
          showSponsorSkipToast(seg, video, conf);
        }
        break;
      }
    }
  }

  function handleVideoSeek(video) {
    if (!video || isProgrammaticSkip) return;
    const activeVid = getActiveVideoId();
    if (
      !activeVid ||
      !currentSponsorVideoId ||
      activeVid !== currentSponsorVideoId
    ) {
      return;
    }
    const fromTime = lastKnownPlaybackTime;
    const toTime = video.currentTime;
    if (!Number.isFinite(fromTime) || !Number.isFinite(toTime)) return;

    if (toTime < fromTime) {
      for (const seg of currentSponsorSegments) {
        if (!seg.uuid) continue;
        // If the user rewound from at/after segment start into or right before the segment
        if (
          fromTime >= seg.start - 0.5 &&
          toTime >= seg.start - 1.0 &&
          toTime < seg.end
        ) {
          ignoredSegmentUuids.add(seg.uuid);
          dismissSponsorToast();
        } else if (toTime < seg.start - 2.0) {
          // If the user rewound well before the segment, re-arm it
          ignoredSegmentUuids.delete(seg.uuid);
          if (lastSkippedSegmentUuid === seg.uuid) {
            lastSkippedSegmentUuid = null;
          }
        }
      }
    } else {
      // Forward seek: if seeked well before a segment, ensure it is re-armed
      for (const seg of currentSponsorSegments) {
        if (!seg.uuid) continue;
        if (toTime < seg.start - 2.0) {
          ignoredSegmentUuids.delete(seg.uuid);
          if (lastSkippedSegmentUuid === seg.uuid) {
            lastSkippedSegmentUuid = null;
          }
        }
      }
    }
  }

  function bindVideoSponsorListener(settings) {
    if (settings) activeSponsorSettings = settings;
    if (window.location.pathname !== '/watch') return;
    const video = document.querySelector('video.html5-main-video');
    if (!video) return;

    if (!video.dataset.libertadSponsorBound) {
      video.dataset.libertadSponsorBound = 'true';
      lastKnownPlaybackTime = video.currentTime || 0;

      const onTimeUpdate = () => {
        lastKnownPlaybackTime = video.currentTime;
        const activeVid = getActiveVideoId();
        if (
          activeVid &&
          currentSponsorVideoId &&
          activeVid !== currentSponsorVideoId
        ) {
          // Transition between videos detected in media playback heartbeat
          resetSponsorNavigation();
          updateSponsorSegments(activeSponsorSettings);
          return;
        }
        checkVideoSponsors(video, activeSponsorSettings);
        if (
          currentSponsorSegments.length > 0 &&
          !activeSponsorContainer?.isConnected
        ) {
          renderSponsorProgressBar();
        }
      };

      const onSeeking = () => {
        handleVideoSeek(video);
      };

      const onSeeked = () => {
        if (isProgrammaticSkip) {
          isProgrammaticSkip = false;
          if (programmaticSkipTimer) {
            clearTimeout(programmaticSkipTimer);
            programmaticSkipTimer = null;
          }
          lastKnownPlaybackTime = video.currentTime;
          return;
        }
        handleVideoSeek(video);
        lastKnownPlaybackTime = video.currentTime;
        onTimeUpdate();
      };

      const onMediaTransition = () => {
        const activeVid = getActiveVideoId();
        if (
          activeVid &&
          currentSponsorVideoId &&
          activeVid !== currentSponsorVideoId
        ) {
          resetSponsorNavigation();
          updateSponsorSegments(activeSponsorSettings);
        }
      };

      video.addEventListener('timeupdate', onTimeUpdate, { passive: true });
      video.addEventListener('seeking', onSeeking, { passive: true });
      video.addEventListener('seeked', onSeeked, { passive: true });
      video.addEventListener('loadstart', onMediaTransition, { passive: true });
      video.addEventListener('emptied', onMediaTransition, { passive: true });

      video.addEventListener('durationchange', () => {
        renderSponsorProgressBar();
      });
      video.addEventListener('loadedmetadata', () => {
        renderSponsorProgressBar();
      });

      if (currentSponsorSegments.length > 0) {
        renderSponsorProgressBar();
      }
    }
  }

  function updateSponsorSegments(settings) {
    if (settings) activeSponsorSettings = settings;
    if (!settings?.skipSponsors) {
      currentSponsorSegments = [];
      currentSponsorVideoDuration = 0;
      renderSponsorProgressBar();
      return;
    }

    if (window.location.pathname !== '/watch') {
      currentSponsorSegments = [];
      renderSponsorProgressBar();
      return;
    }

    const videoId = getActiveVideoId();
    if (!videoId) return;

    if (
      currentSponsorVideoId === videoId &&
      currentSponsorSegments.length > 0
    ) {
      renderSponsorProgressBar();
      return;
    }

    currentSponsorVideoId = videoId;
    currentSponsorSegments = [];
    currentSponsorVideoDuration = 0;
    lastSkippedSegmentUuid = null;
    lastRenderedSponsorKey = '';

    if (sponsorCache.has(videoId)) {
      const cached = sponsorCache.get(videoId);
      if (Array.isArray(cached)) {
        currentSponsorSegments = cached;
        renderSponsorProgressBar();
      }
      return;
    }

    if (!chrome.runtime?.id) return;

    try {
      chrome.runtime.sendMessage(
        { action: 'FETCH_SPONSORS', videoId },
        (res) => {
          if (
            !chrome.runtime?.id ||
            chrome.runtime.lastError ||
            !res ||
            !res.success
          ) {
            sponsorCache.set(videoId, []);
            return;
          }

          if (getActiveVideoId() !== videoId) return;

          const rawSegments = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.segments)
              ? res.segments
              : [];
          const parsed = rawSegments
            .map((s, index) => {
              const start = Array.isArray(s.segment) ? s.segment[0] : 0;
              const end = Array.isArray(s.segment) ? s.segment[1] : 0;
              const fallbackUuid = `seg_${videoId}_${index}_${start.toFixed(2)}_${end.toFixed(2)}`;
              return {
                uuid: s.UUID || s.uuid || fallbackUuid,
                category: s.category,
                start,
                end,
              };
            })
            .filter((s) => s.end > s.start);

          sponsorCache.set(videoId, parsed);
          currentSponsorSegments = parsed;

          const video = document.querySelector('video.html5-main-video');
          if (video && Number.isFinite(video.duration) && video.duration > 0) {
            currentSponsorVideoDuration = video.duration;
          }

          renderSponsorProgressBar();
        },
      );
    } catch (_) {
      sponsorCache.set(videoId, []);
    }
  }

  globalThis.Libertad.getActiveVideoId = getActiveVideoId;
  globalThis.Libertad.checkVideoSponsors = checkVideoSponsors;
  globalThis.Libertad.bindVideoSponsorListener = bindVideoSponsorListener;
  globalThis.Libertad.updateSponsorSegments = updateSponsorSegments;
  globalThis.Libertad.renderSponsorProgressBar = renderSponsorProgressBar;
  globalThis.Libertad.resetSponsorNavigation = resetSponsorNavigation;
  globalThis.Libertad.getMainPlayerProgressBar = getMainPlayerProgressBar;
  globalThis.Libertad.hasActiveSponsorContainer = () =>
    Boolean(activeSponsorContainer?.isConnected);
  globalThis.Libertad.getCurrentSponsorSegments = () => currentSponsorSegments;
  globalThis.Libertad.getCurrentSponsorVideoId = () => currentSponsorVideoId;
})();
