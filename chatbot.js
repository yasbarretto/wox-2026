/* =============================================================
   Wideout X — Locale-aware chatbot init
   -------------------------------------------------------------
   Waits for i18n.js to settle the locale, then boots WoxChat in
   the matching language. Re-languages on manual switch IF the
   widget exposes a teardown method; otherwise the persisted
   choice applies on the next page load.
   ============================================================= */
(function () {
  "use strict";

  // Config that never changes between languages
  var BASE = {
    endpoint:   'https://apim.workato.com/robertr444/chatbot-v1/chat-api',
    apiToken:   '93cbc48980e9cae0ee80b8db56a877562b3e138c6acb91ed08d793bc0827f83a',
    headerIcon: 'flow',
    footerIcon: 'flow',
    accentColor: '#22d3ee',
    position:   'bottom-right'
  };

  // Language-specific copy.
  // NOTE: `message` is the text SENT to your backend when a quick reply is
  // tapped. These are Spanish so your (LLM-based) bot replies in Spanish.
  // If any part of your backend routes on exact ENGLISH phrases, keep the
  // `message` values English and translate only the `label` values.
  var COPY = {
    en: {
      title:    'WideOut X Assistant',
      subtitle: 'Workflow automation guide',
      welcomeMessage: 'Hello — welcome to WideOut X.\nWhat would you like to explore?',
      welcomeQuickReplies: [
        { label: 'Automate a Workflow', icon: 'flow', message: 'I want to automate a workflow' },
        { label: 'Services',            icon: 'work', message: 'Tell me about your services' },
        { label: 'Pricing',             icon: 'tag',  message: 'What are your pricing plans?' },
        { label: 'Careers',             icon: 'case', message: 'Are you hiring?' }
      ],
      footerTagline: 'Map your Manual Workflow and see the path to an Automated Workflow'
    },
    es: {
      title:    'Asistente de WideOut X',
      subtitle: 'Guía de automatización de procesos',
      welcomeMessage: 'Hola, te damos la bienvenida a WideOut X.\n¿Qué te gustaría explorar?',
      welcomeQuickReplies: [
        { label: 'Automatizar un proceso', icon: 'flow', message: 'Quiero automatizar un proceso' },
        { label: 'Servicios',              icon: 'work', message: 'Cuéntame sobre sus servicios' },
        { label: 'Precios',                icon: 'tag',  message: '¿Cuáles son sus planes de precios?' },
        { label: 'Empleos',                icon: 'case', message: '¿Están contratando?' }
      ],
      footerTagline: 'Mapea tu proceso manual y descubre el camino hacia un proceso automatizado'
    }
  };

  var lastLocale = null;

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k]; }
    }
    return target;
  }

  function initChat(locale) {
    if (!window.WoxChat || typeof WoxChat.init !== "function") return;
    if (locale === lastLocale) return;

    // Re-init (language switch after first load): only if the widget can tear down,
    // otherwise keep the existing instance to avoid stacking duplicate widgets.
    if (lastLocale !== null) {
      if (typeof WoxChat.destroy === "function") {
        try { WoxChat.destroy(); } catch (e) {}
      } else {
        return; // no safe teardown — persisted choice will apply on next load
      }
    }

    var cfg = assign({}, BASE, COPY[locale] || COPY.en);
    try { WoxChat.init(cfg); lastLocale = locale; } catch (e) {}
  }

  function start(locale) {
    initChat(locale);
    if (window.WoxI18n && typeof WoxI18n.subscribe === "function") {
      WoxI18n.subscribe(function (newLocale) { initChat(newLocale); });
    }
  }

  // Boot once i18n has settled the locale; fall back to English if i18n is absent.
  if (window.WoxI18n && typeof WoxI18n.ready === "function") {
    WoxI18n.ready(start);
  } else {
    start("en");
  }
})();
