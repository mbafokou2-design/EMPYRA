/* =============================================
   EMI DASHBOARD — dashboard-script.js
   Main overview page JavaScript.

   HOW TO USE THIS FILE:
   Each dashboard page has its OWN script file,
   but ALL share this same pattern for:
   - Sidebar toggle
   - Language switcher
   - Profile dropdown
   - API calls

   Simply copy the SIDEBAR, LANGUAGE, and PROFILE
   sections into each new page's script file.
   Only the API DATA sections change per page.
============================================= */

/* =============================================
   ── SECTION 1: LANGUAGE SWITCHER ──
   Reads localStorage key 'emi_lang'.
   Shared across all dashboard pages.
============================================= */
function setLang(lang) {
  localStorage.setItem('emi_lang', lang);

  // Update sidebar language buttons
  var btnEn = document.getElementById('lang-en');
  var btnFr = document.getElementById('lang-fr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnFr) btnFr.classList.toggle('active', lang === 'fr');

  // Translate all elements with data-en / data-fr attributes
  document.querySelectorAll('[data-en]').forEach(function(el) {
    var text = el.getAttribute('data-' + lang);
    if (text === null) return;
    if (text.indexOf('<') !== -1) el.innerHTML = text;
    else el.textContent = text;
  });

  // Update placeholder text for inputs
  document.querySelectorAll('[data-placeholder-en]').forEach(function(el) {
    var ph = el.getAttribute('data-placeholder-' + lang);
    if (ph) el.placeholder = ph;
  });

  document.documentElement.lang = lang;
}

// Auto-init: read saved language on page load
(function() {
  var saved = localStorage.getItem('emi_lang') || 'en';
  setLang(saved);
})();


/* =============================================
   ── SECTION 2: SIDEBAR TOGGLE ──
   Hamburger opens/closes sidebar on ALL screens.
   Overlay click also closes it.
   Escape key closes it too.
   Copy this section to every dashboard page.
============================================= */
var sidebar        = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebar-overlay');
var hamburger      = document.getElementById('hamburger');
var sidebarClose   = document.getElementById('sidebar-close');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', function() {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

if (sidebarClose) {
  sidebarClose.addEventListener('click', closeSidebar);
}

sidebarOverlay.addEventListener('click', closeSidebar);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
});


/* =============================================
   ── SECTION 3: PROFILE DROPDOWN ──
   Click to open/close. Click outside closes it.
   Copy this section to every dashboard page.
============================================= */
var profileTrigger  = document.getElementById('profile-trigger');
var topbarProfile   = document.getElementById('topbar-profile');
var profileDropdown = document.getElementById('profile-dropdown');

if (profileTrigger) {
  profileTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    topbarProfile.classList.toggle('open');
  });
}

document.addEventListener('click', function(e) {
  if (topbarProfile && !topbarProfile.contains(e.target)) {
    topbarProfile.classList.remove('open');
  }
});

/*
  ── HOW TO POPULATE PROFILE DATA FROM BACKEND ──
  After login, your backend returns a user object.
  Store it in localStorage or pass via session.
  Then call this function to display it:

  function loadProfileData(user) {
    // user = { name: "Jean Dupont", email: "j@emi.cm", initials: "JD" }
    var nameEl     = document.getElementById('profile-name-display');
    var initialsEl = document.getElementById('profile-initials');
    var dropName   = document.getElementById('dropdown-name');

    if (nameEl)     nameEl.textContent     = user.name;
    if (initialsEl) initialsEl.textContent = user.initials || user.name.charAt(0);
    if (dropName)   dropName.textContent   = user.name;

    // To show a profile photo instead of initials:
    var avatar = document.getElementById('profile-avatar');
    if (user.photo_url && avatar) {
      avatar.innerHTML = '<img src="' + user.photo_url + '" alt="' + user.name + '">';
    }
  }
*/

// Load from localStorage if available (set at login)
(function() {
  var stored = localStorage.getItem('emi_admin_user');
  if (stored) {
    try {
      var user = JSON.parse(stored);
      var nameEl     = document.getElementById('profile-name-display');
      var initialsEl = document.getElementById('profile-initials');
      var dropName   = document.getElementById('dropdown-name');
      if (nameEl && user.name)     nameEl.textContent     = user.name;
      if (initialsEl && user.name) initialsEl.textContent = (user.initials || user.name.charAt(0).toUpperCase());
      if (dropName && user.name)   dropName.textContent   = user.name;
    } catch(e) {}
  }
})();


/* =============================================
   ── SECTION 4: WELCOME DATE ──
============================================= */
(function() {
  var el   = document.getElementById('welcome-date');
  var lang = localStorage.getItem('emi_lang') || 'en';
  var now  = new Date();
  var opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  if (el) el.textContent = now.toLocaleDateString(locale, opts);
})();


/* =============================================
   ── SECTION 5: LOGOUT ──
   Clears session data and redirects to login.
   Copy this section to every dashboard page.
============================================= */
var logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    /*
    ── BACKEND LOGOUT ──────────────────────────
    STEP 1: Call your logout API endpoint:
      fetch('https://your-api.com/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('emi_token'),
          'Accept': 'application/json'
        }
      }).then(function() { clearAndRedirect(); });

    STEP 2: Clear local storage:
    ─────────────────────────────────────────────
    */
    localStorage.removeItem('emi_token');
    localStorage.removeItem('emi_admin_user');
    window.location.href = 'login.html';
  });
}


/* =============================================
   ── SECTION 6: API CONFIGURATION ──
   Set your base API URL once here.
   All fetch calls use this variable.

   TO CONNECT YOUR BACKEND:
   STEP 1 — Replace the URL below with your API:
     const API_BASE = 'https://your-api.com/api';
   STEP 2 — Set the auth token after login:
     localStorage.setItem('emi_token', 'your-jwt-token');
   STEP 3 — All fetch calls below use getHeaders()
     which automatically attaches the Bearer token.
============================================= */
var API_BASE = 'https://your-api.com/api'; // ← REPLACE WITH YOUR API URL

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
  };
}

/*
  ── GENERIC API FETCH HELPER ──
  Usage:
    apiGet('/stats').then(function(data) { ... });
    apiPost('/posts', { title: 'My Post' }).then(function(data) { ... });
*/
function apiGet(endpoint) {
  return fetch(API_BASE + endpoint, {
    method: 'GET',
    headers: getHeaders()
  }).then(function(res) {
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    return res.json();
  });
}

function apiPost(endpoint, body) {
  return fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(function(res) { return res.json(); });
}

function apiPut(endpoint, body) {
  return fetch(API_BASE + endpoint, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(function(res) { return res.json(); });
}

function apiDelete(endpoint) {
  return fetch(API_BASE + endpoint, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(function(res) { return res.json(); });
}


/* =============================================
   ── SECTION 7: DASHBOARD STATS API CALLS ──
   Each stat card is populated from its own
   API endpoint. Replace endpoints as needed.

   EXPECTED API RESPONSES:
   GET /stats/users       → { count: 142, change: "+12 this month" }
   GET /stats/services    → { count: 11, change: "11 active" }
   GET /stats/intelligence→ { count: 5, change: "2 published" }
   GET /stats/blog        → { count: 28, change: "+3 this week" }
   GET /stats/actualite   → { count: 14, change: "Latest: yesterday" }
   GET /stats/messages    → { count: 5, change: "5 unread" }
============================================= */
function loadStats() {

  /* ── USERS ── */
  apiGet('/stats/users').then(function(data) {
    if (!data) return;
    document.getElementById('stat-users').textContent       = data.count || '0';
    document.getElementById('stat-users-meta').innerHTML    = '<i class="fa fa-arrow-up"></i> ' + (data.change || '');
  }).catch(function() {
    // Fallback demo data — remove when backend is connected
    document.getElementById('stat-users').textContent    = '142';
    document.getElementById('stat-users-meta').innerHTML = '<i class="fa fa-arrow-up"></i> +12 this month';
  });

  /* ── SERVICES ── */
  apiGet('/stats/services').then(function(data) {
    if (!data) return;
    document.getElementById('stat-services').textContent    = data.count || '0';
    document.getElementById('stat-services-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-services').textContent      = '11';
    document.getElementById('stat-services-meta').textContent = '11 active services';
  });

  /* ── MINING INTELLIGENCE ── */
  apiGet('/stats/intelligence').then(function(data) {
    if (!data) return;
    document.getElementById('stat-intelligence').textContent    = data.count || '0';
    document.getElementById('stat-intelligence-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-intelligence').textContent      = '5';
    document.getElementById('stat-intelligence-meta').textContent = '2 published';
  });

  /* ── BLOG & NEWS ── */
  apiGet('/stats/blog').then(function(data) {
    if (!data) return;
    document.getElementById('stat-blog').textContent    = data.count || '0';
    document.getElementById('stat-blog-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-blog').textContent      = '28';
    document.getElementById('stat-blog-meta').textContent = '+3 this week';
  });

  /* ── ACTUALITÉS ── */
  apiGet('/stats/actualite').then(function(data) {
    if (!data) return;
    document.getElementById('stat-actualite').textContent    = data.count || '0';
    document.getElementById('stat-actualite-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-actualite').textContent      = '14';
    document.getElementById('stat-actualite-meta').textContent = 'Latest: yesterday';
  });

  /* ── UNREAD MESSAGES ── */
  apiGet('/stats/messages').then(function(data) {
    if (!data) return;
    document.getElementById('stat-messages').textContent    = data.count || '0';
    document.getElementById('stat-messages-meta').textContent = data.change || '';
    // Also update sidebar badge
    var badge = document.getElementById('badge-contact');
    if (badge && data.count) badge.textContent = data.count;
  }).catch(function() {
    document.getElementById('stat-messages').textContent      = '5';
    document.getElementById('stat-messages-meta').textContent = '5 unread';
  });
}


/* =============================================
   ── SECTION 8: RECENT ACTIVITY API CALL ──

   EXPECTED API RESPONSE:
   GET /activity/recent
   [
     { icon: "user", color: "blue", text: "New user registered", detail: "john@example.com", time: "2 min ago" },
     { icon: "newspaper", color: "coral", text: "Blog post published", detail: "Mine Safety 2025", time: "1 hr ago" }
   ]
============================================= */
function loadActivity() {
  apiGet('/activity/recent').then(function(data) {
    if (!data || !data.length) return;
    renderActivity(data);
  }).catch(function() {
    // Fallback demo data
    renderActivity([
      { icon: 'ph-user-plus',   color: 'blue',   text: 'New user registered',      detail: 'cameroon@example.com', time: '2 min ago' },
      { icon: 'ph-newspaper',   color: 'coral',  text: 'Blog post published',       detail: 'Mine Water Safety 2025', time: '1 hr ago' },
      { icon: 'ph-envelope',    color: 'teal',   text: 'New contact message',       detail: 'Partnership inquiry', time: '3 hrs ago' },
      { icon: 'ph-hard-hat',    color: 'yellow', text: 'Service page updated',      detail: 'Mine Water Management', time: 'Yesterday' },
      { icon: 'ph-brain',       color: 'green',  text: 'Intelligence report added', detail: 'ARD Risk Report Q2', time: '2 days ago' }
    ]);
  });
}

function renderActivity(items) {
  var list = document.getElementById('activity-list');
  if (!list) return;
  list.innerHTML = items.map(function(item) {
    return '<div class="activity-item">' +
      '<div class="activity-icon ' + (item.color || 'blue') + '">' +
        '<i class="ph ' + item.icon + '"></i>' +
      '</div>' +
      '<div class="activity-text">' +
        '<strong>' + item.text + '</strong>' +
        '<span>' + item.detail + '</span>' +
      '</div>' +
      '<div class="activity-time">' + item.time + '</div>' +
    '</div>';
  }).join('');
}


/* =============================================
   ── SECTION 9: CONTENT OVERVIEW PANEL ──

   EXPECTED API RESPONSE:
   GET /stats/overview
   [
     { label: "Published Services", value: 11, total: 11, color: "yellow" },
     { label: "Published Blog Posts", value: 22, total: 28, color: "coral" }
   ]
============================================= */
function loadOverview() {
  apiGet('/stats/overview').then(function(data) {
    if (!data) return;
    renderOverview(data);
  }).catch(function() {
    renderOverview([
      { label: 'Published Services',     value: 11, total: 11, color: '#f5c518' },
      { label: 'Blog Posts Published',   value: 22, total: 28, color: '#ea5c3a' },
      { label: 'Intelligence Reports',   value: 3,  total: 5,  color: '#16a34a' },
      { label: 'Unread Messages',        value: 5,  total: 5,  color: '#0891b2' },
      { label: 'Active Users (30 days)', value: 98, total: 142, color: '#7c3aed' }
    ]);
  });
}

function renderOverview(items) {
  var el = document.getElementById('overview-list');
  if (!el) return;
  el.innerHTML = items.map(function(item) {
    var pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
    return '<div style="margin-bottom:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
        '<span style="font-size:0.85rem;color:var(--text-body);">' + item.label + '</span>' +
        '<span style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:0.9rem;color:var(--blue-dark);">' + item.value + ' / ' + item.total + '</span>' +
      '</div>' +
      '<div style="height:6px;background:var(--gray-light);border-radius:3px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:' + (item.color || 'var(--blue-light)') + ';border-radius:3px;transition:width .6s;"></div>' +
      '</div>' +
    '</div>';
  }).join('');
}


/* =============================================
   ── SECTION 10: RECENT USERS TABLE ──

   EXPECTED API RESPONSE:
   GET /users/recent?limit=5
   [
     { name: "John Doe", email: "j@example.com", country: "CM", registered: "2025-03-12", status: "active" }
   ]
============================================= */
function loadRecentUsers() {
  apiGet('/users/recent?limit=5').then(function(data) {
    if (!data || !data.length) return;
    renderUsersTable(data);
  }).catch(function() {
    renderUsersTable([
      { name: 'Jean Dupont',    email: 'jean@example.com',    country: 'Cameroon', registered: '2025-04-01', status: 'active' },
      { name: 'Marie Mballa',   email: 'marie@example.com',   country: 'Cameroon', registered: '2025-03-28', status: 'active' },
      { name: 'Pierre Laurent', email: 'pierre@example.com',  country: 'France',   registered: '2025-03-20', status: 'inactive' },
      { name: 'Ama Owusu',      email: 'ama@example.com',     country: 'Ghana',    registered: '2025-03-15', status: 'active' },
      { name: 'Carlos Menza',   email: 'carlos@example.com',  country: 'Cameroon', registered: '2025-03-10', status: 'active' }
    ]);
  });
}

function renderUsersTable(users) {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  tbody.innerHTML = users.map(function(u) {
    var statusBadge = u.status === 'active'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.5rem;"></i>' + (lang === 'fr' ? 'Actif' : 'Active') + '</span>'
      : '<span class="badge badge-gray">' + (lang === 'fr' ? 'Inactif' : 'Inactive') + '</span>';

    // Format date
    var d = new Date(u.registered);
    var dateStr = isNaN(d) ? u.registered : d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return '<tr>' +
      '<td><strong style="color:var(--text-dark);">' + u.name + '</strong></td>' +
      '<td>' + u.email + '</td>' +
      '<td>' + u.country + '</td>' +
      '<td>' + dateStr + '</td>' +
      '<td>' + statusBadge + '</td>' +
    '</tr>';
  }).join('');
}


/* =============================================
   ── INIT: Run everything on page load ──
============================================= */
document.addEventListener('DOMContentLoaded', function() {
  loadStats();
  loadActivity();
  loadOverview();
  loadRecentUsers();
});

/*
  =============================================
  QUICK BACKEND INTEGRATION CHECKLIST
  =============================================

  1. SET YOUR API BASE URL (Section 6):
     var API_BASE = 'https://your-api.com/api';

  2. AFTER LOGIN — store the JWT token:
     localStorage.setItem('emi_token', response.token);
     localStorage.setItem('emi_admin_user', JSON.stringify({
       name: response.user.name,
       initials: 'JD',
       photo_url: response.user.photo
     }));

  3. API ENDPOINTS NEEDED:
     GET  /stats/users          → { count, change }
     GET  /stats/services       → { count, change }
     GET  /stats/intelligence   → { count, change }
     GET  /stats/blog           → { count, change }
     GET  /stats/actualite      → { count, change }
     GET  /stats/messages       → { count, change }
     GET  /activity/recent      → [ { icon, color, text, detail, time } ]
     GET  /stats/overview       → [ { label, value, total, color } ]
     GET  /users/recent?limit=5 → [ { name, email, country, registered, status } ]
     POST /api/logout           → clears session

  4. CORS: Ensure your backend sends:
     Access-Control-Allow-Origin: *  (or your domain)
     Access-Control-Allow-Headers: Content-Type, Authorization

  5. 401 HANDLING: apiGet/apiPost automatically
     redirect to login.html on 401 Unauthorized.

  6. FOR EACH NEW DASHBOARD PAGE:
     Copy Sections 1, 2, 3, 5, 6 (language,
     sidebar, profile, logout, API config).
     Then add page-specific API calls.
  =============================================
*/
