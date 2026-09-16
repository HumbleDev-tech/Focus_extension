/**
 * Libertad - Main World Player & Metadata Agent
 * Runs in YouTube page context (world: "MAIN") to interact directly with internal
 * movie_player methods (audio tracks, captions) and original video details.
 * Strict Rule: No emojis anywhere in code, logs, or UI bindings.
 */

(function () {
  'use strict';

  if (window.__LIBERTAD_AGENT_ACTIVE) return;
  window.__LIBERTAD_AGENT_ACTIVE = true;

  const ORIGINAL_KEYWORDS = [
    'original',
    'origineel',
    'originale',
    'originał',
    'původní',
    'αρχικό',
    'orijinal',
    'оригинал',
    'オリジナル',
    '原始',
    '원본',
    'ต้นฉบับ',
    'मूल',
    'asli',
    'gốc',
  ];

  let retryTimer = null;

  function getPlayer() {
    return (
      document.getElementById('movie_player') ||
      document.querySelector('.html5-video-player')
    );
  }

  function getVideoElement() {
    return (
      document.querySelector('video.html5-main-video') ||
      document.querySelector('video')
    );
  }

  function getPlayerResponse() {
    try {
      const player = getPlayer();
      if (player && typeof player.getPlayerResponse === 'function') {
        const resp = player.getPlayerResponse();
        if (resp) return resp;
      }
    } catch (_) {}

    try {
      if (window.ytInitialPlayerResponse) {
        return window.ytInitialPlayerResponse;
      }
    } catch (_) {}

    try {
      if (
        typeof window.ytplayer === 'object' &&
        window.ytplayer?.config?.args?.raw_player_response
      ) {
        return window.ytplayer.config.args.raw_player_response;
      }
    } catch (_) {}

    return null;
  }

  // Safely decode standard or URL-safe Base64 strings with padding normalization
  function safeAtob(b64) {
    if (!b64 || typeof b64 !== 'string') return '';
    try {
      let normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
      while (normalized.length % 4 !== 0) {
        normalized += '=';
      }
      return atob(normalized);
    } catch (_) {
      return '';
    }
  }

  // Parse track id and decode internal metadata if available
  function parseTrackIdInfo(track) {
    const rawId = String(track?.audioTrackId || track?.id || '');
    if (!rawId) {
      return { isOriginal: false, isDubbed: false, language: null };
    }

    const parts = rawId.split(';');
    if (parts.length < 2) {
      return { isOriginal: false, isDubbed: false, language: null };
    }

    const decoded = safeAtob(parts[1]).toLowerCase();
    if (!decoded) {
      return { isOriginal: false, isDubbed: false, language: null };
    }

    const isOriginal = decoded.includes('original');
    const isDubbed =
      decoded.includes('dubbed') || decoded.includes('dubbed-auto');
    const langMatch = decoded.match(/lang..([-a-zA-Z]+)/);
    const language = langMatch ? langMatch[1].toLowerCase() : null;
    return { isOriginal, isDubbed, language };
  }

  function isOriginalTrack(track, defaultLang) {
    if (!track) return false;

    // 1. YouTube official boolean flags
    if (
      track.isOriginalTrack === true ||
      track.isOriginal === true ||
      track.original === true
    ) {
      return true;
    }

    // 2. Base64 decoded audioTrackId check
    const idInfo = parseTrackIdInfo(track);
    if (idInfo.isOriginal && !idInfo.isDubbed) {
      return true;
    }

    // 3. Display name check across international keywords
    const displayName = String(
      track.displayName || track.name || track.label || '',
    ).toLowerCase();

    for (let i = 0; i < ORIGINAL_KEYWORDS.length; i++) {
      const kw = ORIGINAL_KEYWORDS[i];
      if (
        displayName.includes(`[${kw}]`) ||
        displayName.includes(`(${kw})`) ||
        displayName.includes(` ${kw}`) ||
        displayName.includes(`${kw} `) ||
        displayName === kw
      ) {
        return true;
      }
    }

    // 4. Default audio language match from video metadata
    if (defaultLang) {
      const baseDefault = defaultLang.split('-')[0].trim();
      const trackLang = String(
        track.languageCode ||
          track.language ||
          track.lang ||
          idInfo.language ||
          '',
      )
        .toLowerCase()
        .split('-')[0]
        .trim();

      const isDubbed =
        idInfo.isDubbed ||
        displayName.includes('dub') ||
        displayName.includes('dobl') ||
        String(track.audioTrackId || track.id || '')
          .toLowerCase()
          .includes('dub');

      if (baseDefault && trackLang && trackLang === baseDefault && !isDubbed) {
        return true;
      }
    }

    return false;
  }

  let lastEnforcedVideoId = null;

  function getCurrentVideoId() {
    try {
      const player = getPlayer();
      if (player && typeof player.getVideoData === 'function') {
        const id = player.getVideoData()?.video_id;
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    } catch (_) {}
    const match = window.location.href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  // Enforce the creator's true original audio track (Anti AI-Dubbing)
  function enforceOriginalAudio() {
    const videoId = getCurrentVideoId();
    if (!videoId) return false;
    if (lastEnforcedVideoId === videoId) return true;

    const player = getPlayer();
    if (!player || typeof player.getAvailableAudioTracks !== 'function') {
      return false;
    }

    try {
      const tracks = player.getAvailableAudioTracks();
      if (!Array.isArray(tracks) || tracks.length === 0) {
        return false; // Still waiting for tracks to load
      }

      // If only one track exists, nothing to switch
      if (tracks.length === 1) {
        lastEnforcedVideoId = videoId;
        return true;
      }

      // Ensure current track is actually initialized before querying/switching
      const currentTrack =
        typeof player.getAudioTrack === 'function'
          ? player.getAudioTrack()
          : null;

      if (!currentTrack) {
        return false; // Wait until player confirms active track
      }

      const response = getPlayerResponse();
      const defaultLang = (
        response?.microformat?.playerMicroformatRenderer
          ?.defaultAudioLanguage ||
        response?.videoDetails?.defaultAudioLanguage ||
        ''
      ).toLowerCase();

      // If current track is already original, no switch needed
      if (isOriginalTrack(currentTrack, defaultLang)) {
        lastEnforcedVideoId = videoId;
        return true;
      }

      // Find the true original audio track
      let targetTrack = tracks.find((t) => isOriginalTrack(t, defaultLang));

      // Fallback: exclude any tracks explicitly flagged or named as dubbed
      if (!targetTrack) {
        targetTrack = tracks.find((t) => {
          const name = String(t.displayName || t.name || '').toLowerCase();
          const id = String(t.audioTrackId || t.id || '').toLowerCase();
          const info = parseTrackIdInfo(t);
          return (
            !info.isDubbed &&
            !name.includes('dub') &&
            !name.includes('dobl') &&
            !id.includes('dub')
          );
        });
      }

      if (!targetTrack) {
        targetTrack = tracks[0];
      }

      const currentId = currentTrack?.audioTrackId || currentTrack?.id;
      const targetId = targetTrack?.audioTrackId || targetTrack?.id;

      if (
        targetTrack &&
        targetTrack !== currentTrack &&
        (!currentId || !targetId || currentId !== targetId)
      ) {
        player.setAudioTrack(targetTrack);
        console.log(
          '[Libertad Untranslate] Switched to original audio track:',
          targetTrack.displayName || targetId,
        );
      }

      lastEnforcedVideoId = videoId;
      return true;
    } catch (_) {}
    return false;
  }

  // Clear algorithmic auto-translated subtitles
  function neutralizeAutoCaptions() {
    const player = getPlayer();
    if (!player || typeof player.getOption !== 'function') return false;

    try {
      const translationLang = player.getOption(
        'captions',
        'translationLanguage',
      );
      if (translationLang) {
        player.setOption('captions', 'translationLanguage', null);
        console.log(
          '[Libertad Untranslate] Cleared auto-translated captions language layer',
        );
        return true;
      }
    } catch (_) {}
    return false;
  }

  // Retrieve creator's untranslated raw metadata from YouTube player response
  function getOriginalMetadata() {
    try {
      const resp = getPlayerResponse();
      const details = resp?.videoDetails;
      if (details) {
        return {
          videoId: details.videoId || null,
          title: details.title || null,
          description: details.shortDescription || null,
          author: details.author || null,
          defaultAudioLanguage:
            resp?.microformat?.playerMicroformatRenderer
              ?.defaultAudioLanguage ||
            details.defaultAudioLanguage ||
            null,
        };
      }
    } catch (_) {}
    return null;
  }

  // Broadcast original metadata to content script
  function broadcastMetadata() {
    const meta = getOriginalMetadata();
    if (meta) {
      window.dispatchEvent(
        new CustomEvent('libertad-agent-metadata', {
          detail: meta,
        }),
      );
    }
  }

  function bindPlayerEvents() {
    const player = getPlayer();
    let playerBound = false;
    let videoBound = false;

    if (
      player &&
      typeof player.addEventListener === 'function' &&
      !player.__libertadEventsBound
    ) {
      player.__libertadEventsBound = true;
      player.addEventListener('onStateChange', (state) => {
        // State 1: PLAYING. Only enforce once playback actively starts, NEVER on BUFFERING (state 3)
        if (state === 1) {
          enforceOriginalAudio();
          neutralizeAutoCaptions();
          broadcastMetadata();
        }
      });
      playerBound = true;
    } else if (player?.__libertadEventsBound) {
      playerBound = true;
    }

    const video = getVideoElement();
    if (video && !video.__libertadEventsBound) {
      video.__libertadEventsBound = true;
      video.addEventListener('playing', () => {
        enforceOriginalAudio();
        neutralizeAutoCaptions();
        broadcastMetadata();
      });
      videoBound = true;
    } else if (video?.__libertadEventsBound) {
      videoBound = true;
    }

    return playerBound && videoBound;
  }

  function startEnforcementRoutine() {
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }

    const currentVid = getCurrentVideoId();
    if (currentVid && lastEnforcedVideoId === currentVid) {
      broadcastMetadata();
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    bindPlayerEvents();
    const audioDone = enforceOriginalAudio();
    neutralizeAutoCaptions();
    broadcastMetadata();

    if (audioDone) return;

    retryTimer = setInterval(() => {
      attempts++;
      bindPlayerEvents();
      const done = enforceOriginalAudio();
      neutralizeAutoCaptions();
      broadcastMetadata();

      if (done || attempts >= maxAttempts) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }, 500);
  }

  // Listen for targeted execution commands from Libertad Content Script
  window.addEventListener('libertad-agent-cmd', (event) => {
    const cmd = event?.detail?.action;
    if (cmd === 'ENFORCE_AUDIO') {
      startEnforcementRoutine();
    } else if (cmd === 'NEUTRALIZE_CAPTIONS') {
      neutralizeAutoCaptions();
    } else if (cmd === 'REQUEST_METADATA') {
      broadcastMetadata();
    }
  });

  // Automatically monitor navigation in page context
  window.addEventListener('yt-navigate-finish', () => {
    lastEnforcedVideoId = null;
    bindPlayerEvents();
    setTimeout(startEnforcementRoutine, 400);
  });

  // Initial startup hook
  bindPlayerEvents();
  setTimeout(startEnforcementRoutine, 500);
})();
