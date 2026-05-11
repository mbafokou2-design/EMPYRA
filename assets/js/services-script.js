/* =============================================
   EMI — services-script.js
============================================= */

/* --- LANGUAGE SWITCHER --- */
function setLang(lang) {
  localStorage.setItem('emi_lang', lang);
  var label = document.getElementById('lang-label');
  if (label) label.textContent = lang.toUpperCase();
  var optEn = document.getElementById('opt-en');
  var optFr = document.getElementById('opt-fr');
  if (optEn) optEn.classList.toggle('active', lang === 'en');
  if (optFr) optFr.classList.toggle('active', lang === 'fr');
  document.querySelectorAll('[data-en]').forEach(function(el) {
    var text = el.getAttribute('data-' + lang);
    if (text !== null) {
      if (text.indexOf('<') !== -1) el.innerHTML = text;
      else el.textContent = text;
    }
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(function(el) {
    var ph = el.getAttribute('data-placeholder-' + lang);
    if (ph) el.placeholder = ph;
  });
  document.documentElement.lang = lang;
  if (window.EMIRouter) window.EMIRouter.refresh();
}
(function() { setLang(localStorage.getItem('emi_lang') || 'en'); })();

/* --- NAVBAR --- */
var navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* --- HAMBURGER --- */
var hamburger = document.getElementById('hamburger');
var navMenu   = document.getElementById('nav-menu');
hamburger.addEventListener('click', function() {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('.nav-link').forEach(function(link) {
  link.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && link.parentElement.querySelector('.dropdown')) {
      e.preventDefault();
      link.parentElement.classList.toggle('open');
    }
  });
});

/* --- LANGUAGE DROPDOWN mobile --- */
var navLang     = document.getElementById('nav-lang');
var langTrigger = document.getElementById('lang-trigger');
if (langTrigger) {
  langTrigger.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) { e.stopPropagation(); navLang.classList.toggle('open'); }
  });
}

/* --- CLOSE ALL on outside click --- */
document.addEventListener('click', function(e) {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    navMenu.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('open'); });
    if (navLang) navLang.classList.remove('open');
    closeSearch();
  }
});

/* --- SEARCH POPUP --- */
var searchBtn    = document.getElementById('search-btn');
var searchPopup  = document.getElementById('search-popup');
var searchInput  = document.getElementById('search-input');
var searchSubmit = document.getElementById('search-submit');

function openSearch() {
  searchPopup.classList.add('active');
  searchBtn.classList.add('active');
  setTimeout(function() { searchInput.focus(); }, 80);
}
function closeSearch() {
  if (searchPopup) { searchPopup.classList.remove('active'); searchBtn.classList.remove('active'); }
}
function handleSearch() {
  var query = searchInput.value.trim();
  if (!query) return;
  window.open('https://www.google.com/search?q=site:emi.stevodigital.com+' + encodeURIComponent(query), '_blank');
  closeSearch();
}
searchBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  searchPopup.classList.contains('active') ? closeSearch() : openSearch();
});
searchPopup.addEventListener('click', function(e) { e.stopPropagation(); });
searchSubmit.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleSearch();
  if (e.key === 'Escape') closeSearch();
});
document.querySelectorAll('.search-suggestion-tag').forEach(function(tag) {
  tag.addEventListener('click', function(e) {
    e.stopPropagation();
    var lang = localStorage.getItem('emi_lang') || 'en';
    searchInput.value = tag.getAttribute('data-' + lang) || tag.textContent;
    searchInput.focus();
  });
});

/* --- SCROLL REVEAL --- */
var revealObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });

/* --- BACK TO TOP --- */
var btt = document.getElementById('back-to-top');
window.addEventListener('scroll', function() { btt.classList.toggle('visible', window.scrollY > 400); });
btt.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

/* --- LOAD DYNAMIC SERVICES FROM DASHBOARD --- */
function loadDynamicServices() {
  var API_BASE = 'http://localhost:5000/api';
  fetch(API_BASE + '/services')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    })
    .then(function(services) {
      renderCategoriesGrid(services);
    })
    .catch(function(error) {
      console.error('Error loading dynamic services:', error);
      // Fallback to static content if API fails
    });
}

function renderCategoriesGrid(services) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var grid = document.querySelector('.categories-grid');
  if (!grid) return;

  var categoryConfig = {
    environment: {
      label_en: 'Environment & Sustainable Management',
      label_fr: 'Environnement & Gestion Durable',
      icon: 'fa-leaf'
    },
    audit: {
      label_en: 'Audits, Expertise & Risk Management',
      label_fr: 'Audits, Expertise & Gestion des Risques',
      icon: 'fa-search-plus'
    },
    exploration: {
      label_en: 'Resource Assessment & Exploration',
      label_fr: 'Évaluation des Ressources & Exploration',
      icon: 'fa-compass'
    },
    engineering: {
      label_en: 'Engineering & Mining Operations',
      label_fr: 'Ingénierie & Exploitation Minière',
      icon: 'fa-cogs'
    }
  };

  var groups = {};
  services.forEach(function(service) {
    if (service.status !== 'published') return;
    var category = service.category || 'other';
    groups[category] = groups[category] || [];
    groups[category].push(service);
  });

  var html = Object.keys(groups).map(function(category) {
    var cfg = categoryConfig[category] || {
      label_en: category,
      label_fr: category,
      icon: 'fa-star'
    };
    var label = lang === 'fr' ? cfg.label_fr : cfg.label_en;

    var servicesHtml = groups[category].map(function(service) {
      var title = lang === 'fr' ? service.title_fr : service.title_en;
      var href = './services/service-detail.html?slug=' + encodeURIComponent(service.slug || service.id);
      return '<li>' +
        '<a href="' + href + '" class="category-link">' +
          '<span class="category-link-left">' +
            '<i class="fa ' + cfg.icon + '"></i>' +
            '<span data-en="' + (service.title_en || service.title) + '" data-fr="' + (service.title_fr || service.title) + '">' + title + '</span>' +
          '</span>' +
          '<i class="fa fa-chevron-right category-link-arrow"></i>' +
        '</a>' +
      '</li>';
    }).join('');

    return '<div class="category-card reveal">' +
      '<div class="category-card-header">' +
        '<div class="category-icon"><i class="fa ' + cfg.icon + '"></i></div>' +
        '<h3 data-en="' + cfg.label_en + '" data-fr="' + cfg.label_fr + '">' + label + '</h3>' +
      '</div>' +
      '<ul class="category-links">' +
        servicesHtml +
      '</ul>' +
    '</div>';
  }).join('');

  grid.innerHTML = html;

  // Re-apply reveal observer to new elements
  document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });

  // Re-apply language switching
  setLang(lang);
}

document.addEventListener('DOMContentLoaded', function() {
  loadDynamicServices();
});



