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
    linkGithub: 'GitHub',
    linkIssues: 'Issues',
    linkPrivacy: 'Privacy',
    linkDonate: 'Support',
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
    descBasic:
      'Suppresses annoying overlays, promotional buttons, and end screens.',
    descBalanced:
      'Suppresses sidebar recommendations, shorts, autoplay, and clutter. Comments preserved.',
    descExtreme:
      'Zero clutter. Zen home feed, centered player, no comments or metrics. Focus reticle active.',
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
    chipMerch: 'Merch & Store',
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
    toggleSponsorsTitle: 'Skip In-Video Sponsors',
    toggleSponsorsDesc:
      'Auto-skip paid promotions, intros, and subscribe reminders via SponsorBlock',
    subSponsorsTitle: 'Sponsors',
    subSelfpromoTitle: 'Self-Promo',
    subInteractionTitle: 'Reminders',
    subIntroTitle: 'Intros',
    subOutroTitle: 'Outros',
    subMusicOfftopicTitle: 'Off-Topic',
    sponsorTrayTitle: 'AUTO-SKIP SELECTION',
    sponsorTrayBadge: 'ACTIVE = SKIP',
    sponsorSummaryZero: 'No categories set to skip (all will play)',
    sponsorSummaryPart: 'Skipping {count} of 6: {list}',
    sponsorSummaryAll: 'Skipping all 6 categories',
    statusApiOnline: 'API ONLINE',
    statusEngineActive: 'ENGINE ACTIVE',
    statusSponsorBlock: 'SPONSORBLOCK',
    footerMeta: 'DISTRACTION-FREE SYSTEM',
    zenBadge: 'SYSTEM // FOCUS_ACTIVE',
    zenTitle: 'Intentional Mode Engaged',
    zenDesc:
      'Feed recommendations suppressed. Execute a search query above to locate specific content.',
  },
  es: {
    statusOff: 'OFF',
    themeLabel: 'TEMA',
    langLabel: 'IDIOMA',
    scaleLabel: 'ESCALA',
    resetBtn: 'REINICIAR',
    linkGithub: 'GitHub',
    linkIssues: 'Reportar',
    linkPrivacy: 'Privacidad',
    linkDonate: 'Apoyar',
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
    descBasic:
      'Suprime overlays molestos, botones promocionales y pantallas finales.',
    descBalanced:
      'Suprime recomendaciones laterales, shorts, autoplay y distracciones. Mantiene comentarios.',
    descExtreme:
      'Cero distracciones. Modo Zen en inicio, sin comentarios ni métricas. Retícula activa.',
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
    chipVoiceSearch: 'Micrófono',
    chipCreate: 'Crear (+)',
    chipNotifications: 'Campana',
    chipSearchSuggestions: 'Sugerencias',
    chipFilterChips: 'Filtros',
    chipAutoplay: 'Autoplay',
    chipUpNext: 'Siguiente',
    chipWatermark: 'Marca Agua',
    chipPaidPromo: 'Promo Paga',
    chipMiniplayer: 'Miniplayer',
    chipAskAi: 'Chat IA',
    chipDownload: 'Descargar',
    chipThanksClips: 'Gracias',
    chipJoin: 'Unirse',
    chipShare: 'Compartir',
    chipSave: 'Guardar',
    chipLikeDislike: 'Likes',
    chipSubscribeButton: 'Suscribirse',
    chipSubscriberCount: 'Subs Canal',
    chipViewsDate: 'Vistas/Fecha',
    chipMoreActions: 'Opciones',
    chipMerch: 'Tienda',
    chipLiveChat: 'Chat Vivo',
    chipTrending: 'Tendencias',
    chipMoreFromYoutube: 'Más YouTube',
    auxiliaryLabel: 'SUPERPODERES // UTILIDADES',
    toggleDislikesTitle: 'Restaurar Dislikes',
    toggleDislikesDesc:
      'Muestra el conteo publico de dislikes mediante Return YouTube Dislike API',
    toggleUntranslateTitle: 'No Traducir Titulos',
    toggleUntranslateDesc:
      'Conserva el titulo original en el idioma del creador sin traducciones forzadas',
    toggleSponsorsTitle: 'Saltar Patrocinadores',
    toggleSponsorsDesc:
      'Salta automáticamente segmentos patrocinados, intros y recordatorios con SponsorBlock',
    subSponsorsTitle: 'Sponsors',
    subSelfpromoTitle: 'Auto-Promo',
    subInteractionTitle: 'Avisos',
    subIntroTitle: 'Intros',
    subOutroTitle: 'Outros',
    subMusicOfftopicTitle: 'No-Música',
    sponsorTrayTitle: 'SELECCIÓN DE AUTO-SALTO',
    sponsorTrayBadge: 'ACTIVO = SALTAR',
    sponsorSummaryZero: 'No se saltará ningún segmento (se reproducen todos)',
    sponsorSummaryPart: 'Saltando {count} de 6: {list}',
    sponsorSummaryAll: 'Saltando las 6 categorías',
    statusApiOnline: 'API EN VIVO',
    statusEngineActive: 'MOTOR ACTIVO',
    statusSponsorBlock: 'SPONSORBLOCK',
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
