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



