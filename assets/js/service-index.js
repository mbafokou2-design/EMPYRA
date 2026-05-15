/* =============================================
   service-index.js
   Dynamically renders the homepage service cards and
   the service dropdown menu from the dashboard API.
============================================= */

var API_BASE = 'https://empyrabackend-production.up.railway.app/api';

/* ─── ROOT_URL: always points to the project root ───────────────────
   Walks up the pathname and stops just before /services/
   Works for file://, localhost, and deployed domains.
──────────────────────────────────────────────────────────────────── */
var ROOT_URL = (function () {
  var parts = window.location.pathname.split('/');
  var root  = [];
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].toLowerCase() === 'services') break;
    root.push(parts[i]);
  }
  return window.location.protocol + '//' + window.location.host + root.join('/') + '/';
})();

var SERVICE_CATEGORY_CONFIG = {
  environment: {
    label_en: 'Environment & Sustainable Management',
    label_fr: 'Environnement & Gestion Durable',
    icon: 'ph-leaf'
  },
  audit: {
    label_en: 'Audits & Risk Management',
    label_fr: 'Audits & Gestion des Risques',
    icon: 'ph-magnifying-glass-plus'
  },
  exploration: {
    label_en: 'Resource Assessment & Exploration',
    label_fr: 'Exploration & Évaluation des Ressources',
    icon: 'ph-compass'
  },
  engineering: {
    label_en: 'Engineering & Mining Operations',
    label_fr: 'Ingénierie & Exploitation Minière',
    icon: 'ph-gear-six'
  }
};

function getLang() {
  return localStorage.getItem('emi_lang') || 'en';
}

function escHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function apiFetch(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}

function buildServiceCard(service, lang) {
  var title = lang === 'fr' ? service.title_fr : service.title_en;
  var desc  = lang === 'fr' ? service.desc_fr  : service.desc_en;
  var icon  = service.icon || 'ph-hard-hat';
  var href  = ROOT_URL + 'services/service-detail.html?slug=' + encodeURIComponent(service.slug || '');

  return '<div class="service-card">' +
    '<div class="service-card-icon"><i class="ph ' + escHtml(icon) + '"></i></div>' +
    '<h3>' + escHtml(title) + '</h3>' +
    '<p>' + escHtml(desc) + '</p>' +
    '<a href="' + href + '" class="service-card-link">' +
      (lang === 'fr' ? 'En savoir plus' : 'Learn More') + ' <i class="fa fa-arrow-right"></i>' +
    '</a>' +
  '</div>';
}

function renderServicesGrid(services) {
  var grid = document.getElementById('services-grid');
  if (!grid) return;

  var lang = getLang();
  var published = Array.isArray(services)
    ? services.filter(function(s) { return s.status === 'published'; })
    : [];

  if (published.length === 0) {
    grid.innerHTML = '<div class="services-empty">' +
      '<p>No services available right now.</p>' +
    '</div>';
    return;
  }

  grid.innerHTML = published.map(function(service) {
    return buildServiceCard(service, lang);
  }).join('');

  if (window.revealObs) {
    Array.prototype.forEach.call(grid.querySelectorAll('.service-card'), function(card, index) {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(30px)';
      card.style.transition = 'opacity 0.5s ' + (index * 0.06) + 's, transform 0.5s ' + (index * 0.06) + 's';
      window.revealObs.observe(card);
    });
  }

  if (typeof setLang === 'function') setLang(lang);
}

function renderNavServices(services) {
  var menu = document.getElementById('nav-services-dropdown');
  if (!menu) return;

  var lang = getLang();
  var groups = {};

  (Array.isArray(services) ? services : []).forEach(function(service) {
    if (service.status !== 'published') return;
    var category = service.category || 'other';
    groups[category] = groups[category] || [];
    groups[category].push(service);
  });

  var categoryKeys = Object.keys(groups);

  if (categoryKeys.length === 0) {
    menu.innerHTML = '<div class="dropdown-loading" style="padding:20px;color:var(--gray);font-size:0.85rem;">' +
      'No services available.</div>';
    return;
  }

  var html = categoryKeys.map(function(category) {
    var cfg = SERVICE_CATEGORY_CONFIG[category] || {
      label_en: category,
      label_fr: category,
      icon: 'ph-caret-right'
    };
    var label = lang === 'fr' ? cfg.label_fr : cfg.label_en;

    var servicesHtml = groups[category].map(function(service) {
      var title = lang === 'fr' ? service.title_fr : service.title_en;
      var href  = ROOT_URL + 'services/service-detail.html?slug=' + encodeURIComponent(service.slug || '');

      /* ✅ Use the service's own icon; fall back to category icon, then generic */
      var iconClass = service.icon || cfg.icon || 'ph-hard-hat';

      /* Detect whether it's a Phosphor icon (ph-) or FontAwesome (fa-) */
      var iconHtml = iconClass.startsWith('fa')
        ? '<i class="fa ' + escHtml(iconClass) + '"></i>'
        : '<i class="ph ' + escHtml(iconClass) + '"></i>';

      return '<li>' +
        '<a href="' + escHtml(href) + '">' +
          iconHtml +
          '<span>' + escHtml(title) + '</span>' +
        '</a>' +
      '</li>';
    }).join('');

    return '<div class="dropdown-group">' +
      '<div class="dropdown-group-title">' + escHtml(label) + '</div>' +
      servicesHtml +
    '</div>';
  }).join('');

  menu.innerHTML = html;
}

function loadHomepageServices() {
  apiFetch(API_BASE + '/services')
    .then(function(services) {
      renderNavServices(services);
      renderServicesGrid(services);
    })
    .catch(function(err) {
      console.error('Could not load homepage services:', err);
      var grid = document.getElementById('services-grid');
      if (grid) {
        grid.innerHTML = '<div class="services-empty">' +
          '<p>Unable to load services.</p>' +
        '</div>';
      }
    });
}

document.addEventListener('DOMContentLoaded', loadHomepageServices);
