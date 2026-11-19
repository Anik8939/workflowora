/* WorkFlowora — Zero-Reload 6-Language Switcher (EN, DE, FR, ES, JA, PT),
   Currency Formatter, Dark Mode Persistence & Mobile Drawer */
(function () {
  "use strict";

  var CURRENCY_MAP = {
    USD: { symbol: "$", rate: 1, decimals: 2 },
    EUR: { symbol: "€", rate: 0.92, decimals: 2 },
    GBP: { symbol: "£", rate: 0.79, decimals: 2 },
    JPY: { symbol: "¥", rate: 152, decimals: 0 },
    BRL: { symbol: "R$", rate: 5.75, decimals: 2 },
    CAD: { symbol: "C$", rate: 1.39, decimals: 2 },
    AUD: { symbol: "A$", rate: 1.53, decimals: 2 },
    CHF: { symbol: "CHF ", rate: 0.88, decimals: 2 }
  };

  var TRANSLATIONS = {
    en: {
      nav_calculators: "Calculators",
      nav_tax: "Tax Comparator",
      nav_guides: "Guides",
      nav_requests: "Request Tool",
      nav_about: "About",
      nav_contact: "Contact",
      hero_badge: "100% Client-Side • Zero Sign-Up • Instant Math",
      hero_title: "Precision Financial, SaaS & Freelance Calculators Built for Real Decisions",
      hero_subtitle: "Run transparent loan amortization, compound interest, break-even ROAS, US 1099 tax, startup runway, and FIRE projections directly in your browser—paired with in-depth methodology guides.",
      hero_cta_tools: "Launch Calculators",
      hero_cta_guides: "Read Methodology Guides",
      hero_trust_1: "14 Specialized Formulas",
      hero_trust_2: "12 Original Deep-Dive Guides",
      hero_trust_3: "Private In-Browser Execution",
      sec_calc_title: "Interactive Calculator Suite",
      sec_calc_desc: "Select any tool below to open its dedicated real-time calculator. Every tool uses its own domain-specific formula with live breakdowns.",
      filter_all: "All Tools (14)",
      filter_finance: "Personal Finance",
      filter_business: "SaaS & E-Commerce",
      filter_freelance: "Freelance & Tax",
      filter_productivity: "Productivity & Health",
      sec_tax_title: "Global Income & Effective Tax Comparator",
      sec_tax_desc: "Estimate how an equivalent annual gross salary translates into take-home pay across 9 major economies using standard single-filer progressive brackets.",
      tax_label_income: "Annual Gross Income",
      tax_label_filing: "Benchmark Currency",
      sec_guides_title: "In-Depth Financial & Productivity Guides",
      sec_guides_desc: "Twelve original, worked-example playbooks covering the exact formulas, edge cases, and practical benchmarks behind every WorkFlowora calculator.",
      sec_req_title: "Visitor Feature Request Board",
      sec_req_desc: "Need a niche financial or workflow calculator? Submit your idea or upvote community requests below.",
      req_form_title: "Suggest a New Calculator",
      req_name_label: "Calculator or Guide Name",
      req_cat_label: "Category",
      req_desc_label: "Formula or Use Case Details",
      req_submit_btn: "Submit Request",
      req_board_title: "Community Upvote Queue",
      footer_tagline: "Independent financial, SaaS, freelancing, and productivity calculators built for transparent client-side math and practical decision making.",
      footer_tools_heading: "Popular Calculators",
      footer_guides_heading: "Featured Guides",
      footer_legal_heading: "Company & Legal",
      legal_privacy: "Privacy Policy",
      legal_terms: "Terms & Conditions",
      legal_disclaimer: "Financial Disclaimer",
      footer_rights: "All calculations run privately in your browser for educational and planning purposes.",
      open_tool: "Open Calculator →",
      read_guide: "Read Full Guide →"
    },
    de: {
      nav_calculators: "Rechner",
      nav_tax: "Steuervergleich",
      nav_guides: "Ratgeber",
      nav_requests: "Tool vorschlagen",
      nav_about: "Über uns",
      nav_contact: "Kontakt",
      hero_badge: "100 % lokal im Browser • Ohne Anmeldung • Echtzeit",
      hero_title: "Präzise Finanz-, SaaS- & Freelance-Rechner für fundierte Entscheidungen",
      hero_subtitle: "Berechnen Sie Kredit-Raten, Zinseszins, Break-Even-ROAS, US-1099-Steuern, Startup-Runway und FIRE-Ziele direkt im Browser – ergänzt durch fundierte Fachartikel.",
      hero_cta_tools: "Rechner starten",
      hero_cta_guides: "Fachratgeber lesen",
      hero_trust_1: "14 spezialisierte Formeln",
      hero_trust_2: "12 ausführliche Leitfäden",
      hero_trust_3: "Datenschutz im Browser",
      sec_calc_title: "Interaktive Rechner-Suite",
      sec_calc_desc: "Wählen Sie ein Tool aus, um den jeweiligen Echtzeit-Rechner mit eigener Fachformel zu öffnen.",
      filter_all: "Alle Tools (14)",
      filter_finance: "Privatfinanzen",
      filter_business: "SaaS & E-Commerce",
      filter_freelance: "Freelance & Steuern",
      filter_productivity: "Produktivität & Gesundheit",
      sec_tax_title: "Internationaler Einkommensteuer-Vergleich",
      sec_tax_desc: "Vergleichen Sie das geschätzte Nettoeinkommen für dasselbe Bruttogehalt in 9 großen Volkswirtschaften.",
      tax_label_income: "Jährliches Bruttoeinkommen",
      tax_label_filing: "Vergleichswährung",
      sec_guides_title: "Ausführliche Finanz- & Produktivitäts-Ratgeber",
      sec_guides_desc: "Zwölf eigenständige Leitfäden mit Rechenbeispielen, Tabellen und Praxis-Benchmarks zu jedem Rechner.",
      sec_req_title: "Wunschliste für neue Tools",
      sec_req_desc: "Fehlt Ihnen ein bestimmter Rechner? Reichen Sie Ihren Vorschlag ein oder stimmen Sie für bestehende Ideen ab.",
      req_form_title: "Neuen Rechner vorschlagen",
      req_name_label: "Name des Rechners oder Ratgebers",
      req_cat_label: "Kategorie",
      req_desc_label: "Formel oder Anwendungsfall",
      req_submit_btn: "Vorschlag senden",
      req_board_title: "Community-Abstimmung",
      footer_tagline: "Unabhängige Finanz-, SaaS-, Freelance- und Produktivitätsrechner mit transparenter Berechnung im Browser.",
      footer_tools_heading: "Beliebte Rechner",
      footer_guides_heading: "Empfohlene Ratgeber",
      footer_legal_heading: "Unternehmen & Rechtliches",
      legal_privacy: "Datenschutz",
      legal_terms: "Nutzungsbedingungen",
      legal_disclaimer: "Haftungsausschluss",
      footer_rights: "Alle Berechnungen erfolgen privat im Browser zu Informations- und Planungszwecken.",
      open_tool: "Rechner öffnen →",
      read_guide: "Ratgeber lesen →"
    },
    fr: {
      nav_calculators: "Calculateurs",
      nav_tax: "Comparateur Fiscal",
      nav_guides: "Guides",
      nav_requests: "Suggérer un outil",
      nav_about: "À propos",
      nav_contact: "Contact",
      hero_badge: "100 % Côté Client • Sans Inscription • Calcul Instantané",
      hero_title: "Calculateurs Financiers, SaaS et Freelance de Précision",
      hero_subtitle: "Simulez vos mensualités de prêt, intérêts composés, ROAS seuil de rentabilité, impôts 1099, trésorerie startup et retraite FIRE directement dans votre navigateur.",
      hero_cta_tools: "Ouvrir les calculateurs",
      hero_cta_guides: "Lire les guides",
      hero_trust_1: "14 formules spécialisées",
      hero_trust_2: "12 guides approfondis",
      hero_trust_3: "Calcul privé local",
      sec_calc_title: "Suite de Calculateurs Interactifs",
      sec_calc_desc: "Sélectionnez un outil ci-dessous pour accéder à son calculateur en temps réel et ses formules dédiées.",
      filter_all: "Tous les outils (14)",
      filter_finance: "Finances Personnelles",
      filter_business: "SaaS & E-Commerce",
      filter_freelance: "Freelance & Impôts",
      filter_productivity: "Productivité & Santé",
      sec_tax_title: "Comparateur International d'Impôt sur le Revenu",
      sec_tax_desc: "Estimez votre revenu net disponible à salaire brut équivalent dans 9 grandes économies.",
      tax_label_income: "Revenu Brut Annuel",
      tax_label_filing: "Devise de référence",
      sec_guides_title: "Guides Pratiques Finance & Productivité",
      sec_guides_desc: "Douze dossiers originaux avec exemples chiffrés, tableaux comparatifs et FAQ détaillées.",
      sec_req_title: "Boîte à Idées des Visiteurs",
      sec_req_desc: "Besoin d'un calculateur spécifique ? Proposez votre idée ou votez pour les demandes de la communauté.",
      req_form_title: "Proposer un calculateur",
      req_name_label: "Nom du calculateur ou du guide",
      req_cat_label: "Catégorie",
      req_desc_label: "Détails de la formule ou cas d'usage",
      req_submit_btn: "Envoyer la demande",
      req_board_title: "Votes de la communauté",
      footer_tagline: "Calculateurs indépendants en finance, SaaS, freelancing et productivité exécutés localement dans votre navigateur.",
      footer_tools_heading: "Calculateurs Populaires",
      footer_guides_heading: "Guides Vedettes",
      footer_legal_heading: "Informations Légales",
      legal_privacy: "Confidentialité",
      legal_terms: "Conditions d'utilisation",
      legal_disclaimer: "Avertissement Financier",
      footer_rights: "Tous les calculs sont exécutés localement dans votre navigateur à des fins éducatives.",
      open_tool: "Ouvrir le calculateur →",
      read_guide: "Lire le guide →"
    },
    es: {
      nav_calculators: "Calculadoras",
      nav_tax: "Comparador Fiscal",
      nav_guides: "Guías",
      nav_requests: "Pedir Herramienta",
      nav_about: "Nosotros",
      nav_contact: "Contacto",
      hero_badge: "100 % en el Navegador • Sin Registro • Cálculo Instantáneo",
      hero_title: "Calculadoras Financieras, SaaS y Freelance de Alta Precisión",
      hero_subtitle: "Calcula cuotas de préstamo, interés compuesto, ROAS de equilibrio, impuestos 1099, runway de startups y retiro FIRE al instante, junto con guías detalladas.",
      hero_cta_tools: "Abrir Calculadoras",
      hero_cta_guides: "Leer Guías",
      hero_trust_1: "14 Fórmulas Especializadas",
      hero_trust_2: "12 Guías Originales",
      hero_trust_3: "Privacidad Local",
      sec_calc_title: "Suite de Calculadoras Interactivas",
      sec_calc_desc: "Selecciona cualquier herramienta para abrir su calculadora en tiempo real con fórmulas reales y desgloses claros.",
      filter_all: "Todas (14)",
      filter_finance: "Finanzas Personales",
      filter_business: "SaaS y E-Commerce",
      filter_freelance: "Freelance e Impuestos",
      filter_productivity: "Productividad y Salud",
      sec_tax_title: "Comparador Global de Impuesto sobre la Renta",
      sec_tax_desc: "Compara el salario neto estimado a partir de un mismo ingreso bruto anual en 9 grandes economías.",
      tax_label_income: "Ingreso Bruto Anual",
      tax_label_filing: "Moneda de referencia",
      sec_guides_title: "Guías Profundas de Finanzas y Productividad",
      sec_guides_desc: "Doce guías originales con ejercicios numéricos, tablas comparativas y preguntas frecuentes.",
      sec_req_title: "Tablero de Solicitudes de Herramientas",
      sec_req_desc: "¿Necesitas una calculadora nueva? Envía tu propuesta o vota por las solicitudes existentes.",
      req_form_title: "Sugerir Nueva Calculadora",
      req_name_label: "Nombre de la calculadora o guía",
      req_cat_label: "Categoría",
      req_desc_label: "Fórmula o caso de uso",
      req_submit_btn: "Enviar Solicitud",
      req_board_title: "Votación de la Comunidad",
      footer_tagline: "Calculadoras independientes de finanzas, SaaS, freelancing y productividad con cálculo transparente en el navegador.",
      footer_tools_heading: "Calculadoras Populares",
      footer_guides_heading: "Guías Destacadas",
      footer_legal_heading: "Empresa y Legal",
      legal_privacy: "Política de Privacidad",
      legal_terms: "Términos y Condiciones",
      legal_disclaimer: "Aviso Financiero",
      footer_rights: "Todos los cálculos se ejecutan de forma privada en tu navegador con fines educativos.",
      open_tool: "Abrir Calculadora →",
      read_guide: "Leer Guía Completa →"
    },
    ja: {
      nav_calculators: "計算ツール",
      nav_tax: "税率比較",
      nav_guides: "ガイド",
      nav_requests: "機能リクエスト",
      nav_about: "概要",
      nav_contact: "お問い合わせ",
      hero_badge: "完全ブラウザ完結・登録不要・リアルタイム計算",
      hero_title: "実務に使える金融・SaaS・フリーランス専用計算ツール",
      hero_subtitle: "ローン返済、複利運用、損益分岐ROAS、米国1099税金、スタートアップのランウェイ、FIRE資産計算をブラウザ上で即時にシミュレーションできます。",
      hero_cta_tools: "計算ツールを開く",
      hero_cta_guides: "解説ガイドを読む",
      hero_trust_1: "14種類の専門計算式",
      hero_trust_2: "12本の独自解説ガイド",
      hero_trust_3: "ブラウザ内プライバシー保護",
      sec_calc_title: "インタラクティブ計算ツール一覧",
      sec_calc_desc: "下のカードからツールを選ぶと、専用の数式によるリアルタイム計算パネルが開きます。",
      filter_all: "すべて (14)",
      filter_finance: "個人ファイナンス",
      filter_business: "SaaS・EC",
      filter_freelance: "フリーランス・税金",
      filter_productivity: "生産性・健康",
      sec_tax_title: "世界主要国の所得税・手取り比較",
      sec_tax_desc: "同じ年収（額面）から主要9カ国の実効税率と手取り額の目安を一覧で比較できます。",
      tax_label_income: "年間総収入（額面）",
      tax_label_filing: "表示通貨",
      sec_guides_title: "金融・ビジネス実践ガイド",
      sec_guides_desc: "各ツールの数式、具体的な数値例、比較表、よくある質問をまとめた12本のオリジナル記事。",
      sec_req_title: "ツール追加リクエストボード",
      sec_req_desc: "追加してほしい計算ツールを投稿したり、コミュニティの提案に投票できます。",
      req_form_title: "新しいツールを提案",
      req_name_label: "ツールまたはガイド名",
      req_cat_label: "カテゴリー",
      req_desc_label: "計算内容・用途の詳細",
      req_submit_btn: "リクエストを送信",
      req_board_title: "コミュニティ投票一覧",
      footer_tagline: "金融・SaaS・フリーランス・生産性向上のためのクライアントサイド計算ツールと専門ガイド。",
      footer_tools_heading: "人気の計算ツール",
      footer_guides_heading: "注目のガイド",
      footer_legal_heading: "運営・法的情報",
      legal_privacy: "プライバシーポリシー",
      legal_terms: "利用規約",
      legal_disclaimer: "免責事項",
      footer_rights: "すべての計算は教育・計画目的でお使いのブラウザ内のみで処理されます。",
      open_tool: "ツールを開く →",
      read_guide: "ガイドを読む →"
    },
    pt: {
      nav_calculators: "Calculadoras",
      nav_tax: "Comparador Fiscal",
      nav_guides: "Guias",
      nav_requests: "Pedir Ferramenta",
      nav_about: "Sobre",
      nav_contact: "Contato",
      hero_badge: "100% no Navegador • Sem Cadastro • Cálculo Instantâneo",
      hero_title: "Calculadoras Financeiras, SaaS e Freelance de Alta Precisão",
      hero_subtitle: "Simule parcelas de empréstimo, juros compostos, ROAS de equilíbrio, impostos 1099, runway de startups e aposentadoria FIRE direto no navegador.",
      hero_cta_tools: "Abrir Calculadoras",
      hero_cta_guides: "Ler Guias Completos",
      hero_trust_1: "14 Fórmulas Especializadas",
      hero_trust_2: "12 Guias Aprofundados",
      hero_trust_3: "Privacidade no Navegador",
      sec_calc_title: "Suíte de Calculadoras Interativas",
      sec_calc_desc: "Selecione qualquer ferramenta abaixo para abrir a calculadora em tempo real com sua própria fórmula.",
      filter_all: "Todas (14)",
      filter_finance: "Finanças Pessoais",
      filter_business: "SaaS e E-Commerce",
      filter_freelance: "Freelance e Impostos",
      filter_productivity: "Produtividade e Saúde",
      sec_tax_title: "Comparador Global de Imposto de Renda",
      sec_tax_desc: "Estime quanto um mesmo salário bruto anual rende líquido em 9 grandes economias.",
      tax_label_income: "Renda Bruta Anual",
      tax_label_filing: "Moeda de referência",
      sec_guides_title: "Guias Aprofundados de Finanças e Produtividade",
      sec_guides_desc: "Doze guias originais com exemplos numéricos reais, tabelas comparativas e perguntas frequentes.",
      sec_req_title: "Mural de Pedidos de Ferramentas",
      sec_req_desc: "Precisa de uma calculadora específica? Envie sua sugestão ou vote nas ideias da comunidade.",
      req_form_title: "Sugerir Nova Calculadora",
      req_name_label: "Nome da calculadora ou guia",
      req_cat_label: "Categoria",
      req_desc_label: "Detalhes da fórmula ou uso",
      req_submit_btn: "Enviar Pedido",
      req_board_title: "Fila de Votos da Comunidade",
      footer_tagline: "Calculadoras independentes de finanças, SaaS, freelancing e produtividade executadas com transparência no navegador.",
      footer_tools_heading: "Calculadoras Populares",
      footer_guides_heading: "Guias em Destaque",
      footer_legal_heading: "Empresa e Legal",
      legal_privacy: "Política de Privacidade",
      legal_terms: "Termos e Condições",
      legal_disclaimer: "Aviso Financeiro",
      footer_rights: "Todos os cálculos são executados localmente no seu navegador para fins educativos.",
      open_tool: "Abrir Calculadora →",
      read_guide: "Ler Guia Completo →"
    }
  };

  function getSavedLang() {
    try {
      var l = localStorage.getItem("wf_lang");
      return TRANSLATIONS[l] ? l : "en";
    } catch (e) {
      return "en";
    }
  }

  function getSavedCurrency() {
    try {
      var c = localStorage.getItem("wf_currency");
      return CURRENCY_MAP[c] ? c : "USD";
    } catch (e) {
      return "USD";
    }
  }

  function applyLanguage(lang) {
    var dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.documentElement.setAttribute("lang", lang);
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (dict[key]) {
        nodes[i].textContent = dict[key];
      }
    }
    try {
      localStorage.setItem("wf_lang", lang);
    } catch (e) {}
  }

  function formatMoney(amount, currencyOverride) {
    var code = currencyOverride || window.WF_STATE.currency || "USD";
    var cfg = CURRENCY_MAP[code] || CURRENCY_MAP.USD;
    var val = isFinite(amount) ? amount : 0;
    var sign = val < 0 ? "-" : "";
    var abs = Math.abs(val);
    var formatted = abs.toLocaleString("en-US", {
      minimumFractionDigits: cfg.decimals,
      maximumFractionDigits: cfg.decimals
    });
    return sign + cfg.symbol + formatted;
  }

  window.WF_STATE = {
    lang: getSavedLang(),
    currency: getSavedCurrency(),
    currencyMap: CURRENCY_MAP,
    formatMoney: formatMoney,
    applyLanguage: applyLanguage
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Language Switcher
    var langSelect = document.getElementById("wf-lang-select");
    if (langSelect) {
      langSelect.value = window.WF_STATE.lang;
      applyLanguage(window.WF_STATE.lang);
      langSelect.addEventListener("change", function () {
        window.WF_STATE.lang = langSelect.value;
        applyLanguage(langSelect.value);
      });
    }

    // Currency Switcher
    var currSelect = document.getElementById("wf-currency-select");
    if (currSelect) {
      currSelect.value = window.WF_STATE.currency;
      currSelect.addEventListener("change", function () {
        window.WF_STATE.currency = currSelect.value;
        try {
          localStorage.setItem("wf_currency", currSelect.value);
        } catch (e) {}
        window.dispatchEvent(new CustomEvent("wf:currency-change", { detail: currSelect.value }));
      });
    }

    // Dark Mode Persistence
    var themeBtn = document.getElementById("wf-theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("wf_theme", next);
        } catch (e) {}
      });
    }

    // Mobile Menu Drawer
    var menuBtn = document.getElementById("wf-mobile-menu-btn");
    var drawer = document.getElementById("wf-mobile-drawer");
    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", function () {
        var isHidden = drawer.hasAttribute("hidden");
        if (isHidden) {
          drawer.removeAttribute("hidden");
          menuBtn.setAttribute("aria-expanded", "true");
        } else {
          drawer.setAttribute("hidden", "");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
      drawer.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          drawer.setAttribute("hidden", "");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  });
})();
