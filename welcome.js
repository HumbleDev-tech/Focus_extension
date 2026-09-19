(function () {
  'use strict';

  const I18N = {
    en: {
      welcomeTag: 'SETUP COMPLETE',
      welcomeTitle: 'Libertad is now active',
      welcomeDesc:
        'Your distraction-free YouTube workspace is configured. Follow these 2 quick steps to ensure maximum comfort and full control.',
      step1Title: 'Pin Libertad to your Chrome toolbar',
      pinStep1: '1. Open Puzzle Menu',
      pinStep1Desc:
        'Click the Extensions puzzle icon in the top right corner of Chrome.',
      pinStep2: '2. Click the Pin Icon',
      pinStep2Desc:
        'Find Libertad in the list and click the pin icon so it stays always accessible.',
      step2Title: 'Choose your starting focus level',
      presetBasic:
        'Essential cleanup. Suppresses Shorts, promotional overlays, and end screens.',
      presetBalanced:
        'Balanced focus. Suppresses sidebar suggestions, autoplay, and clutter. Comments kept.',
      presetExtreme:
        'Zero clutter. Zen home screen, centered player, no comments, live chat, or metrics.',
      launchText: 'Open YouTube',
      footerNote: '100% PRIVATE • ZERO TELEMETRY • MANIFEST V3',
    },
    es: {
      welcomeTag: 'INSTALACIÓN COMPLETADA',
      welcomeTitle: 'Libertad ya está activa',
      welcomeDesc:
        'Tu entorno de YouTube libre de distracciones está configurado. Sigue estos 2 rápidos pasos para tener control total de inmediato.',
      step1Title: 'Fija Libertad en la barra de herramientas',
      pinStep1: '1. Abre el menú de extensiones',
      pinStep1Desc:
        'Haz clic en el icono del rompecabezas en la esquina superior derecha de Chrome.',
      pinStep2: '2. Haz clic en el botón de fijar',
      pinStep2Desc:
        'Encuentra Libertad en la lista y presiona el icono de fijar para tenerla siempre visible.',
      step2Title: 'Elige tu nivel de enfoque inicial',
      presetBasic:
        'Limpieza esencial. Oculta Shorts, anuncios emergentes y pantallas finales.',
      presetBalanced:
        'Enfoque balanceado. Oculta sugerencias laterales, reproducción automática y clutter.',
      presetExtreme:
        'Cero distracciones. Modo Zen en inicio, reproductor centrado, sin comentarios ni métricas.',
      launchText: 'Abrir YouTube',
      footerNote: '100% PRIVADO • CERO TELEMETRÍA • MANIFEST V3',
    },
    pt: {
      welcomeTag: 'CONFIGURAÇÃO CONCLUÍDA',
      welcomeTitle: 'O Libertad está ativo',
      welcomeDesc:
        'Seu espaço do YouTube sem distrações está pronto. Siga estes 2 passos rápidos para ter controle total imediatamente.',
      step1Title: 'Fixe o Libertad na barra de ferramentas',
      pinStep1: '1. Abra o menu de extensões',
      pinStep1Desc:
        'Clique no ícone de quebra-cabeça no canto superior direito do Chrome.',
      pinStep2: '2. Clique no ícone de fixar',
      pinStep2Desc:
        'Encontre o Libertad na lista e fixe-o para tê-lo sempre acessível.',
      step2Title: 'Escolha seu nível de foco inicial',
      presetBasic:
        'Limpeza essencial. Oculta Shorts, sobreposições promocionais e telas finais.',
      presetBalanced:
        'Foco equilibrado. Oculta recomendações laterais, reprodução automática e distrações.',
      presetExtreme:
        'Zero distrações. Modo Zen no início, reprodutor centralizado, sem comentários nem métricas.',
      launchText: 'Abrir o YouTube',
      footerNote: '100% PRIVADO • ZERO TELEMETRIA • MANIFEST V3',
    },
  };

  function isSpanishLocale(langStr) {
    if (!langStr || typeof langStr !== 'string') return false;
    const clean = langStr.trim().toLowerCase();
    return clean === 'es' || clean.startsWith('es-') || clean.startsWith('es_');
  }

  function isPortugueseLocale(langStr) {
    if (!langStr || typeof langStr !== 'string') return false;
    const clean = langStr.trim().toLowerCase();
    return clean === 'pt' || clean.startsWith('pt-') || clean.startsWith('pt_');
  }

  function detectSystemLang() {
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
        const uiLang = chrome.i18n.getUILanguage();
        if (uiLang) {
          if (isSpanishLocale(uiLang)) return 'es';
          if (isPortugueseLocale(uiLang)) return 'pt';
        }
      }
      if (typeof navigator !== 'undefined') {
        if (navigator.language) {
          if (isSpanishLocale(navigator.language)) return 'es';
          if (isPortugueseLocale(navigator.language)) return 'pt';
        }
        if (Array.isArray(navigator.languages)) {
          for (let i = 0; i < navigator.languages.length; i++) {
            const l = navigator.languages[i];
            if (isSpanishLocale(l)) return 'es';
            if (isPortugueseLocale(l)) return 'pt';
          }
        }
      }
    } catch (_) {}
    return 'en';
  }

  let currentLang = detectSystemLang();

  function applyTranslations(lang) {
    currentLang = lang;
    const dict = I18N[lang] || I18N.en;
    for (const key in dict) {
      const el = document.getElementById(`t_${key}`);
      if (el) el.textContent = dict[key];
    }
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  applyTranslations(currentLang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenLang = btn.getAttribute('data-lang');
      applyTranslations(chosenLang);
      if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
        chrome.storage.sync.set({ lang: chosenLang });
        try {
          const raw = localStorage.getItem('libertad_popup_state');
          const current = raw ? JSON.parse(raw) : {};
          current.lang = chosenLang;
          localStorage.setItem('libertad_popup_state', JSON.stringify(current));
        } catch (_) {}
      }
    });
  });

  // Handle Preset Selection
  const presetButtons = document.querySelectorAll('.preset-choice');
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetName = btn.getAttribute('data-preset');
      presetButtons.forEach((b) => {
        b.classList.remove('selected');
      });
      btn.classList.add('selected');

      if (
        typeof PRESET_MAP !== 'undefined' &&
        PRESET_MAP[presetName] &&
        typeof chrome !== 'undefined' &&
        chrome.storage?.sync
      ) {
        chrome.storage.sync.get(null, (saved) => {
          const updated = {
            ...(saved || {}),
            ...PRESET_MAP[presetName],
            preset: presetName,
            isOff: false,
          };
          chrome.storage.sync.set(updated);
          try {
            localStorage.setItem(
              'libertad_popup_state',
              JSON.stringify(updated),
            );
          } catch (_) {}
        });
      }
    });
  });

  // Reconcile initial state with storage if previously configured
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync.get(['preset', 'lang'], (saved) => {
      if (saved?.preset) {
        presetButtons.forEach((b) => {
          b.classList.toggle(
            'selected',
            b.getAttribute('data-preset') === saved.preset,
          );
        });
      }
      if (
        saved?.lang &&
        (saved.lang === 'en' || saved.lang === 'es' || saved.lang === 'pt')
      ) {
        applyTranslations(saved.lang);
      }
    });
  }

  // Launch YouTube
  document.getElementById('launchBtn')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: 'https://www.youtube.com' });
    } else {
      window.open('https://www.youtube.com', '_blank');
    }
  });
})();
