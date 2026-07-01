/* =============================================================
   Wideout X — Locale-aware chatbot init
   -------------------------------------------------------------
   • First load: boot WoxChat in the settled locale.
   • Fresh chat switch (welcome only): clean re-mount in new lang.
   • Mid-conversation switch: patch the chrome IN PLACE and
     translate the existing message bubbles via your LLM backend,
     preserving the transcript, the open panel, and the session.
     Your original wording is cached per message, so switching
     back is instant and lossless.
   • Fallback: if the widget's internals change and a switch
     can't verify healthy, degrade to a page reload.

   >>> BACKEND YOU PROVIDE: a translate endpoint. Contract:
       POST <endpoint>   header: api-token: <token>
       body   { target:"es", messages:[{id:"0",text:"..."}, ...] }
       return { translations:[{id:"0",text:"..."}, ...] }
   Fill TRANSLATE.endpoint / .apiToken below. Until then, a
   mid-chat switch just re-languages the chrome and leaves the
   transcript as-is (non-destructive).
   ============================================================= */
(function () {
  "use strict";

  var BASE = {
    endpoint:   'https://apim.workato.com/robertr444/chatbot-v1/chat-api',
    apiToken:   '93cbc48980e9cae0ee80b8db56a877562b3e138c6acb91ed08d793bc0827f83a',
    headerIcon: 'flow',
    footerIcon: 'flow',
    accentColor: '#22d3ee',
    position:   'bottom-right'
  };

  // Live Workato translate endpoint (LLM-backed, returns {translations:[{id,text}]})
  var TRANSLATE = {
    endpoint: 'https://apim.workato.com/robertr444/chatbot-v1/translate-api',
    apiToken: '93cbc48980e9cae0ee80b8db56a877562b3e138c6acb91ed08d793bc0827f83a'
  };

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
      footerTagline: 'Map your Manual Workflow and see the path to an Automated Workflow',
      inputPlaceholder: 'Type your question...'
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
      footerTagline: 'Mapea tu proceso manual y descubre el camino hacia un proceso automatizado',
      inputPlaceholder: 'Escribe tu pregunta...'
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
  function copyFor(locale) { return COPY[locale] || COPY.en; }

  function healthy() {
    var w = window.WoxChat;
    try { return !!(w && w._initialized && w._root && document.body.contains(w._root)); }
    catch (e) { return false; }
  }
  function isOpen() {
    var w = window.WoxChat;
    try { return !!(w && w._panel && w._panel.classList.contains('wox-open')); }
    catch (e) { return false; }
  }
  function inProgress() {
    var w = window.WoxChat;
    if (!w) return false;
    try {
      if (w._conversationId) return true;
      return !!(w._messages && w._messages.querySelector('.wox-msg-user'));
    } catch (e) { return false; }
  }
  function translationConfigured() {
    return TRANSLATE.endpoint && TRANSLATE.endpoint.indexOf('REPLACE') === -1;
  }

  function setPlaceholder(locale) {
    var w = window.WoxChat, copy = copyFor(locale);
    try {
      var el = (w && w._input) || (w && w._root && w._root.querySelector('.wox-input'));
      if (el && copy.inputPlaceholder) el.setAttribute('placeholder', copy.inputPlaceholder);
    } catch (e) {}
  }

  // ---- Chrome (non-message UI): swap in place, keep the conversation ----
  function patchLanguage(locale) {
    var w = window.WoxChat, copy = copyFor(locale);
    if (!w || !w._root) return false;
    try {
      var titleEl = w._root.querySelector('.wox-title');
      if (!titleEl) return false;
      titleEl.textContent = copy.title;

      var subEl = w._root.querySelector('.wox-subtitle');
      if (subEl) {
        if (copy.subtitle) { subEl.textContent = copy.subtitle; subEl.style.display = ''; }
        else { subEl.style.display = 'none'; }
      }
      var footEl = w._root.querySelector('.wox-footer-tagline > div:last-child');
      if (footEl) footEl.textContent = copy.footerTagline;

      setPlaceholder(locale);

      if (w._config) {
        w._config.title = copy.title;
        w._config.subtitle = copy.subtitle;
        w._config.footerTagline = copy.footerTagline;
        w._config.welcomeMessage = copy.welcomeMessage;
        w._config.welcomeQuickReplies = copy.welcomeQuickReplies;
      }
      return true;
    } catch (e) { return false; }
  }

  // ---- Message-history translation via the LLM backend ----
  function messageBubbles() {
    var w = window.WoxChat;
    if (!w || !w._messages) return [];
    var all = w._messages.querySelectorAll('.wox-msg-user, .wox-msg-bot');
    var out = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].textContent && all[i].textContent.trim()) out.push(all[i]);
    }
    return out;
  }
  function setBusy(on) {
    var w = window.WoxChat;
    try {
      if (w && w._messages) w._messages.style.opacity = on ? '0.5' : '';
      if (w && w._input) w._input.disabled = on;
      if (w && w._sendBtn) w._sendBtn.disabled = on;
    } catch (e) {}
  }
  function cacheOriginal(el, lang) {
    if (!el.__woxByLang) {
      el.__woxByLang = {};
      el.__woxOrigLang = lang;
      el.__woxByLang[lang] = { text: el.textContent, html: el.innerHTML };
    }
  }
  function applyCached(el, lang) {
    var c = el.__woxByLang && el.__woxByLang[lang];
    if (!c) return false;
    if (lang === el.__woxOrigLang && c.html != null) el.innerHTML = c.html; // pristine, keeps formatting
    else el.textContent = c.text;
    return true;
  }
  function stripFences(s) {
    if (typeof s !== 'string') return s;
    var m = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i); // pull JSON out of ```json ... ```
    return (m ? m[1] : s).trim();
  }
  function translateMessages(items, target) {
    return fetch(TRANSLATE.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-token': TRANSLATE.apiToken },
      body: JSON.stringify({ target: target, messages: items })
    }).then(function (r) {
      if (!r.ok) throw new Error('translate HTTP ' + r.status);
      return r.text();
    }).then(function (raw) {
      var data;
      try { data = JSON.parse(raw); }
      catch (e) { data = JSON.parse(stripFences(raw)); } // tolerate non-JSON / fenced responses
      var out = {}, list = (data && data.translations) || [];
      if (Array.isArray(list)) {
        list.forEach(function (t) { if (t && t.id != null) out[String(t.id)] = t.text; });
      } else if (list && typeof list === 'object') { out = list; }
      return out;
    });
  }
  function translateHistory(fromLang, toLang) {
    if (!translationConfigured()) return; // no endpoint yet -> leave transcript as-is
    var els = messageBubbles();
    if (!els.length) return;

    var need = [];
    els.forEach(function (el, i) {
      cacheOriginal(el, fromLang);
      if (!applyCached(el, toLang)) {
        need.push({ el: el, id: String(i), text: el.__woxByLang[fromLang].text });
      }
    });
    if (!need.length) return; // everything served from cache

    setBusy(true);
    translateMessages(need.map(function (n) { return { id: n.id, text: n.text }; }), toLang)
      .then(function (map) {
        need.forEach(function (n) {
          var t = map[n.id];
          if (t != null) { n.el.__woxByLang[toLang] = { text: t }; n.el.textContent = t; }
        });
        setBusy(false);
      })
      .catch(function () { setBusy(false); }); // non-destructive: keep originals on failure
  }

  // ---- Teardown / (re)mount ----
  function teardown() {
    var w = window.WoxChat;
    if (!w) return;
    try { if (w._root && typeof w._root.remove === 'function') w._root.remove(); } catch (e) {}
    try {
      var key = (w._config && w._config.sessionKey) || 'wox_chat_conversation_id';
      sessionStorage.removeItem(key);
    } catch (e) {}
    w._initialized = false;
    w._welcomeShown = false;
    w._config = null;
    w._root = w._panel = w._messages = w._input = w._sendBtn = null;
    w._conversationId = '';
  }
  function doInit(locale) {
    try { WoxChat.init(assign({}, BASE, copyFor(locale))); } catch (e) {}
    if (healthy()) { setPlaceholder(locale); return true; }
    return false;
  }
  function remount(locale) {
    var wasOpen = isOpen();
    teardown();
    var ok = doInit(locale);
    if (ok && wasOpen && typeof WoxChat.open === "function") { try { WoxChat.open(); } catch (e) {} }
    return ok;
  }

  function switchLanguage(locale) {
    var from = currentLocale;
    if (inProgress()) {
      if (patchLanguage(locale) && healthy()) {
        currentLocale = locale;
        translateHistory(from, locale); // async; updates bubbles when the backend responds
      } else {
        location.reload();
      }
    } else {
      if (remount(locale) && healthy()) currentLocale = locale;
      else location.reload();
    }
  }

  function initChat(locale) {
    if (!window.WoxChat || typeof WoxChat.init !== "function") return;
    if (locale === currentLocale) return;
    if (currentLocale === null) { if (doInit(locale)) currentLocale = locale; return; }
    switchLanguage(locale);
  }

  function start(locale) {
    initChat(locale);
    if (window.WoxI18n && typeof WoxI18n.subscribe === "function") {
      WoxI18n.subscribe(function (newLocale) { initChat(newLocale); });
    }
  }

  if (window.WoxI18n && typeof WoxI18n.ready === "function") { WoxI18n.ready(start); }
  else { start("en"); }
})();
