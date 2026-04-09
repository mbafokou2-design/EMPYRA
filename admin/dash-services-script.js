/* =============================================
   EMI DASHBOARD — dash-services-script.js
   Services management: list, add, edit,
   delete, view. Fully API-ready.
============================================= */

/* =============================================
   ── SECTION 1: LANGUAGE (copy to all pages) ──
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
(function() { setLang(localStorage.getItem('emi_lang') || 'en'); })();


/* =============================================
   ── SECTION 2: SIDEBAR (copy to all pages) ──
============================================= */
var sidebar        = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebar-overlay');
var hamburger      = document.getElementById('hamburger');
var sidebarClose   = document.getElementById('sidebar-close');

function openSidebar()  { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; }

hamburger.addEventListener('click', function() { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeSidebar(); closeAllModals(); } });


/* =============================================
   ── SECTION 3: PROFILE DROPDOWN (copy to all) ──
============================================= */
var profileTrigger = document.getElementById('profile-trigger');
var topbarProfile  = document.getElementById('topbar-profile');
if (profileTrigger) {
  profileTrigger.addEventListener('click', function(e) { e.stopPropagation(); topbarProfile.classList.toggle('open'); });
}
document.addEventListener('click', function(e) {
  if (topbarProfile && !topbarProfile.contains(e.target)) topbarProfile.classList.remove('open');
});

// Load profile from localStorage (set at login)
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


/* =============================================
   ── SECTION 4: LOGOUT (copy to all pages) ──
============================================= */
var logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    /*
    ── BACKEND LOGOUT ──
    fetch(API_BASE + '/logout', { method: 'POST', headers: getHeaders() })
      .finally(function() { clearAndRedirect(); });
    */
    localStorage.removeItem('emi_token');
    localStorage.removeItem('emi_admin_user');
    window.location.href = 'login.html';
  });
}


/* =============================================
   ── SECTION 5: API CONFIGURATION ──
   Set your API base URL here once.
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


/* =============================================
   ── SECTION 6: TOAST NOTIFICATIONS ──
   Usage: showToast('success', 'Title', 'Detail message');
   Types: 'success', 'error', 'warning'
============================================= */
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


/* =============================================
   ── SECTION 7: MODAL HELPERS ──
============================================= */
function openModal(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
function closeAllModals() {
  ['modal-form', 'modal-view', 'modal-delete'].forEach(closeModal);
}

// Close buttons
document.getElementById('close-modal-form').addEventListener('click',   function() { closeModal('modal-form'); });
document.getElementById('close-modal-view').addEventListener('click',   function() { closeModal('modal-view'); });
document.getElementById('close-modal-delete').addEventListener('click', function() { closeModal('modal-delete'); });
document.getElementById('cancel-form').addEventListener('click',        function() { closeModal('modal-form'); });

// Close on backdrop click
['modal-form', 'modal-view', 'modal-delete'].forEach(function(id) {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) closeModal(id);
  });
});


/* =============================================
   ── SECTION 8: CATEGORY CONFIG ──
   Maps category keys to display labels,
   colour classes, and Phosphor icons.
============================================= */
var CATEGORIES = {
  environment: {
    label_en: 'Environment & Sustainability',
    label_fr: 'Environnement & Durabilité',
    cls:      'sic-env',
    icon:     'ph-leaf'
  },
  audit: {
    label_en: 'Audits & Risk Management',
    label_fr: 'Audits & Gestion des Risques',
    cls:      'sic-audit',
    icon:     'ph-magnifying-glass-plus'
  },
  exploration: {
    label_en: 'Exploration & Resources',
    label_fr: 'Exploration & Ressources',
    cls:      'sic-explor',
    icon:     'ph-compass'
  },
  engineering: {
    label_en: 'Engineering & Operations',
    label_fr: 'Ingénierie & Opérations',
    cls:      'sic-eng',
    icon:     'ph-gear-six'
  }
};

function getCatLabel(key) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var cat  = CATEGORIES[key];
  if (!cat) return key;
  return lang === 'fr' ? cat.label_fr : cat.label_en;
}


/* =============================================
   ── SECTION 9: STATE ──
   Holds all services and current filters.
============================================= */
var STATE = {
  services:        [],  // all services from API
  filtered:        [],  // after search/filter
  currentPage:     1,
  perPage:         9,
  editingId:       null,
  deletingId:      null,
  deletingName:    ''
};


/* =============================================
   ── SECTION 10: LOAD SERVICES FROM API ──

   EXPECTED API RESPONSE:
   GET /services
   [
     {
       id:          1,
       title_en:    "Mine Water Management",
       title_fr:    "Gestion des Eaux de Mine",
       category:    "environment",    // one of the CATEGORIES keys
       status:      "published",      // "published" | "draft"
       icon:        "ph-waves",       // Phosphor icon class
       desc_en:     "We provide...",
       desc_fr:     "Nous fournissons...",
       slug:        "service-water.html",
       image_url:   "https://your-cdn.com/water.jpg",
       created_at:  "2025-01-10T10:00:00Z",
       updated_at:  "2025-03-15T14:30:00Z"
     }
   ]
============================================= */
function loadServices() {
  var grid = document.getElementById('services-grid');
  grid.innerHTML = '<div class="services-loading"><i class="ph ph-spinner" style="font-size:1.5rem;"></i> <span data-en="Loading services…" data-fr="Chargement…">Loading services…</span></div>';

  apiGet('/services').then(function(data) {
    STATE.services = data || [];
    applyFilters();
  }).catch(function() {
    // ── DEMO DATA (remove when backend connected) ──
    STATE.services = [
      { id:1, title_en:'Mine Water Management',          title_fr:'Gestion des Eaux de Mine',          category:'environment', status:'published', icon:'ph-waves',                desc_en:'We provide comprehensive solutions for managing surface and groundwater on mine sites.', desc_fr:'Nous fournissons des solutions complètes pour gérer les eaux superficielles et souterraines.', slug:'service-water.html' },
      { id:2, title_en:'Environmental Geochemistry & ARD', title_fr:'Géochimie Environnementale & ARD', category:'environment', status:'published', icon:'ph-atom',                desc_en:'Our geochemistry experts assess geochemical properties of mining waste and predict ARD potential.', desc_fr:'Nos experts en géochimie évaluent les propriétés des déchets miniers.', slug:'service-geochemistry.html' },
      { id:3, title_en:'Environment & Social Responsibility', title_fr:'Environnement & Responsabilité Sociale', category:'environment', status:'published', icon:'ph-plant',        desc_en:'We help mining companies meet environmental and social obligations.', desc_fr:'Nous aidons les entreprises minières à satisfaire leurs obligations.', slug:'service-environment.html' },
      { id:4, title_en:'Independent Expertise & Audits',  title_fr:'Expertise Indépendante & Audits',  category:'audit',       status:'published', icon:'ph-magnifying-glass-plus', desc_en:'As an independent third party, we provide unbiased technical assessments.', desc_fr:'En tant que tiers indépendant, nous fournissons des évaluations impartiales.', slug:'service-audit.html' },
      { id:5, title_en:'Risk Management',                  title_fr:'Gestion des Risques',              category:'audit',       status:'published', icon:'ph-shield-warning',       desc_en:'Mining projects face multiple risks — geological, technical, environmental.', desc_fr:'Les projets miniers sont exposés à de multiples risques.', slug:'service-risk.html' },
      { id:6, title_en:'Mineral Resource Modeling',        title_fr:'Modélisation des Ressources',       category:'exploration', status:'published', icon:'ph-cube',                 desc_en:'Accurate mineral resource estimation forms the foundation of any mining project.', desc_fr:'L\'estimation précise des ressources constitue la base de tout projet minier.', slug:'service-modeling.html' },
      { id:7, title_en:'Exploration Services',             title_fr:'Services d\'Exploration',          category:'exploration', status:'published', icon:'ph-compass',              desc_en:'Our expertise covers the entire discovery process from prospecting to drilling.', desc_fr:'Notre expertise couvre l\'ensemble du processus de découverte.', slug:'service-exploration.html' },
      { id:8, title_en:'Feasibility Studies',              title_fr:'Études de Faisabilité',            category:'exploration', status:'draft',     icon:'ph-chart-bar',            desc_en:'Feasibility studies are essential tools to determine if a project should proceed.', desc_fr:'Les études de faisabilité sont des outils essentiels pour tout projet minier.', slug:'service-feasibility.html' },
      { id:9, title_en:'Mining Operations Support',        title_fr:'Support aux Opérations Minières',  category:'engineering', status:'published', icon:'ph-gear-six',             desc_en:'We provide technical assistance in mining planning and production scheduling.', desc_fr:'Nous fournissons une assistance technique en planification minière.', slug:'service-operations.html' },
      { id:10, title_en:'Open-Pit Mining',                 title_fr:'Mines à Ciel Ouvert',              category:'engineering', status:'published', icon:'ph-mountains',            desc_en:'Expert support for open-pit mining design, planning and operations.', desc_fr:'Support expert pour la conception, planification et opérations des mines à ciel ouvert.', slug:'service-openpit.html' },
      { id:11, title_en:'Mine Closure',                    title_fr:'Fermeture de Mines',               category:'engineering', status:'draft',     icon:'ph-x-circle',             desc_en:'Comprehensive mine closure planning and environmental rehabilitation.', desc_fr:'Planification complète de la fermeture de mines et réhabilitation environnementale.', slug:'service-closure.html' }
    ];
    applyFilters();
  });
}


/* =============================================
   ── SECTION 11: FILTER + SEARCH ──
============================================= */
function applyFilters() {
  var lang     = localStorage.getItem('emi_lang') || 'en';
  var query    = document.getElementById('search-services').value.toLowerCase().trim();
  var category = document.getElementById('filter-category').value;
  var status   = document.getElementById('filter-status').value;

  STATE.filtered = STATE.services.filter(function(s) {
    var title = (lang === 'fr' ? s.title_fr : s.title_en) || '';
    var desc  = (lang === 'fr' ? s.desc_fr  : s.desc_en)  || '';
    var matchQuery    = !query    || title.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    var matchCategory = !category || s.category === category;
    var matchStatus   = !status   || s.status   === status;
    return matchQuery && matchCategory && matchStatus;
  });

  STATE.currentPage = 1;

  // Update count
  document.getElementById('count-number').textContent = STATE.filtered.length;

  renderGrid();
  renderPagination();
}

// Live search and filter events
document.getElementById('search-services').addEventListener('input',   applyFilters);
document.getElementById('filter-category').addEventListener('change',  applyFilters);
document.getElementById('filter-status').addEventListener('change',    applyFilters);


/* =============================================
   ── SECTION 12: RENDER SERVICES GRID ──
============================================= */
function renderGrid() {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var grid  = document.getElementById('services-grid');
  var start = (STATE.currentPage - 1) * STATE.perPage;
  var page  = STATE.filtered.slice(start, start + STATE.perPage);

  if (page.length === 0) {
    grid.innerHTML =
      '<div class="services-empty">' +
        '<i class="ph ph-magnifying-glass" style="font-size:3rem;color:var(--gray-light);"></i>' +
        '<h3>' + (lang === 'fr' ? 'Aucun service trouvé' : 'No services found') + '</h3>' +
        '<p>' + (lang === 'fr' ? 'Essayez de modifier vos filtres.' : 'Try adjusting your filters.') + '</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = page.map(function(s) {
    var cat       = CATEGORIES[s.category] || {};
    var catCls    = cat.cls  || '';
    var catLabel  = lang === 'fr' ? (cat.label_fr || s.category) : (cat.label_en || s.category);
    var title     = lang === 'fr' ? s.title_fr : s.title_en;
    var desc      = lang === 'fr' ? s.desc_fr  : s.desc_en;
    var icon      = s.icon || (cat.icon || 'ph-hard-hat');
    var statusBadge = s.status === 'published'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.45rem;"></i>' + (lang === 'fr' ? 'Publié' : 'Published') + '</span>'
      : '<span class="badge badge-yellow">' + (lang === 'fr' ? 'Brouillon' : 'Draft') + '</span>';

    return '<div class="service-item-card ' + catCls + '" data-id="' + s.id + '">' +
      '<div class="sic-head">' +
        '<div class="sic-icon"><i class="ph ' + icon + '"></i></div>' +
        '<div class="sic-meta">' +
          '<div class="sic-category">' + catLabel + '</div>' +
          '<div class="sic-title" title="' + title + '">' + title + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sic-body">' +
        '<p class="sic-description">' + (desc || '—') + '</p>' +
      '</div>' +
      '<div class="sic-footer">' +
        statusBadge +
        '<div class="sic-actions">' +
          '<button class="sic-action-btn view"   title="' + (lang === 'fr' ? 'Voir' : 'View') + '"   onclick="openViewModal(' + s.id + ')"><i class="ph ph-eye"></i></button>' +
          '<button class="sic-action-btn edit"   title="' + (lang === 'fr' ? 'Modifier' : 'Edit') + '" onclick="openEditModal(' + s.id + ')"><i class="ph ph-pencil-simple"></i></button>' +
          '<button class="sic-action-btn delete" title="' + (lang === 'fr' ? 'Supprimer' : 'Delete') + '" onclick="openDeleteModal(' + s.id + ', \'' + title.replace(/'/g, "\\'") + '\')"><i class="ph ph-trash"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}


/* =============================================
   ── SECTION 13: PAGINATION ──
============================================= */
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
  renderGrid();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* =============================================
   ── SECTION 14: ADD SERVICE MODAL ──
============================================= */
document.getElementById('btn-add-service').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  STATE.editingId = null;
  resetForm();

  // Update modal header for "Add" mode
  document.getElementById('modal-form-icon').className = 'modal-header-icon add';
  document.getElementById('modal-form-icon').innerHTML = '<i class="ph ph-plus-circle"></i>';
  document.getElementById('modal-form-title').textContent  = lang === 'fr' ? 'Ajouter un Service'    : 'Add New Service';
  document.getElementById('modal-form-subtitle').textContent = lang === 'fr' ? 'Remplissez les détails' : 'Fill in the details below';
  document.getElementById('submit-btn-label').textContent  = lang === 'fr' ? 'Enregistrer'           : 'Save Service';

  openModal('modal-form');
});


/* =============================================
   ── SECTION 15: EDIT SERVICE MODAL ──
============================================= */
function openEditModal(id) {
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var service = STATE.services.find(function(s) { return s.id === id; });
  if (!service) return;

  STATE.editingId = id;
  resetForm();

  // Populate form fields
  document.getElementById('service-id').value    = service.id;
  document.getElementById('svc-title-en').value  = service.title_en  || '';
  document.getElementById('svc-title-fr').value  = service.title_fr  || '';
  document.getElementById('svc-category').value  = service.category  || '';
  document.getElementById('svc-status').value    = service.status    || 'published';
  document.getElementById('svc-icon').value      = service.icon      || '';
  document.getElementById('svc-desc-en').value   = service.desc_en   || '';
  document.getElementById('svc-desc-fr').value   = service.desc_fr   || '';
  document.getElementById('svc-slug').value      = service.slug      || '';
  previewIcon(service.icon || '');

  // Update modal header for "Edit" mode
  document.getElementById('modal-form-icon').className = 'modal-header-icon edit';
  document.getElementById('modal-form-icon').innerHTML = '<i class="ph ph-pencil-simple"></i>';
  document.getElementById('modal-form-title').textContent    = lang === 'fr' ? 'Modifier le Service'  : 'Edit Service';
  document.getElementById('modal-form-subtitle').textContent = lang === 'fr' ? (service.title_fr || '') : (service.title_en || '');
  document.getElementById('submit-btn-label').textContent    = lang === 'fr' ? 'Mettre à Jour'         : 'Update Service';

  openModal('modal-form');
}


/* =============================================
   ── SECTION 16: VIEW SERVICE MODAL ──
============================================= */
function openViewModal(id) {
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var service = STATE.services.find(function(s) { return s.id === id; });
  if (!service) return;

  var cat      = CATEGORIES[service.category] || {};
  var catLabel = lang === 'fr' ? (cat.label_fr || service.category) : (cat.label_en || service.category);
  var title    = lang === 'fr' ? service.title_fr : service.title_en;
  var desc     = lang === 'fr' ? service.desc_fr  : service.desc_en;

  document.getElementById('view-modal-title').textContent = title;
  document.getElementById('view-modal-cat').textContent   = catLabel;

  // "Edit this service" button
  document.getElementById('view-to-edit').onclick = function() {
    closeModal('modal-view');
    openEditModal(id);
  };

  var body = document.getElementById('view-modal-body');
  body.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">' +
      '<div><div class="form-label" style="margin-bottom:4px;">' + (lang === 'fr' ? 'Catégorie' : 'Category') + '</div><span class="badge badge-blue">' + catLabel + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Status</div><span class="badge ' + (service.status === 'published' ? 'badge-green' : 'badge-yellow') + '">' + (service.status === 'published' ? (lang === 'fr' ? 'Publié' : 'Published') : (lang === 'fr' ? 'Brouillon' : 'Draft')) + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Icon</div><div style="display:flex;align-items:center;gap:8px;"><i class="ph ' + (service.icon || 'ph-star') + '" style="font-size:1.4rem;color:var(--blue-light);"></i><code style="font-size:0.8rem;color:var(--gray);">' + (service.icon || '—') + '</code></div></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Slug</div><code style="font-size:0.8rem;color:var(--blue-light);">' + (service.slug || '—') + '</code></div>' +
    '</div>' +
    (service.image_url ? '<img src="' + service.image_url + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;"/>' : '') +
    '<div style="margin-bottom:14px;"><div class="form-label" style="margin-bottom:6px;">Description (EN)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.7;">' + (service.desc_en || '—') + '</p></div>' +
    '<div><div class="form-label" style="margin-bottom:6px;">Description (FR)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.7;">' + (service.desc_fr || '—') + '</p></div>';

  openModal('modal-view');
}


/* =============================================
   ── SECTION 17: DELETE SERVICE ──
============================================= */
function openDeleteModal(id, name) {
  STATE.deletingId   = id;
  STATE.deletingName = name;
  document.getElementById('delete-service-name').textContent = name;
  openModal('modal-delete');
}

document.getElementById('confirm-delete-btn').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var id   = STATE.deletingId;
  if (!id) return;

  this.disabled = true;
  this.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang === 'fr' ? 'Suppression…' : 'Deleting…');

  /*
  ── BACKEND DELETE ──────────────────────────────
  EXPECTED API:
    DELETE /services/{id}
    Response: { success: true, message: "Service deleted" }
  ───────────────────────────────────────────────
  */
  apiDelete('/services/' + id).then(function(data) {
    // Remove from local state
    STATE.services = STATE.services.filter(function(s) { return s.id !== id; });
    applyFilters();
    closeModal('modal-delete');
    showToast('success',
      lang === 'fr' ? 'Service supprimé' : 'Service deleted',
      '"' + STATE.deletingName + '" ' + (lang === 'fr' ? 'a été supprimé.' : 'has been removed.')
    );
    STATE.deletingId   = null;
    STATE.deletingName = '';
  }).catch(function() {
    // Demo: remove from local state without real API
    STATE.services = STATE.services.filter(function(s) { return s.id !== id; });
    applyFilters();
    closeModal('modal-delete');
    showToast('success',
      lang === 'fr' ? 'Service supprimé' : 'Service deleted',
      '"' + STATE.deletingName + '" ' + (lang === 'fr' ? 'a été supprimé (démo).' : 'removed (demo mode).')
    );
    STATE.deletingId = null;
  }).finally(function() {
    var btn = document.getElementById('confirm-delete-btn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-trash"></i> <span>' + (lang === 'fr' ? 'Oui, Supprimer' : 'Yes, Delete') + '</span>';
    }
  });
});


/* =============================================
   ── SECTION 18: FORM SUBMIT (Add / Edit) ──
============================================= */
document.getElementById('submit-form').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';

  // Collect form values
  var payload = {
    title_en:  document.getElementById('svc-title-en').value.trim(),
    title_fr:  document.getElementById('svc-title-fr').value.trim(),
    category:  document.getElementById('svc-category').value,
    status:    document.getElementById('svc-status').value,
    icon:      document.getElementById('svc-icon').value.trim(),
    desc_en:   document.getElementById('svc-desc-en').value.trim(),
    desc_fr:   document.getElementById('svc-desc-fr').value.trim(),
    slug:      document.getElementById('svc-slug').value.trim()
  };

  // Validate required fields
  if (!payload.title_en || !payload.title_fr || !payload.category || !payload.desc_en || !payload.desc_fr) {
    showToast('error',
      lang === 'fr' ? 'Champs manquants' : 'Missing fields',
      lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.'
    );
    return;
  }

  var btn = document.getElementById('submit-form');
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang === 'fr' ? 'Enregistrement…' : 'Saving…');

  var isEdit   = STATE.editingId !== null;
  var endpoint = isEdit ? '/services/' + STATE.editingId : '/services';
  var method   = isEdit ? apiPut : apiPost;

  /*
  ── BACKEND SAVE ──────────────────────────────
  ADD:  POST /services           → returns { id, ...service }
  EDIT: PUT  /services/{id}      → returns { ...updated service }

  For image upload use FormData instead of JSON:
    var fd = new FormData();
    fd.append('title_en', payload.title_en);
    ...
    fd.append('image', document.getElementById('svc-image').files[0]);
    fetch(API_BASE + endpoint, { method: 'POST'/'PUT', headers: { Authorization: ... }, body: fd });
  ───────────────────────────────────────────────
  */
  method(endpoint, payload).then(function(data) {
    if (isEdit) {
      // Update in local state
      var idx = STATE.services.findIndex(function(s) { return s.id === STATE.editingId; });
      if (idx !== -1) STATE.services[idx] = Object.assign(STATE.services[idx], payload, data || {});
    } else {
      // Add to local state
      var newService = Object.assign({ id: Date.now() }, payload, data || {});
      STATE.services.unshift(newService);
    }
    applyFilters();
    closeModal('modal-form');
    showToast('success',
      isEdit ? (lang === 'fr' ? 'Service mis à jour' : 'Service updated') : (lang === 'fr' ? 'Service ajouté' : 'Service added'),
      '"' + payload.title_en + '" ' + (lang === 'fr' ? 'enregistré avec succès.' : 'saved successfully.')
    );
  }).catch(function() {
    // Demo mode: update/add locally
    if (isEdit) {
      var idx = STATE.services.findIndex(function(s) { return s.id === STATE.editingId; });
      if (idx !== -1) Object.assign(STATE.services[idx], payload);
    } else {
      STATE.services.unshift(Object.assign({ id: Date.now() }, payload));
    }
    applyFilters();
    closeModal('modal-form');
    showToast('success',
      lang === 'fr' ? 'Enregistré (démo)' : 'Saved (demo mode)',
      lang === 'fr' ? 'Mode démo actif — connectez votre API.' : 'Demo mode — connect your API to persist.'
    );
  }).finally(function() {
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang === 'fr' ? 'Enregistrer' : 'Save Service') + '</span>';
  });
});


/* =============================================
   ── SECTION 19: ICON PREVIEW ──
============================================= */
function previewIcon(val) {
  var preview = document.getElementById('icon-preview');
  if (!preview) return;
  var cls = val.trim();
  if (!cls) { preview.innerHTML = '<i class="ph ph-star"></i>'; return; }
  // Ensure it has "ph-" prefix
  if (!cls.startsWith('ph-')) cls = 'ph-' + cls;
  preview.innerHTML = '<i class="ph ' + cls + '"></i>';
}


/* =============================================
   ── SECTION 20: IMAGE PREVIEW ──
============================================= */
function previewImage(event) {
  var file = event.target.files[0];
  var preview = document.getElementById('img-preview-el');
  if (file && preview) {
    var reader = new FileReader();
    reader.onload = function(e) {
      preview.src   = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}


/* =============================================
   ── SECTION 21: RESET FORM ──
============================================= */
function resetForm() {
  document.getElementById('service-form').reset();
  document.getElementById('service-id').value = '';
  document.getElementById('icon-preview').innerHTML = '<i class="ph ph-star"></i>';
  var preview = document.getElementById('img-preview-el');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
}


/* =============================================
   ── INIT ──
============================================= */
document.addEventListener('DOMContentLoaded', function() {
  loadServices();
});

/*
  =============================================
  BACKEND API SUMMARY FOR THIS PAGE
  =============================================

  GET    /services           → Load all services (array)
  POST   /services           → Create new service
  PUT    /services/{id}      → Update existing service
  DELETE /services/{id}      → Delete service

  REQUEST BODY (POST / PUT):
  {
    "title_en":  "Mine Water Management",
    "title_fr":  "Gestion des Eaux de Mine",
    "category":  "environment",
    "status":    "published",
    "icon":      "ph-waves",
    "desc_en":   "Description in English…",
    "desc_fr":   "Description en français…",
    "slug":      "service-water.html"
  }

  FOR IMAGE UPLOAD: use FormData (not JSON)
  and append the file as "image" field.

  All requests use: Authorization: Bearer {token}
  =============================================
*/
