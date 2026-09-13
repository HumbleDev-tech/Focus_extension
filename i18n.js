/**
 * Libertad - Internationalization Dictionary (i18n)
 * Provides synchronous translation mappings for English and Spanish.
 * Strict Rule: No emojis anywhere in user-facing strings or keys.
 */

const LIBERTAD_I18N = {
  en: {
    statusOff: 'OFF',
    themeLabel: 'THEME',
    langLabel: 'LANG',
    scaleLabel: 'SCALE',
    resetBtn: 'RESET CONFIG',
    tabFocus: 'FOCUS SHIELD',
    tabCleaner: 'UI CLEANER',
    tabExtras: 'EXTRAS',
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
    toggleHomeFeedDesc:
      'Suppress infinite recommendations grid and engage Zen Mode',
    toggleSidebarTitle: 'Related Sidebar',
    toggleSidebarDesc: 'Suppress watch-next suggested videos and center player',
    toggleCommentsTitle: 'Comments',
    toggleCommentsDesc: 'Suppress video comments section across watch pages',
    toggleShortsTitle: 'Shorts',
    toggleShortsDesc:
      'Suppress shorts tab, shelves, and navigation drawer links',
    toggleEndScreensTitle: 'End Screens',
    toggleEndScreensDesc:
      'Suppress popup cards and teasers at video conclusion',
    // UI Cleaner Section Headers
    cleanerHeaderSubtitle: 'HEADER & SEARCH',
    cleanerPlayerSubtitle: 'PLAYER & OVERLAYS',
    cleanerActionsSubtitle: 'ACTIONS & SOCIAL',
    cleanerNavSubtitle: 'FEEDS & NAVIGATION',
    // UI Cleaner Chips
    chipVoiceSearch: 'Voice Mic',
    chipCreate: 'Create (+)',
    chipNotifications: 'Bell Alerts',
    chipSearchSuggestions: 'Search Suggs',
    chipFilterChips: 'Filter Chips',
    chipAutoplay: 'Autoplay',
    chipUpNext: 'Up Next',
    chipWatermark: 'Watermark',
    chipPaidPromo: 'Paid Promo',
    chipMiniplayer: 'Miniplayer',
    chipAskAi: 'Ask AI',
    chipDownload: 'Download',
    chipThanksClips: 'Thanks & Clips',
    chipJoin: 'Join Button',
    chipShare: 'Share Button',
    chipSave: 'Save Video',
    chipLikeDislike: 'Like/Dislike',
    chipSubscribeButton: 'Subscribe',
    chipSubscriberCount: 'Sub Count',
    chipViewsDate: 'Views & Date',
    chipMoreActions: '3-Dots Menu',
    chipMerch: 'Merch Shelf',
    chipLiveChat: 'Live Chat',
    chipTrending: 'Trending',
    chipMoreFromYoutube: 'More YouTube',
    auxiliaryLabel: 'POWER MODULES // UTILITIES',
    toggleDislikesTitle: 'Restore Dislikes',
    toggleDislikesDesc:
      'Incorporate public community dislikes metric via Return YouTube Dislike API',
    toggleUntranslateTitle: 'Untranslate Titles',
    toggleUntranslateDesc:
      'Preserve creators original video title without algorithmic auto-translation',
    statusApiOnline: 'API ONLINE',
    statusEngineActive: 'ENGINE ACTIVE',
    footerMeta: 'DISTRACTION-FREE SYSTEM',
    zenBadge: 'SYSTEM // FOCUS_ENGAGED',
    zenTitle: 'Intentional Mode Active',
    zenDesc:
      'Feed recommendations suppressed. Execute a search query above to locate specific content.',
  },
  es: {
    statusOff: 'INACTIVO',
    themeLabel: 'TEMA',
    langLabel: 'IDIOMA',
    scaleLabel: 'ESCALA',
    resetBtn: 'REINICIAR CONFIG',
    tabFocus: 'ENFOQUE',
    tabCleaner: 'LIMPIEZA UI',
    tabExtras: 'EXTRAS',
    focusPresetLabel: 'PRESET DE ENFOQUE',
    presetOff: 'OFF',
    presetBasic: 'BASICO',
    presetBalanced: 'BALANCE',
    presetExtreme: 'EXTREMO',
    presetCustom: 'CUSTOM',
    descOff:
      'Estado estandar de YouTube. Todos los feeds y recomendaciones visibles.',
    descBasic: 'Suprime comentarios y tarjetas interactivas de final de video.',
    descBalanced:
      'Suprime recomendaciones laterales, comentarios, shorts y pantallas finales.',
    descExtreme:
      'Cero distracciones. Suprime feed de inicio, barra lateral, comentarios y shorts. Reticula activa.',
    descCustom:
      'Configuracion personalizada. Recuerda tu matriz de preferencias propia.',
    parametersLabel: 'PARAMETROS // AJUSTE FINO',
    toggleHomeFeedTitle: 'Feed Principal',
    toggleHomeFeedDesc:
      'Suprime la cuadricula infinita de recomendaciones y activa Modo Zen',
    toggleSidebarTitle: 'Barra Lateral',
    toggleSidebarDesc:
      'Suprime videos sugeridos de la barra lateral y centra el reproductor',
    toggleCommentsTitle: 'Comentarios',
    toggleCommentsDesc: 'Suprime la seccion de comentarios del video',
    toggleShortsTitle: 'Shorts',
    toggleShortsDesc: 'Suprime pestana, estantes y enlaces de shorts',
    toggleEndScreensTitle: 'Pantallas Finales',
    toggleEndScreensDesc: 'Suprime tarjetas emergentes al final del video',
    // UI Cleaner Section Headers
    cleanerHeaderSubtitle: 'CABECERA Y BUSQUEDA',
    cleanerPlayerSubtitle: 'REPRODUCTOR Y OVERLAYS',
    cleanerActionsSubtitle: 'ACCIONES Y SOCIAL',
    cleanerNavSubtitle: 'FEEDS Y NAVEGACION',
    // UI Cleaner Chips
    chipVoiceSearch: 'Microfono',
    chipCreate: 'Crear (+)',
    chipNotifications: 'Campana',
    chipSearchSuggestions: 'Sugerencias',
    chipFilterChips: 'Filtros',
    chipAutoplay: 'Autoplay',
    chipUpNext: 'Siguiente',
    chipWatermark: 'Marca Agua',
    chipPaidPromo: 'Promo Paga',
    chipMiniplayer: 'Miniplayer',
    chipAskAi: 'Asistente IA',
    chipDownload: 'Descargar',
    chipThanksClips: 'Gracias y Clips',
    chipJoin: 'Unirse',
    chipShare: 'Compartir',
    chipSave: 'Guardar',
    chipLikeDislike: 'Likes',
    chipSubscribeButton: 'Suscribirse',
    chipSubscriberCount: 'Subs Canal',
    chipViewsDate: 'Vistas/Fecha',
    chipMoreActions: 'Menu 3 Puntos',
    chipMerch: 'Tienda',
    chipLiveChat: 'Chat en Vivo',
    chipTrending: 'Tendencias',
    chipMoreFromYoutube: 'Mas YouTube',
    auxiliaryLabel: 'SUPERPODERES // UTILIDADES',
    toggleDislikesTitle: 'Restaurar Dislikes',
    toggleDislikesDesc:
      'Muestra el conteo publico de dislikes mediante Return YouTube Dislike API',
    toggleUntranslateTitle: 'No Traducir Titulos',
    toggleUntranslateDesc:
      'Conserva el titulo original en el idioma del creador sin traducciones forzadas',
    statusApiOnline: 'API EN VIVO',
    statusEngineActive: 'MOTOR ACTIVO',
    footerMeta: 'SISTEMA LIBRE DE DISTRACCIONES',
    zenBadge: 'SISTEMA // ENFOQUE_ACTIVO',
    zenTitle: 'Modo Intencional Activo',
    zenDesc:
      'Recomendaciones de feed suprimidas. Realiza una busqueda arriba para encontrar contenido especifico.',
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
