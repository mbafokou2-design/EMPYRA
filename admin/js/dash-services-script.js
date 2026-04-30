/* =============================================
   EMI DASHBOARD — dash-services-script.js
   ✅ = live endpoint (backend built)
============================================= */

/* ── SECTION 1: LANGUAGE ── */
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

/* ── SECTION 2: SIDEBAR ── */
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

/* ── SECTION 3: PROFILE DROPDOWN ── */
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

/* ── SECTION 4: LOGOUT ── */
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
   ✅ SECTION 5: API CONFIGURATION
============================================= */
var API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '')
  };
}

/* Standard JSON requests */
function apiRequest(method, endpoint, body) {
  var opts = { method: method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + endpoint, opts).then(function(res) {
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    return res.json();
  });
}
var apiGet    = function(ep)       { return apiRequest('GET',    ep); };
var apiDelete = function(ep)       { return apiRequest('DELETE', ep); };

/*
  ✅ apiPostForm — POST with multipart/form-data (image upload)
  Do NOT set Content-Type manually — browser sets it with boundary.
*/
function apiPostForm(endpoint, formData) {
  return fetch(API_BASE + endpoint, {
    method:  'POST',
    headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '') },
    body:    formData
  }).then(function(res) {
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    return res.json();
  });
}

/* ✅ apiPutForm — PUT with multipart/form-data (optional new image) */
function apiPutForm(endpoint, formData) {
  return fetch(API_BASE + endpoint, {
    method:  'PUT',
    headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('emi_token') || '') },
    body:    formData
  }).then(function(res) {
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    return res.json();
  });
}

/* ── SECTION 6: TOAST ── */
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

/* ── SECTION 7: MODAL HELPERS ── */
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

/* ── SECTION 8: CATEGORY CONFIG ── */
var CATEGORIES = {
  environment: { label_en: 'Environment & Sustainability', label_fr: 'Environnement & Durabilité',  cls: 'sic-env',    icon: 'ph-leaf'                  },
  audit:       { label_en: 'Audits & Risk Management',    label_fr: 'Audits & Gestion des Risques', cls: 'sic-audit',  icon: 'ph-magnifying-glass-plus' },
  exploration: { label_en: 'Exploration & Resources',     label_fr: 'Exploration & Ressources',     cls: 'sic-explor', icon: 'ph-compass'               },
  engineering: { label_en: 'Engineering & Operations',    label_fr: 'Ingénierie & Opérations',      cls: 'sic-eng',    icon: 'ph-gear-six'              }
};
function getCatLabel(key) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var cat  = CATEGORIES[key];
  if (!cat) return key;
  return lang === 'fr' ? cat.label_fr : cat.label_en;
}

/* Helper — MongoDB uses _id */
function uid(s) { return s._id || s.id; }

/* ── SECTION 9: STATE ── */
var STATE = {
  services:     [], filtered: [],
  currentPage:  1,  perPage: 9,
  editingId:    null, deletingId: null, deletingName: ''
};

/* =============================================
   ✅ SECTION 10: LOAD SERVICES
   GET /api/services
   Backend returns array sorted newest first.
   Fields: _id, title_en, title_fr, category,
           status, icon, desc_en, desc_fr,
           slug, image_url, image_public_id, createdAt
============================================= */
function loadServices() {
  var grid = document.getElementById('services-grid');
  grid.innerHTML =
    '<div class="services-loading"><i class="ph ph-spinner" style="font-size:1.5rem;"></i> ' +
    '<span data-en="Loading services…" data-fr="Chargement…">Loading services…</span></div>';

  apiGet('/services').then(function(data) {
    if (!data) return;
    STATE.services = data;
    applyFilters();
  }).catch(function() {
    showToast('error', 'Load failed', 'Could not reach the server.');
    STATE.services = [];
    applyFilters();
  });
}

/* ── SECTION 11: FILTER + SEARCH ── */
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

/* ── SECTION 12: RENDER GRID ── */
function renderGrid() {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var grid  = document.getElementById('services-grid');
  var start = (STATE.currentPage - 1) * STATE.perPage;
  var page  = STATE.filtered.slice(start, start + STATE.perPage);

  if (page.length === 0) {
    grid.innerHTML =
      '<div class="services-empty">' +
      '<i class="ph ph-magnifying-glass" style="font-size:3rem;color:var(--gray-light);"></i>' +
      '<h3>' + (lang === 'fr' ? 'Aucun service trouvé'          : 'No services found')           + '</h3>' +
      '<p>'  + (lang === 'fr' ? 'Essayez de modifier vos filtres.' : 'Try adjusting your filters.') + '</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = page.map(function(s) {
    var id       = uid(s);
    var cat      = CATEGORIES[s.category] || {};
    var catCls   = cat.cls   || '';
    var catLabel = lang === 'fr' ? (cat.label_fr || s.category) : (cat.label_en || s.category);
    var title    = lang === 'fr' ? s.title_fr : s.title_en;
    var desc     = lang === 'fr' ? s.desc_fr  : s.desc_en;
    var icon     = s.icon || (cat.icon || 'ph-hard-hat');

    var statusBadge = s.status === 'published'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.45rem;"></i>' + (lang==='fr'?'Publié':'Published') + '</span>'
      : '<span class="badge badge-yellow">' + (lang==='fr'?'Brouillon':'Draft') + '</span>';

    return '<div class="service-item-card ' + catCls + '" data-id="' + id + '">' +
      '<div class="sic-head">' +
        '<div class="sic-icon"><i class="ph ' + icon + '"></i></div>' +
        '<div class="sic-meta">' +
          '<div class="sic-category">' + catLabel + '</div>' +
          '<div class="sic-title" title="' + title + '">' + title + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sic-body"><p class="sic-description">' + (desc || '—') + '</p></div>' +
      '<div class="sic-footer">' +
        statusBadge +
        '<div class="sic-actions">' +
          '<button class="sic-action-btn view"   data-id="' + id + '" onclick="openViewModal(this.dataset.id)"   title="' + (lang==='fr'?'Voir':'View')      + '"><i class="ph ph-eye"></i></button>' +
          '<button class="sic-action-btn edit"   data-id="' + id + '" onclick="openEditModal(this.dataset.id)"   title="' + (lang==='fr'?'Modifier':'Edit')   + '"><i class="ph ph-pencil-simple"></i></button>' +
          '<button class="sic-action-btn delete" data-id="' + id + '" data-name="' + (title||'').replace(/"/g,'&quot;') + '" onclick="openDeleteModal(this.dataset.id, this.dataset.name)" title="' + (lang==='fr'?'Supprimer':'Delete') + '"><i class="ph ph-trash"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── SECTION 13: PAGINATION ── */
function renderPagination() {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  var pag   = document.getElementById('pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  var html = '<button class="page-btn" onclick="changePage(' + (STATE.currentPage - 1) + ')" ' + (STATE.currentPage === 1 ? 'disabled' : '') + '><i class="fa fa-chevron-left"></i></button>';
  for (var i = 1; i <= total; i++) html += '<button class="page-btn ' + (i === STATE.currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
  html += '<button class="page-btn" onclick="changePage(' + (STATE.currentPage + 1) + ')" ' + (STATE.currentPage === total ? 'disabled' : '') + '><i class="fa fa-chevron-right"></i></button>';
  pag.innerHTML = html;
}
function changePage(p) {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  if (p < 1 || p > total) return;
  STATE.currentPage = p; renderGrid(); renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── SECTION 14: ADD ── */
document.getElementById('btn-add-service').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  STATE.editingId = null;
  resetForm();
  document.getElementById('modal-form-icon').className      = 'modal-header-icon add';
  document.getElementById('modal-form-icon').innerHTML      = '<i class="ph ph-plus-circle"></i>';
  document.getElementById('modal-form-title').textContent   = lang==='fr' ? 'Ajouter un Service'    : 'Add New Service';
  document.getElementById('modal-form-subtitle').textContent = lang==='fr' ? 'Remplissez les détails' : 'Fill in the details below';
  document.getElementById('submit-btn-label').textContent   = lang==='fr' ? 'Enregistrer'           : 'Save Service';
  openModal('modal-form');
});

/* ── SECTION 15: EDIT ── */
function openEditModal(id) {
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var service = STATE.services.find(function(s) { return uid(s) === id; });
  if (!service) return;
  STATE.editingId = id;
  resetForm();
  document.getElementById('service-id').value   = id;
  document.getElementById('svc-title-en').value = service.title_en || '';
  document.getElementById('svc-title-fr').value = service.title_fr || '';
  document.getElementById('svc-category').value = service.category || '';
  document.getElementById('svc-status').value   = service.status   || 'published';
  document.getElementById('svc-icon').value     = service.icon     || '';
  document.getElementById('svc-desc-en').value  = service.desc_en  || '';
  document.getElementById('svc-desc-fr').value  = service.desc_fr  || '';
  document.getElementById('svc-slug').value     = service.slug     || '';
  previewIcon(service.icon || '');
  /* Show existing image if present */
  if (service.image_url) {
    var wrap = document.getElementById('upload-area');
    if (wrap) {
      var existing = document.createElement('img');
      existing.src   = service.image_url;
      existing.id    = 'existing-img-preview';
      existing.style = 'width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:8px;';
      var old = document.getElementById('existing-img-preview');
      if (old) old.remove();
      wrap.insertBefore(existing, wrap.firstChild);
    }
  }
  document.getElementById('modal-form-icon').className      = 'modal-header-icon edit';
  document.getElementById('modal-form-icon').innerHTML      = '<i class="ph ph-pencil-simple"></i>';
  document.getElementById('modal-form-title').textContent    = lang==='fr' ? 'Modifier le Service'  : 'Edit Service';
  document.getElementById('modal-form-subtitle').textContent = lang==='fr' ? (service.title_fr||'') : (service.title_en||'');
  document.getElementById('submit-btn-label').textContent    = lang==='fr' ? 'Mettre à Jour'        : 'Update Service';
  openModal('modal-form');
}

/* ── SECTION 16: VIEW ── */
function openViewModal(id) {
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var service = STATE.services.find(function(s) { return uid(s) === id; });
  if (!service) return;

  var cat      = CATEGORIES[service.category] || {};
  var catLabel = lang==='fr' ? (cat.label_fr || service.category) : (cat.label_en || service.category);
  var title    = lang==='fr' ? service.title_fr : service.title_en;
  var desc     = lang==='fr' ? service.desc_fr  : service.desc_en;

  document.getElementById('view-modal-title').textContent = title;
  document.getElementById('view-modal-cat').textContent   = catLabel;
  document.getElementById('view-to-edit').onclick = function() { closeModal('modal-view'); openEditModal(id); };

  document.getElementById('view-modal-body').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">' +
      '<div><div class="form-label" style="margin-bottom:4px;">' + (lang==='fr'?'Catégorie':'Category') + '</div><span class="badge badge-blue">' + catLabel + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Status</div><span class="badge ' + (service.status==='published'?'badge-green':'badge-yellow') + '">' + (service.status==='published'?(lang==='fr'?'Publié':'Published'):(lang==='fr'?'Brouillon':'Draft')) + '</span></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Icon</div><div style="display:flex;align-items:center;gap:8px;"><i class="ph ' + (service.icon||'ph-star') + '" style="font-size:1.4rem;color:var(--blue-light);"></i><code style="font-size:0.8rem;color:var(--gray);">' + (service.icon||'—') + '</code></div></div>' +
      '<div><div class="form-label" style="margin-bottom:4px;">Slug</div><code style="font-size:0.8rem;color:var(--blue-light);">' + (service.slug||'—') + '</code></div>' +
    '</div>' +
    (service.image_url ? '<img src="' + service.image_url + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;"/>' : '') +
    '<div style="margin-bottom:14px;"><div class="form-label" style="margin-bottom:6px;">Description (EN)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.7;">' + (service.desc_en||'—') + '</p></div>' +
    '<div><div class="form-label" style="margin-bottom:6px;">Description (FR)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.7;">' + (service.desc_fr||'—') + '</p></div>';

  openModal('modal-view');
}

/* =============================================
   ✅ SECTION 17: DELETE
   DELETE /api/services/:id
   Backend also deletes image from Cloudinary.
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
  var btn  = this;
  btn.disabled  = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr' ? 'Suppression…' : 'Deleting…');

  /* ✅ DELETE /api/services/:id */
  apiDelete('/services/' + id).then(function() {
    afterDelete();
  }).catch(function() {
    afterDelete();
  });

  function afterDelete() {
    STATE.services = STATE.services.filter(function(s) { return uid(s) !== id; });
    applyFilters();
    closeModal('modal-delete');
    showToast('success',
      lang==='fr' ? 'Service supprimé' : 'Service deleted',
      '"' + STATE.deletingName + '" ' + (lang==='fr' ? 'a été supprimé.' : 'has been removed.')
    );
    STATE.deletingId   = null;
    STATE.deletingName = '';
    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-trash"></i> <span>' + (lang==='fr' ? 'Oui, Supprimer' : 'Yes, Delete') + '</span>';
  }
});

/* =============================================
   ✅ SECTION 18: FORM SUBMIT (Add / Edit)
   POST /api/services  → create  (multipart/form-data)
   PUT  /api/services/:id → update (multipart/form-data)

   Always sends FormData so the image field works.
   If no image selected on edit, existing image is kept
   (backend only updates image_url if req.file exists).
============================================= */
document.getElementById('submit-form').addEventListener('click', function() {
  var lang   = localStorage.getItem('emi_lang') || 'en';
  var isEdit = STATE.editingId !== null;
  var btn    = this;

  var title_en  = document.getElementById('svc-title-en').value.trim();
  var title_fr  = document.getElementById('svc-title-fr').value.trim();
  var category  = document.getElementById('svc-category').value;
  var status    = document.getElementById('svc-status').value;
  var icon      = document.getElementById('svc-icon').value.trim();
  var desc_en   = document.getElementById('svc-desc-en').value.trim();
  var desc_fr   = document.getElementById('svc-desc-fr').value.trim();
  var slug      = document.getElementById('svc-slug').value.trim();
  var imageFile = document.getElementById('svc-image').files[0];

  if (!title_en || !title_fr || !category || !desc_en || !desc_fr) {
    showToast('error',
      lang==='fr' ? 'Champs manquants'                         : 'Missing fields',
      lang==='fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.'
    );
    return;
  }

  /* Build FormData — works with or without image */
  var formData = new FormData();
  formData.append('title_en', title_en);
  formData.append('title_fr', title_fr);
  formData.append('category', category);
  formData.append('status',   status);
  formData.append('icon',     icon);
  formData.append('desc_en',  desc_en);
  formData.append('desc_fr',  desc_fr);
  formData.append('slug',     slug);
  if (imageFile) formData.append('image', imageFile);

  btn.disabled  = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> ' + (lang==='fr' ? 'Enregistrement…' : 'Saving…');

  var request = isEdit
    ? apiPutForm('/services/' + STATE.editingId, formData)
    : apiPostForm('/services', formData);

  request.then(function(data) {
    afterSave(data);
  }).catch(function() {
    showToast('error', 'Error', 'Could not save. Please try again.');
    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr' ? 'Enregistrer' : 'Save Service') + '</span>';
  });

  function afterSave(data) {
    if (!data || (data.message && !data._id && !data.id)) {
      showToast('error', 'Error', (data && data.message) || 'Server error.');
      btn.disabled  = false;
      btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr' ? 'Enregistrer' : 'Save Service') + '</span>';
      return;
    }

    if (isEdit) {
      var idx = STATE.services.findIndex(function(s) { return uid(s) === STATE.editingId; });
      if (idx !== -1) STATE.services[idx] = data;
    } else {
      STATE.services.unshift(data);
    }

    applyFilters();
    closeModal('modal-form');
    showToast('success',
      isEdit ? (lang==='fr' ? 'Service mis à jour' : 'Service updated') : (lang==='fr' ? 'Service ajouté' : 'Service added'),
      '"' + title_en + '" ' + (lang==='fr' ? 'enregistré avec succès.' : 'saved successfully.')
    );
    btn.disabled  = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>' + (lang==='fr' ? 'Enregistrer' : 'Save Service') + '</span>';
  }
});

/* ── SECTION 19: ICON PREVIEW ── */
function previewIcon(val) {
  var preview = document.getElementById('icon-preview');
  if (!preview) return;
  var cls = val.trim();
  if (!cls) { preview.innerHTML = '<i class="ph ph-star"></i>'; return; }
  if (!cls.startsWith('ph-')) cls = 'ph-' + cls;
  preview.innerHTML = '<i class="ph ' + cls + '"></i>';
}

/* ── SECTION 20: IMAGE PREVIEW ── */
function previewImage(event) {
  var file    = event.target.files[0];
  var preview = document.getElementById('img-preview-el');
  if (file && preview) {
    var reader = new FileReader();
    reader.onload = function(e) { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  }
}

/* ── SECTION 21: RESET FORM ── */
function resetForm() {
  document.getElementById('service-form').reset();
  document.getElementById('service-id').value = '';
  document.getElementById('icon-preview').innerHTML = '<i class="ph ph-star"></i>';
  var preview = document.getElementById('img-preview-el');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  var old = document.getElementById('existing-img-preview');
  if (old) old.remove();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() { loadServices(); });

/*
  ═══════════════════════════════════════════════════
  BACKEND INTEGRATION STATUS — dash-services-script.js
  ═══════════════════════════════════════════════════

  ✅ ALL ENDPOINTS LIVE:
    GET    /api/services        → load all services
    POST   /api/services        → create  (multipart/form-data + image → Cloudinary)
    PUT    /api/services/:id    → update  (multipart/form-data + optional new image)
    DELETE /api/services/:id    → delete  (also removes image from Cloudinary)

  KEY NOTES:
  - MongoDB returns _id (string). uid() helper handles both _id and id.
  - Images use FormData, NOT JSON. apiPostForm/apiPutForm send no Content-Type
    header so browser sets it with the correct multipart boundary.
  - If no image is selected on edit, existing image_url is untouched (backend
    only updates image fields when req.file is present).
  - createdAt comes from Mongoose timestamps: true.

  ═══════════════════════════════════════════════════
*/