/**
 * Libertad - Theme & Scale Initializer
 * Loaded synchronously in head to prevent FOUC without violating Manifest V3 CSP.
 */
try {
  const savedTheme = localStorage.getItem('libertad_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  const savedScale = localStorage.getItem('libertad_scale');
  if (savedScale) {
    document.documentElement.setAttribute('data-scale', savedScale);
  }
} catch (_) {}
