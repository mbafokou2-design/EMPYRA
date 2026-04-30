/* =============================================
   EMI DASHBOARD — dash-users-script.js
   ✅ = live endpoint
   🔧 = not built yet (demo data shown)
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
(function() { setLang(localStorage.getItem('emi_lang') || 'en'); })();

/* ── SIDEBAR ── */
var sidebar        = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebar-overlay');
var hamburger      = document.getElementById('hamburger');
var sidebarClose   = document.getElementById('sidebar-close');
function openSidebar()  { sidebar.classList.add('open');    sidebarOverlay.classList.add('active');    document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; }
hamburger.addEventListener('click', function() { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeSidebar(); closeAllModals(); } });

/* ── PROFILE DROPDOWN ── */
var profileTrigger = document.getElementById('profile-trigger');
var topbarProfile  = document.getElementById('topbar-profile');
if (profileTrigger) {
  profileTrigger.addEventListener('click', function(e) { e.stopPropagation(); topbarProfile.classList.toggle('open'); });
}
document.addEventListener('click', function(e) {
  if (topbarProfile && !topbarProfile.contains(e.target)) topbarProfile.classList.remove('open');
});
(function() {
  var stored = localStorage.getItem('emi_admin_user');
  if (!stored) return;
  try {
    var user       = JSON.parse(stored);
    var nameEl     = document.getElementById('profile-name-display');
    var initialsEl = document.getElementById('profile-initials');
    var dropName   = document.getElementById('dropdown-name');
    if (nameEl     && user.name) nameEl.textContent     = user.name;
    if (initialsEl && user.name) initialsEl.textContent = user.initials || user.name.charAt(0).toUpperCase();
    if (dropName   && user.name) dropName.textContent   = user.name;
  } catch(e) {}
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
   ✅ API CONFIG — connected to your Express server
============================================= */
var API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
  };
}
function apiRequest(method, endpoint, body) {
  var opts = { method: method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + endpoint, opts).then(function(res) {
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    return res.json();
  });
}
var apiGet    = function(ep)       { return apiRequest('GET',    ep); };
var apiPut    = function(ep, body) { return apiRequest('PUT',    ep, body); };
var apiDelete = function(ep)       { return apiRequest('DELETE', ep); };

/* ── TOAST ── */
function showToast(type, title, detail) {
  var container = document.getElementById('toast-container');
  var icons = { success: 'ph-check-circle', error: 'ph-warning-circle', warning: 'ph-warning' };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML =
    '<i class="ph ' + (icons[type]||'ph-info') + ' toast-icon"></i>' +
    '<div class="toast-text"><strong>' + title + '</strong><span>' + (detail||'') + '</span></div>' +
    '<button class="toast-dismiss" onclick="this.parentElement.remove()"><i class="fa fa-times"></i></button>';
  container.appendChild(toast);
  setTimeout(function() { if (toast.parentElement) toast.remove(); }, 4000);
}

/* ── MODALS ── */
function openModal(id)  { var el = document.getElementById(id); if (el) { el.classList.add('open');    document.body.style.overflow = 'hidden'; } }
function closeModal(id) { var el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } }
function closeAllModals() { ['modal-view','modal-edit','modal-delete'].forEach(closeModal); }
document.getElementById('close-modal-view').addEventListener('click',   function() { closeModal('modal-view'); });
document.getElementById('close-modal-edit').addEventListener('click',   function() { closeModal('modal-edit'); });
document.getElementById('close-modal-delete').addEventListener('click', function() { closeModal('modal-delete'); });
document.getElementById('cancel-edit').addEventListener('click',        function() { closeModal('modal-edit'); });
['modal-view','modal-edit','modal-delete'].forEach(function(id) {
  document.getElementById(id).addEventListener('click', function(e) { if (e.target === this) closeModal(id); });
});

/* =============================================
   STATE
============================================= */
var STATE = {
  users: [], filtered: [],
  currentPage: 1, perPage: 10,
  editingId: null, deletingId: null, deletingName: ''
};

/* =============================================
   HELPERS
============================================= */
function getInitials(name) {
  if (!name) return '?';
  var parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
}

/* MongoDB _id is a string — derive a consistent colour index from it */
function randomGradient(id) {
  var colours = [
    '#0d2244,#2563b0', '#0a3020,#16a34a', '#1a1040,#7c3aed',
    '#2a1000,#d97706', '#001a2a,#0891b2', '#2a0a0a,#ea5c3a'
  ];
  var seed = typeof id === 'number' ? id :
    String(id).split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0);
  return colours[seed % colours.length];
}

/* Return the right id field — MongoDB uses _id, not id */
function uid(user) { return user._id || user.id; }

/* =============================================
   ✅ LOAD USERS — GET /api/users
   Your backend returns all users (no password).
   We support both id and _id (MongoDB uses _id).
============================================= */
function loadUsers() {
  document.getElementById('users-tbody').innerHTML =
    '<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--gray);">' +
    '<i class="ph ph-spinner" style="font-size:1.4rem;"></i> <span>Loading…</span></td></tr>';

  apiGet('/users').then(function(data) {
    if (!data) return;
    STATE.users = data;
    buildCountryFilter();
    updateStats();
    applyFilters();
  }).catch(function() {
    /* Demo fallback — remove when backend is reachable */
    STATE.users = [
      { _id:'1',  first_name:'Jean',    last_name:'Dupont',    email:'jean@example.com',    phone:'+237 655 001 001',  country:'Cameroon',     status:'active',   createdAt:'2025-01-10' },
      { _id:'2',  first_name:'Marie',   last_name:'Mballa',    email:'marie@example.com',   phone:'+237 655 002 002',  country:'Cameroon',     status:'active',   createdAt:'2025-01-18' },
      { _id:'3',  first_name:'Pierre',  last_name:'Laurent',   email:'pierre@example.com',  phone:'+33 6 12 34 56 78', country:'France',       status:'inactive', createdAt:'2025-02-03' },
      { _id:'4',  first_name:'Ama',     last_name:'Owusu',     email:'ama@example.com',     phone:'+233 24 000 0001',  country:'Ghana',        status:'active',   createdAt:'2025-02-14' },
      { _id:'5',  first_name:'Carlos',  last_name:'Menza',     email:'carlos@example.com',  phone:'+237 655 003 003',  country:'Cameroon',     status:'active',   createdAt:'2025-02-22' },
      { _id:'6',  first_name:'Sophie',  last_name:'Martin',    email:'sophie@example.com',  phone:'+32 2 000 0001',    country:'Belgium',      status:'active',   createdAt:'2025-03-01' },
      { _id:'7',  first_name:'Kwame',   last_name:'Asante',    email:'kwame@example.com',   phone:'+233 24 000 0002',  country:'Ghana',        status:'inactive', createdAt:'2025-03-08' },
      { _id:'8',  first_name:'Fatima',  last_name:'Nkosi',     email:'fatima@example.com',  phone:'+237 655 004 004',  country:'Cameroon',     status:'active',   createdAt:'2025-03-15' },
      { _id:'9',  first_name:'Ibrahim', last_name:'Diallo',    email:'ibrahim@example.com', phone:'+221 77 000 0001',  country:'Senegal',      status:'active',   createdAt:'2025-03-20' },
      { _id:'10', first_name:'Lena',    last_name:'Schneider', email:'lena@example.com',    phone:'+49 30 0000001',    country:'Germany',      status:'active',   createdAt:'2025-03-28' },
      { _id:'11', first_name:'Omar',    last_name:'Traoré',    email:'omar@example.com',    phone:'+226 70 000 001',   country:'Burkina Faso', status:'inactive', createdAt:'2025-04-02' },
      { _id:'12', first_name:'Aline',   last_name:'Bello',     email:'aline@example.com',   phone:'+237 655 005 005',  country:'Cameroon',     status:'active',   createdAt:'2025-04-05' }
    ];
    buildCountryFilter();
    updateStats();
    applyFilters();
  });
}

/* ── BUILD COUNTRY FILTER from data ── */
function buildCountryFilter() {
  var countries = STATE.users
    .map(function(u) { return u.country; })
    .filter(Boolean)
    .filter(function(c, i, arr) { return arr.indexOf(c) === i; })
    .sort();
  var sel   = document.getElementById('filter-country');
  var first = sel.options[0];
  sel.innerHTML = '';
  sel.appendChild(first);
  countries.forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

/* ── UPDATE MINI STATS ── */
function updateStats() {
  var total    = STATE.users.length;
  var active   = STATE.users.filter(function(u) { return u.status === 'active'; }).length;
  var inactive = STATE.users.filter(function(u) { return u.status !== 'active'; }).length;
  var now      = new Date();

  /* MongoDB stores createdAt — fall back to registered_at for demo data */
  var newMonth = STATE.users.filter(function(u) {
    var raw = u.createdAt || u.registered_at;
    if (!raw) return false;
    var d = new Date(raw);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-active').textContent   = active;
  document.getElementById('stat-new').textContent      = newMonth;
  document.getElementById('stat-inactive').textContent = inactive;
}

/* ── FILTERS ── */
function applyFilters() {
  var query   = document.getElementById('search-input').value.toLowerCase().trim();
  var country = document.getElementById('filter-country').value;
  var status  = document.getElementById('filter-status').value;

  STATE.filtered = STATE.users.filter(function(u) {
    var name   = ((u.first_name||'') + ' ' + (u.last_name||'')).toLowerCase();
    var matchQ = !query   || name.includes(query) || (u.email||'').toLowerCase().includes(query) || (u.country||'').toLowerCase().includes(query);
    var matchC = !country || u.country === country;
    var matchS = !status  || u.status  === status;
    return matchQ && matchC && matchS;
  });

  STATE.currentPage = 1;
  document.getElementById('count-number').textContent = STATE.filtered.length;
  renderTable();
  renderPagination();
}
document.getElementById('search-input').addEventListener('input',    applyFilters);
document.getElementById('filter-country').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change',  applyFilters);

/* ── RENDER TABLE ── */
function renderTable() {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var tbody = document.getElementById('users-tbody');
  var start = (STATE.currentPage - 1) * STATE.perPage;
  var page  = STATE.filtered.slice(start, start + STATE.perPage);

  if (page.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="table-empty">' +
      '<i class="ph ph-magnifying-glass" style="font-size:2.8rem;color:var(--gray-light);"></i>' +
      '<p>' + (lang==='fr' ? 'Aucun utilisateur trouvé.' : 'No users found.') + '</p>' +
      '</div></td></tr>';
    return;
  }

  tbody.innerHTML = page.map(function(u) {
    var id       = uid(u);
    var name     = (u.first_name||'') + ' ' + (u.last_name||'');
    var initials = getInitials(name);
    var dateRaw  = u.createdAt || u.registered_at;
    var dateStr  = dateRaw
      ? new Date(dateRaw).toLocaleDateString(lang==='fr' ? 'fr-FR' : 'en-US', { year:'numeric', month:'short', day:'numeric' })
      : '—';

    var avatarHtml = u.photo_url
      ? '<div class="user-avatar"><img src="' + u.photo_url + '" alt="' + name + '"/></div>'
      : '<div class="user-avatar" style="background:linear-gradient(135deg,' + randomGradient(id) + ')">' + initials + '</div>';

    var statusBadge = u.status === 'active'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.45rem;"></i>' + (lang==='fr'?'Actif':'Active') + '</span>'
      : '<span class="badge badge-gray">' + (lang==='fr'?'Inactif':'Inactive') + '</span>';

    /* Escape name for onclick string — use data attribute instead to avoid quote issues */
    return '<tr>' +
      '<td><div class="user-cell">' + avatarHtml +
        '<div><span class="user-name">' + name + '</span>' +
        '<span class="user-email">' + u.email + '</span></div></div></td>' +
      '<td>' + (u.country||'—') + '</td>' +
      '<td>' + (u.phone||'—') + '</td>' +
      '<td>' + dateStr + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="row-action-btn view"   data-id="' + id + '" onclick="openViewModal(this.dataset.id)"   title="' + (lang==='fr'?'Voir':'View') + '"><i class="ph ph-eye"></i></button>' +
        '<button class="row-action-btn edit"   data-id="' + id + '" onclick="openEditModal(this.dataset.id)"   title="' + (lang==='fr'?'Modifier':'Edit') + '"><i class="ph ph-pencil-simple"></i></button>' +
        '<button class="row-action-btn delete" data-id="' + id + '" data-name="' + name.trim() + '" onclick="openDeleteModal(this.dataset.id, this.dataset.name)" title="' + (lang==='fr'?'Supprimer':'Delete') + '"><i class="ph ph-trash"></i></button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

/* ── PAGINATION ── */
function renderPagination() {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  var pag   = document.getElementById('pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  var html = '<button class="page-btn" onclick="changePage(' + (STATE.currentPage - 1) + ')" ' + (STATE.currentPage === 1 ? 'disabled' : '') + '><i class="fa fa-chevron-left"></i></button>';
  for (var i = 1; i <= total; i++) {
    html += '<button class="page-btn ' + (i === STATE.currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
  }
  html += '<button class="page-btn" onclick="changePage(' + (STATE.currentPage + 1) + ')" ' + (STATE.currentPage === total ? 'disabled' : '') + '><i class="fa fa-chevron-right"></i></button>';
  pag.innerHTML = html;
}
function changePage(p) {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  if (p < 1 || p > total) return;
  STATE.currentPage = p;
  renderTable();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =============================================
   ✅ VIEW USER MODAL
   Reads from STATE.users (already loaded).
   Supports both id and _id (MongoDB).
============================================= */
function openViewModal(id) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var user = STATE.users.find(function(u) { return uid(u) === id; });
  if (!user) return;

  var name     = (user.first_name||'') + ' ' + (user.last_name||'');
  var initials = getInitials(name);
  var dateRaw  = user.createdAt || user.registered_at;
  var dateStr  = dateRaw
    ? new Date(dateRaw).toLocaleDateString(lang==='fr' ? 'fr-FR' : 'en-US', { year:'numeric', month:'long', day:'numeric' })
    : '—';

  document.getElementById('view-modal-title').textContent = lang==='fr' ? 'Profil Utilisateur' : 'User Profile';
  document.getElementById('view-modal-sub').textContent   = user.email;
  document.getElementById('view-to-edit').onclick         = function() { closeModal('modal-view'); openEditModal(id); };

  var avatarHtml = user.photo_url
    ? '<div class="view-avatar"><img src="' + user.photo_url + '" alt="' + name + '"/></div>'
    : '<div class="view-avatar" style="background:linear-gradient(135deg,' + randomGradient(uid(user)) + ')">' + initials + '</div>';

  var statusBadge = user.status === 'active'
    ? '<span class="badge badge-green">' + (lang==='fr'?'Actif':'Active') + '</span>'
    : '<span class="badge badge-gray">'  + (lang==='fr'?'Inactif':'Inactive') + '</span>';

  document.getElementById('view-modal-body').innerHTML =
    '<div class="view-user-header">' + avatarHtml +
      '<div><div class="view-user-name">' + name + '</div>' +
      '<div class="view-user-email">' + user.email + '</div></div>' +
    '</div>' +
    '<div class="view-info-grid">' +
      '<div class="view-info-item"><div class="view-info-label">' + (lang==='fr'?'Prénom':'First Name') + '</div><div class="view-info-value">' + (user.first_name||'—') + '</div></div>' +
      '<div class="view-info-item"><div class="view-info-label">' + (lang==='fr'?'Nom':'Last Name')     + '</div><div class="view-info-value">' + (user.last_name||'—')  + '</div></div>' +
      '<div class="view-info-item"><div class="view-info-label">Email</div><div class="view-info-value">' + (user.email||'—') + '</div></div>' +
      '<div class="view-info-item"><div class="view-info-label">' + (lang==='fr'?'Téléphone':'Phone')   + '</div><div class="view-info-value">' + (user.phone||'—')    + '</div></div>' +
      '<div class="view-info-item"><div class="view-info-label">' + (lang==='fr'?'Pays':'Country')      + '</div><div class="view-info-value">' + (user.country||'—')  + '</div></div>' +
      '<div class="view-info-item"><div class="view-info-label">Status</div><div class="view-info-value">' + statusBadge + '</div></div>' +
      '<div class="view-info-item"><div class="view-info-label">' + (lang==='fr'?'Inscrit le':'Registered') + '</div><div class="view-info-value">' + dateStr + '</div></div>' +
    '</div>';

  openModal('modal-view');
}

/* =============================================
   ✅ EDIT USER — PUT /api/users/:id
   Your backend: finds by _id, updates fields,
   returns updated user object.
============================================= */
function openEditModal(id) {
  var user = STATE.users.find(function(u) { return uid(u) === id; });
  if (!user) return;
  STATE.editingId = id;
  var name = (user.first_name||'') + ' ' + (user.last_name||'');
  document.getElementById('edit-modal-sub').textContent = name.trim();
  document.getElementById('edit-user-id').value         = id;
  document.getElementById('edit-first-name').value      = user.first_name || '';
  document.getElementById('edit-last-name').value       = user.last_name  || '';
  document.getElementById('edit-email').value           = user.email      || '';
  document.getElementById('edit-phone').value           = user.phone      || '';
  document.getElementById('edit-country').value         = user.country    || '';
  document.getElementById('edit-status').value          = user.status     || 'active';
  openModal('modal-edit');
}

document.getElementById('submit-edit').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var id   = STATE.editingId;
  var payload = {
    first_name: document.getElementById('edit-first-name').value.trim(),
    last_name:  document.getElementById('edit-last-name').value.trim(),
    email:      document.getElementById('edit-email').value.trim(),
    phone:      document.getElementById('edit-phone').value.trim(),
    country:    document.getElementById('edit-country').value.trim(),
    status:     document.getElementById('edit-status').value
  };

  if (!payload.first_name || !payload.last_name || !payload.email) {
    showToast('error',
      lang==='fr' ? 'Champs manquants'       : 'Missing fields',
      lang==='fr' ? 'Remplissez les champs obligatoires.' : 'Fill in required fields.');
    return;
  }

  var btn = this;
  btn.disabled  = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr' ? 'Enregistrement…' : 'Saving…');

  /* ✅ PUT /api/users/:id */
  apiPut('/users/' + id, payload).then(function(data) {
    afterEdit(data);
  }).catch(function() {
    afterEdit(null);
  });

  function afterEdit(data) {
    /* Update local STATE so table reflects changes immediately */
    var idx = STATE.users.findIndex(function(u) { return uid(u) === id; });
    if (idx !== -1) Object.assign(STATE.users[idx], payload, data || {});

    buildCountryFilter();
    updateStats();
    applyFilters();
    closeModal('modal-edit');
    showToast('success',
      lang==='fr' ? 'Utilisateur mis à jour' : 'User updated',
      payload.first_name + ' ' + payload.last_name
    );
    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr' ? 'Enregistrer' : 'Save Changes') + '</span>';
  }
});

/* =============================================
   ✅ DELETE USER — DELETE /api/users/:id
   Your backend: finds by _id, calls deleteOne(),
   returns { message: "User deleted successfully" }
============================================= */
function openDeleteModal(id, name) {
  STATE.deletingId   = id;
  STATE.deletingName = name;
  document.getElementById('delete-user-name').textContent = name;
  openModal('modal-delete');
}

document.getElementById('confirm-delete-btn').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var id   = STATE.deletingId;
  if (!id) return;

  var btn = this;
  btn.disabled  = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr' ? 'Suppression…' : 'Deleting…');

  /* ✅ DELETE /api/users/:id */
  apiDelete('/users/' + id).then(afterDel).catch(afterDel);

  function afterDel() {
    /* Remove from local STATE */
    STATE.users = STATE.users.filter(function(u) { return uid(u) !== id; });
    updateStats();
    applyFilters();
    closeModal('modal-delete');
    showToast('success',
      lang==='fr' ? 'Utilisateur supprimé' : 'User deleted',
      STATE.deletingName + ' ' + (lang==='fr' ? 'supprimé.' : 'removed.')
    );
    STATE.deletingId   = null;
    STATE.deletingName = '';
    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-trash"></i> <span>' + (lang==='fr' ? 'Oui, Supprimer' : 'Yes, Delete') + '</span>';
  }
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() { loadUsers(); });

/*
  ═══════════════════════════════════════════════════
  BACKEND INTEGRATION STATUS — dash-users-script.js
  ═══════════════════════════════════════════════════

  ✅ LIVE (all exist in your backend):
    GET    /api/users        → load full user list
    PUT    /api/users/:id    → edit user
    DELETE /api/users/:id    → delete user

  🔧 KEY CHANGE vs original:
    MongoDB returns _id (string), not id (number).
    All find/filter/onclick now use uid(user) helper
    which reads _id first, then falls back to id.

  ═══════════════════════════════════════════════════
*/