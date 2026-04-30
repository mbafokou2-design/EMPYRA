/* =============================================
   EMI DASHBOARD — dash-intelligence-script.js
   Mining Intelligence: list, add, edit,
   delete, view. Fully API-ready.
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
    var user = JSON.parse(stored);
    var nameEl     = document.getElementById('profile-name-display');
    var initialsEl = document.getElementById('profile-initials');
    var dropName   = document.getElementById('dropdown-name');
    if (nameEl && user.name)     nameEl.textContent     = user.name;
    if (initialsEl && user.name) initialsEl.textContent = user.initials || user.name.charAt(0).toUpperCase();
    if (dropName && user.name)   dropName.textContent   = user.name;
  } catch(e) {}
})();

/* ── LOGOUT ── */
var logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    /* BACKEND: POST /api/logout with Bearer token, then clear */
    localStorage.removeItem('emi_token');
    localStorage.removeItem('emi_admin_user');
    window.location.href = 'login.html';
  });
}

/* =============================================
   API CONFIGURATION
   STEP 1 — Replace API_BASE with your URL:
     var API_BASE = 'https://your-api.com/api';
   STEP 2 — After login store token:
     localStorage.setItem('emi_token', token);
============================================= */
var API_BASE = 'https://your-api.com/api'; // ← REPLACE

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
var apiPost   = function(ep, body) { return apiRequest('POST',   ep, body); };
var apiPut    = function(ep, body) { return apiRequest('PUT',    ep, body); };
var apiDelete = function(ep)       { return apiRequest('DELETE', ep); };

/* ── TOAST ── */
function showToast(type, title, detail) {
  var container = document.getElementById('toast-container');
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

/* ── MODALS ── */
function openModal(id)  { var el = document.getElementById(id); if (el) { el.classList.add('open');    document.body.style.overflow = 'hidden'; } }
function closeModal(id) { var el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } }
function closeAllModals() { ['modal-form','modal-view','modal-delete'].forEach(closeModal); }

document.getElementById('close-modal-form').addEventListener('click',   function() { closeModal('modal-form'); });
document.getElementById('close-modal-view').addEventListener('click',   function() { closeModal('modal-view'); });
document.getElementById('close-modal-delete').addEventListener('click', function() { closeModal('modal-delete'); });
document.getElementById('cancel-form').addEventListener('click',        function() { closeModal('modal-form'); });
['modal-form','modal-view','modal-delete'].forEach(function(id) {
  document.getElementById(id).addEventListener('click', function(e) { if (e.target === this) closeModal(id); });
});

/* =============================================
   CATEGORY CONFIG
============================================= */
var CATS = {
  operations:  { en: 'Operations Support',    fr: 'Soutien aux Opérations', icon: 'ph-chart-line',      col: 0 },
  risk:        { en: 'Risk Assessment',        fr: 'Évaluation des Risques', icon: 'ph-shield-warning',  col: 1 },
  water:       { en: 'Mine Water Management',  fr: 'Gestion des Eaux',       icon: 'ph-waves',           col: 2 },
  environment: { en: 'Environment',            fr: 'Environnement',          icon: 'ph-leaf',            col: 3 },
  closure:     { en: 'Mine Closure',           fr: 'Fermeture de Mine',      icon: 'ph-x-circle',        col: 4 },
  training:    { en: 'EMI In-Situ Training',   fr: 'Formation EMI In Situ',  icon: 'ph-graduation-cap',  col: 5 }
};
function getCatLabel(key) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  return CATS[key] ? (lang === 'fr' ? CATS[key].fr : CATS[key].en) : key;
}

/* =============================================
   STATE
============================================= */
var STATE = {
  items:       [],
  filtered:    [],
  currentPage: 1,
  perPage:     6,
  editingId:   null,
  deletingId:  null,
  deletingName: ''
};

/* =============================================
   LOAD FROM API

   GET /intelligence
   Expected array:
   [
     {
       id:         1,
       title_en:   "Mining Risk Evaluation",
       title_fr:   "Évaluation des Risques Miniers",
       category:   "risk",         // key from CATS
       status:     "published",    // "published" | "draft"
       icon:       "ph-shield-warning",
       text_en:    "Lorem ipsum…",
       text_fr:    "Lorem ipsum…",
       image_url:  "https://cdn.com/image.jpg",  // optional
       created_at: "2025-01-10T10:00:00Z"
     }
   ]
============================================= */
function loadItems() {
  var grid = document.getElementById('intel-grid');
  grid.innerHTML = '<div class="intel-loading"><i class="ph ph-spinner" style="font-size:1.5rem;"></i><span data-en=" Loading…" data-fr=" Chargement…"> Loading…</span></div>';

  apiGet('/intelligence').then(function(data) {
    STATE.items = data || [];
    applyFilters();
  }).catch(function() {
    /* Demo data — remove when backend is connected */
    STATE.items = [
      { id:1, title_en:'Mining Risk Evaluation',           title_fr:'Évaluation des Risques Miniers',    category:'risk',        status:'published', icon:'ph-shield-warning',  text_en:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', text_fr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.', created_at:'2025-01-10' },
      { id:2, title_en:'Operational Site Assistance',      title_fr:'Assistance Opérationnelle de Sites', category:'operations',  status:'published', icon:'ph-chart-line',      text_en:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco.', text_fr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam.', created_at:'2025-02-05' },
      { id:3, title_en:'Mine Water Management',            title_fr:'Gestion des Eaux de Mine',           category:'water',       status:'published', icon:'ph-waves',           text_en:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate.', text_fr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor.', created_at:'2025-02-18' },
      { id:4, title_en:'Environmental Responsibility',     title_fr:'Responsabilité Environnementale',    category:'environment', status:'published', icon:'ph-leaf',            text_en:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident.', text_fr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat.', created_at:'2025-03-01' },
      { id:5, title_en:'Mine Closure Planning',            title_fr:'Planification de Fermeture de Mine', category:'closure',     status:'draft',     icon:'ph-x-circle',        text_en:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sunt in culpa qui officia deserunt mollit anim id est laborum.', text_fr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sunt in culpa qui officia.', created_at:'2025-03-14' },
      { id:6, title_en:'EMI In-Situ Training Programme',   title_fr:'Programme de Formation EMI In Situ', category:'training',    status:'published', icon:'ph-graduation-cap',  text_en:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut.', text_fr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem.', created_at:'2025-03-22' }
    ];
    applyFilters();
  });
}

/* =============================================
   FILTER + SEARCH
============================================= */
function applyFilters() {
  var lang     = localStorage.getItem('emi_lang') || 'en';
  var query    = document.getElementById('search-intel').value.toLowerCase().trim();
  var category = document.getElementById('filter-category').value;
  var status   = document.getElementById('filter-status').value;

  STATE.filtered = STATE.items.filter(function(item) {
    var title = (lang === 'fr' ? item.title_fr : item.title_en) || '';
    var text  = (lang === 'fr' ? item.text_fr  : item.text_en)  || '';
    var matchQ = !query    || title.toLowerCase().includes(query) || text.toLowerCase().includes(query);
    var matchC = !category || item.category === category;
    var matchS = !status   || item.status   === status;
    return matchQ && matchC && matchS;
  });

  STATE.currentPage = 1;
  document.getElementById('count-number').textContent = STATE.filtered.length;
  renderGrid();
  renderPagination();
}

document.getElementById('search-intel').addEventListener('input',   applyFilters);
document.getElementById('filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change',   applyFilters);

/* =============================================
   RENDER GRID
============================================= */
function renderGrid() {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var grid  = document.getElementById('intel-grid');
  var start = (STATE.currentPage - 1) * STATE.perPage;
  var page  = STATE.filtered.slice(start, start + STATE.perPage);

  if (page.length === 0) {
    grid.innerHTML =
      '<div class="intel-empty">' +
        '<i class="ph ph-magnifying-glass" style="font-size:3rem;color:var(--gray-light);"></i>' +
        '<h3>' + (lang === 'fr' ? 'Aucune entrée trouvée' : 'No entries found') + '</h3>' +
        '<p>' + (lang === 'fr' ? 'Modifiez vos filtres.' : 'Try adjusting your filters.') + '</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = page.map(function(item, idx) {
    var cat      = CATS[item.category] || {};
    var catLabel = lang === 'fr' ? (cat.fr || item.category) : (cat.en || item.category);
    var title    = lang === 'fr' ? item.title_fr : item.title_en;
    var text     = lang === 'fr' ? item.text_fr  : item.text_en;
    var icon     = item.icon || (cat.icon || 'ph-brain');
    var colCls   = 'ic-col-' + ((cat.col !== undefined ? cat.col : idx) % 6);

    var photoHtml = item.image_url
      ? '<img src="' + item.image_url + '" alt="' + title + '"/>'
      : '<div class="ic-photo-placeholder"><i class="ph ph-image"></i></div>';

    var statusBadge = item.status === 'published'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.45rem;"></i>' + (lang === 'fr' ? 'Publié' : 'Published') + '</span>'
      : '<span class="badge badge-yellow">' + (lang === 'fr' ? 'Brouillon' : 'Draft') + '</span>';

    var dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year:'numeric', month:'short', day:'numeric' }) : '—';

    return '<div class="intel-card" data-id="' + item.id + '">' +
      '<div class="ic-photo">' +
        photoHtml +
        '<span class="ic-cat-tag">' + catLabel + '</span>' +
        '<div class="ic-icon-wrap"><div class="ic-icon ' + colCls + '"><i class="ph ' + icon + '"></i></div></div>' +
      '</div>' +
      '<div class="ic-body">' +
        '<div class="ic-title">' + title + '</div>' +
        '<div class="ic-text">' + (text || '—') + '</div>' +
      '</div>' +
      '<div class="ic-footer">' +
        '<span class="ic-date"><i class="ph ph-calendar-blank"></i>' + dateStr + '</span>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          statusBadge +
          '<div class="ic-actions">' +
            '<button class="ic-action-btn view"   onclick="openViewModal('   + item.id + ')" title="' + (lang==='fr'?'Voir':'View') + '"><i class="ph ph-eye"></i></button>' +
            '<button class="ic-action-btn edit"   onclick="openEditModal('   + item.id + ')" title="' + (lang==='fr'?'Modifier':'Edit') + '"><i class="ph ph-pencil-simple"></i></button>' +
            '<button class="ic-action-btn delete" onclick="openDeleteModal(' + item.id + ', \'' + title.replace(/'/g,"\\'") + '\')" title="' + (lang==='fr'?'Supprimer':'Delete') + '"><i class="ph ph-trash"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* =============================================
   PAGINATION
============================================= */
function renderPagination() {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  var pag   = document.getElementById('pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  var html = '<button class="page-btn" onclick="changePage(' + (STATE.currentPage-1) + ')" ' + (STATE.currentPage===1?'disabled':'') + '><i class="fa fa-chevron-left"></i></button>';
  for (var i = 1; i <= total; i++) {
    html += '<button class="page-btn ' + (i===STATE.currentPage?'active':'') + '" onclick="changePage(' + i + ')">' + i + '</button>';
  }
  html += '<button class="page-btn" onclick="changePage(' + (STATE.currentPage+1) + ')" ' + (STATE.currentPage===total?'disabled':'') + '><i class="fa fa-chevron-right"></i></button>';
  pag.innerHTML = html;
}
function changePage(p) {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  if (p < 1 || p > total) return;
  STATE.currentPage = p;
  renderGrid();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =============================================
   ADD MODAL
============================================= */
document.getElementById('btn-add-intel').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  STATE.editingId = null;
  resetForm();
  document.getElementById('modal-form-icon').className   = 'modal-header-icon add';
  document.getElementById('modal-form-icon').innerHTML   = '<i class="ph ph-plus-circle"></i>';
  document.getElementById('modal-form-title').textContent   = lang==='fr' ? 'Ajouter une Entrée'    : 'Add Intelligence Entry';
  document.getElementById('modal-form-subtitle').textContent = lang==='fr' ? 'Remplissez les détails' : 'Fill in the details below';
  document.getElementById('submit-btn-label').textContent   = lang==='fr' ? 'Enregistrer'           : 'Save Entry';
  openModal('modal-form');
});

/* =============================================
   EDIT MODAL
============================================= */
function openEditModal(id) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var item = STATE.items.find(function(i) { return i.id === id; });
  if (!item) return;
  STATE.editingId = id;
  resetForm();

  document.getElementById('intel-id').value        = item.id;
  document.getElementById('intel-title-en').value  = item.title_en  || '';
  document.getElementById('intel-title-fr').value  = item.title_fr  || '';
  document.getElementById('intel-category').value  = item.category  || '';
  document.getElementById('intel-status').value    = item.status    || 'published';
  document.getElementById('intel-icon').value      = item.icon      || '';
  document.getElementById('intel-text-en').value   = item.text_en   || '';
  document.getElementById('intel-text-fr').value   = item.text_fr   || '';
  previewIcon(item.icon || '');

  // Show current image if exists
  if (item.image_url) {
    var wrap = document.getElementById('current-img-wrap');
    var img  = document.getElementById('current-img-preview');
    if (wrap) wrap.style.display = 'block';
    if (img)  img.src = item.image_url;
  }

  document.getElementById('modal-form-icon').className    = 'modal-header-icon edit';
  document.getElementById('modal-form-icon').innerHTML    = '<i class="ph ph-pencil-simple"></i>';
  document.getElementById('modal-form-title').textContent    = lang==='fr' ? 'Modifier l\'Entrée'  : 'Edit Entry';
  document.getElementById('modal-form-subtitle').textContent = lang==='fr' ? (item.title_fr||'') : (item.title_en||'');
  document.getElementById('submit-btn-label').textContent    = lang==='fr' ? 'Mettre à Jour'       : 'Update Entry';
  openModal('modal-form');
}

/* =============================================
   VIEW MODAL
============================================= */
function openViewModal(id) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var item = STATE.items.find(function(i) { return i.id === id; });
  if (!item) return;
  var catLabel = getCatLabel(item.category);
  var title    = lang==='fr' ? item.title_fr : item.title_en;
  var text     = lang==='fr' ? item.text_fr  : item.text_en;

  document.getElementById('view-title').textContent = title;
  document.getElementById('view-cat').textContent   = catLabel;
  document.getElementById('view-to-edit').onclick   = function() { closeModal('modal-view'); openEditModal(id); };

  var body = document.getElementById('view-body');
  var imgHtml = item.image_url
    ? '<img src="' + item.image_url + '" alt="' + title + '" class="view-hero-img"/>'
    : '<div class="view-hero-placeholder"><i class="ph ph-image"></i></div>';

  var dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-US', { year:'numeric', month:'long', day:'numeric' }) : '—';

  body.innerHTML =
    imgHtml +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">' +
      '<div><div class="form-label" style="margin-bottom:4px;">' + (lang==='fr'?'Catégorie':'Category') + '</div><span class="badge badge-blue">' + catLabel + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Status</div><span class="badge ' + (item.status==='published'?'badge-green':'badge-yellow') + '">' + (item.status==='published'?(lang==='fr'?'Publié':'Published'):(lang==='fr'?'Brouillon':'Draft')) + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Icon</div><div style="display:flex;align-items:center;gap:8px;"><i class="ph ' + (item.icon||'ph-brain') + '" style="font-size:1.3rem;color:var(--blue-light);"></i><code style="font-size:0.8rem;color:var(--gray);">' + (item.icon||'—') + '</code></div></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">' + (lang==='fr'?'Date':'Date') + '</div><span style="font-size:0.85rem;color:var(--text-body);">' + dateStr + '</span></div>' +
    '</div>' +
    '<div style="margin-bottom:14px;"><div class="form-label" style="margin-bottom:6px;">Text (EN)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.75;">' + (item.text_en||'—') + '</p></div>' +
    '<div><div class="form-label" style="margin-bottom:6px;">Text (FR)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.75;">' + (item.text_fr||'—') + '</p></div>';

  openModal('modal-view');
}

/* =============================================
   DELETE
============================================= */
function openDeleteModal(id, name) {
  STATE.deletingId   = id;
  STATE.deletingName = name;
  document.getElementById('delete-item-name').textContent = name;
  openModal('modal-delete');
}

document.getElementById('confirm-delete-btn').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var id   = STATE.deletingId;
  if (!id) return;
  var btn  = this;
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr'?'Suppression…':'Deleting…');

  /*
  ── BACKEND DELETE ──────────────────────────────────
  DELETE /intelligence/{id}
  Expected response: { success: true }
  ─────────────────────────────────────────────────────
  */
  apiDelete('/intelligence/' + id).then(function() {
    afterDelete(lang);
  }).catch(function() {
    afterDelete(lang); // Demo: remove locally
  });

  function afterDelete(lang) {
    STATE.items    = STATE.items.filter(function(i) { return i.id !== id; });
    applyFilters();
    closeModal('modal-delete');
    showToast('success',
      lang==='fr' ? 'Entrée supprimée' : 'Entry deleted',
      '"' + STATE.deletingName + '" ' + (lang==='fr' ? 'a été supprimée.' : 'has been removed.')
    );
    STATE.deletingId = null;
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-trash"></i> <span>' + (lang==='fr'?'Oui, Supprimer':'Yes, Delete') + '</span>';
  }
});

/* =============================================
   FORM SUBMIT — Add / Edit

   ADD:  POST /intelligence
   EDIT: PUT  /intelligence/{id}

   REQUEST BODY:
   {
     title_en:  "Mining Risk Evaluation",
     title_fr:  "Évaluation des Risques Miniers",
     category:  "risk",
     status:    "published",
     icon:      "ph-shield-warning",
     text_en:   "Description in English…",
     text_fr:   "Description en français…"
   }

   For image: use FormData, append "image" field.
   Response should include the full saved object
   (including id and image_url if uploaded).
============================================= */
document.getElementById('submit-form').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';

  var payload = {
    title_en:  document.getElementById('intel-title-en').value.trim(),
    title_fr:  document.getElementById('intel-title-fr').value.trim(),
    category:  document.getElementById('intel-category').value,
    status:    document.getElementById('intel-status').value,
    icon:      document.getElementById('intel-icon').value.trim(),
    text_en:   document.getElementById('intel-text-en').value.trim(),
    text_fr:   document.getElementById('intel-text-fr').value.trim()
  };

  if (!payload.title_en || !payload.title_fr || !payload.category || !payload.text_en || !payload.text_fr) {
    showToast('error',
      lang==='fr' ? 'Champs manquants' : 'Missing fields',
      lang==='fr' ? 'Remplissez tous les champs obligatoires.' : 'Please fill all required fields.'
    );
    return;
  }

  var btn    = document.getElementById('submit-form');
  var isEdit = STATE.editingId !== null;
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr'?'Enregistrement…':'Saving…');

  var endpoint = isEdit ? '/intelligence/' + STATE.editingId : '/intelligence';
  var method   = isEdit ? apiPut : apiPost;

  method(endpoint, payload).then(function(data) {
    afterSave(data, isEdit, payload, lang);
  }).catch(function() {
    afterSave(null, isEdit, payload, lang); // Demo mode
  });

  function afterSave(data, isEdit, payload, lang) {
    if (isEdit) {
      var idx = STATE.items.findIndex(function(i) { return i.id === STATE.editingId; });
      if (idx !== -1) Object.assign(STATE.items[idx], payload, data || {});
    } else {
      STATE.items.unshift(Object.assign({ id: Date.now() }, payload, data || {}));
    }
    applyFilters();
    closeModal('modal-form');
    showToast('success',
      isEdit ? (lang==='fr'?'Entrée mise à jour':'Entry updated') : (lang==='fr'?'Entrée ajoutée':'Entry added'),
      '"' + payload.title_en + '" ' + (lang==='fr'?'enregistrée.':'saved successfully.')
    );
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr'?'Enregistrer':'Save Entry') + '</span>';
  }
});

/* =============================================
   ICON PREVIEW
============================================= */
function previewIcon(val) {
  var preview = document.getElementById('icon-preview');
  if (!preview) return;
  var cls = val.trim();
  if (!cls) { preview.innerHTML = '<i class="ph ph-brain"></i>'; return; }
  if (!cls.startsWith('ph-')) cls = 'ph-' + cls;
  preview.innerHTML = '<i class="ph ' + cls + '"></i>';
}

/* =============================================
   IMAGE PREVIEW
============================================= */
function previewImage(event) {
  var file    = event.target.files[0];
  var preview = document.getElementById('img-preview-el');
  if (file && preview) {
    var reader = new FileReader();
    reader.onload = function(e) { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  }
}

/* =============================================
   RESET FORM
============================================= */
function resetForm() {
  document.getElementById('intel-form').reset();
  document.getElementById('intel-id').value = '';
  document.getElementById('icon-preview').innerHTML = '<i class="ph ph-brain"></i>';
  var preview = document.getElementById('img-preview-el');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  var wrap = document.getElementById('current-img-wrap');
  if (wrap) wrap.style.display = 'none';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() { loadItems(); });

/*
  =============================================
  BACKEND API SUMMARY
  =============================================
  GET    /intelligence         → Load all entries
  POST   /intelligence         → Create entry
  PUT    /intelligence/{id}    → Update entry
  DELETE /intelligence/{id}    → Delete entry

  For image upload use FormData (not JSON):
    var fd = new FormData();
    fd.append('title_en', ...);
    fd.append('image', file);
    fetch(API_BASE + '/intelligence', { method:'POST', headers: { Authorization:... }, body: fd });
  =============================================
*/
