// =====================start of index.html
/* -----------------------------------------------
   HERO SLIDER
----------------------------------------------- */
const slides      = document.querySelectorAll('.slide');
const dots        = document.querySelectorAll('.dot');
const sliderTrack = document.getElementById('slider-track');
let currentSlide  = 0;
let autoSlide;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function startAuto() {
  autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5500);
}
function resetAuto() {
  clearInterval(autoSlide);
  startAuto();
}

document.getElementById('next-btn').addEventListener('click', () => { goToSlide(currentSlide + 1); resetAuto(); });
document.getElementById('prev-btn').addEventListener('click', () => { goToSlide(currentSlide - 1); resetAuto(); });
dots.forEach(dot => {
  dot.addEventListener('click', () => { goToSlide(+dot.dataset.index); resetAuto(); });
});

startAuto();

/* -----------------------------------------------
   INTELLIGENCE MINIÈRE SLIDER
----------------------------------------------- */
const intelTrack   = document.getElementById('intel-track');
const intelDots    = document.querySelectorAll('.intel-dot');
let intelCurrent   = 0;
let intelAuto;

function goIntel(index) {
  intelCurrent = (index + 3) % 3;
  intelTrack.style.transform = `translateX(-${intelCurrent * 100}%)`;
  intelDots.forEach((d, i) => d.classList.toggle('active', i === intelCurrent));
}

function startIntelAuto() {
  intelAuto = setInterval(() => goIntel(intelCurrent + 1), 6000);
}
function resetIntelAuto() { clearInterval(intelAuto); startIntelAuto(); }

document.getElementById('intel-next').addEventListener('click', () => { goIntel(intelCurrent + 1); resetIntelAuto(); });
document.getElementById('intel-prev').addEventListener('click', () => { goIntel(intelCurrent - 1); resetIntelAuto(); });
intelDots.forEach(dot => {
  dot.addEventListener('click', () => { goIntel(+dot.dataset.intel); resetIntelAuto(); });
});
startIntelAuto();

/* -----------------------------------------------
   BLOG HORIZONTAL CARD SLIDER
----------------------------------------------- */
(function() {
  const track    = document.getElementById('blog-track');
  const dots     = document.querySelectorAll('.blog-dot');
  const prevBtn  = document.getElementById('blog-prev');
  const nextBtn  = document.getElementById('blog-next');
  const cards    = track.querySelectorAll('.blog-card');
  let current    = 0;

  function getVisible() {
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function totalPages() {
    return Math.ceil(cards.length / getVisible());
  }

  function getCardWidth() {
    const gap = 28;
    const visible = getVisible();
    const trackW = track.parentElement.offsetWidth;
    return (trackW - gap * (visible - 1)) / visible;
  }

  function updateDots() {
    const pages = totalPages();
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.style.display = i < pages ? 'block' : 'none';
    });
  }

  function slideTo(index) {
    const pages = totalPages();
    current = Math.max(0, Math.min(index, pages - 1));
    const cardW = getCardWidth();
    const gap   = 28;
    const offset = current * getVisible() * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= pages - 1;
    updateDots();
  }

  prevBtn.addEventListener('click', () => slideTo(current - 1));
  nextBtn.addEventListener('click', () => slideTo(current + 1));
  dots.forEach(dot => dot.addEventListener('click', () => slideTo(+dot.dataset.blog)));

  // Re-init on resize
  window.addEventListener('resize', () => { current = 0; slideTo(0); });

  slideTo(0);
})();

/* -----------------------------------------------
   BACK TO TOP
----------------------------------------------- */
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* -----------------------------------------------
   SCROLL REVEAL (Intersection Observer)
----------------------------------------------- */
const revealEls = document.querySelectorAll('.scroll-reveal, .scroll-reveal-right, .service-card, .blog-card, .intel-card');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      // For cards stagger
      if (el.target.classList.contains('service-card') || el.target.classList.contains('blog-card')) {
        el.target.style.opacity = '1';
        el.target.style.transform = 'translateY(0)';
      }
      revealObs.unobserve(el.target);
    }
  });
}, { threshold: 0.15 });

// Cards start invisible
document.querySelectorAll('.service-card, .blog-card, .intel-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = `opacity 0.5s ${i * 0.08}s, transform 0.5s ${i * 0.08}s`;
  revealObs.observe(el);
});
document.querySelectorAll('.scroll-reveal, .scroll-reveal-right').forEach(el => revealObs.observe(el));

/* -----------------------------------------------
   COUNTER ANIMATION (stats bar)
----------------------------------------------- */
const counters = document.querySelectorAll('[data-count]');
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el      = entry.target;
      const target  = +el.dataset.count;
      const suffix  = target >= 100 ? '+' : (target >= 10 ? '+' : '+');
      let current   = 0;
      const step    = Math.ceil(target / 50);
      const timer   = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current + suffix;
      }, 30);
      countObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => countObs.observe(c));

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
}

(function() {
  var saved = localStorage.getItem('emi_lang') || 'en';
  setLang(saved);
})();

/* -----------------------------------------------
   NAVBAR — sticky scroll
----------------------------------------------- */
var navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* -----------------------------------------------
   HAMBURGER
----------------------------------------------- */
var hamburger = document.getElementById('hamburger');
var navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', function() {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

navMenu.querySelectorAll('.nav-link').forEach(function(link) {
  link.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      var parent = link.parentElement;
      if (parent.querySelector('.dropdown')) {
        e.preventDefault();
        parent.classList.toggle('open');
      }
    }
  });
});

/* -----------------------------------------------
   LANGUAGE DROPDOWN — mobile tap toggle
----------------------------------------------- */
var navLang     = document.getElementById('nav-lang');
var langTrigger = document.getElementById('lang-trigger');
if (langTrigger) {
  langTrigger.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      e.stopPropagation();
      navLang.classList.toggle('open');
    }
  });
}

/* -----------------------------------------------
   CLOSE NAV / SEARCH on outside click
----------------------------------------------- */
document.addEventListener('click', function(e) {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    navMenu.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('open'); });
    if (navLang) navLang.classList.remove('open');
    closeSearch();
  }
});

/* -----------------------------------------------
   SEARCH POPUP CARD
   Small hover card — appears below search icon.
   Click the icon to toggle open/close.
   Escape key closes it too.
----------------------------------------------- */
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
  if (searchPopup) {
    searchPopup.classList.remove('active');
    if (searchBtn) searchBtn.classList.remove('active');
  }
}

function handleSearch() {
  var query = searchInput.value.trim();
  if (!query) return;
  var lang = localStorage.getItem('emi_lang') || 'en';
  /*
    ── CONNECT SEARCH BACKEND HERE ────────────────
    Replace with your own search endpoint, e.g.:
    window.location.href = 'search.html?q=' + encodeURIComponent(query) + '&lang=' + lang;
    ────────────────────────────────────────────────
  */
  window.open('https://www.google.com/search?q=site:emi.stevodigital.com+' + encodeURIComponent(query), '_blank');
  closeSearch();
}

if (searchBtn) {
  searchBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (searchPopup.classList.contains('active')) { closeSearch(); }
    else { openSearch(); }
  });
}

if (searchPopup) {
  searchPopup.addEventListener('click', function(e) { e.stopPropagation(); });
}

if (searchSubmit) {
  searchSubmit.addEventListener('click', handleSearch);
}

if (searchInput) {
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') closeSearch();
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeSearch();
});

// Suggestion tags
document.querySelectorAll('.search-suggestion-tag').forEach(function(tag) {
  tag.addEventListener('click', function(e) {
    e.stopPropagation();
    var lang = localStorage.getItem('emi_lang') || 'en';
    searchInput.value = tag.getAttribute('data-' + lang) || tag.textContent;
    searchInput.focus();
  });
});

// =================================end of index.html

// ==================================contact.html
var contactForm = document.getElementById('contact-form');
var submitBtn   = document.getElementById('submit-btn');
var successMsg  = document.getElementById('form-success');
var errorMsg    = document.getElementById('form-error');

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    var lang = localStorage.getItem('emi_lang') || 'en';

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> <span>' +
      (lang === 'fr' ? 'Envoi en cours…' : 'Sending…') + '</span>';
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';

    try {
      var response = await fetch(contactForm.action, {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        successMsg.style.display = 'flex';
        contactForm.reset();
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        errorMsg.style.display = 'flex';
      }
    } catch (err) {
      errorMsg.style.display = 'flex';
    }

    // Restore button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> <span>' +
      (lang === 'fr' ? 'Envoyer le Message' : 'Send Message') + '</span>';
  });
}
//====================== Services
function updateHero(data) {
  const eyebrow = document.querySelector(".page-hero-eyebrow");
  const title = document.querySelector("#page-hero h1");
  const breadcrumb = document.querySelector(".breadcrumb span");

  if (eyebrow) eyebrow.innerHTML = data.eyebrow;
  if (title) title.innerHTML = data.title;
  if (breadcrumb) breadcrumb.innerHTML = data.breadcrumb;
}
document.addEventListener("DOMContentLoaded", () => {
  initRouter();

  // load from URL if exists
  const params = new URLSearchParams(window.location.search);
  const route = params.get("service");

  if (route && servicesData[route]) {
    const lang = localStorage.getItem("lang") || "en";
    updateHero(servicesData[route][lang]);
  }
});