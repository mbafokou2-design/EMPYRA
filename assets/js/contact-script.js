/* =============================================
   EMI CONTACT PAGE — contact-script.js
   Handles: language, navbar, search overlay,
   hamburger, Formspree form, back-to-top
============================================= */

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
      if (text.indexOf('<') !== -1) { el.innerHTML = text; }
      else { el.textContent = text; }
    }
  });

  document.querySelectorAll('[data-placeholder-en]').forEach(function(el) {
    var ph = el.getAttribute('data-placeholder-' + lang);
    if (ph) el.placeholder = ph;
  });

  var hiddenLang = document.getElementById('hidden-lang');
  if (hiddenLang) hiddenLang.value = lang;

  document.documentElement.lang = lang;

  // Refresh hero if router is loaded (services page)
  if (window.EMIRouter) window.EMIRouter.refresh();
}

// Auto-init on page load
(function() {
  var saved = localStorage.getItem('emi_lang') || 'en';
  setLang(saved);
})();

/* -----------------------------------------------
   LANGUAGE DROPDOWN — mobile toggle
----------------------------------------------- */
var navLang     = document.getElementById('nav-lang');
var langTrigger = document.getElementById('lang-trigger');

if (langTrigger && navLang) {
  langTrigger.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      e.stopPropagation();
      navLang.classList.toggle('open');
    }
  });
}

/* -----------------------------------------------
   NAVBAR — sticky scroll effect
----------------------------------------------- */
var navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* -----------------------------------------------
   HAMBURGER MENU
----------------------------------------------- */
var hamburger = document.getElementById('hamburger');
var navMenu   = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Mobile: toggle dropdowns on tap
  navMenu.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        var parentItem = link.parentElement;
        if (parentItem.querySelector('.dropdown')) {
          e.preventDefault();
          parentItem.classList.toggle('open');
        }
      }
    });
  });
}

// Close nav when clicking outside
document.addEventListener('click', function(e) {
  if (navbar && !navbar.contains(e.target)) {
    if (hamburger) hamburger.classList.remove('open');
    if (navMenu) {
      navMenu.classList.remove('open');
      navMenu.querySelectorAll('.nav-item').forEach(function(i) {
        i.classList.remove('open');
      });
    }
    if (navLang) navLang.classList.remove('open');
  }
});

/* -----------------------------------------------
   SEARCH POPUP
----------------------------------------------- */

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

/* -----------------------------------------------
   FORMSPREE CONTACT FORM (AJAX)
----------------------------------------------- */
var contactForm = document.getElementById('contact-form');
var submitBtn   = document.getElementById('submit-btn');
var successMsg  = document.getElementById('form-success');
var errorMsg    = document.getElementById('form-error');

if (contactForm && submitBtn && successMsg && errorMsg) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    var lang = localStorage.getItem('emi_lang') || 'en';

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

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> <span>' +
      (lang === 'fr' ? 'Envoyer le Message' : 'Send Message') + '</span>';
  });
}

/* -----------------------------------------------
   BACK TO TOP
----------------------------------------------- */
var btt = document.getElementById('back-to-top');
if (btt) {
  window.addEventListener('scroll', function() {
    btt.classList.toggle('visible', window.scrollY > 400);
  });
  btt.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}