/* =============================================
   EMI DASHBOARD — dash-services-script.js
   ✅ = live endpoint (backend built)
   Rich content fields connected to Service model.
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
   ✅ API CONFIG
============================================= */
var API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
  };
}
function parseApiResponse(res) {
  if (res.status === 401) { window.location.href = 'login.html'; return; }
  if (!res.ok) {
    return res.text().then(function(text) {
      var payload = text || res.statusText;
      var err = new Error('Server ' + res.status + ': ' + payload);
      err.status = res.status;
      err.body = text;
      throw err;
    });
  }
  return res.text().then(function(text) {
    try { return text ? JSON.parse(text) : null; }
    catch (e) { return text; }
  });
}
function apiRequest(method, endpoint, body) {
  var opts = { method: method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + endpoint, opts).then(parseApiResponse);
}
var apiGet    = function(ep) { return apiRequest('GET',    ep); };
var apiDelete = function(ep) { return apiRequest('DELETE', ep); };

function apiPostForm(endpoint, formData) {
  return fetch(API_BASE + endpoint, {
    method:  'POST',
    headers: {
      'Accept':        'application/json',
      'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
    },
    body:    formData
  }).then(parseApiResponse);
}
function apiPutForm(endpoint, formData) {
  return fetch(API_BASE + endpoint, {
    method:  'PUT',
    headers: {
      'Accept':        'application/json',
      'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
    },
    body:    formData
  }).then(parseApiResponse);
}

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
var closeModalForm   = document.getElementById('close-modal-form');
var closeModalView   = document.getElementById('close-modal-view');
var closeModalDelete = document.getElementById('close-modal-delete');
var cancelForm       = document.getElementById('cancel-form');

if (closeModalForm) {
  closeModalForm.addEventListener('click', function() {
    closeModal('modal-form');
  });
}

if (closeModalView) {
  closeModalView.addEventListener('click', function() {
    closeModal('modal-view');
  });
}

if (closeModalDelete) {
  closeModalDelete.addEventListener('click', function() {
    closeModal('modal-delete');
  });
}

if (cancelForm) {
  cancelForm.addEventListener('click', function() {
    closeModal('modal-form');
  });
}

['modal-form','modal-view','modal-delete'].forEach(function(id) {
  var modal = document.getElementById(id);

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) closeModal(id);
    });
  }
});

/* ── CATEGORY CONFIG ── */
var CATEGORIES = {
  environment: { label_en: 'Environment & Sustainability', label_fr: 'Environnement & Durabilité',  cls: 'sic-env',    icon: 'ph-leaf'                  },
  audit:       { label_en: 'Audits & Risk Management',    label_fr: 'Audits & Gestion des Risques', cls: 'sic-audit',  icon: 'ph-magnifying-glass-plus' },
  exploration: { label_en: 'Exploration & Resources',     label_fr: 'Exploration & Ressources',     cls: 'sic-explor', icon: 'ph-compass'               },
  engineering: { label_en: 'Engineering & Operations',    label_fr: 'Ingénierie & Opérations',      cls: 'sic-eng',    icon: 'ph-gear-six'              }
};
function getCatLabel(key) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var cat  = CATEGORIES[key];
  return cat ? (lang === 'fr' ? cat.label_fr : cat.label_en) : key;
}

/* ── Slug helpers ── */
function slugify(str) {
  return String(str || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* Auto-fill slug as user types title */
var titleEnEl = document.getElementById('svc-title-en');
var slugEl    = document.getElementById('svc-slug');
var slugPreviewEl = document.getElementById('slug-preview');
if (titleEnEl) {
  titleEnEl.addEventListener('input', function() {
    /* Only auto-fill if slug is still empty (not manually edited) */
    if (slugEl && !slugEl.dataset.manuallySet) {
      var s = slugify(this.value);
      slugEl.value = s;
      if (slugPreviewEl) slugPreviewEl.textContent = s || 'your-slug';
    }
  });
}
if (slugEl) {
  slugEl.addEventListener('input', function() {
    slugEl.dataset.manuallySet = this.value ? 'true' : '';
    if (slugPreviewEl) slugPreviewEl.textContent = this.value || 'your-slug';
  });
}

/* ── Helper — MongoDB uses _id ── */
function uid(s) { return String(s._id || s.id || ''); }

/* ── STATE ── */
var STATE = {
  services: [], filtered: [],
  currentPage: 1, perPage: 9,
  editingId: null, deletingId: null, deletingName: ''
};

/* =============================================
   ✅ LOAD SERVICES — GET /api/services
============================================= */
function loadServices() {
  var grid = document.getElementById('services-grid');
  grid.innerHTML = '<div class="services-loading"><i class="ph ph-spinner" style="font-size:1.5rem;"></i> Loading services…</div>';

  apiGet('/services').then(function(data) {
    if (!data) return;
    STATE.services = data;
    applyFilters();
  }).catch(function(err) {
    var msg = err && err.message ? err.message : 'Could not reach the server.';
    showToast('error', 'Load failed', msg);
    console.error('Service load error:', err);
    STATE.services = [];
    applyFilters();
  });
}

/* ── FILTER + SEARCH ── */
function applyFilters() {
  var lang     = localStorage.getItem('emi_lang') || 'en';
  var query    = document.getElementById('search-services').value.toLowerCase().trim();
  var category = document.getElementById('filter-category').value;
  var status   = document.getElementById('filter-status').value;

  STATE.filtered = STATE.services.filter(function(s) {
    var title = (lang === 'fr' ? s.title_fr : s.title_en) || '';
    var desc  = (lang === 'fr' ? s.desc_fr  : s.desc_en)  || '';
    return (!query    || title.toLowerCase().includes(query) || desc.toLowerCase().includes(query)) &&
           (!category || s.category === category) &&
           (!status   || s.status   === status);
  });

  STATE.currentPage = 1;
  document.getElementById('count-number').textContent = STATE.filtered.length;
  renderGrid();
  renderPagination();
}
document.getElementById('search-services').addEventListener('input',  applyFilters);
document.getElementById('filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change',   applyFilters);

/* ── RENDER GRID ── */
function renderGrid() {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var grid  = document.getElementById('services-grid');
  var start = (STATE.currentPage - 1) * STATE.perPage;
  var page  = STATE.filtered.slice(start, start + STATE.perPage);

  if (page.length === 0) {
    grid.innerHTML =
      '<div class="services-empty">' +
      '<i class="ph ph-magnifying-glass" style="font-size:3rem;color:var(--gray-light);"></i>' +
      '<h3>' + (lang==='fr' ? 'Aucun service trouvé' : 'No services found') + '</h3>' +
      '<p>'  + (lang==='fr' ? 'Essayez de modifier vos filtres.' : 'Try adjusting your filters.') + '</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = page.map(function(s) {
    var id       = uid(s);
    var cat      = CATEGORIES[s.category] || {};
    var catCls   = cat.cls   || '';
    var catLabel = lang==='fr' ? (cat.label_fr||s.category) : (cat.label_en||s.category);
    var title    = lang==='fr' ? s.title_fr : s.title_en;
    var desc     = lang==='fr' ? s.desc_fr  : s.desc_en;
    var icon     = s.icon || (cat.icon || 'ph-hard-hat');

    var statusBadge = s.status === 'published'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.45rem;"></i>' + (lang==='fr'?'Publié':'Published') + '</span>'
      : '<span class="badge badge-yellow">' + (lang==='fr'?'Brouillon':'Draft') + '</span>';

    /* Public page link using slug */
    var publicLink = s.slug
      ? '../services/service-detail.html?slug=' + encodeURIComponent(s.slug)
      : '#';

    return '<div class="service-item-card ' + catCls + '" data-id="' + id + '">' +
      '<div class="sic-head">' +
        '<div class="sic-icon"><i class="ph ' + icon + '"></i></div>' +
        '<div class="sic-meta">' +
          '<div class="sic-category">' + catLabel + '</div>' +
          '<div class="sic-title" title="' + title + '">' + title + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sic-body"><p class="sic-description">' + (desc||'—') + '</p></div>' +
      '<div class="sic-footer">' +
        statusBadge +
        '<div class="sic-actions">' +
          '<a href="' + publicLink + '" target="_blank" class="sic-action-btn view" title="View on site"><i class="ph ph-arrow-square-out"></i></a>' +
          '<button class="sic-action-btn edit"   data-id="' + id + '" onclick="openEditModal(this.dataset.id)"   title="Edit"><i class="ph ph-pencil-simple"></i></button>' +
          '<button class="sic-action-btn delete" data-id="' + id + '" data-name="' + (title||'').replace(/"/g,'&quot;') + '" onclick="openDeleteModal(this.dataset.id, this.dataset.name)" title="Delete"><i class="ph ph-trash"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── PAGINATION ── */
function renderPagination() {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  var pag   = document.getElementById('pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  var html = '<button class="page-btn" onclick="changePage(' + (STATE.currentPage-1) + ')" ' + (STATE.currentPage===1?'disabled':'') + '><i class="fa fa-chevron-left"></i></button>';
  for (var i = 1; i <= total; i++) html += '<button class="page-btn ' + (i===STATE.currentPage?'active':'') + '" onclick="changePage(' + i + ')">' + i + '</button>';
  html += '<button class="page-btn" onclick="changePage(' + (STATE.currentPage+1) + ')" ' + (STATE.currentPage===total?'disabled':'') + '><i class="fa fa-chevron-right"></i></button>';
  pag.innerHTML = html;
}
function changePage(p) {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  if (p < 1 || p > total) return;
  STATE.currentPage = p; renderGrid(); renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── ADD ── */
document.getElementById('btn-add-service').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  STATE.editingId = null;
  resetForm();
  var modalFormIcon = document.getElementById('modal-form-icon');
  if (modalFormIcon) {
    modalFormIcon.className = 'modal-header-icon add';
    modalFormIcon.innerHTML = '<i class="ph ph-plus-circle"></i>';
  }
  setText('modal-form-title',   lang==='fr' ? 'Ajouter un Service' : 'Add New Service');
  setText('modal-form-subtitle', lang==='fr' ? 'Remplissez les détails' : 'Fill in the details below');
  setText('submit-btn-label',   lang==='fr' ? 'Enregistrer' : 'Save Service');
  openModal('modal-form');
});

/* ── EDIT ── */
function openEditModal(id) {
  id = String(id);
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var service = STATE.services.find(function(s) { return uid(s) === id; });
  if (!service) { console.warn('Service not found for id:', id); return; }

  STATE.editingId = id;
  resetForm();

  /* Basic fields */
  document.getElementById('service-id').value    = id;
  document.getElementById('svc-title-en').value  = service.title_en || '';
  document.getElementById('svc-title-fr').value  = service.title_fr || '';
  document.getElementById('svc-category').value  = service.category || '';
  document.getElementById('svc-status').value    = service.status   || 'published';
  document.getElementById('svc-icon').value      = service.icon     || '';
  document.getElementById('svc-desc-en').value   = service.desc_en  || '';
  document.getElementById('svc-desc-fr').value   = service.desc_fr  || '';
  document.getElementById('svc-slug').value      = service.slug     || '';
  if (slugPreviewEl) slugPreviewEl.textContent   = service.slug     || 'your-slug';
  previewIcon(service.icon || '');

  /* Rich content fields */
  setField('svc-intro-en',     service.intro_en);
  setField('svc-intro-fr',     service.intro_fr);
  setField('svc-body-en',      service.body_en);
  setField('svc-body-fr',      service.body_fr);
  setField('svc-body2-en',     service.body2_en);
  setField('svc-body2-fr',     service.body2_fr);
  setField('svc-highlight-en', service.highlight_en);
  setField('svc-highlight-fr', service.highlight_fr);

  /* Bullets: array → newline-separated string */
  setField('svc-bullets-en', Array.isArray(service.bullets_en) ? service.bullets_en.join('\n') : '');
  setField('svc-bullets-fr', Array.isArray(service.bullets_fr) ? service.bullets_fr.join('\n') : '');

  /* Show existing image thumbnail */
  if (service.image_url) {
    var wrap = document.getElementById('upload-area');
    if (wrap) {
      var old = document.getElementById('existing-img-preview');
      if (old) old.remove();
      var existing = document.createElement('img');
      existing.src   = service.image_url;
      existing.id    = 'existing-img-preview';
      existing.style = 'width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:8px;';
      wrap.insertBefore(existing, wrap.firstChild);
    }
  }

  var modalFormIcon = document.getElementById('modal-form-icon');
  if (modalFormIcon) {
    modalFormIcon.className = 'modal-header-icon edit';
    modalFormIcon.innerHTML = '<i class="ph ph-pencil-simple"></i>';
  }
  setText('modal-form-title',   lang==='fr' ? 'Modifier le Service' : 'Edit Service');
  setText('modal-form-subtitle', lang==='fr' ? (service.title_fr||'') : (service.title_en||''));
  setText('submit-btn-label',   lang==='fr' ? 'Mettre à Jour' : 'Update Service');
  openModal('modal-form');
}

function setField(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value || '';
}

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHtml(id, value) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

/* ── VIEW (dashboard preview) ── */
function openViewModal(id) {
  id = String(id);
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var service = STATE.services.find(function(s) { return uid(s) === id; });
  if (!service) return;

  var cat      = CATEGORIES[service.category] || {};
  var catLabel = lang==='fr' ? (cat.label_fr||service.category) : (cat.label_en||service.category);
  var title    = lang==='fr' ? service.title_fr : service.title_en;

  document.getElementById('view-modal-title').textContent = title;
  document.getElementById('view-modal-cat').textContent   = catLabel;
  document.getElementById('view-to-edit').onclick = function() { closeModal('modal-view'); openEditModal(id); };

  var publicLink = service.slug
    ? '../services/service-detail.html?slug=' + encodeURIComponent(service.slug)
    : '#';

  var bulletsHtml = '';
  var bullets = lang==='fr' ? service.bullets_fr : service.bullets_en;
  if (bullets && bullets.length) {
    bulletsHtml = '<ul style="margin:0;padding-left:18px;">' +
      bullets.map(function(b) { return '<li style="font-size:0.85rem;color:var(--text-body);margin-bottom:4px;">' + b + '</li>'; }).join('') +
      '</ul>';
  }

  document.getElementById('view-modal-body').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">' +
      '<div><div class="form-label" style="margin-bottom:4px;">Category</div><span class="badge badge-blue">' + catLabel + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Status</div><span class="badge ' + (service.status==='published'?'badge-green':'badge-yellow') + '">' + (service.status==='published'?'Published':'Draft') + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Icon</div><i class="ph ' + (service.icon||'ph-star') + '" style="font-size:1.4rem;color:var(--blue-light);"></i> <code style="font-size:0.78rem;color:var(--gray);">' + (service.icon||'—') + '</code></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Public URL</div><a href="' + publicLink + '" target="_blank" style="font-size:0.78rem;color:var(--blue-light);">service-detail.html?slug=' + (service.slug||'—') + '</a></div>' +
    '</div>' +
    (service.image_url ? '<img src="' + service.image_url + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;"/>' : '') +
    '<div style="margin-bottom:12px;"><div class="form-label" style="margin-bottom:4px;">Description (EN)</div><p style="font-size:0.88rem;color:var(--text-body);line-height:1.6;">' + (service.desc_en||'—') + '</p></div>' +
    '<div style="margin-bottom:12px;"><div class="form-label" style="margin-bottom:4px;">Description (FR)</div><p style="font-size:0.88rem;color:var(--text-body);line-height:1.6;">' + (service.desc_fr||'—') + '</p></div>' +
    (bulletsHtml ? '<div><div class="form-label" style="margin-bottom:6px;">Services List (' + (lang==='fr'?'FR':'EN') + ')</div>' + bulletsHtml + '</div>' : '');

  openModal('modal-view');
}

/* ── DELETE ── */
function openDeleteModal(id, name) {
  STATE.deletingId   = id;
  STATE.deletingName = name;
  document.getElementById('delete-service-name').textContent = name;
  openModal('modal-delete');
}

var confirmDeleteBtn = document.getElementById('confirm-delete-btn');

if (confirmDeleteBtn) {

  confirmDeleteBtn.addEventListener('click', function() {

    var lang = localStorage.getItem('emi_lang') || 'en';
    var id   = STATE.deletingId;

    if (!id) return;

    var btn = this;

    btn.disabled  = true;

    btn.innerHTML =
      '<i class="ph ph-spinner"></i> ' +
      (lang === 'fr' ? 'Suppression…' : 'Deleting…');

    apiDelete('/services/' + id)
      .then(afterDelete)
      .catch(afterDelete);

    function afterDelete() {

      STATE.services = STATE.services.filter(function(s) {
        return uid(s) !== String(id);
      });

      applyFilters();

      closeModal('modal-delete');

      showToast(
        'success',
        lang === 'fr'
          ? 'Service supprimé'
          : 'Service deleted',

        '"' + STATE.deletingName + '" ' +
        (lang === 'fr'
          ? 'a été supprimé.'
          : 'has been removed.')
      );

      STATE.deletingId   = null;
      STATE.deletingName = '';

      btn.disabled = false;

      btn.innerHTML =
        '<i class="ph ph-trash"></i> <span>' +
        (lang === 'fr'
          ? 'Oui, Supprimer'
          : 'Yes, Delete') +
        '</span>';
    }

  });

}
/* =============================================
   ✅ FORM SUBMIT — ADD / EDIT
   Sends all rich content fields as FormData.
   Bullets sent as newline-separated string.
============================================= */
document.getElementById('submit-form').addEventListener('click', function(event) {
  event.preventDefault();
  var lang   = localStorage.getItem('emi_lang') || 'en';
  var isEdit = STATE.editingId !== null;
  var btn    = this;

  var title_en = document.getElementById('svc-title-en').value.trim();
  var title_fr = document.getElementById('svc-title-fr').value.trim();
  var category = document.getElementById('svc-category').value;
  var status   = document.getElementById('svc-status').value;
  var icon     = document.getElementById('svc-icon').value.trim();
  var desc_en  = document.getElementById('svc-desc-en').value.trim();
  var desc_fr  = document.getElementById('svc-desc-fr').value.trim();
  var slug     = document.getElementById('svc-slug').value.trim() || slugify(title_en);

  /* Rich content */
  var intro_en     = getFieldValue('svc-intro-en');
  var intro_fr     = getFieldValue('svc-intro-fr');
  var body_en      = getFieldValue('svc-body-en');
  var body_fr      = getFieldValue('svc-body-fr');
  var body2_en     = getFieldValue('svc-body2-en');
  var body2_fr     = getFieldValue('svc-body2-fr');
  var highlight_en = getFieldValue('svc-highlight-en');
  var highlight_fr = getFieldValue('svc-highlight-fr');
  var bullets_en   = getFieldValue('svc-bullets-en');
  var bullets_fr   = getFieldValue('svc-bullets-fr');
  var imageFile    = document.getElementById('svc-image').files[0];

  if (!title_en || !title_fr || !category || !desc_en || !desc_fr) {
    showToast('error',
      lang==='fr' ? 'Champs manquants' : 'Missing fields',
      lang==='fr' ? 'Remplissez tous les champs obligatoires.' : 'Please fill in all required fields.'
    );
    return;
  }

  /* Update slug preview */
  if (slugEl) slugEl.value = slug;
  if (slugPreviewEl) slugPreviewEl.textContent = slug;

  var formData = new FormData();
  formData.append('title_en',     title_en);
  formData.append('title_fr',     title_fr);
  formData.append('category',     category);
  formData.append('status',       status);
  formData.append('icon',         icon);
  formData.append('desc_en',      desc_en);
  formData.append('desc_fr',      desc_fr);
  formData.append('slug',         slug);
  formData.append('intro_en',     intro_en);
  formData.append('intro_fr',     intro_fr);
  formData.append('body_en',      body_en);
  formData.append('body_fr',      body_fr);
  formData.append('body2_en',     body2_en);
  formData.append('body2_fr',     body2_fr);
  formData.append('highlight_en', highlight_en);
  formData.append('highlight_fr', highlight_fr);
  formData.append('bullets_en',   bullets_en);
  formData.append('bullets_fr',   bullets_fr);
  if (imageFile) formData.append('image', imageFile);

  btn.disabled  = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr'?'Enregistrement…':'Saving…');

  var request = isEdit
    ? apiPutForm('/services/' + STATE.editingId, formData)
    : apiPostForm('/services', formData);

  request.then(function(data) { afterSave(data); })
    .catch(function(err) {
      var msg = err && err.message ? err.message : 'Could not save. Please try again.';
      showToast('error', 'Error', msg);
      console.error('Service save error:', err);
      btn.disabled  = false;
      btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr'?'Enregistrer':'Save Service') + '</span>';
    });

  function afterSave(data) {
    if (!data || (data.message && !data._id && !data.id)) {
      showToast('error', 'Error', (data && data.message) || 'Server error.');
      btn.disabled  = false;
      btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr'?'Enregistrer':'Save Service') + '</span>';
      return;
    }

    if (isEdit) {
      var idx = STATE.services.findIndex(function(s) { return uid(s) === String(STATE.editingId); });
      if (idx !== -1) STATE.services[idx] = data;
    } else {
      STATE.services.unshift(data);
    }

    applyFilters();
    closeModal('modal-form');
    showToast('success',
      isEdit ? (lang==='fr'?'Service mis à jour':'Service updated') : (lang==='fr'?'Service ajouté':'Service added'),
      '"' + title_en + '" ' + (lang==='fr'?'enregistré avec succès.':'saved successfully.')
    );
    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr'?'Enregistrer':'Save Service') + '</span>';
  }
});

function getFieldValue(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ── ICON PREVIEW ── */
function previewIcon(val) {
  var preview = document.getElementById('icon-preview');
  if (!preview) return;
  var cls = val.trim();
  if (!cls) { preview.innerHTML = '<i class="ph ph-star"></i>'; return; }
  if (!cls.startsWith('ph-')) cls = 'ph-' + cls;
  preview.innerHTML = '<i class="ph ' + cls + '"></i>';
}

/* ── IMAGE PREVIEW ── */
function previewImage(event) {
  var file    = event.target.files[0];
  var preview = document.getElementById('img-preview-el');
  if (file && preview) {
    var reader = new FileReader();
    reader.onload = function(e) { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  }
}

/* ── RESET FORM ── */
function resetForm() {
  document.getElementById('service-form').reset();
  document.getElementById('service-id').value = '';
  document.getElementById('icon-preview').innerHTML = '<i class="ph ph-star"></i>';
  if (slugEl) slugEl.dataset.manuallySet = '';
  if (slugPreviewEl) slugPreviewEl.textContent = 'your-slug';
  var preview = document.getElementById('img-preview-el');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  var old = document.getElementById('existing-img-preview');
  if (old) old.remove();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() { loadServices(); });