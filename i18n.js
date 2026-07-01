/* =============================================================
   Wideout X — Geo-based localization
   -------------------------------------------------------------
   Detects the visitor's country by IP and swaps copy to LATAM
   Spanish for Spanish-speaking Latin American countries.
   Everyone else (incl. the Philippines) stays on English.

   Manual override for testing:  ?lang=es  or  ?lang=en
   Debug missing strings:        ?i18n=debug
   ============================================================= */
(function () {
  "use strict";

  // Spanish-speaking LATAM countries -> serve Spanish.
  // (Spain 'ES' intentionally excluded — add it here if you want EU Spanish too.)
  var SPANISH_LATAM = new Set([
    "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU",
    "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR"
  ]);

  // ---- Translation dictionary: English source -> LATAM Spanish ----
  // Keys must match the on-page English exactly (punctuation/dashes included).
  var DICT = {
    // Nav + shared CTAs
    "Solution": "Solución",
    "Why Wideout X": "Por qué Wideout X",
    "Use Cases": "Casos de uso",
    "Pricing": "Precios",
    "Get Started": "Comienza ahora",

    // Hero
    "Escape the production trap with": "Escapa de la trampa de la producción con",
    "expert-architected automation.": "automatización diseñada por expertos.",
    "Wideout X builds safe, scalable hybrid workflows that combine AI speed with expert human oversight to eliminate repetitive manual tasks. We help you scale output, not your headcount, without sacrificing quality, security, or brand governance.":
      "Wideout X crea flujos de trabajo híbridos, seguros y escalables que combinan la velocidad de la IA con la supervisión de expertos humanos para eliminar las tareas manuales repetitivas. Te ayudamos a escalar tu producción, no tu plantilla, sin sacrificar la calidad, la seguridad ni el control de tu marca.",
    "Book a Demo": "Agenda una demo",
    "Discover More": "Descubre más",

    // Solution
    "SOLUTION": "SOLUCIÓN",
    "Maximize Workflow Efficiency.": "Maximiza la eficiencia de tus procesos.",
    "Scale Seamlessly.": "Escala sin fricciones.",
    "We map your disjointed tech stack, close process gaps, and deploy end-to-end automation. By pairing AI's high-volume generation with human quality control, your senior talent can focus purely on strategy while our systems do the heavy lifting safely.":
      "Mapeamos tu stack tecnológico fragmentado, cerramos las brechas en tus procesos e implementamos automatización de principio a fin. Al combinar la generación de alto volumen de la IA con el control de calidad humano, tu talento senior puede enfocarse solo en la estrategia mientras nuestros sistemas hacen el trabajo pesado de forma segura.",
    "$0 upfront until you sign with us!": "¡$0 por adelantado hasta que firmes con nosotros!",
    "Pragmatic Partnership": "Alianza pragmática",
    "Free workflow mapping and actionable blueprints with zero upfront retainers.":
      "Mapeo de procesos gratuito y planes de acción concretos, sin anticipos.",
    "Human In the Loop": "Humanos en el proceso",
    "AI does the heavy lifting while your experts maintain quality, control, and compliance.":
      "La IA hace el trabajo pesado mientras tus expertos mantienen la calidad, el control y el cumplimiento.",
    "Seamless Integration": "Integración sin fricciones",
    "End-to-end tool connectivity designed to scale without disrupting daily operations.":
      "Conectividad de herramientas de principio a fin, diseñada para escalar sin interrumpir tus operaciones diarias.",
    "Future-Proof": "Preparado para el futuro",
    "Continuous system adaptation to keep you ahead as technology evolves.":
      "Adaptación continua de los sistemas para mantenerte a la vanguardia a medida que evoluciona la tecnología.",

    // Why Wideout X
    "WHY WIDEOUT X": "POR QUÉ WIDEOUT X",
    "Expert Co-Pilots.": "Copilotos expertos.",
    "Measurable Results.": "Resultados medibles.",
    "We don't just sell software; we engineer custom operational systems. Our services cover every step of your automation journey.":
      "No solo vendemos software; diseñamos sistemas operativos a la medida. Nuestros servicios cubren cada etapa de tu camino hacia la automatización.",
    "Architects, Not Just Vendors": "Arquitectos, no solo proveedores",
    "We act as strategic co-pilots, building custom systems tailored to your specific bottlenecks.":
      "Actuamos como copilotos estratégicos, creando sistemas a la medida de tus cuellos de botella específicos.",
    "Uncompromising Governance": "Gobernanza sin concesiones",
    "Strict quality checkpoints managed by you ensure brand safety, data security, and total control.":
      "Puntos de control de calidad estrictos, gestionados por ti, garantizan la seguridad de tu marca, la protección de tus datos y el control total.",
    "Measurable ROI, Not Hype": "ROI medible, sin exageraciones",
    "Practical, data-driven automation that immediately reduces overhead and accelerates turnarounds.":
      "Automatización práctica y basada en datos que reduce costos de inmediato y acelera los tiempos de entrega.",
    "$0 Until You Sign": "$0 hasta que firmes",
    "You don't need to pay to talk to us. We'll be happy to find out if automation works for you for free. Charges applied once you sign.":
      "No necesitas pagar para hablar con nosotros. Con gusto evaluamos sin costo si la automatización funciona para ti. Los cargos aplican solo cuando firmas.",
    "Are we the right team for your workflows?": "¿Somos el equipo indicado para tus procesos?",
    "Connect with us": "Conecta con nosotros",
    "The Typical Manual Process": "El proceso manual típico",
    "Manual Data Entry": "Captura manual de datos",
    "Prone to errors and delays.": "Propensa a errores y retrasos.",
    "Disjointed Handoffs": "Traspasos desconectados",
    "Context lost between silos.": "Se pierde el contexto entre silos.",
    "Slow Turnaround": "Tiempos de entrega lentos",
    "Bottlenecks kill scalability.": "Los cuellos de botella frenan la escalabilidad.",
    "The Wideout X Path": "El camino Wideout X",
    "End-to-End Automation": "Automatización de principio a fin",
    "Integrated tech stack + AI generation + Human QA checkpoints.":
      "Stack tecnológico integrado + generación con IA + control de calidad humano.",
    "Faster Delivery": "Entregas más rápidas",

    // Stats band
    "Achieve peak productivity with": "Alcanza la máxima productividad con",
    "AI speed and human precision.": "la velocidad de la IA y la precisión humana.",
    "Efficiency Gain": "Aumento de eficiencia",
    "Productivity Gain": "Aumento de productividad",
    "Time Savings": "Ahorro de tiempo",

    // Use cases
    "USE CASES": "CASOS DE USO",
    "High-Impact Automation": "Automatización de alto impacto",
    "Across Your Ecosystem": "En todo tu ecosistema",
    "We partner with forward-thinking enterprises ready to break free from manual bottlenecks. If repetitive workflows are throttling your growth, Wideout X builds the systems to get you out of the weeds.":
      "Nos aliamos con empresas visionarias listas para liberarse de los cuellos de botella manuales. Si los procesos repetitivos están frenando tu crecimiento, Wideout X crea los sistemas para sacarte del atolladero.",
    "Book A Free Call": "Agenda una llamada gratis",
    "Marketing & Creative Operations": "Operaciones de marketing y creatividad",
    "Automate brief creation, high-volume asset generation, and QA checkpoints. Free your top talent from execution so they can focus purely on strategy.":
      "Automatiza la creación de briefs, la generación de activos a gran escala y los controles de calidad. Libera a tu mejor talento de la ejecución para que se enfoque solo en la estrategia.",
    "Internal Process Orchestration": "Orquestación de procesos internos",
    "Streamline complex operational workflows by connecting disjointed tech stacks, eliminating costly manual data entry, and drastically accelerating turnaround times.":
      "Optimiza flujos de trabajo operativos complejos conectando stacks tecnológicos desconectados, eliminando la costosa captura manual de datos y acelerando drásticamente los tiempos de entrega.",
    "Customer Intake & Fulfillment": "Recepción y atención de clientes",
    "Automate order processing, instant quoting, and support triage, enabling your staff to prioritize high-level service delivery instead of administrative tasks.":
      "Automatiza el procesamiento de pedidos, las cotizaciones instantáneas y la clasificación de soporte, para que tu equipo priorice un servicio de alto nivel en lugar de tareas administrativas.",
    'Escaping the "Production Trap"': "Escapar de la «trampa de la producción»",
    "Whether you are a global enterprise or a scaling business, if your team spends more time managing trivial tasks than driving revenue, we deploy the automation to scale your output safely.":
      "Ya sea que seas una empresa global o un negocio en crecimiento, si tu equipo dedica más tiempo a tareas triviales que a generar ingresos, implementamos la automatización para escalar tu producción de forma segura.",

    // Pricing
    "PRICING": "PRECIOS",
    "Milestone Pricing.": "Precios por hitos.",
    "Scale With Confidence.": "Escala con confianza.",
    "Our pragmatic, milestone-based pricing model means no massive upfront retainers. Each phase builds on the last — and you only move forward when you're ready.":
      "Nuestro modelo de precios pragmático y basado en hitos significa que no hay grandes anticipos. Cada fase se construye sobre la anterior, y solo avanzas cuando estás listo.",
    "Phase 1": "Fase 1",
    "Phase 2": "Fase 2",
    "Phase 3": "Fase 3",
    "Capture the Process": "Captura el proceso",
    "30–60 minutes": "30–60 minutos",
    "We map your workflows, identify inefficiencies, and define high-impact automation opportunities.":
      "Mapeamos tus procesos, identificamos ineficiencias y definimos oportunidades de automatización de alto impacto.",
    "DELIVERABLE:": "ENTREGABLE:",
    "A clear process blueprint and prioritized roadmap.": "Un plan de procesos claro y una hoja de ruta priorizada.",
    "$0 / FREE": "$0 / GRATIS",
    "$0 upfront until you sign!": "¡$0 por adelantado hasta que firmes!",
    "Automate Your Process": "Automatiza tu proceso",
    "2–4 weeks": "2–4 semanas",
    "We deploy automation into your workflow, retaining human oversight to ensure quality and control.":
      "Implementamos la automatización en tu proceso, manteniendo la supervisión humana para garantizar la calidad y el control.",
    "A functional, integrated automated workflow.": "Un flujo de trabajo automatizado, funcional e integrado.",
    "Operationalize the Data": "Operacionaliza los datos",
    "3–6 months": "3–6 meses",
    "We structure and connect your data to trigger actions and drive measurable insights.":
      "Estructuramos y conectamos tus datos para desencadenar acciones y generar información medible.",
    "A scalable, data-driven operating model.": "Un modelo operativo escalable y basado en datos.",
    "Contact Sales": "Contacta a ventas",

    // Final CTA
    "Break free from": "Libérate de",
    "operational bottlenecks.": "los cuellos de botella operativos.",
    "Stop letting manual bottlenecks throttle your bandwidth. Wideout X integrates your tech stack and deploys hybrid workflows to eliminate latency and scale throughput. Combine AI speed with human governance to unlock your team's true capacity.":
      "Deja de permitir que los cuellos de botella manuales limiten tu capacidad. Wideout X integra tu stack tecnológico e implementa flujos de trabajo híbridos para eliminar la latencia y escalar el rendimiento. Combina la velocidad de la IA con la gobernanza humana para liberar el verdadero potencial de tu equipo.",
    "Start Automating Now": "Comienza a automatizar ahora",

    // Footer
    "The AI and automation arm of Wideout Workforces Inc.—builds secure, scalable hybrid workflows that replace repetitive tasks with AI speed and human precision.":
      "El brazo de IA y automatización de Wideout Workforces Inc.: crea flujos de trabajo híbridos, seguros y escalables que reemplazan las tareas repetitivas con la velocidad de la IA y la precisión humana.",
    "Company": "Empresa",
    "Careers": "Empleos",
    "Contact": "Contacto",
    "Wideout Group": "Grupo Wideout",
    "© 2025 Wideout X. All rights reserved.": "© 2025 Wideout X. Todos los derechos reservados.",
    "Privacy Policy": "Política de privacidad",
    "Terms of Service": "Términos del servicio",

    // Modal
    "Book with Wideout X": "Agenda con Wideout X"
  };

  // Attribute-based strings (not visible text nodes)
  var ATTR = {
    es: {
      title: "Wideout X | Automatización diseñada por expertos",
      description: "Wideout X crea flujos de trabajo híbridos, seguros y escalables que combinan la velocidad de la IA con la supervisión de expertos humanos para eliminar las tareas manuales repetitivas."
    }
  };
  var ATTR_EN = {
    title: document.title,
    description: (document.querySelector('meta[name="description"]') || {}).content || ""
  };

  // ---- helpers ----
  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  // Pre-normalize dictionary for whitespace-tolerant matching
  var esByNorm = Object.create(null);
  Object.keys(DICT).forEach(function (en) { esByNorm[norm(en)] = DICT[en]; });

  var nodes = null;
  function collectNodes() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest("svg")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var out = [], node;
    while ((node = walker.nextNode())) out.push({ node: node, original: node.nodeValue });
    return out;
  }

  function applyLocale(locale) {
    if (!nodes) nodes = collectNodes();
    var debug = /(^|[?&])i18n=debug/.test(location.search);
    var misses = [];

    nodes.forEach(function (item) {
      if (locale === "es") {
        var key = norm(item.original);
        var es = esByNorm[key];
        if (es) {
          var lead = item.original.match(/^\s*/)[0];
          var trail = item.original.match(/\s*$/)[0];
          item.node.nodeValue = lead + es + trail;
        } else if (debug) {
          misses.push(key);
        }
      } else {
        item.node.nodeValue = item.original; // restore English
      }
    });

    // Attributes (title + meta description)
    var meta = document.querySelector('meta[name="description"]');
    if (locale === "es") {
      document.title = ATTR.es.title;
      if (meta) meta.content = ATTR.es.description;
    } else {
      document.title = ATTR_EN.title;
      if (meta) meta.content = ATTR_EN.description;
    }

    document.documentElement.lang = locale;
    syncSwitcher(locale);

    if (debug && misses.length) {
      console.warn("[i18n] Untranslated strings (" + misses.length + "):");
      misses.forEach(function (m) { console.warn("  • " + m); });
    }
  }

  function localeForCountry(cc) {
    return cc && SPANISH_LATAM.has(cc) ? "es" : "en";
  }

  // ---- Manual preference (a user's switch choice overrides geo, and persists) ----
  function getManual() {
    try { return localStorage.getItem("wox_lang"); } catch (e) { return null; }
  }
  function setManual(locale) {
    try { localStorage.setItem("wox_lang", locale); } catch (e) {}
  }

  // ---- Language switch UI ----
  function syncSwitcher(locale) {
    var opts = document.querySelectorAll(".lang-opt");
    for (var i = 0; i < opts.length; i++) {
      var on = opts[i].getAttribute("data-lang") === locale;
      opts[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  function wireSwitcher() {
    var opts = document.querySelectorAll(".lang-opt");
    for (var i = 0; i < opts.length; i++) {
      opts[i].addEventListener("click", function () {
        var loc = this.getAttribute("data-lang");
        setManual(loc);        // remember the choice for next visit
        applyLocale(loc);      // apply immediately (also syncs the UI)
      });
    }
  }

  // ---- IP country detection with provider fallbacks ----
  function detectCountry() {
    var providers = [
      function () { return fetch("https://ipapi.co/country/").then(function (r) { return r.text(); }).then(function (t) { return t.trim().toUpperCase(); }); },
      function () { return fetch("https://ipwho.is/?fields=country_code").then(function (r) { return r.json(); }).then(function (j) { return (j.country_code || "").toUpperCase(); }); },
      function () { return fetch("https://get.geojs.io/v1/ip/country.json").then(function (r) { return r.json(); }).then(function (j) { return (j.country || "").toUpperCase(); }); }
    ];
    return providers.reduce(function (chain, p) {
      return chain.then(function (cc) {
        if (cc && /^[A-Z]{2}$/.test(cc)) return cc;         // already resolved
        return p().catch(function () { return ""; });        // try next provider
      });
    }, Promise.resolve("")).then(function (cc) {
      return /^[A-Z]{2}$/.test(cc) ? cc : null;
    });
  }

  function run() {
    wireSwitcher();

    var params = new URLSearchParams(location.search);
    var forced = params.get("lang");

    // 1) Manual override via URL wins (great for testing / sharing a language-specific link).
    //    Not persisted — it's a preview, not a saved preference.
    if (forced === "es" || forced === "en") { applyLocale(forced); return; }

    // 2) A saved manual choice (from clicking the switch) beats geo, on every visit.
    var manual = getManual();
    if (manual === "es" || manual === "en") { applyLocale(manual); return; }

    // 3) Geo path. Show cached country instantly (no flash), then refresh in the background.
    var cached = null;
    try { cached = localStorage.getItem("wox_country"); } catch (e) {}
    if (cached) { applyLocale(localeForCountry(cached)); }
    else { syncSwitcher("en"); } // page starts in English until detection resolves

    detectCountry().then(function (cc) {
      if (!cc) return;
      try { localStorage.setItem("wox_country", cc); } catch (e) {}
      // Only apply the geo result if the user hasn't manually chosen in the meantime.
      if (!getManual()) applyLocale(localeForCountry(cc));
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
