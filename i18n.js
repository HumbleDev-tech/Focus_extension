/**
 * Libertad - Internationalization Dictionary (i18n)
 * Provides synchronous translation mappings for English and Spanish.
 */

const LIBERTAD_I18N = {
  en: {
    brandTagline: 'FOCUS ENGINE // v1.0',
    statusActive: 'ACTIVE',
    statusOff: 'OFF',
    themeLabel: 'THEME',
    langLabel: 'LANG',
    tabFocus: 'FOCUS SHIELD',
    tabCleaner: 'UI CLEANER',
    focusPresetLabel: 'FOCUS PRESET',
    presetOff: 'OFF',
    presetBasic: 'BASIC',
    presetBalanced: 'BALANCED',
    presetExtreme: 'EXTREME',
    presetCustom: 'CUSTOM',
    descOff:
      'Default YouTube state. All algorithmic feeds and recommendations visible.',
    descBasic: 'Suppresses comments and endscreen interactive video overlays.',
    descBalanced:
      'Suppresses sidebar recommendations, comments, shorts feeds, and endscreens.',
    descExtreme:
      'Zero clutter. Suppresses home feed, sidebar, comments, and shorts. Focus reticle active.',
    descCustom:
      'User tailored configuration. Remembers your personalized preference matrix.',
    parametersLabel: 'PARAMETERS // FINE-TUNE',
    toggleHomeFeedTitle: 'Home Feed',
    toggleHomeFeedDesc: 'Suppress infinite recommendations grid',
    toggleSidebarTitle: 'Related Sidebar',
    toggleSidebarDesc: 'Suppress watch-next suggested videos',
    toggleCommentsTitle: 'Comments',
    toggleCommentsDesc: 'Suppress video comments section',
    toggleShortsTitle: 'Shorts',
    toggleShortsDesc: 'Suppress shorts tab, shelves, and navigation',
    toggleEndScreensTitle: 'End Screens',
    toggleEndScreensDesc: 'Suppress popup cards at video conclusion',
    headerCleanerLabel: 'HEADER // SEARCH & TOPBAR',
    toggleVoiceSearchTitle: 'Voice Search',
    toggleVoiceSearchDesc: 'Suppress microphone icon beside search bar',
    toggleCreateTitle: 'Create Button (+)',
    toggleCreateDesc: 'Suppress video creation & upload button in top bar',
    toggleNotificationsTitle: 'Notifications Bell',
    toggleNotificationsDesc:
      'Suppress notification bell and FOMO red badge alerts',
    playerActionsLabel: 'PLAYER // ACTION BUTTONS',
    toggleAskAiTitle: 'Ask AI Assistant',
    toggleAskAiDesc: 'Suppress experimental YouTube conversational AI button',
    toggleDownloadTitle: 'Download Button',
    toggleDownloadDesc: 'Suppress promotional Premium download prompt',
    toggleThanksClipsTitle: 'Thanks & Clips',
    toggleThanksClipsDesc: 'Suppress Super Thanks, Clips, and Remix actions',
    toggleJoinTitle: 'Channel Memberships',
    toggleJoinDesc: 'Suppress promotional Join button beside Subscribe',
    toggleShareTitle: 'Share Button',
    toggleShareDesc: 'Suppress video share action button',
    commercialClutterLabel: 'PAGE // SHOPPING & COMMERCIAL',
    toggleMerchTitle: 'Merch & Products',
    toggleMerchDesc:
      'Suppress product shelves, affiliate stores, and shopping panels',
    auxiliaryLabel: 'AUXILIARY MODULES',
    toggleDislikesTitle: 'Restore Dislikes',
    toggleDislikesDesc: 'Display public dislike count on action bar',
    toggleUntranslateTitle: 'Untranslate Titles',
    toggleUntranslateDesc: "Preserve creator's original video title",
    footerMeta: 'DISTRACTION-FREE SYSTEM',
    scaleLabel: 'SCALE',
    resetBtn: 'RESET CONFIG',
    zenBadge: 'SYSTEM // FOCUS_ENGAGED',
    zenTitle: 'Intentional Mode Active',
    zenDesc:
      'Feed recommendations suppressed. Execute a search query above to locate specific content.',
  },
  es: {
    brandTagline: 'MOTOR DE ENFOQUE // v1.0',
    statusActive: 'ACTIVO',
    statusOff: 'INACTIVO',
    themeLabel: 'TEMA',
    langLabel: 'IDIOMA',
    tabFocus: 'ENFOQUE',
    tabCleaner: 'LIMPIEZA UI',
    focusPresetLabel: 'PRESET DE ENFOQUE',
    presetOff: 'OFF',
    presetBasic: 'BÁSICO',
    presetBalanced: 'BALANCE',
    presetExtreme: 'EXTREMO',
    presetCustom: 'CUSTOM',
    descOff:
      'Estado estándar de YouTube. Todos los feeds y recomendaciones visibles.',
    descBasic: 'Suprime comentarios y tarjetas interactivas de final de video.',
    descBalanced:
      'Suprime recomendaciones laterales, comentarios, shorts y pantallas finales.',
    descExtreme:
      'Cero distracciones. Suprime feed de inicio, barra lateral, comentarios y shorts. Retícula activa.',
    descCustom:
      'Configuración personalizada. Recuerda tu matriz de preferencias propia.',
    parametersLabel: 'PARÁMETROS // AJUSTE FINO',
    toggleHomeFeedTitle: 'Feed Principal',
    toggleHomeFeedDesc: 'Suprime la cuadrícula infinita de recomendaciones',
    toggleSidebarTitle: 'Barra Lateral',
    toggleSidebarDesc: 'Suprime videos sugeridos de la barra lateral',
    toggleCommentsTitle: 'Comentarios',
    toggleCommentsDesc: 'Suprime la sección de comentarios del video',
    toggleShortsTitle: 'Shorts',
    toggleShortsDesc: 'Suprime pestaña, estantes y enlaces de shorts',
    toggleEndScreensTitle: 'Pantallas Finales',
    toggleEndScreensDesc: 'Suprime tarjetas emergentes al final del video',
    headerCleanerLabel: 'CABECERA // BÚSQUEDA Y MENÚ',
    toggleVoiceSearchTitle: 'Búsqueda por Voz',
    toggleVoiceSearchDesc: 'Suprime el botón del micrófono del buscador',
    toggleCreateTitle: 'Botón Crear (+)',
    toggleCreateDesc: 'Suprime el botón de cámara y subida en la cabecera',
    toggleNotificationsTitle: 'Campana de Notificaciones',
    toggleNotificationsDesc: 'Suprime la campana y contadores de alerta roja',
    playerActionsLabel: 'REPRODUCTOR // ACCIONES',
    toggleAskAiTitle: 'Asistente IA (Ask)',
    toggleAskAiDesc: 'Suprime el botón experimental de IA de YouTube',
    toggleDownloadTitle: 'Botón Descargar',
    toggleDownloadDesc: 'Suprime el botón que solicita YouTube Premium',
    toggleThanksClipsTitle: 'Gracias y Clips',
    toggleThanksClipsDesc: 'Suprime botones de Gracias, Clips y Remix',
    toggleJoinTitle: 'Membresías (Unirse)',
    toggleJoinDesc: 'Suprime el botón comercial de unirse al canal',
    toggleShareTitle: 'Botón Compartir',
    toggleShareDesc: 'Suprime el botón de compartir debajo del video',
    commercialClutterLabel: 'PÁGINA // TIENDA Y COMERCIAL',
    toggleMerchTitle: 'Tienda y Productos',
    toggleMerchDesc: 'Suprime estantes de venta de productos y merchandising',
    auxiliaryLabel: 'MÓDULOS AUXILIARES',
    toggleDislikesTitle: 'Restaurar Dislikes',
    toggleDislikesDesc:
      'Muestra el conteo público de dislikes en la barra de acciones',
    toggleUntranslateTitle: 'No Traducir Títulos',
    toggleUntranslateDesc:
      'Conserva el título original en el idioma del creador',
    footerMeta: 'SISTEMA LIBRE DE DISTRACCIONES',
    scaleLabel: 'ESCALA',
    resetBtn: 'REINICIAR',
    zenBadge: 'SISTEMA // ENFOQUE_ACTIVO',
    zenTitle: 'Modo Intencional Activo',
    zenDesc:
      'Recomendaciones de feed suprimidas. Realiza una búsqueda arriba para encontrar contenido específico.',
  },
};

/**
 * Translate a key into the target language with fallback to English.
 */
function getTranslation(key, lang = 'en') {
  const dictionary = LIBERTAD_I18N[lang] || LIBERTAD_I18N.en;
  return dictionary[key] || LIBERTAD_I18N.en[key] || key;
}

// Export for window context or Node environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LIBERTAD_I18N, getTranslation };
}
