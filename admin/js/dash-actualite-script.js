/* =============================================
   EMI DASHBOARD — dash-actualite-script.js
   Actualités: list, add, edit, delete, view.
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
    /* BACKEND: POST /api/logout then clear */
    localStorage.removeItem('emi_token');
    localStorage.removeItem('emi_admin_user');
    window.location.href = 'login.html';
  });
}

/* =============================================
   API CONFIG
   STEP 1 — Replace with your API URL:
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
  mining:      { en: 'Mining',       fr: 'Mines',            icon: 'ph-mountains',    col: 0 },
  environment: { en: 'Environment',  fr: 'Environnement',    icon: 'ph-leaf',         col: 1 },
  regulation:  { en: 'Regulation',   fr: 'Réglementation',   icon: 'ph-scales',       col: 2 },
  innovation:  { en: 'Innovation',   fr: 'Innovation',       icon: 'ph-lightbulb',    col: 3 },
  community:   { en: 'Community',    fr: 'Communauté',       icon: 'ph-users-three',  col: 4 },
  event:       { en: 'Event',        fr: 'Événement',        icon: 'ph-calendar',     col: 5 }
};
function getCatLabel(key) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  return CATS[key] ? (lang === 'fr' ? CATS[key].fr : CATS[key].en) : key;
}

/* =============================================
   STATE
============================================= */
var STATE = {
  items: [], filtered: [],
  currentPage: 1, perPage: 6,
  editingId: null, deletingId: null, deletingName: ''
};

/* =============================================
   LOAD FROM API

   GET /actualite
   Expected array:
   [
     {
       id:         1,
       title_en:   "Cameroon Mining Code Update",
       title_fr:   "Mise à Jour du Code Minier",
       category:   "regulation",
       status:     "published",
       icon:       "ph-scales",
       text_en:    "Lorem ipsum…",
       text_fr:    "Lorem ipsum…",
       image_url:  "https://cdn.com/img.jpg",
       created_at: "2025-03-10T09:00:00Z"
     }
   ]
============================================= */
function loadItems() {
  document.getElementById('posts-grid').innerHTML =
    '<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line" style="height:16px;width:60%;margin:0 auto 8px;"></div><div class="skeleton-line" style="height:13px;width:90%;margin:0 auto 6px;"></div><div class="skeleton-line" style="height:13px;width:75%;margin:0 auto;"></div></div></div>'.repeat(3);

  apiGet('/actualite').then(function(data) {
    STATE.items = data || [];
    applyFilters();
  }).catch(function() {
    /* Demo data — remove when backend connected */
    STATE.items = [
      { id:1, title_en:'Cameroon Mining Code 2025 Update',         title_fr:'Mise à Jour du Code Minier 2025',        category:'regulation',  status:'published', icon:'ph-scales',       text_en:'Lorem ipsum dolor sit amet consectetur adipiscing elit. The Cameroonian government has announced key updates to the mining code effective 2025.', text_fr:'Lorem ipsum dolor sit amet consectetur adipiscing elit. Le gouvernement camerounais a annoncé des mises à jour importantes du code minier.', created_at:'2025-01-15' },
      { id:2, title_en:'New Environmental Compliance Standards',    title_fr:'Nouvelles Normes de Conformité Environnementale', category:'environment', status:'published', icon:'ph-leaf',         text_en:'Lorem ipsum dolor sit amet consectetur adipiscing elit. EMI has adopted new ISO 14001 aligned compliance procedures.', text_fr:'Lorem ipsum dolor sit amet consectetur adipiscing elit. EMI a adopté de nouvelles procédures de conformité alignées ISO 14001.', created_at:'2025-02-03' },
      { id:3, title_en:'EMI at the Yaoundé Mining Summit',          title_fr:'EMI au Sommet Minier de Yaoundé',        category:'event',       status:'published', icon:'ph-calendar',     text_en:'Lorem ipsum dolor sit amet consectetur adipiscing elit. EMI participated in the Yaoundé Mining Summit presenting our latest innovations.', text_fr:'Lorem ipsum dolor sit amet consectetur adipiscing elit. EMI a participé au Sommet Minier de Yaoundé.', created_at:'2025-02-20' },
      { id:4, title_en:'Community Development Partnership Signed',  title_fr:'Partenariat de Développement Signé',     category:'community',   status:'published', icon:'ph-users-three',  text_en:'Lorem ipsum dolor sit amet consectetur adipiscing elit. A new community partnership was signed to support local mining communities.', text_fr:'Lorem ipsum dolor sit amet consectetur adipiscing elit. Un nouveau partenariat communautaire a été signé.', created_at:'2025-03-05' },
      { id:5, title_en:'Sustainable Mining Innovation Award',       title_fr:'Prix de l\'Innovation Minière Durable',  category:'innovation',  status:'draft',     icon:'ph-trophy',       text_en:'Lorem ipsum dolor sit amet consectetur adipiscing elit. EMI has been nominated for the 2025 Sustainable Mining Innovation Award.', text_fr:'Lorem ipsum dolor sit amet consectetur adipiscing elit. EMI a été nominé pour le Prix de l\'Innovation Minière Durable 2025.', created_at:'2025-03-18' },
      { id:6, title_en:'ITIE Report 2024: Key Findings',           title_fr:'Rapport ITIE 2024: Conclusions Clés',    category:'mining',      status:'published', icon:'ph-file-text',    text_en:'Lorem ipsum dolor sit amet consectetur adipiscing elit. The ITIE 2024 report highlights key challenges and opportunities in Cameroonian mining.', text_fr:'Lorem ipsum dolor sit amet consectetur adipiscing elit. Le rapport ITIE 2024 met en évidence les défis et opportunités.', created_at:'2025-03-28' }
    ];
    applyFilters();
  });
}

/* ── FILTERS ── */
function applyFilters() {
  var lang     = localStorage.getItem('emi_lang') || 'en';
  var query    = document.getElementById('search-input').value.toLowerCase().trim();
  var category = document.getElementById('filter-category').value;
  var status   = document.getElementById('filter-status').value;
  STATE.filtered = STATE.items.filter(function(item) {
    var title = (lang==='fr' ? item.title_fr : item.title_en) || '';
    var text  = (lang==='fr' ? item.text_fr  : item.text_en)  || '';
    return (!query    || title.toLowerCase().includes(query) || text.toLowerCase().includes(query)) &&
           (!category || item.category === category) &&
           (!status   || item.status   === status);
  });
  STATE.currentPage = 1;
  document.getElementById('count-number').textContent = STATE.filtered.length;
  renderGrid();
  renderPagination();
}
document.getElementById('search-input').addEventListener('input',     applyFilters);
document.getElementById('filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change',   applyFilters);

/* ── RENDER GRID ── */
function renderGrid() {
  var lang  = localStorage.getItem('emi_lang') || 'en';
  var grid  = document.getElementById('posts-grid');
  var start = (STATE.currentPage - 1) * STATE.perPage;
  var page  = STATE.filtered.slice(start, start + STATE.perPage);
  if (page.length === 0) {
    grid.innerHTML = '<div class="posts-empty"><i class="ph ph-magnifying-glass" style="font-size:3rem;color:var(--gray-light);"></i><h3>' + (lang==='fr'?'Aucune actualité trouvée':'No actualités found') + '</h3><p>' + (lang==='fr'?'Modifiez vos filtres.':'Try adjusting your filters.') + '</p></div>';
    return;
  }
  grid.innerHTML = page.map(function(item, idx) {
    var cat      = CATS[item.category] || {};
    var catLabel = lang==='fr' ? (cat.fr||item.category) : (cat.en||item.category);
    var title    = lang==='fr' ? item.title_fr : item.title_en;
    var text     = lang==='fr' ? item.text_fr  : item.text_en;
    var icon     = item.icon || (cat.icon||'ph-megaphone');
    var colCls   = 'ic-col-' + ((cat.col!==undefined ? cat.col : idx) % 6);
    var photo    = item.image_url ? '<img src="'+item.image_url+'" alt="'+title+'"/>' : '<div class="pc-photo-placeholder"><i class="ph ph-image"></i></div>';
    var statusBadge = item.status==='published'
      ? '<span class="badge badge-green"><i class="fa fa-circle" style="font-size:0.45rem;"></i>'+(lang==='fr'?'Publié':'Published')+'</span>'
      : '<span class="badge badge-yellow">'+(lang==='fr'?'Brouillon':'Draft')+'</span>';
    var dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-US',{year:'numeric',month:'short',day:'numeric'}) : '—';
    return '<div class="post-card" data-id="'+item.id+'">'+
      '<div class="pc-photo">'+photo+'<span class="pc-cat-tag">'+catLabel+'</span>'+
        '<div class="pc-icon-wrap"><div class="pc-icon '+colCls+'"><i class="ph '+icon+'"></i></div></div>'+
      '</div>'+
      '<div class="pc-body"><div class="pc-title">'+title+'</div><div class="pc-text">'+(text||'—')+'</div></div>'+
      '<div class="pc-footer">'+
        '<span class="pc-date"><i class="ph ph-calendar-blank"></i>'+dateStr+'</span>'+
        '<div style="display:flex;align-items:center;gap:8px;">'+statusBadge+
          '<div class="pc-actions">'+
            '<button class="pc-action-btn view"   onclick="openViewModal('+item.id+')"  title="'+(lang==='fr'?'Voir':'View')+'"><i class="ph ph-eye"></i></button>'+
            '<button class="pc-action-btn edit"   onclick="openEditModal('+item.id+')"  title="'+(lang==='fr'?'Modifier':'Edit')+'"><i class="ph ph-pencil-simple"></i></button>'+
            '<button class="pc-action-btn delete" onclick="openDeleteModal('+item.id+',\''+title.replace(/'/g,"\\'")+'\')" title="'+(lang==='fr'?'Supprimer':'Delete')+'"><i class="ph ph-trash"></i></button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

/* ── PAGINATION ── */
function renderPagination() {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  var pag   = document.getElementById('pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  var html = '<button class="page-btn" onclick="changePage('+(STATE.currentPage-1)+')" '+(STATE.currentPage===1?'disabled':'')+'><i class="fa fa-chevron-left"></i></button>';
  for (var i = 1; i <= total; i++) html += '<button class="page-btn '+(i===STATE.currentPage?'active':'')+'" onclick="changePage('+i+')">'+i+'</button>';
  html += '<button class="page-btn" onclick="changePage('+(STATE.currentPage+1)+')" '+(STATE.currentPage===total?'disabled':'')+'><i class="fa fa-chevron-right"></i></button>';
  pag.innerHTML = html;
}
function changePage(p) {
  var total = Math.ceil(STATE.filtered.length / STATE.perPage);
  if (p < 1 || p > total) return;
  STATE.currentPage = p; renderGrid(); renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── ADD ── */
document.getElementById('btn-add').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  STATE.editingId = null; resetForm();
  document.getElementById('modal-form-icon').className    = 'modal-header-icon add';
  document.getElementById('modal-form-icon').innerHTML    = '<i class="ph ph-plus-circle"></i>';
  document.getElementById('modal-form-title').textContent    = lang==='fr' ? 'Ajouter une Actualité' : 'Add Actualité';
  document.getElementById('modal-form-subtitle').textContent = lang==='fr' ? 'Remplissez les détails' : 'Fill in the details below';
  document.getElementById('submit-btn-label').textContent    = lang==='fr' ? 'Enregistrer' : 'Save Actualité';
  openModal('modal-form');
});

/* ── EDIT ── */
function openEditModal(id) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var item = STATE.items.find(function(i) { return i.id === id; });
  if (!item) return;
  STATE.editingId = id; resetForm();
  document.getElementById('post-id').value        = item.id;
  document.getElementById('post-title-en').value  = item.title_en  || '';
  document.getElementById('post-title-fr').value  = item.title_fr  || '';
  document.getElementById('post-category').value  = item.category  || '';
  document.getElementById('post-status').value    = item.status    || 'published';
  document.getElementById('post-icon').value      = item.icon      || '';
  document.getElementById('post-text-en').value   = item.text_en   || '';
  document.getElementById('post-text-fr').value   = item.text_fr   || '';
  previewIcon(item.icon || '');
  if (item.image_url) {
    document.getElementById('current-img-wrap').style.display = 'block';
    document.getElementById('current-img-preview').src = item.image_url;
  }
  document.getElementById('modal-form-icon').className    = 'modal-header-icon edit';
  document.getElementById('modal-form-icon').innerHTML    = '<i class="ph ph-pencil-simple"></i>';
  document.getElementById('modal-form-title').textContent    = lang==='fr' ? 'Modifier l\'Actualité' : 'Edit Actualité';
  document.getElementById('modal-form-subtitle').textContent = lang==='fr' ? (item.title_fr||'') : (item.title_en||'');
  document.getElementById('submit-btn-label').textContent    = lang==='fr' ? 'Mettre à Jour' : 'Update Actualité';
  openModal('modal-form');
}

/* ── VIEW ── */
function openViewModal(id) {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var item = STATE.items.find(function(i) { return i.id === id; });
  if (!item) return;
  var title    = lang==='fr' ? item.title_fr : item.title_en;
  var text     = lang==='fr' ? item.text_fr  : item.text_en;
  var catLabel = getCatLabel(item.category);
  document.getElementById('view-title').textContent = title;
  document.getElementById('view-cat').textContent   = catLabel;
  document.getElementById('view-to-edit').onclick   = function() { closeModal('modal-view'); openEditModal(id); };
  var imgHtml = item.image_url ? '<img src="'+item.image_url+'" alt="'+title+'" class="view-hero-img"/>' : '<div class="view-hero-placeholder"><i class="ph ph-image"></i></div>';
  var dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-US',{year:'numeric',month:'long',day:'numeric'}) : '—';
  document.getElementById('view-body').innerHTML =
    imgHtml +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">'+
      '<div><div class="form-label" style="margin-bottom:4px;">'+(lang==='fr'?'Catégorie':'Category')+'</div><span class="badge badge-blue">'+catLabel+'</span></div>'+
      '<div><div class="form-label" style="margin-bottom:4px;">Status</div><span class="badge '+(item.status==='published'?'badge-green':'badge-yellow')+'">'+(item.status==='published'?(lang==='fr'?'Publié':'Published'):(lang==='fr'?'Brouillon':'Draft'))+'</span></div>'+
      '<div><div class="form-label" style="margin-bottom:4px;">Icon</div><div style="display:flex;align-items:center;gap:8px;"><i class="ph '+(item.icon||'ph-megaphone')+'" style="font-size:1.3rem;color:var(--blue-light);"></i><code style="font-size:0.8rem;color:var(--gray);">'+(item.icon||'—')+'</code></div></div>'+
      '<div><div class="form-label" style="margin-bottom:4px;">Date</div><span style="font-size:0.85rem;color:var(--text-body);">'+dateStr+'</span></div>'+
    '</div>'+
    '<div style="margin-bottom:14px;"><div class="form-label" style="margin-bottom:6px;">Text (EN)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.75;">'+(item.text_en||'—')+'</p></div>'+
    '<div><div class="form-label" style="margin-bottom:6px;">Text (FR)</div><p style="font-size:0.9rem;color:var(--text-body);line-height:1.75;">'+(item.text_fr||'—')+'</p></div>';
  openModal('modal-view');
}

/* ── DELETE ── */
function openDeleteModal(id, name) {
  STATE.deletingId = id; STATE.deletingName = name;
  document.getElementById('delete-item-name').textContent = name;
  openModal('modal-delete');
}
document.getElementById('confirm-delete-btn').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var id   = STATE.deletingId; if (!id) return;
  var btn  = this;
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> '+(lang==='fr'?'Suppression…':'Deleting…');
  /*
  ── BACKEND: DELETE /actualite/{id}
  Expected: { success: true }
  */
  apiDelete('/actualite/' + id).then(afterDel).catch(afterDel);
  function afterDel() {
    STATE.items = STATE.items.filter(function(i) { return i.id !== id; });
    applyFilters(); closeModal('modal-delete');
    showToast('success', lang==='fr'?'Actualité supprimée':'Actualité deleted', '"'+STATE.deletingName+'" '+(lang==='fr'?'supprimée.':'removed.'));
    STATE.deletingId = null;
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-trash"></i> <span>'+(lang==='fr'?'Oui, Supprimer':'Yes, Delete')+'</span>';
  }
});

/* ── FORM SUBMIT ──
   ADD:  POST /actualite         → returns saved object
   EDIT: PUT  /actualite/{id}    → returns updated object
   Body: { title_en, title_fr, category, status, icon, text_en, text_fr }
   For image: use FormData with "image" field.
*/
document.getElementById('submit-form').addEventListener('click', function() {
  var lang = localStorage.getItem('emi_lang') || 'en';
  var payload = {
    title_en: document.getElementById('post-title-en').value.trim(),
    title_fr: document.getElementById('post-title-fr').value.trim(),
    category: document.getElementById('post-category').value,
    status:   document.getElementById('post-status').value,
    icon:     document.getElementById('post-icon').value.trim(),
    text_en:  document.getElementById('post-text-en').value.trim(),
    text_fr:  document.getElementById('post-text-fr').value.trim()
  };
  if (!payload.title_en || !payload.title_fr || !payload.category || !payload.text_en || !payload.text_fr) {
    showToast('error', lang==='fr'?'Champs manquants':'Missing fields', lang==='fr'?'Remplissez tous les champs.':'Fill all required fields.');
    return;
  }
  var btn    = this;
  var isEdit = STATE.editingId !== null;
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner"></i> '+(lang==='fr'?'Enregistrement…':'Saving…');
  var endpoint = isEdit ? '/actualite/'+STATE.editingId : '/actualite';
  var method   = isEdit ? apiPut : apiPost;
  method(endpoint, payload).then(function(data) { afterSave(data); }).catch(function() { afterSave(null); });
  function afterSave(data) {
    if (isEdit) {
      var idx = STATE.items.findIndex(function(i) { return i.id === STATE.editingId; });
      if (idx !== -1) Object.assign(STATE.items[idx], payload, data||{});
    } else {
      STATE.items.unshift(Object.assign({ id: Date.now() }, payload, data||{}));
    }
    applyFilters(); closeModal('modal-form');
    showToast('success', isEdit?(lang==='fr'?'Mise à jour':'Updated'):(lang==='fr'?'Ajoutée':'Added'), '"'+payload.title_en+'" '+(lang==='fr'?'enregistrée.':'saved.'));
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-floppy-disk"></i> <span>'+(lang==='fr'?'Enregistrer':'Save Actualité')+'</span>';
  }
});

/* ── ICON PREVIEW ── */
function previewIcon(val) {
  var preview = document.getElementById('icon-preview');
  if (!preview) return;
  var cls = val.trim();
  if (!cls) { preview.innerHTML = '<i class="ph ph-megaphone"></i>'; return; }
  if (!cls.startsWith('ph-')) cls = 'ph-' + cls;
  preview.innerHTML = '<i class="ph ' + cls + '"></i>';
}

/* ── IMAGE PREVIEW ── */
function previewImage(event) {
  var file = event.target.files[0];
  var preview = document.getElementById('img-preview-el');
  if (file && preview) {
    var reader = new FileReader();
    reader.onload = function(e) { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  }
}

/* ── RESET FORM ── */
function resetForm() {
  document.getElementById('post-form').reset();
  document.getElementById('post-id').value = '';
  document.getElementById('icon-preview').innerHTML = '<i class="ph ph-megaphone"></i>';
  var preview = document.getElementById('img-preview-el');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  var wrap = document.getElementById('current-img-wrap');
  if (wrap) wrap.style.display = 'none';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() { loadItems(); });

/*
  BACKEND API SUMMARY:
  GET    /actualite         → array of actualités
  POST   /actualite         → create
  PUT    /actualite/{id}    → update
  DELETE /actualite/{id}    → delete
  Image upload: FormData with "image" field
*/
