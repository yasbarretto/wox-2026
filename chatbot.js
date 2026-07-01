/* =============================================================
   Wideout X — Locale-aware chatbot init
   -------------------------------------------------------------
   Boots WoxChat in the language i18n.js settles on, and switches
   language IN PLACE when the user flips the nav switch.

   WoxChat has no destroy() and init() is not re-entrant (it bails
   if _initialized). Since it's a plain global object, we do a
   clean teardown ourselves — remove its mounted root, reset its
   internal flags to a fresh state, then init() in the new
   language. Header/subtitle/footer/quick-replies are baked in at
   mount, so a full re-mount is what actually re-languages it.
   (reset() only clears messages using the OLD config.)
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
  // it replies in Spanish. If exact-match English routing is ever added,
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

  var currentLocale = null;

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k]; }
    }
    return target;
  }

  function isOpen() {
    var w = window.WoxChat;
    try { return !!(w && w._panel && w._panel.classList.contains('wox-open')); }
    catch (e) { return false; }
  }

  // Remove the mounted widget and reset internal state so init() runs fresh.
  function teardown() {
    var w = window.WoxChat;
    if (!w) return;
    try { if (w._root && typeof w._root.remove === 'function') w._root.remove(); } catch (e) {}
    // Start a clean conversation for the new language
    try {
      var key = (w._config && w._config.sessionKey) || 'wox_chat_conversation_id';
      sessionStorage.removeItem(key);
    } catch (e) {}
    // Reset the flags/refs init() and _mount() rely on
    w._initialized = false;
    w._welcomeShown = false;
    w._config = null;
    w._root = w._panel = w._messages = w._input = w._sendBtn = null;
    w._conversationId = '';
  }

  function initChat(locale) {
    if (!window.WoxChat || typeof WoxChat.init !== "function") return;
    if (locale === currentLocale) return;

    var wasOpen = false;
    if (currentLocale !== null) {      // language switch after first load
      wasOpen = isOpen();
      teardown();
    }

    var cfg = assign({}, BASE, COPY[locale] || COPY.en);
    try {
      WoxChat.init(cfg);
      currentLocale = locale;
      if (wasOpen && typeof WoxChat.open === "function") WoxChat.open();
    } catch (e) {}
  }

  function start(locale) {
    initChat(locale);
    if (window.WoxI18n && typeof WoxI18n.subscribe === "function") {
      WoxI18n.subscribe(function (newLocale) { initChat(newLocale); });
    }
  }

  if (window.WoxI18n && typeof WoxI18n.ready === "function") {
    WoxI18n.ready(start);
  } else {
    start("en");
  }
})();
