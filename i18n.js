/**
 * Libertad - Internationalization Dictionary (i18n)
 * Provides synchronous translation mappings for English and Spanish.
 * Strict Rule: No emojis anywhere in user-facing strings or keys.
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
    cleanerHeaderSubtitle: 'HEADER & NAVIGATION',
    cleanerPlayerSubtitle: 'PLAYER & CONTROLS',
    chipVoiceSearch: 'Voice Mic',
    chipCreate: 'Create (+)',
    chipNotifications: 'Bell Alerts',
    chipAskAi: 'Ask AI',
    chipDownload: 'Download',
    chipThanksClips: 'Thanks & Clips',
    chipJoin: 'Join Button',
    chipShare: 'Share Button',
    chipMerch: 'Merch Shelf',
    toggleVoiceSearchTitle: 'Voice Search',
    toggleVoiceSearchDesc: 'Suppress microphone icon beside search bar',
    toggleCreateTitle: 'Create Button (+)',
    toggleCreateDesc: 'Suppress video creation & upload button in top bar',
    toggleNotificationsTitle: 'Notifications Bell',
    toggleNotificationsDesc:
      'Suppress notification bell and red alert counters',
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
    auxiliaryLabel: 'POWER MODULES // UTILITIES',
    toggleDislikesTitle: 'Restore Dislikes',
    toggleDislikesDesc:
      'Incorporate public community dislikes metric via Return YouTube Dislike API',
    toggleUntranslateTitle: 'Untranslate Titles',
    toggleUntranslateDesc:
      'Preserve creators original video title without algorithmic auto-translation',
    statusApiOnline: 'API ONLINE',
    statusEngineActive: 'ENGINE ACTIVE',
    settingsDrawerTitle: 'PREFERENCES',
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
    cleanerHeaderSubtitle: 'CABECERA Y NAVEGACION',
    cleanerPlayerSubtitle: 'REPRODUCTOR Y CONTROLES',
    chipVoiceSearch: 'Microfono',
    chipCreate: 'Crear (+)',
    chipNotifications: 'Campana',
    chipAskAi: 'Asistente IA',
    chipDownload: 'Descargar',
    chipThanksClips: 'Gracias y Clips',
    chipJoin: 'Unirse',
    chipShare: 'Compartir',
    chipMerch: 'Tienda',
    toggleVoiceSearchTitle: 'Busqueda por Voz',
    toggleVoiceSearchDesc: 'Suprime el boton del microfono del buscador',
    toggleCreateTitle: 'Boton Crear (+)',
    toggleCreateDesc: 'Suprime el boton de camara y subida en la cabecera',
    toggleNotificationsTitle: 'Campana de Notificaciones',
    toggleNotificationsDesc: 'Suprime la campana y contadores de alerta roja',
    playerActionsLabel: 'REPRODUCTOR // ACCIONES',
    toggleAskAiTitle: 'Asistente IA (Ask)',
    toggleAskAiDesc: 'Suprime el boton experimental de IA de YouTube',
    toggleDownloadTitle: 'Boton Descargar',
    toggleDownloadDesc: 'Suprime el boton que solicita YouTube Premium',
    toggleThanksClipsTitle: 'Gracias y Clips',
    toggleThanksClipsDesc: 'Suprime botones de Gracias, Clips y Remix',
    toggleJoinTitle: 'Membresias (Unirse)',
    toggleJoinDesc: 'Suprime el boton comercial de unirse al canal',
    toggleShareTitle: 'Boton Compartir',
    toggleShareDesc: 'Suprime el boton de compartir debajo del video',
    commercialClutterLabel: 'PAGINA // TIENDA Y COMERCIAL',
    toggleMerchTitle: 'Tienda y Productos',
    toggleMerchDesc: 'Suprime estantes de venta de productos y merchandising',
    auxiliaryLabel: 'SUPERPODERES // UTILIDADES',
    toggleDislikesTitle: 'Restaurar Dislikes',
    toggleDislikesDesc:
      'Muestra el conteo publico de dislikes mediante Return YouTube Dislike API',
    toggleUntranslateTitle: 'No Traducir Titulos',
    toggleUntranslateDesc:
      'Conserva el titulo original en el idioma del creador sin traducciones forzadas',
    statusApiOnline: 'API EN VIVO',
    statusEngineActive: 'MOTOR ACTIVO',
    settingsDrawerTitle: 'PREFERENCIAS',
    footerMeta: 'SISTEMA LIBRE DE DISTRACCIONES',
    scaleLabel: 'ESCALA',
    resetBtn: 'REINICIAR CONFIG',
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
