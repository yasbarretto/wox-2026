/* =============================================================
   Wideout X — Locale-aware chatbot init
   -------------------------------------------------------------
   Boots WoxChat in the language i18n.js settles on, and
   re-languages LIVE when the user flips the nav switch.

   The widget exposes: init, open, close, reset  (no destroy).
   So we do our own teardown: a MutationObserver records exactly
   which DOM nodes WoxChat injects during init; on a language
   switch we remove those nodes, then init again in the new
   language. No duplicate widgets, no page reload.
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
  // `message` is what gets SENT to the backend on a quick-reply tap.
  // The bot is LLM-based (Gemini/OpenAI), so Spanish messages are fine and
  // it replies in Spanish. If you ever add exact-match English routing,
  // revert the `message` values to English and keep only `label` translated.
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
  var injected = [];      // top-level nodes WoxChat added
  var observer = null;

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k]; }
    }
    return target;
  }

  // Record top-level nodes added to <body>/<head> while `fn` runs (+ a short
  // window after, to catch deferred insertion). These are the widget's roots.
  function captureInjected(fn) {
    var seen = [];
    if (observer) { try { observer.disconnect(); } catch (e) {} observer = null; }
    observer = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType === 1 && seen.indexOf(n) === -1) seen.push(n);
        }
      }
    });
    try { observer.observe(document.body, { childList: true }); } catch (e) {}
    try { observer.observe(document.head, { childList: true }); } catch (e) {}

    try { fn(); } catch (e) {}

    // keep watching briefly for late inserts, then lock in the list
    setTimeout(function () {
      if (observer) { try { observer.disconnect(); } catch (e) {} observer = null; }
      injected = seen;
    }, 800);
  }

  function teardown() {
    if (observer) { try { observer.disconnect(); } catch (e) {} observer = null; }
    for (var i = 0; i < injected.length; i++) {
      var n = injected[i];
      try { if (n && n.parentNode) n.parentNode.removeChild(n); } catch (e) {}
    }
    injected = [];
  }

  function initChat(locale) {
    if (!window.WoxChat || typeof WoxChat.init !== "function") return;
    if (locale === lastLocale) return;

    // Language switch after first load: remove the old widget DOM first,
    // then close it if it happens to be open, so we start clean.
    if (lastLocale !== null) {
      if (typeof WoxChat.close === "function") { try { WoxChat.close(); } catch (e) {} }
      teardown();
    }

    var cfg = assign({}, BASE, COPY[locale] || COPY.en);
    captureInjected(function () { WoxChat.init(cfg); });
    lastLocale = locale;
  }

  function start(locale) {
    initChat(locale);
    if (window.WoxI18n && typeof WoxI18n.subscribe === "function") {
      WoxI18n.subscribe(function (newLocale) { initChat(newLocale); });
    }
  }

  // Boot once i18n has settled the locale; fall back to English if absent.
  if (window.WoxI18n && typeof WoxI18n.ready === "function") {
    WoxI18n.ready(start);
  } else {
    start("en");
  }
})();
