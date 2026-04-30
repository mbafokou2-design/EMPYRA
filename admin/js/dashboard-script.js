/* =============================================
   EMI DASHBOARD — dashboard-script.js

   ✅ = endpoint EXISTS in your backend (live)
   🔧 = endpoint NOT YET BUILT (uses demo data,
        uncomment the API call when ready)
============================================= */


/* =============================================
   ── SECTION 1: LANGUAGE SWITCHER ──
============================================= */
function setLang(lang) {
  localStorage.setItem('emi_lang', lang);
  var btnEn = document.getElementById('lang-en');
  var btnFr = document.getElementById('lang-fr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnFr) btnFr.classList.toggle('active', lang === 'fr');
  document.querySelectorAll('[data-en]').forEach(function(el) {
    var text = el.getAttribute('data-' + lang);
    if (text === null) return;
    if (text.indexOf('<') !== -1) el.innerHTML = text;
    else el.textContent = text;
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


/* =============================================
   ── SECTION 2: SIDEBAR TOGGLE ──
============================================= */
var sidebar        = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebar-overlay');
var hamburger      = document.getElementById('hamburger');
var sidebarClose   = document.getElementById('sidebar-close');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', function() {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
});


/* =============================================
   ── SECTION 3: PROFILE DROPDOWN ──
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

/* ── ✅ Load profile from localStorage (set at login) ── */
(function() {
  var stored = localStorage.getItem('emi_admin_user');
  if (stored) {
    try {
      var user       = JSON.parse(stored);
      var nameEl     = document.getElementById('profile-name-display');
      var initialsEl = document.getElementById('profile-initials');
      var dropName   = document.getElementById('dropdown-name');
      if (nameEl     && user.name) nameEl.textContent     = user.name;
      if (initialsEl && user.name) initialsEl.textContent = user.initials || user.name.charAt(0).toUpperCase();
      if (dropName   && user.name) dropName.textContent   = user.name;
    } catch(e) {}
  }
})();


/* =============================================
   ── SECTION 4: WELCOME DATE ──
============================================= */
(function() {
  var el     = document.getElementById('welcome-date');
  var lang   = localStorage.getItem('emi_lang') || 'en';
  var now    = new Date();
  var opts   = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  if (el) el.textContent = now.toLocaleDateString(locale, opts);
})();


/* =============================================
   ── SECTION 5: LOGOUT ──
   ✅ Clears token + redirects to login.

   🔧 TODO: Uncomment the fetch below when you
   add POST /auth/logout to your backend.
   (Express just needs to return { success: true }
   — the real work is on the frontend: clear storage)
============================================= */
var logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();

    /*
    🔧 TODO: Uncomment when POST /auth/logout exists on backend:
    ─────────────────────────────────────────────────────────────
    fetch(API_BASE + '/auth/logout', {
      method:  'POST',
      headers: getHeaders()
    }).finally(function() {
      clearAndRedirect();
    });
    ─────────────────────────────────────────────────────────────
    For now, we just clear locally and redirect:
    */

    localStorage.removeItem('emi_token');
    localStorage.removeItem('emi_admin_user');
    window.location.href = 'login.html';
  });
}


/* =============================================
   ── SECTION 6: API CONFIGURATION ──
   ✅ Points to your running Express server.
============================================= */
var API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
  };
}

/* Generic fetch helpers — all dashboard pages use these */
function apiGet(endpoint) {
  return fetch(API_BASE + endpoint, {
    method:  'GET',
    headers: getHeaders()
  }).then(function(res) {
    if (res.status === 401) {
      // Token expired or invalid → back to login
      window.location.href = 'login.html';
      return;
    }
    return res.json();
  });
}

function apiPost(endpoint, body) {
  return fetch(API_BASE + endpoint, {
    method:  'POST',
    headers: getHeaders(),
    body:    JSON.stringify(body)
  }).then(function(res) { return res.json(); });
}

function apiPut(endpoint, body) {
  return fetch(API_BASE + endpoint, {
    method:  'PUT',
    headers: getHeaders(),
    body:    JSON.stringify(body)
  }).then(function(res) { return res.json(); });
}

function apiDelete(endpoint) {
  return fetch(API_BASE + endpoint, {
    method:  'DELETE',
    headers: getHeaders()
  }).then(function(res) { return res.json(); });
}


/* =============================================
   ── SECTION 7: DASHBOARD STATS ──

   ✅ /api/users        → we count from GET /users
   🔧 /stats/services   → not built yet
   🔧 /stats/intelligence
   🔧 /stats/blog
   🔧 /stats/actualite
   🔧 /stats/messages

   For ✅ endpoints: real API call is active.
   For 🔧 endpoints: demo data is shown,
   uncomment the apiGet() block when you build
   that endpoint.
============================================= */
function loadStats() {

  /* ─────────────────────────────────────────
     ✅ USERS — counted from GET /api/users
     Your backend already returns the full list,
     so we count the array length here.
     Later you can add GET /stats/users on the
     backend that returns { count, change } directly.
  ───────────────────────────────────────────*/
  apiGet('/users').then(function(data) {
    if (!data) return;
    var count = Array.isArray(data) ? data.length : (data.count || 0);
    document.getElementById('stat-users').textContent       = count;
    document.getElementById('stat-users-meta').innerHTML    = '<i class="fa fa-users"></i> total registered';
  }).catch(function() {
    document.getElementById('stat-users').textContent       = '—';
    document.getElementById('stat-users-meta').innerHTML    = 'Could not load';
  });

  /* ─────────────────────────────────────────
     🔧 SERVICES — uncomment when backend ready
     Create endpoint: GET /api/stats/services
     Returns: { count: 11, change: "11 active" }
  ─────────────────────────────────────────────
  apiGet('/stats/services').then(function(data) {
    if (!data) return;
    document.getElementById('stat-services').textContent      = data.count  || '0';
    document.getElementById('stat-services-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-services').textContent      = '—';
    document.getElementById('stat-services-meta').textContent = 'Could not load';
  });
  */
  // Demo data until endpoint is built:
  document.getElementById('stat-services').textContent      = '11';
  document.getElementById('stat-services-meta').textContent = '11 active services';

  /* ─────────────────────────────────────────
     🔧 MINING INTELLIGENCE — uncomment when ready
     Create endpoint: GET /api/stats/intelligence
     Returns: { count: 5, change: "2 published" }
  ─────────────────────────────────────────────
  apiGet('/stats/intelligence').then(function(data) {
    if (!data) return;
    document.getElementById('stat-intelligence').textContent      = data.count  || '0';
    document.getElementById('stat-intelligence-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-intelligence').textContent      = '—';
    document.getElementById('stat-intelligence-meta').textContent = 'Could not load';
  });
  */
  // Demo data until endpoint is built:
  document.getElementById('stat-intelligence').textContent      = '5';
  document.getElementById('stat-intelligence-meta').textContent = '2 published';

  /* ─────────────────────────────────────────
     🔧 BLOG & NEWS — uncomment when ready
     Create endpoint: GET /api/stats/blog
     Returns: { count: 28, change: "+3 this week" }
  ─────────────────────────────────────────────
  apiGet('/stats/blog').then(function(data) {
    if (!data) return;
    document.getElementById('stat-blog').textContent      = data.count  || '0';
    document.getElementById('stat-blog-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-blog').textContent      = '—';
    document.getElementById('stat-blog-meta').textContent = 'Could not load';
  });
  */
  // Demo data until endpoint is built:
  document.getElementById('stat-blog').textContent      = '28';
  document.getElementById('stat-blog-meta').textContent = '+3 this week';

  /* ─────────────────────────────────────────
     🔧 ACTUALITÉS — uncomment when ready
     Create endpoint: GET /api/stats/actualite
     Returns: { count: 14, change: "Latest: yesterday" }
  ─────────────────────────────────────────────
  apiGet('/stats/actualite').then(function(data) {
    if (!data) return;
    document.getElementById('stat-actualite').textContent      = data.count  || '0';
    document.getElementById('stat-actualite-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-actualite').textContent      = '—';
    document.getElementById('stat-actualite-meta').textContent = 'Could not load';
  });
  */
  // Demo data until endpoint is built:
  document.getElementById('stat-actualite').textContent      = '14';
  document.getElementById('stat-actualite-meta').textContent = 'Latest: yesterday';

  /* ─────────────────────────────────────────
     🔧 UNREAD MESSAGES — uncomment when ready
     Create endpoint: GET /api/stats/messages
     Returns: { count: 5, change: "5 unread" }
  ─────────────────────────────────────────────
  apiGet('/stats/messages').then(function(data) {
    if (!data) return;
    document.getElementById('stat-messages').textContent      = data.count  || '0';
    document.getElementById('stat-messages-meta').textContent = data.change || '';
    var badge = document.getElementById('badge-contact');
    if (badge && data.count) badge.textContent = data.count;
  }).catch(function() {
    document.getElementById('stat-messages').textContent      = '—';
    document.getElementById('stat-messages-meta').textContent = 'Could not load';
  });
  */
  // Demo data until endpoint is built:
  document.getElementById('stat-messages').textContent      = '5';
  document.getElementById('stat-messages-meta').textContent = '5 unread';
}


/* =============================================
   ── SECTION 8: RECENT ACTIVITY ──

   🔧 NOT BUILT YET
   Create endpoint: GET /api/activity/recent
   Returns array:
   [
     {
       icon:   "ph-user-plus",
       color:  "blue",
       text:   "New user registered",
       detail: "john@example.com",
       time:   "2 min ago"
     },
     ...
   ]

   When ready, uncomment the apiGet block below
   and remove the renderActivity(demoActivity) line.
============================================= */

var demoActivity = [
  { icon: 'ph-user-plus', color: 'blue',   text: 'New user registered',      detail: 'cameroon@example.com',   time: '2 min ago'  },
  { icon: 'ph-newspaper',  color: 'coral',  text: 'Blog post published',       detail: 'Mine Water Safety 2025', time: '1 hr ago'   },
  { icon: 'ph-envelope',   color: 'teal',   text: 'New contact message',       detail: 'Partnership inquiry',    time: '3 hrs ago'  },
  { icon: 'ph-hard-hat',   color: 'yellow', text: 'Service page updated',      detail: 'Mine Water Management',  time: 'Yesterday'  },
  { icon: 'ph-brain',      color: 'green',  text: 'Intelligence report added', detail: 'ARD Risk Report Q2',     time: '2 days ago' }
];

function loadActivity() {
  /*
  🔧 TODO: Uncomment when GET /api/activity/recent exists:
  ──────────────────────────────────────────────────────────
  apiGet('/activity/recent').then(function(data) {
    if (!data || !data.length) { renderActivity(demoActivity); return; }
    renderActivity(data);
  }).catch(function() {
    renderActivity(demoActivity);
  });
  ──────────────────────────────────────────────────────────
  Remove the line below when you uncomment the block above:
  */
  renderActivity(demoActivity);
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
        '<strong>' + item.text   + '</strong>' +
        '<span>'   + item.detail + '</span>'   +
      '</div>' +
      '<div class="activity-time">' + item.time + '</div>' +
    '</div>';
  }).join('');
}


/* =============================================
   ── SECTION 9: CONTENT OVERVIEW PANEL ──

   🔧 NOT BUILT YET
   Create endpoint: GET /api/stats/overview
   Returns array:
   [
     { label: "Published Services",   value: 11, total: 11, color: "#f5c518" },
     { label: "Blog Posts Published", value: 22, total: 28, color: "#ea5c3a" },
     ...
   ]

   When ready, uncomment the apiGet block below
   and remove the renderOverview(demoOverview) line.
============================================= */

var demoOverview = [
  { label: 'Published Services',     value: 11, total: 11,  color: '#f5c518' },
  { label: 'Blog Posts Published',   value: 22, total: 28,  color: '#ea5c3a' },
  { label: 'Intelligence Reports',   value: 3,  total: 5,   color: '#16a34a' },
  { label: 'Unread Messages',        value: 5,  total: 5,   color: '#0891b2' },
  { label: 'Active Users (30 days)', value: 98, total: 142, color: '#7c3aed' }
];

function loadOverview() {
  /*
  🔧 TODO: Uncomment when GET /api/stats/overview exists:
  ──────────────────────────────────────────────────────────
  apiGet('/stats/overview').then(function(data) {
    if (!data) { renderOverview(demoOverview); return; }
    renderOverview(data);
  }).catch(function() {
    renderOverview(demoOverview);
  });
  ──────────────────────────────────────────────────────────
  Remove the line below when you uncomment the block above:
  */
  renderOverview(demoOverview);
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
   ── SECTION 10: USER CARDS ──

   ✅ DELETE /api/users/:id   — LIVE
   🔧 GET    /api/users/recent — NOT BUILT YET

   For the recent users list, your current backend
   has GET /api/users which returns ALL users.
   We use that and slice the first 7.

   Later, add GET /api/users/recent?limit=7 to your
   backend for better performance (avoids fetching
   all users just to show 7 cards).
============================================= */

var GRAD_COLORS = [
  '#0d2244,#2563b0', '#0a3020,#16a34a', '#1a1040,#7c3aed',
  '#2a1000,#d97706', '#001a2a,#0891b2', '#2a0a0a,#ea5c3a',
  '#1a0a2a,#9333ea'
];
function userGradient(id) {
  // MongoDB _id is a string — we use charCodeAt sum for a consistent colour
  var seed = typeof id === 'number' ? id :
    String(id).split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0);
  return GRAD_COLORS[seed % GRAD_COLORS.length];
}

function getInitials(first, last) {
  return ((first || '')[0] || '') + ((last || '')[0] || '').toUpperCase();
}

var recentUsersData = [];

function loadUserCards() {
  /*
  ─────────────────────────────────────────────────────────────
  ✅ ACTIVE: We call GET /api/users (exists on your backend).
  We sort by _id descending (newest first) and slice 7.

  🔧 FUTURE: When you add GET /api/users/recent?limit=7,
  replace the apiGet('/users') call below with:
    apiGet('/users/recent?limit=7')
  and remove the sort + slice since the backend will handle it.
  ─────────────────────────────────────────────────────────────
  */
  apiGet('/users').then(function(data) {
    if (!data || !data.length) return;

    // Sort by MongoDB _id descending = most recent first
    var sorted = data.slice().sort(function(a, b) {
      return (b._id > a._id) ? 1 : -1;
    });
    var recent = sorted.slice(0, 7);

    recentUsersData = recent;
    renderUserCards(recent);
  }).catch(function() {
    // Fallback demo data when backend is unreachable
    var demo = [
      { _id:'1', first_name:'Jean',   last_name:'Dupont',  email:'jean@example.com',   country:'Cameroon', status:'active'   },
      { _id:'2', first_name:'Marie',  last_name:'Mballa',  email:'marie@example.com',  country:'Cameroon', status:'active'   },
      { _id:'3', first_name:'Pierre', last_name:'Laurent', email:'pierre@example.com', country:'France',   status:'inactive' },
      { _id:'4', first_name:'Ama',    last_name:'Owusu',   email:'ama@example.com',    country:'Ghana',    status:'active'   },
      { _id:'5', first_name:'Carlos', last_name:'Menza',   email:'carlos@example.com', country:'Cameroon', status:'active'   },
      { _id:'6', first_name:'Sophie', last_name:'Martin',  email:'sophie@example.com', country:'Belgium',  status:'active'   },
      { _id:'7', first_name:'Kwame',  last_name:'Asante',  email:'kwame@example.com',  country:'Ghana',    status:'inactive' }
    ];
    recentUsersData = demo;
    renderUserCards(demo);
  });
}

function renderUserCards(users) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var grid = document.getElementById('user-cards-grid');
  if (!grid) return;

  var cards = users.map(function(u, idx) {
    // MongoDB uses _id — support both id and _id
    var uid      = u.id || u._id;
    var name     = (u.first_name || '') + ' ' + (u.last_name || '');
    var initials = getInitials(u.first_name, u.last_name);
    var grad     = userGradient(uid || idx);
    var stripes  = ['#2563b0','#16a34a','#7c3aed','#d97706','#0891b2','#ea5c3a','#9333ea'];
    var stripe   = stripes[idx % stripes.length];

    var avatarHtml = u.photo_url
      ? '<div class="uc-avatar"><img src="' + u.photo_url + '" alt="' + name + '"/></div>'
      : '<div class="uc-avatar" style="background:linear-gradient(135deg,' + grad + ');">' + initials + '</div>';

    var statusBadge = u.status === 'active'
      ? '<span class="badge badge-green" style="font-size:0.68rem;padding:2px 8px;"><i class="fa fa-circle" style="font-size:0.4rem;"></i>' + (lang==='fr'?'Actif':'Active') + '</span>'
      : '<span class="badge badge-gray"  style="font-size:0.68rem;padding:2px 8px;">' + (lang==='fr'?'Inactif':'Inactive') + '</span>';

    return '<div class="user-card" style="--uc-color:' + stripe + ';">' +
      avatarHtml +
      '<div class="uc-name"    title="' + name.trim()  + '">' + name.trim()  + '</div>' +
      '<div class="uc-email"   title="' + u.email      + '">' + u.email      + '</div>' +
      '<div class="uc-country"><i class="ph ph-map-pin"></i>' + (u.country || '—') + '</div>' +
      '<div class="uc-footer">' +
        statusBadge +
        '<div class="uc-actions">' +
          '<a href="dash-users.html" class="uc-action-btn edit" title="' + (lang==='fr'?'Modifier':'Edit') + '"><i class="ph ph-pencil-simple"></i></a>' +
          '<button class="uc-action-btn delete" title="' + (lang==='fr'?'Supprimer':'Delete') + '" ' +
            'onclick="deleteUserFromCard(\'' + uid + '\',\'' + name.trim().replace(/'/g, "\\'") + '\')"><i class="ph ph-trash"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  // "View All" card
  cards.push(
    '<div class="user-card user-card-more" onclick="window.location.href=\'dash-users.html\'">' +
      '<i class="ph ph-users-three"></i>' +
      '<span data-en="View All Users" data-fr="Voir Tous les Utilisateurs">' +
        (lang==='fr' ? 'Voir Tous les Utilisateurs' : 'View All Users') +
      '</span>' +
    '</div>'
  );

  grid.innerHTML = cards.join('');
}

/* ─────────────────────────────────────────────
   ✅ DELETE USER FROM CARD
   Calls DELETE /api/users/:id (exists on backend)
   MongoDB _id is used as the identifier.
─────────────────────────────────────────────── */
function deleteUserFromCard(id, name) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var msg  = lang === 'fr'
    ? 'Supprimer ' + name + ' ?\nCette action est irréversible.'
    : 'Delete ' + name + '?\nThis action cannot be undone.';
  if (!confirm(msg)) return;

  apiDelete('/users/' + id).then(function(data) {
    // Backend returns: { message: "User deleted successfully" }
    afterCardDelete(id, name, lang);
  }).catch(function() {
    afterCardDelete(id, name, lang);
  });
}

function afterCardDelete(id, name, lang) {
  // Remove from local array (match both id and _id)
  recentUsersData = recentUsersData.filter(function(u) {
    return (u.id || u._id) !== id;
  });
  renderUserCards(recentUsersData);

  showDashToast('success',
    lang === 'fr' ? 'Utilisateur supprimé' : 'User deleted',
    name + (lang === 'fr' ? ' a été supprimé.' : ' has been removed.')
  );

  // Refresh the user stat counter
  apiGet('/users').then(function(data) {
    if (data && Array.isArray(data)) {
      document.getElementById('stat-users').textContent = data.length;
    }
  }).catch(function() {});
}


/* =============================================
   ── SECTION 11: ADD USER MODAL ──

   ✅ CONNECTED TO: POST /api/auth/register (protected)

   NOTE: Your "add user" in the dashboard uses the
   register endpoint. That route is protected, so it
   requires the admin's Bearer token (getHeaders()
   sends it automatically). ✅

   Your backend returns on success (201):
   { id, first_name, last_name, email }

   On duplicate email (400):
   { message: "User already exists" }
============================================= */
document.getElementById('btn-add-user').addEventListener('click', function() {
  resetAddUserForm();
  openAddUserModal();
});

function openAddUserModal() {
  var modal = document.getElementById('modal-add-user');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function() { document.getElementById('new-first-name').focus(); }, 100);
}

function closeAddUserModal() {
  document.getElementById('modal-add-user').classList.remove('open');
  document.body.style.overflow = '';
  resetAddUserForm();
}

document.getElementById('close-modal-add-user').addEventListener('click', closeAddUserModal);
document.getElementById('cancel-add-user').addEventListener('click',      closeAddUserModal);

document.getElementById('modal-add-user').addEventListener('click', function(e) {
  if (e.target === this) closeAddUserModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAddUserModal();
});

function toggleNewPwd() {
  var field = document.getElementById('new-password');
  var icon  = document.getElementById('new-pwd-icon');
  var isText = field.type === 'text';
  field.type = isText ? 'password' : 'text';
  icon.className = isText ? 'fa fa-eye' : 'fa fa-eye-slash';
}

function resetAddUserForm() {
  var form = document.getElementById('add-user-form');
  if (form) form.reset();
  var err = document.getElementById('add-user-error');
  if (err) err.style.display = 'none';
  ['new-first-name','new-last-name','new-email','new-password'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.borderColor = '';
  });
}

function showAddUserError(msg) {
  var err    = document.getElementById('add-user-error');
  var errMsg = document.getElementById('add-user-error-msg');
  if (err && errMsg) {
    errMsg.textContent = msg;
    err.style.display  = 'flex';
  }
}

document.getElementById('submit-add-user').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var btn  = this;

  var firstName = document.getElementById('new-first-name').value.trim();
  var lastName  = document.getElementById('new-last-name').value.trim();
  var email     = document.getElementById('new-email').value.trim();
  var phone     = document.getElementById('new-phone').value.trim();
  var country   = document.getElementById('new-country').value.trim();
  var password  = document.getElementById('new-password').value;
  var status    = document.getElementById('new-status').value;

  /* Validate */
  var errors = [];
  if (!firstName) errors.push(lang==='fr' ? 'Le prénom est requis.'  : 'First name is required.');
  if (!lastName)  errors.push(lang==='fr' ? 'Le nom est requis.'     : 'Last name is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push(lang==='fr' ? 'Email invalide.' : 'A valid email is required.');
  if (!password || password.length < 8)
    errors.push(lang==='fr'
      ? 'Le mot de passe doit contenir au moins 8 caractères.'
      : 'Password must be at least 8 characters.');
  if (errors.length) { showAddUserError(errors.join(' ')); return; }

  /* Loading */
  btn.disabled    = true;
  btn.innerHTML   = '<i class="ph ph-spinner"></i> ' + (lang==='fr' ? 'Création…' : 'Creating…');

  var payload = {
    first_name: firstName,
    last_name:  lastName,
    email:      email,
    phone:      phone,
    country:    country,
    password:   password,
    status:     status
  };

  /* ── ✅ POST /api/auth/register (protected) ── */
  apiPost('/auth/register', payload).then(function(data) {
    afterAddUser(data, payload, lang);
  }).catch(function() {
    afterAddUser(null, payload, lang);
  });

  function afterAddUser(data, payload, lang) {

    // Check if backend returned an error message
    if (data && data.message && !data.id && !data._id) {
      // e.g. { message: "User already exists" }
      showAddUserError(data.message);
      btn.disabled  = false;
      btn.innerHTML = '<i class="ph ph-user-plus"></i> <span>' +
        (lang==='fr' ? 'Créer l\'Utilisateur' : 'Create User') + '</span>';
      return;
    }

    // Build the new user card entry using backend response
    var newUser = {
      _id:        (data && (data.id || data._id)) || ('local-' + Date.now()),
      first_name: payload.first_name,
      last_name:  payload.last_name,
      email:      payload.email,
      country:    payload.country,
      status:     payload.status || 'active',
      photo_url:  null
    };

    // Add to top of cards
    recentUsersData.unshift(newUser);
    if (recentUsersData.length > 7) recentUsersData = recentUsersData.slice(0, 7);
    renderUserCards(recentUsersData);

    closeAddUserModal();
    showDashToast('success',
      lang==='fr' ? 'Utilisateur créé' : 'User created',
      payload.first_name + ' ' + payload.last_name +
        (lang==='fr' ? ' a été ajouté.' : ' has been added.')
    );

    // Refresh user count stat
    apiGet('/users').then(function(d) {
      if (d && Array.isArray(d)) document.getElementById('stat-users').textContent = d.length;
    }).catch(function() {});

    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-user-plus"></i> <span>' +
      (lang==='fr' ? 'Créer l\'Utilisateur' : 'Create User') + '</span>';
  }
});


/* =============================================
   ── SECTION 12: DASHBOARD TOAST ──
============================================= */
function showDashToast(type, title, detail) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var icons = { success: 'ph-check-circle', error: 'ph-warning-circle', warning: 'ph-warning' };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML =
    '<i class="ph ' + (icons[type] || 'ph-info') + ' toast-icon"></i>' +
    '<div class="toast-text"><strong>' + title + '</strong><span>' + (detail || '') + '</span></div>' +
    '<button class="toast-dismiss" onclick="this.parentElement.remove()"><i class="fa fa-times"></i></button>';
  container.appendChild(toast);
  setTimeout(function() { if (toast.parentElement) toast.remove(); }, 4000);
}


/* =============================================
   ── INIT ──
============================================= */
document.addEventListener('DOMContentLoaded', function() {
  loadStats();
  loadActivity();
  loadOverview();
  loadUserCards();
});


/*
  ═══════════════════════════════════════════════════
  BACKEND INTEGRATION STATUS — dashboard-script.js
  ═══════════════════════════════════════════════════

  ✅ LIVE (endpoints exist in your backend):
  ───────────────────────────────────────────
  POST  /api/auth/login          → login-script.js
  POST  /api/auth/register       → Add User modal (Section 11)
  GET   /api/users               → user cards + user stat count
  DELETE /api/users/:id          → delete from card

  🔧 TODO (demo data shown, uncomment when built):
  ───────────────────────────────────────────────
  GET /api/stats/services        → stat card
  GET /api/stats/intelligence    → stat card
  GET /api/stats/blog            → stat card
  GET /api/stats/actualite       → stat card
  GET /api/stats/messages        → stat card + sidebar badge
  GET /api/activity/recent       → recent activity list
  GET /api/stats/overview        → content overview panel
  GET /api/users/recent?limit=7  → optional (replaces slicing /users)

  🔐 ALL requests send: Authorization: Bearer <token>
     Token stored as 'emi_token' in localStorage.
     401 response → auto-redirect to login.html.

  ═══════════════════════════════════════════════════
*/