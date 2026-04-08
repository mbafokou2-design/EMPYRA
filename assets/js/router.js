/**
 * EMPYRA MINING INNOVATIONS — router.js
 * ─────────────────────────────────────────────
 * Reads ?service=<key> from the URL on page load.
 * Updates the hero section (eyebrow, title, breadcrumb, icon, tab title)
 * without a page reload.
 *
 * Also intercepts all dropdown service-link clicks and pushes a new URL
 * using history.pushState so the page updates instantly + the URL is shareable.
 *
 * Works from any location (local file, server, subdirectory) because it
 * uses relative paths and only manipulates the query string.
 */

(function () {
  "use strict";

  /* ── 1. HELPERS ─────────────────────────────────────────────────── */

  /** Get the current language ("en" or "fr") from localStorage or default to "en" */
  function getLang() {
    return localStorage.getItem("emi_lang") || "en";
  }

  /** Read ?service= from any URL string (defaults to current page URL) */
  function getServiceKey(url) {
    const u = new URL(url || window.location.href, window.location.origin);
    return u.searchParams.get("service") || null;
  }

  /* ── 2. HERO UPDATER ────────────────────────────────────────────── */

  /**
   * Injects service-specific content into the #page-hero section.
   * Falls back gracefully to the default "Our Services" state if no key given.
   *
   * @param {string|null} key   - Route key e.g. "closure", "water"
   * @param {string}      lang  - "en" or "fr"
   */
  function updateHero(key, lang) {
    const hero     = document.getElementById("page-hero");
    if (!hero) return; // not on a page that has the hero — exit silently

    const eyebrowEl   = hero.querySelector(".page-hero-eyebrow");
    const titleEl     = hero.querySelector("h1");
    const breadcrumb  = hero.querySelector(".breadcrumb");
    const watermark   = hero.querySelector(".hero-watermark");

    /* ── DEFAULT STATE (no service selected) ── */
    const DEFAULTS = {
      en: { eyebrow: "What We Do",          title: "Our <em>Services</em>",   breadcrumb: "Services",  icon: "fa-hard-hat" },
      fr: { eyebrow: "Ce Que Nous Faisons", title: "Nos <em>Services</em>",   breadcrumb: "Services",  icon: "fa-hard-hat" }
    };

    const serviceEntry = key && SERVICES_DATA[key] ? SERVICES_DATA[key][lang] : null;
    const data         = serviceEntry || DEFAULTS[lang];

    /* ── EYEBROW ── */
    if (eyebrowEl) {
      eyebrowEl.innerHTML = data.eyebrow;
      // Keep data-en / data-fr in sync so setLang() works later
      eyebrowEl.setAttribute("data-en", SERVICES_DATA[key] ? SERVICES_DATA[key].en.eyebrow : DEFAULTS.en.eyebrow);
      eyebrowEl.setAttribute("data-fr", SERVICES_DATA[key] ? SERVICES_DATA[key].fr.eyebrow : DEFAULTS.fr.eyebrow);
    }

    /* ── TITLE ── */
    if (titleEl) {
      titleEl.innerHTML = data.title;
      titleEl.setAttribute("data-en", SERVICES_DATA[key] ? SERVICES_DATA[key].en.title : DEFAULTS.en.title);
      titleEl.setAttribute("data-fr", SERVICES_DATA[key] ? SERVICES_DATA[key].fr.title : DEFAULTS.fr.title);
    }

    /* ── BREADCRUMB ── */
    if (breadcrumb) {
      // Keep the "Home >" part, replace only the last <span>
      const lastSpan = breadcrumb.querySelector("span:last-child");
      if (lastSpan) {
        lastSpan.textContent = data.breadcrumb;
        lastSpan.setAttribute("data-en", SERVICES_DATA[key] ? SERVICES_DATA[key].en.breadcrumb : DEFAULTS.en.breadcrumb);
        lastSpan.setAttribute("data-fr", SERVICES_DATA[key] ? SERVICES_DATA[key].fr.breadcrumb : DEFAULTS.fr.breadcrumb);
      }
    }

    /* ── WATERMARK ICON ── */
    if (watermark) {
      // Remove any existing fa- icon class and set the new one
      watermark.innerHTML = `<i class="fa ${data.icon}"></i>`;
    }

    /* ── BROWSER TAB TITLE ── */
    const tabSuffix = " – EMPYRA MINING INNOVATIONS";
    if (key && serviceEntry) {
      document.title = data.breadcrumb + tabSuffix;
    } else {
      document.title = (lang === "fr" ? "Services" : "Services") + tabSuffix;
    }
  }

  /* ── 3. ACTIVE LINK HIGHLIGHTER ─────────────────────────────────── */

  /**
   * Adds the "active-service" class to the navbar dropdown link
   * whose data-route matches the current key.
   */
  function highlightActiveLink(key) {
    // Remove any previously highlighted link
    document.querySelectorAll(".service-link.active-service").forEach(function (el) {
      el.classList.remove("active-service");
    });
    if (!key) return;
    const match = document.querySelector(`.service-link[data-route="${key}"]`);
    if (match) match.classList.add("active-service");
  }

  /* ── 4. FULL PAGE UPDATE ────────────────────────────────────────── */

  function applyService(key, pushState) {
    const lang = getLang();

    // Optionally push a new URL so the back button works and links are shareable
    if (pushState) {
      const newURL = key
        ? `${window.location.pathname}?service=${key}`
        : window.location.pathname;
      history.pushState({ service: key }, "", newURL);
    }

    updateHero(key, lang);
    highlightActiveLink(key);

    // Scroll to top of hero smoothly if triggered by a link click
    if (pushState) {
      const hero = document.getElementById("page-hero");
      if (hero) {
        hero.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  /* ── 5. INITIALISE ON PAGE LOAD ─────────────────────────────────── */

  document.addEventListener("DOMContentLoaded", function () {

    // Read the key from the current URL and apply immediately
    const key = getServiceKey();
    applyService(key, false); // don't push state on initial load

    /* ── 6. INTERCEPT DROPDOWN CLICKS ── */
    document.querySelectorAll(".service-link[data-route]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault(); // stop the default href="#" jump

        const route = this.getAttribute("data-route");
        applyService(route, true); // update hero + push URL

        // Close the dropdown / mobile menu if open
        const navMenu = document.getElementById("nav-menu");
        if (navMenu) navMenu.classList.remove("open");
      });
    });

    /* ── 7. ALSO INTERCEPT CATEGORY PAGE LINKS (services.html cards) ── */
    // These are the <a href="service-xxx.html"> links in the categories grid.
    // We convert them to query-param navigation so no new page is needed.
    document.querySelectorAll("a[href^='service-']").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        // Derive the key from the filename: "service-closure.html" → "closure"
        const href  = this.getAttribute("href");                  // e.g. "service-closure.html"
        const match = href.match(/^service-([^.]+)\.html$/);      // capture group = "closure"
        if (!match) return;

        // Handle compound names like "service-water-mine.html" → "water-mine"
        // map known aliases to their SERVICES_DATA key
        const RAW_TO_KEY = {
          "operational-assistance": "operations",
          "water-mine":             "water",
          "risk-mining":            "risk"
        };
        const rawKey = match[1];
        const key    = RAW_TO_KEY[rawKey] || rawKey;

        applyService(key, true);
      });
    });

    /* ── 8. HANDLE BROWSER BACK/FORWARD ── */
    window.addEventListener("popstate", function (e) {
      const key = e.state && e.state.service ? e.state.service : getServiceKey();
      applyService(key, false);
    });

  });

  /* ── 9. EXPOSE PUBLIC API ────────────────────────────────────────── */
  // So services-script.js or any other file can call refreshHero() after a language switch
  window.EMIRouter = {
    refresh: function () {
      const key = getServiceKey();
      applyService(key, false);
    }
  };

})();