/* =============================================
   search.js
   Reusable search functionality for services
============================================= */

var API_BASE = 'https://empyrabackend-production.up.railway.app/api';

// Search services from API
async function searchServices(query) {
  const response = await fetch(API_BASE + '/services');
  if (!response.ok) throw new Error('Failed to fetch services');

  const services = await response.json();
  const lang = localStorage.getItem('emi_lang') || 'en';

  // Filter services based on search query
  const filteredServices = services.filter(function(service) {
    const title = (lang === 'fr' ? service.title_fr : service.title_en) || service.title || '';
    const description = (lang === 'fr' ? service.description_fr : service.description_en) || service.description || '';
    const category = service.category || '';

    const searchText = (title + ' ' + description + ' ' + category).toLowerCase();
    const searchQuery = query.toLowerCase();

    return searchText.includes(searchQuery);
  });

  return filteredServices.slice(0, 5); // Limit to 5 results
}

// Display search results in popup
function displaySearchResults(results, query) {
  const suggestionsDiv = document.querySelector('.search-suggestions');

  if (results.length === 0) {
    suggestionsDiv.innerHTML = '<div class="no-results">No services found for "' + query + '"</div>';
    return;
  }

  const lang = localStorage.getItem('emi_lang') || 'en';
  let html = '<div class="search-results-title">Services found:</div>';

  results.forEach(function(service) {
    const title = (lang === 'fr' ? service.title_fr : service.title_en) || service.title;
    const slug = service.slug || service.id;
    const image = service.image_url || 'https://via.placeholder.com/60x40?text=Service';

    html += `
      <a href="./services/service-detail.html?slug=${encodeURIComponent(slug)}" class="search-result-item">
        <img src="${image}" alt="${title}" class="search-result-img">
        <div class="search-result-content">
          <div class="search-result-title">${title}</div>
          <div class="search-result-category">${service.category || 'Service'}</div>
        </div>
      </a>
    `;
  });

  // Add "View all results" link
  html += `<a href="./services.html?q=${encodeURIComponent(query)}" class="search-view-all">View all services</a>`;

  suggestionsDiv.innerHTML = html;
}

// Initialize search functionality
function initSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchPopup = document.getElementById('search-popup');
  const searchInput = document.getElementById('search-input');
  const searchSubmit = document.getElementById('search-submit');

  if (!searchBtn || !searchPopup || !searchInput || !searchSubmit) return;

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

    // Show loading state
    searchSubmit.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    searchSubmit.disabled = true;

    // Search services from API
    searchServices(query).then(function(results) {
      displaySearchResults(results, query);
      searchSubmit.innerHTML = '<i class="fa fa-arrow-right"></i>';
      searchSubmit.disabled = false;
    }).catch(function(error) {
      console.error('Search error:', error);
      // Fallback to Google search
      window.open('https://www.google.com/search?q=site:emi.stevodigital.com+' + encodeURIComponent(query), '_blank');
      closeSearch();
      searchSubmit.innerHTML = '<i class="fa fa-arrow-right"></i>';
      searchSubmit.disabled = false;
    });
  }

  // Event listeners
  searchBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (searchPopup.classList.contains('active')) { closeSearch(); }
    else { openSearch(); }
  });

  searchPopup.addEventListener('click', function(e) { e.stopPropagation(); });

  searchSubmit.addEventListener('click', handleSearch);

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') closeSearch();
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (searchPopup && !searchPopup.contains(e.target) && !searchBtn.contains(e.target)) {
      closeSearch();
    }
  });

  // Close on escape
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
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}
