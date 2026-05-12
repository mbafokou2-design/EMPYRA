// =====================start of index.html
/* -----------------------------------------------
   HERO SLIDER  (12 slides — auto-detected)
----------------------------------------------- */
let slides      = document.querySelectorAll('.slide');
let dots        = document.querySelectorAll('.dot');
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

// Load dynamic slides from services
if (typeof loadSlides === 'function') {
  loadSlides();
}

/* -----------------------------------------------
   INTELLIGENCE MINIÈRE SLIDER
----------------------------------------------- */
(function() {
  const intelTrack = document.getElementById('intel-track');
  const prevBtn = document.getElementById('intel-prev');
  const nextBtn = document.getElementById('intel-next');
  const dotsContainer = document.getElementById('intel-dots');
  if (!intelTrack || !prevBtn || !nextBtn || !dotsContainer) return;

  let current = 0;
  let slides = Array.from(intelTrack.querySelectorAll('.intel-slide'));

  function getTotalSlides() {
    return slides.length;
  }

  function rebuildDots() {
    const total = getTotalSlides();
    dotsContainer.innerHTML = '';

    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'intel-dot' + (i === current ? ' active' : '');
      dot.dataset.intel = i;
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function() {
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const pageButtons = dotsContainer.querySelectorAll('.intel-dot');
    pageButtons.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goToSlide(index) {
    const total = getTotalSlides();
    if (total === 0) {
      intelTrack.style.transform = 'translateX(0px)';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    current = Math.max(0, Math.min(index, total - 1));
    intelTrack.style.transform = `translateX(-${current * 100}%)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= total - 1;
    updateDots();
  }

  function reinitIntelSlider() {
    slides = Array.from(intelTrack.querySelectorAll('.intel-slide'));
    current = 0;
    rebuildDots();
    goToSlide(0);
  }

  prevBtn.addEventListener('click', function() { goToSlide(current - 1); });
  nextBtn.addEventListener('click', function() { goToSlide(current + 1); });

  window.reinitIntelSlider = reinitIntelSlider;

  // Auto slide
  let intelAuto;
  function startIntelAuto() {
    intelAuto = setInterval(() => {
      const total = getTotalSlides();
      if (total > 1) goToSlide(current + 1);
    }, 6000);
  }
  function resetIntelAuto() { clearInterval(intelAuto); startIntelAuto(); }

  // Start auto after dynamic load
  setTimeout(function() {
    if (slides.length > 0) startIntelAuto();
  }, 1000);

  // Re-init on resize
  window.addEventListener('resize', function() {
    slides = Array.from(intelTrack.querySelectorAll('.intel-slide'));
    current = 0;
    rebuildDots();
    goToSlide(0);
  });
})();

/* -----------------------------------------------
   BLOG HORIZONTAL CARD SLIDER
----------------------------------------------- */
(function() {
  const track = document.getElementById('blog-track');
  const prevBtn = document.getElementById('blog-prev');
  const nextBtn = document.getElementById('blog-next');
  const dotsContainer = document.getElementById('blog-dots');
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  let current = 0;
  let cards = Array.from(track.querySelectorAll('.blog-card'));

  function getVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function totalPages() {
    return Math.max(0, Math.ceil(cards.length / getVisible()));
  }

  function getCardWidth() {
    const gap = 28;
    const visible = getVisible();
    const trackW = track.parentElement.offsetWidth;
    return (trackW - gap * (visible - 1)) / visible;
  }

  function rebuildDots() {
    const pages = totalPages();
    dotsContainer.innerHTML = '';

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'blog-dot' + (i === current ? ' active' : '');
      dot.dataset.blog = i;
      dot.setAttribute('aria-label', 'Page ' + (i + 1));
      dot.addEventListener('click', function() {
        slideTo(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const pageButtons = dotsContainer.querySelectorAll('.blog-dot');
    pageButtons.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function slideTo(index) {
    const pages = totalPages();
    if (pages === 0) {
      track.style.transform = 'translateX(0px)';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    current = Math.max(0, Math.min(index, pages - 1));
    const cardW = getCardWidth();
    const gap = 28;
    const offset = current * getVisible() * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= pages - 1;
    updateDots();
  }

  function reinitBlogSlider() {
    cards = Array.from(track.querySelectorAll('.blog-card'));
    current = 0;
    rebuildDots();
    slideTo(0);
  }

  prevBtn.addEventListener('click', function() { slideTo(current - 1); });
  nextBtn.addEventListener('click', function() { slideTo(current + 1); });

  window.reinitBlogSlider = reinitBlogSlider;

  window.addEventListener('resize', function() {
    cards = Array.from(track.querySelectorAll('.blog-card'));
    current = 0;
    rebuildDots();
    slideTo(0);
  });

  reinitBlogSlider();
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
   CLOSE NAV on outside click
----------------------------------------------- */
document.addEventListener('click', function(e) {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    navMenu.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('open'); });
    if (navLang) navLang.classList.remove('open');
  }
});

/* Search popup is now handled by assets/js/search.js */

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
  if (typeof initRouter === "function") {
    initRouter();
  } else if (window.EMIRouter && typeof window.EMIRouter.refresh === "function") {
    window.EMIRouter.refresh();
  }

  // load from URL if exists
  const params = new URLSearchParams(window.location.search);
  const route = params.get("service");
  const servicesData = typeof SERVICES_DATA !== "undefined" ? SERVICES_DATA : {};

  if (route && servicesData[route]) {
    const lang = localStorage.getItem("lang") || "en";
    updateHero(servicesData[route][lang]);
  }
});