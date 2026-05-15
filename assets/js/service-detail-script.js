/* =============================================
   service-detail-script.js
   Reads ?slug= from URL → fetches service from API
   → renders full page content dynamically.

   URL format:
     services/service-detail.html?slug=mine-water-management

   API calls (both public — no auth needed):
     GET /api/services/slug/:slug       → the service
     GET /api/services/category/:cat    → sidebar siblings
============================================= */

var API_BASE = 'https://empyrabackend-production.up.railway.app/api';

var ROOT_URL = (function () {
  var loc  = window.location;
  var path = loc.pathname;

  // If inside /services/, everything before it is the root
  if (path.indexOf('/services/') !== -1) {
    var root = path.split('/services/')[0];
    // file:// has no host, so just use protocol + path
    if (loc.protocol === 'file:') return loc.protocol + '//' + root + '/';
    return loc.protocol + '//' + loc.host + root + '/';
  }

  // At root level — strip the filename (e.g. index.html, services.html)
  var dir = path.replace(/\/[^\/]*$/, '/');
  if (loc.protocol === 'file:') return loc.protocol + '//' + dir;
  return loc.protocol + '//' + loc.host + dir;
})();
/* Category config — labels + icons */
var CATEGORY_CONFIG = {
  environment: {
    en: 'Environment & Sustainable Management',
    fr: 'Environnement & Gestion Durable',
    icon: 'fa-leaf',
    watermark: 'ph ph-leaf'
  },
  audit: {
    en: 'Audits & Risk Management',
    fr: 'Audits & Gestion des Risques',
    icon: 'fa-search',
    watermark: 'ph ph-magnifying-glass-plus'
  },
  exploration: {
    en: 'Resource Assessment & Exploration',
    fr: 'Évaluation des Ressources & Exploration',
    icon: 'fa-compass',
    watermark: 'ph ph-compass'
  },
  engineering: {
    en: 'Engineering & Mining Operations',
    fr: 'Ingénierie & Exploitation Minière',
    icon: 'fa-cogs',
    watermark: 'ph ph-gear-six'
  }
};

/* ── Read ?slug= from URL ── */
function getSlugFromUrl() {
  var params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

/* ── Current language ── */
function getLang() {
  return localStorage.getItem('emi_lang') || 'en';
}

/* ── Fetch wrapper ── */
function apiFetch(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}

/* ── Show 404 state ── */
function showNotFound() {
  document.getElementById('page-hero').style.display    = 'none';
  document.getElementById('service-main').style.display = 'none';
  document.getElementById('service-not-found').style.display = 'block';
  setLangAll(); // translate the 404 message
}

/* =============================================
   MAIN — runs on DOMContentLoaded
============================================= */
document.addEventListener('DOMContentLoaded', function() {
  var slug = getSlugFromUrl();

  if (!slug) {
    showNotFound();
    return;
  }

  /* Fetch service by slug */
  apiFetch(API_BASE + '/services/slug/' + encodeURIComponent(slug))
    .then(function(service) {
      renderPage(service);
      /* After page is rendered, fetch sidebar siblings */
      return apiFetch(API_BASE + '/services/category/' + service.category)
        .then(function(siblings) {
          renderSidebar(service, siblings);
        });
    })
    .catch(function(err) {
      console.error('Service load error:', err);
      showNotFound();
    });
});

/* =============================================
   RENDER PAGE
============================================= */
function renderPage(service) {
  var lang = getLang();
  var title = lang === 'fr' ? service.title_fr : service.title_en;
  var cat   = CATEGORY_CONFIG[service.category] || {};
  var catLabel = lang === 'fr' ? (cat.fr || service.category) : (cat.en || service.category);

  /* ── <title> tag ── */
  document.getElementById('page-title').textContent = title + ' – EMPYRA MINING INNOVATIONS';

  /* ── Hero watermark icon ── */
  var watermark = document.getElementById('hero-watermark');
  if (watermark && cat.watermark) {
    watermark.innerHTML = '<i class="' + cat.watermark + '"></i>';
  }

  /* ── Hero title ── */
  var heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    /* Split title at last word to wrap it in <em> */
    var words = title.trim().split(' ');
    var lastWord = words.pop();
    heroTitle.innerHTML = words.join(' ') + ' <em>' + lastWord + '</em>';
  }

  /* ── Breadcrumb ── */
  var breadcrumb = document.getElementById('breadcrumb-title');
  if (breadcrumb) breadcrumb.textContent = title;

  /* ── Build main content HTML ── */
  var lang_en = lang === 'en';
  var content = '';

  /* Hero image */
  if (service.image_url) {
    content += '<div class="service-image-slot">' +
      '<div class="img-placeholder">' +
        '<img src="' + service.image_url + '" alt="' + escHtml(title) + '"/>' +
      '</div>' +
    '</div>';
  }

  /* Category tag */
  content += '<div class="service-intro-tag">' + escHtml(catLabel) + '</div>';

  /* Main title */
  content += '<h2 class="service-content-title">' + escHtml(title) + '</h2>';
  content += '<div class="content-divider"></div>';

  /* Intro paragraph */
  var intro = lang === 'fr' ? service.intro_fr : service.intro_en;
  if (intro) {
    content += '<div class="service-body"><p>' + escHtml(intro) + '</p></div>';
  } else {
    /* Fallback: use desc if no intro */
    var desc = lang === 'fr' ? service.desc_fr : service.desc_en;
    if (desc) content += '<div class="service-body"><p>' + escHtml(desc) + '</p></div>';
  }

  /* Body paragraph */
  var body = lang === 'fr' ? service.body_fr : service.body_en;
  if (body) {
    content += '<div class="service-body"><p>' + escHtml(body) + '</p></div>';
  }

  /* Body2 paragraph */
  var body2 = lang === 'fr' ? service.body2_fr : service.body2_en;
  if (body2) {
    content += '<div class="service-body"><p>' + escHtml(body2) + '</p></div>';
  }

  /* Bullet list */
  var bullets = lang === 'fr' ? service.bullets_fr : service.bullets_en;
  if (bullets && bullets.length > 0) {
    content += '<div class="service-highlight">';
    content += '<p><strong data-en="Our Services" data-fr="Nos Services">' +
      (lang === 'fr' ? 'Nos Services' : 'Our Services') + '</strong></p>';
    content += '<ul>';
    bullets.forEach(function(bullet) {
      content += '<li>' + escHtml(bullet) + '</li>';
    });
    content += '</ul></div>';
  }

  /* Closing highlight */
  var highlight = lang === 'fr' ? service.highlight_fr : service.highlight_en;
  if (highlight) {
    content += '<div class="service-highlight"><p>' + escHtml(highlight) + '</p></div>';
  }

  /* Inject into page */
  document.getElementById('service-content').innerHTML = content;

  /* Run setLang to translate any data-en/fr elements */
  if (typeof setLang === 'function') setLang(lang);
}

/* =============================================
   RENDER SIDEBAR
   Shows all services in the same category.
   Current service is marked active.
============================================= */
function renderSidebar(currentService, siblings) {
  var lang = getLang();
  var cat  = CATEGORY_CONFIG[currentService.category] || {};
  var catLabel = lang === 'fr' ? (cat.fr || currentService.category) : (cat.en || currentService.category);

  /* Sidebar heading */
  var sidebarTitle = document.getElementById('sidebar-cat-title');
  if (sidebarTitle) sidebarTitle.textContent = catLabel;

  /* Sidebar list */
  var list = document.getElementById('sidebar-services-list');
  if (!list) return;

  if (!siblings || siblings.length === 0) {
    list.innerHTML = '<li style="padding:12px;color:var(--gray);font-size:0.85rem;">No related services.</li>';
    return;
  }

  list.innerHTML = siblings.map(function(s) {
    var isActive  = String(s._id || s.id) === String(currentService._id || currentService.id);
    var sTitle    = lang === 'fr' ? s.title_fr : s.title_en;
    var href = ROOT_URL + 'services/service-detail.html?slug=' + encodeURIComponent(s.slug);

    return '<li' + (isActive ? ' class="active"' : '') + '>' +
      '<a href="' + href + '">' +
        '<i class="fa fa-chevron-right"></i>' +
        '<span>' + escHtml(sTitle) + '</span>' +
      '</a>' +
    '</li>';
  }).join('');
}

/* =============================================
   ESCAPE HTML — prevent XSS from DB content
============================================= */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =============================================
   LANGUAGE SWITCH
   When user clicks EN/FR, re-render the page
   with the new language WITHOUT a page reload.
============================================= */
(function patchSetLang() {
  /* Wait for service-water-script.js to define setLang, then wrap it */
  var maxWait = 50;
  var attempts = 0;
  var interval = setInterval(function() {
    attempts++;
    if (typeof setLang === 'function' || attempts > maxWait) {
      clearInterval(interval);

      var originalSetLang = typeof setLang === 'function' ? setLang : function() {};

      window.setLang = function(lang) {
        originalSetLang(lang);
        /* Re-render page content in new language */
        var slug = getSlugFromUrl();
        if (!slug) return;
        apiFetch(API_BASE + '/services/slug/' + encodeURIComponent(slug))
          .then(function(service) {
            renderPage(service);
            return apiFetch(API_BASE + '/services/category/' + service.category)
              .then(function(siblings) { renderSidebar(service, siblings); });
          })
          .catch(function() {});
      };
    }
  }, 100);
})();

/* ─────────────────────────────────────────────
   HOW SERVICE LINKS WORK
   ─────────────────────────────────────────────
   Old static URL:
     services/service-water.html

   New dynamic URL:
     services/service-detail.html?slug=mine-water-management

   The slug is auto-generated from the title when
   you create a service in the dashboard.
   Example titles → slugs:
     "Mine Water Management"    → mine-water-management
     "Open Pit Mines"           → open-pit-mines
     "Risk Management"          → risk-management
     "Underground Mines"        → underground-mines

   To get the slug of any service:
     GET /api/services  → each object has a .slug field
   ─────────────────────────────────────────────
*/
