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

  function resetSponsorNavigation() {
    currentSponsorVideoId = null;
    currentSponsorSegments = [];
    currentSponsorVideoDuration = 0;
    lastSkippedSegmentUuid = null;
    lastRenderedSponsorKey = '';
    ignoredSegmentUuids.clear();
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
      video.currentTime = targetTime;
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
    let label = '';
    if (category === 'selfpromo') {
      label = isEs
        ? 'AUTO-PROMOCION SALTADA'
        : isPt
          ? 'AUTO-PROMOÇÃO PULADA'
          : 'SELF-PROMO SKIPPED';
    } else if (category === 'interaction') {
      label = isEs
        ? 'RECORDATORIO SALTADO'
        : isPt
          ? 'LEMBRETE PULADO'
          : 'REMINDER SKIPPED';
    } else if (category === 'intro') {
      label = isEs ? 'INTRO SALTADA' : isPt ? 'INTRO PULADA' : 'INTRO SKIPPED';
    } else if (category === 'outro') {
      label = isEs ? 'OUTRO SALTADA' : isPt ? 'FINAL PULADO' : 'OUTRO SKIPPED';
    } else {
      label = isEs
        ? 'PATROCINIO SALTADO'
        : isPt
          ? 'PATROCÍNIO PULADO'
          : 'SPONSOR SKIPPED';
    }

    const unskipText = isEs ? 'DESHACER' : isPt ? 'DESFAZER' : 'UNSKIP';

    toast.textContent = '';
    const textSpan = document.createElement('span');
    textSpan.textContent = label;
    toast.appendChild(textSpan);

    if (seg && typeof seg.start === 'number' && video) {
      const unskipBtn = document.createElement('button');
      unskipBtn.type = 'button';
      unskipBtn.className = 'libertad-sponsor-toast-unskip';
      unskipBtn.textContent = unskipText;
      unskipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (seg.uuid) ignoredSegmentUuids.add(seg.uuid);
        seekVideoPlayer(video, Math.max(0, seg.start - 0.2));
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
      });
      toast.appendChild(unskipBtn);
    }

    toast.style.opacity = '1';

    if (toast.fadeTimeout) clearTimeout(toast.fadeTimeout);
    toast.fadeTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
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
    const player = getMainPlayerContainer();
    if (!player) return null;
    return (
      player.querySelector('.ytp-progress-bar-container') ||
      player.querySelector('.ytp-progress-bar') ||
      document.querySelector('.ytp-progress-bar-container') ||
      document.querySelector('.ytp-progress-bar')
    );
  }

  function renderSponsorProgressBar() {
    const progressBar = getMainPlayerProgressBar();
    if (!progressBar) return;

    let container = progressBar.querySelector(
      '.libertad-sponsor-bar-container',
    );
    if (!currentSponsorSegments.length) {
      if (container) container.remove();
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
      return;
    }

    if (!container) {
      container = document.createElement('div');
      container.className = 'libertad-sponsor-bar-container';
      progressBar.appendChild(container);
    }

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
          console.log(
            `[Libertad SponsorBlock] Skipped ${seg.category} (${seg.start.toFixed(1)}s -> ${seg.end.toFixed(1)}s)`,
          );
        }
        break;
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

      const onTimeUpdate = () => {
        checkVideoSponsors(video, activeSponsorSettings);
        if (
          currentSponsorSegments.length > 0 &&
          !document.querySelector('.libertad-sponsor-bar-container')
        ) {
          renderSponsorProgressBar();
        }
      };

      video.addEventListener('timeupdate', onTimeUpdate, { passive: true });
      video.addEventListener('seeked', onTimeUpdate, { passive: true });

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

    chrome.runtime.sendMessage({ action: 'FETCH_SPONSORS', videoId }, (res) => {
      if (chrome.runtime.lastError || !res || !res.success) {
        sponsorCache.set(videoId, []);
        return;
      }

      if (getActiveVideoId() !== videoId) return;

      const rawSegments = Array.isArray(res.segments) ? res.segments : [];
      const parsed = rawSegments
        .map((s) => ({
          uuid: s.UUID || s.uuid || '',
          category: s.category,
          start: Array.isArray(s.segment) ? s.segment[0] : 0,
          end: Array.isArray(s.segment) ? s.segment[1] : 0,
        }))
        .filter((s) => s.end > s.start);

      sponsorCache.set(videoId, parsed);
      currentSponsorSegments = parsed;

      const video = document.querySelector('video.html5-main-video');
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        currentSponsorVideoDuration = video.duration;
      }

      renderSponsorProgressBar();
    });
  }

  globalThis.Libertad.getActiveVideoId = getActiveVideoId;
  globalThis.Libertad.checkVideoSponsors = checkVideoSponsors;
  globalThis.Libertad.bindVideoSponsorListener = bindVideoSponsorListener;
  globalThis.Libertad.updateSponsorSegments = updateSponsorSegments;
  globalThis.Libertad.renderSponsorProgressBar = renderSponsorProgressBar;
  globalThis.Libertad.resetSponsorNavigation = resetSponsorNavigation;
  globalThis.Libertad.getMainPlayerProgressBar = getMainPlayerProgressBar;
  globalThis.Libertad.getCurrentSponsorSegments = () => currentSponsorSegments;
  globalThis.Libertad.getCurrentSponsorVideoId = () => currentSponsorVideoId;
})();
