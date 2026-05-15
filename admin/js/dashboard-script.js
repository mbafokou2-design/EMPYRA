/* =============================================
   EMI DASHBOARD — dashboard-script.js
   ✅ = ALL stat endpoints now live
============================================= */

/* ── LANGUAGE ── */
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

/* ── SIDEBAR ── */
var sidebar        = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebar-overlay');
var hamburger      = document.getElementById('hamburger');
var sidebarClose   = document.getElementById('sidebar-close');
function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; }
hamburger.addEventListener('click', function() { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar(); });

/* ── PROFILE DROPDOWN ── */
var profileTrigger  = document.getElementById('profile-trigger');
var topbarProfile   = document.getElementById('topbar-profile');
if (profileTrigger) {
  profileTrigger.addEventListener('click', function(e) { e.stopPropagation(); topbarProfile.classList.toggle('open'); });
}
document.addEventListener('click', function(e) {
  if (topbarProfile && !topbarProfile.contains(e.target)) topbarProfile.classList.remove('open');
});
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

/* ── WELCOME DATE ── */
(function() {
  var el     = document.getElementById('welcome-date');
  var lang   = localStorage.getItem('emi_lang') || 'en';
  var now    = new Date();
  var opts   = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  if (el) el.textContent = now.toLocaleDateString(locale, opts);
})();

/* ── LOGOUT ── */
var logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('emi_token');
    localStorage.removeItem('emi_admin_user');
    window.location.href = 'login.html';
  });
}

/* =============================================
   ✅ API CONFIG
============================================= */
var API_BASE = 'https://empyrabackend-production.up.railway.app/api';

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
  };
}
function apiGet(endpoint) {
  return fetch(API_BASE + endpoint, { method: 'GET', headers: getHeaders() })
    .then(function(res) {
      if (res.status === 401) { window.location.href = 'login.html'; return; }
      return res.json();
    });
}
function apiPost(endpoint, body) {
  return fetch(API_BASE + endpoint, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) })
    .then(function(res) { return res.json(); });
}
function apiDelete(endpoint) {
  return fetch(API_BASE + endpoint, { method: 'DELETE', headers: getHeaders() })
    .then(function(res) { return res.json(); });
}

/* =============================================
   ── SECTION 7: DASHBOARD STATS ──
   ✅ ALL connected to real backend data.
   Each stat calls GET /api/stats/<resource>
   which returns { count, change }.
============================================= */
function loadStats() {

  /* ✅ USERS */
  apiGet('/stats/users').then(function(data) {
    if (!data) return;
    document.getElementById('stat-users').textContent    = data.count  || '0';
    document.getElementById('stat-users-meta').innerHTML = '<i class="fa fa-arrow-up"></i> ' + (data.change || '');
  }).catch(function() {
    document.getElementById('stat-users').textContent    = '—';
    document.getElementById('stat-users-meta').innerHTML = 'Could not load';
  });

  /* ✅ SERVICES */
  apiGet('/stats/services').then(function(data) {
    if (!data) return;
    document.getElementById('stat-services').textContent      = data.count  || '0';
    document.getElementById('stat-services-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-services').textContent      = '—';
    document.getElementById('stat-services-meta').textContent = 'Could not load';
  });

  /* ✅ MINING INTELLIGENCE */
  apiGet('/stats/intelligence').then(function(data) {
    if (!data) return;
    document.getElementById('stat-intelligence').textContent      = data.count  || '0';
    document.getElementById('stat-intelligence-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-intelligence').textContent      = '—';
    document.getElementById('stat-intelligence-meta').textContent = 'Could not load';
  });

  /* ✅ BLOG & NEWS */
  apiGet('/stats/blog').then(function(data) {
    if (!data) return;
    document.getElementById('stat-blog').textContent      = data.count  || '0';
    document.getElementById('stat-blog-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-blog').textContent      = '—';
    document.getElementById('stat-blog-meta').textContent = 'Could not load';
  });

  /* ✅ ACTUALITÉS */
  apiGet('/stats/actualite').then(function(data) {
    if (!data) return;
    document.getElementById('stat-actualite').textContent      = data.count  || '0';
    document.getElementById('stat-actualite-meta').textContent = data.change || '';
  }).catch(function() {
    document.getElementById('stat-actualite').textContent      = '—';
    document.getElementById('stat-actualite-meta').textContent = 'Could not load';
  });

  /* 🔧 MESSAGES — uncomment when Contact/Messages module is built
  ──────────────────────────────────────────────────────────────────
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
  ──────────────────────────────────────────────────────────────────
  Demo until messages module is built: */
  document.getElementById('stat-messages').textContent      = '—';
  document.getElementById('stat-messages-meta').textContent = 'Coming soon';
}

/* =============================================
   ── SECTION 8: RECENT ACTIVITY ──
   🔧 Build GET /api/activity/recent when ready.
   For now shows demo data.
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
  🔧 TODO: Uncomment when GET /api/activity/recent is built:
  ────────────────────────────────────────────────────────────
  apiGet('/activity/recent').then(function(data) {
    if (!data || !data.length) { renderActivity(demoActivity); return; }
    renderActivity(data);
  }).catch(function() { renderActivity(demoActivity); });
  ────────────────────────────────────────────────────────────
  */
  renderActivity(demoActivity);
}

function renderActivity(items) {
  var list = document.getElementById('activity-list');
  if (!list) return;
  list.innerHTML = items.map(function(item) {
    return '<div class="activity-item">' +
      '<div class="activity-icon ' + (item.color || 'blue') + '"><i class="ph ' + item.icon + '"></i></div>' +
      '<div class="activity-text"><strong>' + item.text + '</strong><span>' + item.detail + '</span></div>' +
      '<div class="activity-time">' + item.time + '</div>' +
    '</div>';
  }).join('');
}

/* =============================================
   ── SECTION 9: CONTENT OVERVIEW ──
   ✅ GET /api/stats/overview — real data
============================================= */
function loadOverview() {
  apiGet('/stats/overview').then(function(data) {
    if (!data || !data.length) { renderOverview([]); return; }
    renderOverview(data);
  }).catch(function() {
    renderOverview([]);
  });
}

function renderOverview(items) {
  var el = document.getElementById('overview-list');
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<p style="color:var(--gray);font-size:0.85rem;text-align:center;padding:20px 0;">No data available</p>';
    return;
  }
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
   ✅ GET /api/users — live
   ✅ DELETE /api/users/:id — live
============================================= */
var GRAD_COLORS = [
  '#0d2244,#2563b0', '#0a3020,#16a34a', '#1a1040,#7c3aed',
  '#2a1000,#d97706', '#001a2a,#0891b2', '#2a0a0a,#ea5c3a', '#1a0a2a,#9333ea'
];
function userGradient(id) {
  var seed = typeof id === 'number' ? id :
    String(id).split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0);
  return GRAD_COLORS[seed % GRAD_COLORS.length];
}
function getInitials(first, last) {
  return ((first || '')[0] || '') + ((last || '')[0] || '').toUpperCase();
}

var recentUsersData = [];

function loadUserCards() {
  apiGet('/users').then(function(data) {
    if (!data || !data.length) return;
    var sorted = data.slice().sort(function(a, b) { return (b._id > a._id) ? 1 : -1; });
    recentUsersData = sorted.slice(0, 7);
    renderUserCards(recentUsersData);
  }).catch(function() {
    recentUsersData = [];
    renderUserCards([]);
  });
}

function renderUserCards(users) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var grid = document.getElementById('user-cards-grid');
  if (!grid) return;

  var cards = users.map(function(u, idx) {
    var uid      = String(u._id || u.id || idx);
    var name     = (u.first_name || '') + ' ' + (u.last_name || '');
    var initials = getInitials(u.first_name, u.last_name);
    var grad     = userGradient(uid);
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
      '<div class="uc-name"    title="' + name.trim() + '">' + name.trim() + '</div>' +
      '<div class="uc-email"   title="' + u.email + '">' + u.email + '</div>' +
      '<div class="uc-country"><i class="ph ph-map-pin"></i>' + (u.country || '—') + '</div>' +
      '<div class="uc-footer">' + statusBadge +
        '<div class="uc-actions">' +
          '<a href="dash-users.html" class="uc-action-btn edit" title="' + (lang==='fr'?'Modifier':'Edit') + '"><i class="ph ph-pencil-simple"></i></a>' +
          '<button class="uc-action-btn delete" data-id="' + uid + '" data-name="' + name.trim().replace(/"/g,'&quot;') + '" onclick="deleteUserFromCard(this.dataset.id, this.dataset.name)" title="' + (lang==='fr'?'Supprimer':'Delete') + '"><i class="ph ph-trash"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  cards.push(
    '<div class="user-card user-card-more" onclick="window.location.href=\'dash-users.html\'">' +
      '<i class="ph ph-users-three"></i>' +
      '<span>' + (lang==='fr' ? 'Voir Tous les Utilisateurs' : 'View All Users') + '</span>' +
    '</div>'
  );

  grid.innerHTML = cards.join('');
}

function deleteUserFromCard(id, name) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  if (!confirm((lang==='fr' ? 'Supprimer ' : 'Delete ') + name + '?')) return;

  apiDelete('/users/' + id).then(function() {
    afterCardDelete(id, name, lang);
  }).catch(function() {
    afterCardDelete(id, name, lang);
  });
}

function afterCardDelete(id, name, lang) {
  recentUsersData = recentUsersData.filter(function(u) { return String(u._id || u.id) !== String(id); });
  renderUserCards(recentUsersData);
  showDashToast('success',
    lang==='fr' ? 'Utilisateur supprimé' : 'User deleted',
    name + (lang==='fr' ? ' a été supprimé.' : ' has been removed.')
  );
  /* Refresh user stat */
  apiGet('/stats/users').then(function(data) {
    if (data) document.getElementById('stat-users').textContent = data.count || '0';
  }).catch(function() {});
}

/* =============================================
   ── SECTION 11: ADD USER MODAL ──
   ✅ POST /api/auth/register (protected)
============================================= */
document.getElementById('btn-add-user').addEventListener('click', function() {
  resetAddUserForm();
  openAddUserModal();
});

function openAddUserModal() {
  document.getElementById('modal-add-user').classList.add('open');
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
document.getElementById('modal-add-user').addEventListener('click', function(e) { if (e.target === this) closeAddUserModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeAddUserModal(); });

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
}

function showAddUserError(msg) {
  var err    = document.getElementById('add-user-error');
  var errMsg = document.getElementById('add-user-error-msg');
  if (err && errMsg) { errMsg.textContent = msg; err.style.display = 'flex'; }
}

document.getElementById('submit-add-user').addEventListener('click', function() {
  var lang      = localStorage.getItem('emi_lang') || 'en';
  var btn       = this;
  var firstName = document.getElementById('new-first-name').value.trim();
  var lastName  = document.getElementById('new-last-name').value.trim();
  var email     = document.getElementById('new-email').value.trim();
  var phone     = document.getElementById('new-phone').value.trim();
  var country   = document.getElementById('new-country').value.trim();
  var password  = document.getElementById('new-password').value;
  var status    = document.getElementById('new-status').value;

  var errors = [];
  if (!firstName) errors.push(lang==='fr' ? 'Le prénom est requis.' : 'First name is required.');
  if (!lastName)  errors.push(lang==='fr' ? 'Le nom est requis.'    : 'Last name is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push(lang==='fr' ? 'Email invalide.' : 'A valid email is required.');
  if (!password || password.length < 8)
    errors.push(lang==='fr' ? 'Min. 8 caractères.' : 'Password must be at least 8 characters.');
  if (errors.length) { showAddUserError(errors.join(' ')); return; }

  btn.disabled  = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr' ? 'Création…' : 'Creating…');

  apiPost('/auth/register', { first_name: firstName, last_name: lastName, email, phone, country, password, status })
    .then(function(data) { afterAddUser(data, { first_name: firstName, last_name: lastName, email, country, status }, lang); })
    .catch(function()    { afterAddUser(null, { first_name: firstName, last_name: lastName, email, country, status }, lang); });

  function afterAddUser(data, payload, lang) {
    if (data && data.message && !data.id && !data._id) {
      showAddUserError(data.message);
      btn.disabled  = false;
      btn.innerHTML = '<i class="ph ph-user-plus"></i> <span>' + (lang==='fr' ? 'Créer l\'Utilisateur' : 'Create User') + '</span>';
      return;
    }

    var newUser = {
      _id:        String((data && (data.id || data._id)) || ('local-' + Date.now())),
      first_name: payload.first_name,
      last_name:  payload.last_name,
      email:      payload.email,
      country:    payload.country,
      status:     payload.status || 'active',
      photo_url:  null
    };

    recentUsersData.unshift(newUser);
    if (recentUsersData.length > 7) recentUsersData = recentUsersData.slice(0, 7);
    renderUserCards(recentUsersData);
    closeAddUserModal();
    showDashToast('success',
      lang==='fr' ? 'Utilisateur créé' : 'User created',
      payload.first_name + ' ' + payload.last_name + (lang==='fr' ? ' a été ajouté.' : ' has been added.')
    );

    /* Refresh user stat card */
    apiGet('/stats/users').then(function(d) {
      if (d) document.getElementById('stat-users').textContent = d.count || '0';
    }).catch(function() {});

    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-user-plus"></i> <span>' + (lang==='fr' ? 'Créer l\'Utilisateur' : 'Create User') + '</span>';
  }
});

/* ── TOAST ── */
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

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() {
  loadStats();
  loadActivity();
  loadOverview();
  loadUserCards();
});
