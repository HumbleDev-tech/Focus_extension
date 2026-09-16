/**
 * Libertad - Theme & Scale Initializer
 * Loaded synchronously in head to prevent FOUC without violating Manifest V3 CSP.
 */
try {
  let savedTheme = localStorage.getItem('libertad_theme');
  if (!savedTheme || savedTheme === 'auto') {
    savedTheme = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light';
  }
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  let savedScale = localStorage.getItem('libertad_scale');
  if (!savedScale || !['100', '120', '140'].includes(savedScale)) {
    const screenW = window.screen ? window.screen.width || 1920 : 1920;
    const dpr = window.devicePixelRatio || 1;
    const effectiveW = screenW * dpr;
    if (screenW >= 3440 || (effectiveW >= 3840 && dpr < 1.5)) {
      savedScale = '140';
    } else if (screenW >= 2400 || (effectiveW >= 2560 && dpr <= 1.25)) {
      savedScale = '120';
    } else {
      savedScale = '100';
    }
  }
  if (savedScale) {
    document.documentElement.setAttribute('data-scale', savedScale);
  }
} catch (_) {}
