

/* -----------------------------------------------
   LANGUAGE SWITCHER
----------------------------------------------- */
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



/* -----------------------------------------------
   SCROLL REVEAL
----------------------------------------------- */
var revealEls = document.querySelectorAll('.reveal');
var revealObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(function(el) { revealObs.observe(el); });

/* -----------------------------------------------
   BACK TO TOP
----------------------------------------------- */
var btt = document.getElementById('back-to-top');
window.addEventListener('scroll', function() {
  btt.classList.toggle('visible', window.scrollY > 400);
});
btt.addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ==============================================
   HOW TO IMPLEMENT THE SEARCH POPUP ON
   ALL PREVIOUSLY BUILT PAGES (index + contact)
   =============================================

   The search bar has been redesigned from a
   full-screen overlay to a small popup card
   below the search icon. Follow these steps
   to update your existing pages.

   ─────────────────────────────────────────────
   STEP 1 — UPDATE THE CSS
   ─────────────────────────────────────────────
   In index.html <style> block OR contact-style.css:

   A) REMOVE these old classes if present:
      .search-overlay, .search-overlay-inner,
      .search-overlay-label, .search-close-btn

   B) ADD these new classes (copy from service-water.css):
      .nav-right
      .nav-search-btn  (update: keep existing styles)
      .search-popup
      .search-popup-inner
      .search-popup-label
      .search-input-wrap  (already exists, keep it)
      .search-input       (already exists, keep it)
      .search-submit-btn  (already exists, keep it)
      .search-suggestions (already exists, keep it)
      .search-suggestion-tag (already exists, keep it)
      .search-popup::before  (the triangle pointer)

   ─────────────────────────────────────────────
   STEP 2 — UPDATE THE HTML NAVBAR (index.html)
   ─────────────────────────────────────────────
   Find the old search icon button in navbar:
     <button class="nav-search-btn" id="search-open-btn" ...>

   Replace the button AND the old overlay block
   <div class="search-overlay">...</div> with:

     <div class="nav-right">
       <button class="nav-search-btn" id="search-btn" aria-label="Search">
         <i class="fa fa-search"></i>
       </button>
       <div class="search-popup" id="search-popup">
         <div class="search-popup-inner">
           <span class="search-popup-label"
                 data-en="Search the site" data-fr="Rechercher">Search the site</span>
           <div class="search-input-wrap">
             <input type="text" class="search-input" id="search-input"
                    data-placeholder-en="Services, news, projects…"
                    data-placeholder-fr="Services, actualités, projets…"
                    placeholder="Services, news, projects…" autocomplete="off"/>
             <button class="search-submit-btn" id="search-submit" aria-label="Go">
               <i class="fa fa-arrow-right"></i>
             </button>
           </div>
           <div class="search-suggestions">
             <button class="search-suggestion-tag" data-en="Exploration" data-fr="Exploration">Exploration</button>
             <button class="search-suggestion-tag" data-en="Water" data-fr="Eau">Water</button>
             <button class="search-suggestion-tag" data-en="Risk" data-fr="Risque">Risk</button>
             <button class="search-suggestion-tag" data-en="Intelligence" data-fr="Intelligence">Intelligence</button>
           </div>
         </div>
       </div>
     </div>

   ─────────────────────────────────────────────
   STEP 3 — UPDATE index.html JAVASCRIPT
   ─────────────────────────────────────────────
   In your index.html <script> block:

   A) REMOVE the old search overlay functions:
      openSearch(), closeSearch(), handleSearch()
      and the old event listeners referencing
      'search-open-btn' and 'search-close-btn'

   B) ADD the new search popup functions.
      Copy the entire "SEARCH POPUP CARD" section
      from this file (lines ~75–115) into your
      index.html <script> block.

      Key change: IDs changed from
        'search-open-btn' → 'search-btn'
        'search-submit-btn' → 'search-submit'
      No more 'search-close-btn' needed.

   ─────────────────────────────────────────────
   STEP 4 — UPDATE contact.html + contact-script.js
   ─────────────────────────────────────────────
   In contact.html navbar:
     Same HTML swap as Step 2 above.

   In contact-style.css:
     Same CSS swap as Step 1 above.

   In contact-script.js:
     Same JS swap as Step 3 above.
     Replace references to 'search-open-btn'
     with 'search-btn', remove overlay logic.

   ─────────────────────────────────────────────
   STEP 5 — UPDATE register.html (same pattern)
   ─────────────────────────────────────────────
   register.html doesn't yet have a search bar.
   To add it, follow Steps 1–3 and apply to the
   register page navbar the same way.

   ─────────────────────────────────────────────
   NOTE: The nav-right wrapper div is important!
   It sets position:relative so the popup card
   positions itself correctly below the icon.
   Don't skip wrapping the button + popup inside
   <div class="nav-right">.
   ─────────────────────────────────────────────
*/
