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

  let agentSettings = {
    isOff: false,
    hideAutoplay: false,
    untranslateMaster: true,
    untranslateAudio: true,
    untranslateCaptions: true,
  };

  // Synchronous cache hydration from sessionStorage for frame 0 state accuracy
  try {
    const cached = sessionStorage.getItem('libertad_settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        agentSettings.isOff = Boolean(parsed.isOff || parsed.preset === 'off');
        if (parsed.hideAutoplay !== undefined) {
          agentSettings.hideAutoplay = Boolean(parsed.hideAutoplay);
        }
        if (parsed.untranslateMaster !== undefined) {
          agentSettings.untranslateMaster = parsed.untranslateMaster !== false;
        }
        if (parsed.untranslateAudio !== undefined) {
          agentSettings.untranslateAudio = parsed.untranslateAudio !== false;
        }
        if (parsed.untranslateCaptions !== undefined) {
          agentSettings.untranslateCaptions =
            parsed.untranslateCaptions !== false;
        }
      }
    }
  } catch (_) {}

  // Synchronize settings from Libertad content script
  window.addEventListener('libertad-agent-settings', (event) => {
    const detail = event?.detail;
    if (!detail || typeof detail !== 'object') return;
    agentSettings = {
      ...agentSettings,
      ...detail,
    };
    if (agentSettings.hideAutoplay && !agentSettings.isOff) {
      enforceAutoplaySuppression();
    }
    if (
      agentSettings.isOff ||
      !agentSettings.untranslateMaster ||
      (!agentSettings.untranslateAudio && !agentSettings.untranslateCaptions)
    ) {
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }
  });

  // Request fresh settings handshake in case content script initialized first
  try {
    window.dispatchEvent(new CustomEvent('libertad-agent-ready'));
  } catch (_) {}

  function getPlayer() {
    return (
      document.getElementById('movie_player') ||
      document.querySelector('.html5-video-player')
    );
  }

  function enforceAutoplaySuppression() {
    if (agentSettings.isOff || !agentSettings.hideAutoplay) return;
    try {
      const player = getPlayer();
      if (player) {
        if (typeof player.getAutonav === 'function') {
          if (player.getAutonav() === true) {
            player.setAutonav(false);
          }
        } else if (typeof player.setAutonav === 'function') {
          player.setAutonav(false);
        }
      }
    } catch (_) {}
  }

  function getVideoElement() {
    return (
      document.querySelector('video.html5-main-video') ||
      document.querySelector('video')
    );
  }

  let cachedPlayerResponse = null;
  let cachedPlayerResponseVideoId = null;

  function getPlayerResponse() {
    const currentVid = getCurrentVideoId();
    if (
      currentVid &&
      currentVid === cachedPlayerResponseVideoId &&
      cachedPlayerResponse
    ) {
      return cachedPlayerResponse;
    }

    try {
      const player = getPlayer();
      if (player && typeof player.getPlayerResponse === 'function') {
        const resp = player.getPlayerResponse();
        if (resp) {
          if (currentVid && resp.videoDetails) {
            cachedPlayerResponse = resp;
            cachedPlayerResponseVideoId = currentVid;
          }
          return resp;
        }
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
  function enforceOriginalAudio(force = false) {
    if (
      agentSettings.isOff ||
      !agentSettings.untranslateMaster ||
      !agentSettings.untranslateAudio
    ) {
      return false;
    }
    const videoId = getCurrentVideoId();
    if (!videoId) return false;
    if (!force && lastEnforcedVideoId === videoId) return true;

    const player = getPlayer();
    if (!player || typeof player.getAvailableAudioTracks !== 'function') {
      return false;
    }

    try {
      const tracks = player.getAvailableAudioTracks();
      if (!Array.isArray(tracks) || tracks.length === 0) {
        return false; // Still waiting for tracks to load
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

      // If only one track exists currently, verify if it is genuinely the original track
      if (tracks.length === 1) {
        if (isOriginalTrack(tracks[0], defaultLang)) {
          lastEnforcedVideoId = videoId;
          return true;
        }
        // If the single loaded track is dubbed or not yet verified as original,
        // keep retry timer alive to await additional manifest audio tracks
        return false;
      }

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
      }

      lastEnforcedVideoId = videoId;
      return true;
    } catch (_) {}
    return false;
  }

  // Clear algorithmic auto-translated subtitles
  function neutralizeAutoCaptions() {
    if (
      agentSettings.isOff ||
      !agentSettings.untranslateMaster ||
      !agentSettings.untranslateCaptions
    ) {
      return false;
    }
    const player = getPlayer();
    if (!player || typeof player.getOption !== 'function') return false;

    try {
      const translationLang = player.getOption(
        'captions',
        'translationLanguage',
      );
      if (translationLang) {
        player.setOption('captions', 'translationLanguage', null);
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

  let lastBroadcastMetadataKey = null;

  // Broadcast original metadata to content script
  function broadcastMetadata(force = false) {
    const meta = getOriginalMetadata();
    if (meta?.videoId) {
      const key = `${meta.videoId}_${meta.title || ''}_${meta.description?.length || 0}`;
      if (!force && key === lastBroadcastMetadataKey) {
        return;
      }
      lastBroadcastMetadataKey = key;
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
          enforceAutoplaySuppression();
          if (!agentSettings.isOff && agentSettings.untranslateMaster) {
            if (agentSettings.untranslateAudio) enforceOriginalAudio(true);
            if (agentSettings.untranslateCaptions) neutralizeAutoCaptions();
            broadcastMetadata();
          }
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
        if (!agentSettings.isOff && agentSettings.untranslateMaster) {
          if (agentSettings.untranslateAudio) enforceOriginalAudio(true);
          if (agentSettings.untranslateCaptions) neutralizeAutoCaptions();
          broadcastMetadata();
        }
      });
      videoBound = true;
    } else if (video?.__libertadEventsBound) {
      videoBound = true;
    }

    return playerBound && videoBound;
  }

  function startEnforcementRoutine() {
    if (retryTimer) {
      clearTimeout(retryTimer);
      clearInterval(retryTimer);
      retryTimer = null;
    }

    if (
      agentSettings.isOff ||
      !agentSettings.untranslateMaster ||
      (!agentSettings.untranslateAudio && !agentSettings.untranslateCaptions)
    ) {
      return;
    }

    const currentVid = getCurrentVideoId();
    if (currentVid && lastEnforcedVideoId === currentVid) {
      broadcastMetadata();
      return;
    }

    bindPlayerEvents();
    const audioDone = enforceOriginalAudio();
    neutralizeAutoCaptions();
    broadcastMetadata();

    if (audioDone) return;

    // Exponential backoff instead of continuous blind 500ms polling
    let attempts = 0;
    const backoffDelays = [400, 1000, 2000];

    function scheduleNextAttempt() {
      if (attempts >= backoffDelays.length) {
        retryTimer = null;
        return;
      }
      const delay = backoffDelays[attempts++];
      retryTimer = setTimeout(() => {
        retryTimer = null;
        bindPlayerEvents();
        const done = enforceOriginalAudio();
        neutralizeAutoCaptions();
        if (!done) {
          scheduleNextAttempt();
        }
      }, delay);
    }
    scheduleNextAttempt();
  }

  // Listen for targeted execution commands from Libertad Content Script
  window.addEventListener('libertad-agent-cmd', (event) => {
    const detail = event?.detail;
    if (!detail || typeof detail !== 'object') return;
    const cmd = detail.action;
    if (cmd === 'ENFORCE_AUDIO') {
      startEnforcementRoutine();
    } else if (cmd === 'NEUTRALIZE_CAPTIONS') {
      neutralizeAutoCaptions();
    } else if (cmd === 'ENFORCE_AUTOPLAY') {
      enforceAutoplaySuppression();
    } else if (cmd === 'REQUEST_METADATA') {
      broadcastMetadata(true);
    }
  });

  // Automatically monitor navigation in page context
  window.addEventListener('yt-navigate-finish', () => {
    lastEnforcedVideoId = null;
    lastBroadcastMetadataKey = null;
    cachedPlayerResponse = null;
    cachedPlayerResponseVideoId = null;
    if (retryTimer) {
      clearTimeout(retryTimer);
      clearInterval(retryTimer);
      retryTimer = null;
    }
    bindPlayerEvents();
    enforceAutoplaySuppression();
    setTimeout(startEnforcementRoutine, 400);
  });

  window.addEventListener('popstate', () => {
    lastEnforcedVideoId = null;
    lastBroadcastMetadataKey = null;
    cachedPlayerResponse = null;
    cachedPlayerResponseVideoId = null;
    if (retryTimer) {
      clearTimeout(retryTimer);
      clearInterval(retryTimer);
      retryTimer = null;
    }
  });

  // Initial startup hook
  bindPlayerEvents();
  enforceAutoplaySuppression();
  setTimeout(startEnforcementRoutine, 500);
})();
