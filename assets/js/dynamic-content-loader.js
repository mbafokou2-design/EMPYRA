/* =============================================
   EMI — dynamic-content-loader.js
   Dynamically loads and renders:
   - Blog posts
   - Actualité/News
   - Mining Intelligence
   
   With loading animations and responsive layouts
============================================= */

var API_BASE = 'http://localhost:5000/api';

/* ── LANGUAGE HELPER ── */
function getLang() {
  return localStorage.getItem('emi_lang') || 'en';
}

function escHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── LOADING SKELETON ── */
function showLoadingSkeleton(containerId, count) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var skeleton = '<div class="skeleton-loader">';
  for (var i = 0; i < count; i++) {
    skeleton += '<div class="skeleton-card">' +
      '<div class="skeleton-img"></div>' +
      '<div class="skeleton-body">' +
      '<div class="skeleton-line" style="height:16px;width:60%;margin:0 auto 8px;"></div>' +
      '<div class="skeleton-line" style="height:13px;width:90%;margin:0 auto 6px;"></div>' +
      '<div class="skeleton-line" style="height:13px;width:75%;margin:0 auto;"></div>' +
      '</div></div>';
  }
  skeleton += '</div>';
  container.innerHTML = skeleton;
}

/* ── FORMAT DATE ── */
function formatDate(dateStr, lang) {
  if (!dateStr) return '—';
  try {
    var date = new Date(dateStr);
    return date.toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  } catch (e) {
    return '—';
  }
}

/* =============================================
   BLOG LOADER — /api/blog only
============================================= */
function loadBlogPosts(containerId) {
  showLoadingSkeleton(containerId, 3);
  
  fetch(API_BASE + '/blog')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to fetch blog');
      return res.json();
    })
    .then(function(posts) {
      // Filter by blog category if needed
      var blogOnly = Array.isArray(posts) ? posts.filter(function(p) {
        return p.status === 'published' && (p.category === 'blog' || p.category === 'Blog' || !p.category);
      }) : [];
      renderBlogPosts(containerId, blogOnly);
    })
    .catch(function(err) {
      console.error('Blog load error:', err);
      var container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="content-empty">' +
          '<p data-en="Unable to load blog posts." data-fr="Impossible de charger les articles.">Unable to load blog posts.</p>' +
        '</div>';
      }
    });
}

/* Alternative: Load blog and filter by category */
function loadBlogByCategory(containerId, category) {
  showLoadingSkeleton(containerId, 3);
  
  fetch(API_BASE + '/blog')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to fetch blog');
      return res.json();
    })
    .then(function(posts) {
      // Filter by specified category
      var filtered = Array.isArray(posts) ? posts.filter(function(p) {
        return p.status === 'published' && p.category === category;
      }) : [];
      renderBlogPosts(containerId, filtered);
    })
    .catch(function(err) {
      console.error('Blog load error:', err);
      var container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="content-empty">' +
          '<p data-en="Unable to load blog posts." data-fr="Impossible de charger les articles.">Unable to load blog posts.</p>' +
        '</div>';
      }
    });
}

function renderBlogPosts(containerId, posts) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var lang = getLang();
  // Already filtered before calling this function
  var published = Array.isArray(posts) ? posts : [];

  if (published.length === 0) {
    container.innerHTML = '<div class="content-empty">' +
      '<p data-en="No blog posts available." data-fr="Aucun article disponible.">No blog posts available.</p>' +
    '</div>';
    return;
  }

  var html = published.map(function(post, idx) {
    var title = lang === 'fr' ? post.title_fr : post.title_en;
    var text = lang === 'fr' ? post.text_fr : post.text_en;
    var category = post.category || 'Blog';
    var date = formatDate(post.createdAt || post.created_at, lang);
    var image = post.image_url || 'https://via.placeholder.com/400x250?text=Blog';
    var icon = post.icon || 'fa-newspaper';

    return '<div class="blog-card" style="opacity:0;transform:translateY(20px);animation:slideUp 0.5s ' + (idx * 0.08) + 's forwards;">' +
      '<div class="blog-card-img" style="background-image:url(\'' + image + '\');background-size:cover;background-position:center;">' +
        '<i class="fa ' + icon + '" style="font-size:3rem;color:rgba(255,255,255,0.08);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></i>' +
        '<span class="blog-cat">' + escHtml(category) + '</span>' +
      '</div>' +
      '<div class="blog-body">' +
        '<div class="blog-meta">' +
          '<span><i class="fa fa-calendar"></i> ' + date + '</span>' +
          '<span><i class="fa fa-user"></i> EMI Team</span>' +
        '</div>' +
        '<h3>' + escHtml(title) + '</h3>' +
        '<p>' + escHtml(text.substring(0, 150)) + '...</p>' +
        '<a href="#" class="blog-card-link">Read More <i class="fa fa-arrow-right"></i></a>' +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML = html;
  
  // Re-apply language switching
  if (typeof setLang === 'function') setLang(lang);
}

/* =============================================
   ACTUALITÉ LOADER — /api/actualite only
============================================= */
function loadActualites(containerId) {
  showLoadingSkeleton(containerId, 3);
  
  fetch(API_BASE + '/actualite')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to fetch actualités');
      return res.json();
    })
    .then(function(items) {
      // Filter only actualité type items
      var actualiteOnly = Array.isArray(items) ? items.filter(function(i) {
        return i.status === 'published';
      }) : [];
      renderActualites(containerId, actualiteOnly);
    })
    .catch(function(err) {
      console.error('Actualité load error:', err);
      var container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="content-empty">' +
          '<p data-en="Unable to load news." data-fr="Impossible de charger les actualités.">Unable to load news.</p>' +
        '</div>';
      }
    });
}

/* Alternative: Load from blog but filter for actualité category */
function loadActualitiesFromBlog(containerId) {
  showLoadingSkeleton(containerId, 3);
  
  fetch(API_BASE + '/blog')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to fetch blog');
      return res.json();
    })
    .then(function(items) {
      // Filter only actualité type items
      var actualiteOnly = Array.isArray(items) ? items.filter(function(i) {
        return i.status === 'published' && (i.category === 'actualite' || i.category === 'Actualité' || i.category === 'news');
      }) : [];
      renderActualites(containerId, actualiteOnly);
    })
    .catch(function(err) {
      console.error('Actualité load error:', err);
      var container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="content-empty">' +
          '<p data-en="Unable to load news." data-fr="Impossible de charger les actualités.">Unable to load news.</p>' +
        '</div>';
      }
    });
}

function renderActualites(containerId, items) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var lang = getLang();
  // Already filtered before calling this function
  var published = Array.isArray(items) ? items : [];

  if (published.length === 0) {
    container.innerHTML = '<div class="content-empty">' +
      '<p data-en="No news available." data-fr="Aucune actualité disponible.">No news available.</p>' +
    '</div>';
    return;
  }

  var html = published.map(function(item, idx) {
    var title = lang === 'fr' ? item.title_fr : item.title_en;
    var text = lang === 'fr' ? item.text_fr : item.text_en;
    var category = item.category || 'News';
    var date = formatDate(item.createdAt || item.created_at, lang);
    var image = item.image_url || 'https://via.placeholder.com/400x250?text=News';
    var icon = item.icon || 'fa-megaphone';

    return '<div class="blog-card actualite-card" style="opacity:0;transform:translateY(20px);animation:slideUp 0.5s ' + (idx * 0.08) + 's forwards;">' +
      '<div class="blog-card-img" style="background-image:url(\'' + image + '\');background-size:cover;background-position:center;">' +
        '<i class="fa ' + icon + '" style="font-size:3rem;color:rgba(255,255,255,0.08);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></i>' +
        '<span class="blog-cat">' + escHtml(category) + '</span>' +
      '</div>' +
      '<div class="blog-body">' +
        '<div class="blog-meta">' +
          '<span><i class="fa fa-calendar"></i> ' + date + '</span>' +
          '<span><i class="fa fa-user"></i> EMI Team</span>' +
        '</div>' +
        '<h3>' + escHtml(title) + '</h3>' +
        '<p>' + escHtml(text.substring(0, 150)) + '...</p>' +
        '<a href="#" class="blog-card-link">Read More <i class="fa fa-arrow-right"></i></a>' +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML = html;
  
  // Re-apply language switching
  if (typeof setLang === 'function') setLang(lang);
}
function loadBlogAndActualites(containerId) {
  showLoadingSkeleton(containerId, 4);

  Promise.allSettled([
    fetch(API_BASE + '/blog'),
    fetch(API_BASE + '/actualite')
  ]).then(function(results) {
    var blogItems = [];
    var actualiteItems = [];
    var fetchTasks = [];

    if (results[0].status === 'fulfilled') {
      var blogRes = results[0].value;
      if (blogRes.ok) {
        fetchTasks.push(blogRes.json().then(function(posts) {
          blogItems = Array.isArray(posts) ? posts.filter(function(p) {
            return p.status === 'published';
          }) : [];
        }).catch(function() {
          blogItems = [];
        }));
      }
    }

    if (results[1].status === 'fulfilled') {
      var actualiteRes = results[1].value;
      if (actualiteRes.ok) {
        fetchTasks.push(actualiteRes.json().then(function(items) {
          actualiteItems = Array.isArray(items) ? items.filter(function(i) {
            return i.status === 'published';
          }) : [];
        }).catch(function() {
          actualiteItems = [];
        }));
      }
    }

    Promise.all(fetchTasks).then(function() {
      var combined = blogItems.concat(actualiteItems);
      if (combined.length === 0) {
        var container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '<div class="content-empty">' +
            '<p data-en="No updates available." data-fr="Aucune mise à jour disponible.">No updates available.</p>' +
          '</div>';
        }
        return;
      }

      combined.sort(function(a, b) {
        var dateA = new Date(a.createdAt || a.created_at || a.date || 0);
        var dateB = new Date(b.createdAt || b.created_at || b.date || 0);
        return dateB - dateA;
      });

      renderBlogPosts(containerId, combined);
      if (typeof window.reinitBlogSlider === 'function') {
        window.reinitBlogSlider();
      }
    }).catch(function(err) {
      console.error('Combined blog/news processing error:', err);
      var container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="content-empty">' +
          '<p data-en="Unable to load updates." data-fr="Impossible de charger les mises à jour.">Unable to load updates.</p>' +
        '</div>';
      }
    });
  }).catch(function(err) {
    console.error('Combined blog/news load error:', err);
    var container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div class="content-empty">' +
        '<p data-en="Unable to load updates." data-fr="Impossible de charger les mises à jour.">Unable to load updates.</p>' +
      '</div>';
    }
  });
}
/* =============================================
   INTELLIGENCE LOADER (Slider format)
============================================= */
function loadIntelligence(trackId) {
  var track = document.getElementById(trackId);
  if (!track) return;

  // Show loading state
  track.innerHTML = '<div class="intel-loading" style="text-align:center;padding:40px;color:var(--gray);">' +
    '<i class="fa fa-spinner fa-spin" style="font-size:2rem;margin-bottom:16px;"></i>' +
    '<p data-en="Loading intelligence…" data-fr="Chargement de l\'intelligence…">Loading intelligence…</p>' +
  '</div>';

  fetch(API_BASE + '/intelligence')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to fetch intelligence');
      return res.json();
    })
    .then(function(items) {
      renderIntelligenceSlides(trackId, items);
    })
    .catch(function(err) {
      console.error('Intelligence load error:', err);
      track.innerHTML = '<div class="intel-empty" style="text-align:center;padding:40px;color:var(--gray);">' +
        '<p data-en="Unable to load mining intelligence." data-fr="Impossible de charger l\'intelligence minière.">Unable to load mining intelligence.</p>' +
      '</div>';
    });
}

function renderIntelligenceSlides(trackId, items) {
  var track = document.getElementById(trackId);
  if (!track) return;

  var lang = getLang();
  var published = Array.isArray(items)
    ? items.filter(function(i) { return i.status === 'published'; })
    : [];

  if (published.length === 0) {
    track.innerHTML = '<div class="intel-empty" style="text-align:center;padding:40px;color:var(--gray);">' +
      '<p data-en="No intelligence available." data-fr="Aucune intelligence disponible.">No intelligence available.</p>' +
    '</div>';
    return;
  }

  var html = published.map(function(item, idx) {
    var title = lang === 'fr' ? item.title_fr : item.title_en;
    var text = lang === 'fr' ? item.text_fr : item.text_en;
    var image = item.image_url || '';
    var icon = item.icon || 'fa-brain';

    return '<div class="intel-slide intel-slide-' + (idx + 1) + '" style="opacity:0;animation:fadeIn 0.6s ' + (idx * 0.1) + 's forwards;">' +
      '<div class="container">' +
        '<div class="intel-grid">' +
          '<div class="intel-content">' +
            '<div class="section-tag">' + escHtml(title.substring(0, 30)) + '</div>' +
            '<h2 class="section-title light">' + escHtml(title) + '</h2>' +
            '<div class="section-divider" style="margin-left:0; margin-bottom:18px;"></div>' +
            '<p>' + escHtml(text.substring(0, 300)) + '...</p>' +
            '<a href="#" class="btn btn-primary"><i class="fa ' + icon + '"></i> <span data-en="Learn More" data-fr="En Savoir Plus">Learn More</span></a>' +
          '</div>' +
          '<div class="intel-visual" style="background-image:url(\'' + image + '\');background-size:cover;background-position:center;background-repeat:no-repeat;">' +
            '<i class="intel-visual-icon fa ' + icon + '"></i>' +
            '<div class="intel-visual-overlay"></div>' +
            '<div class="intel-visual-badge">' + escHtml(item.category || 'Intelligence') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  track.innerHTML = html;
  
  // Update dots count based on number of items
  var dotsContainer = track.parentElement.querySelector('.intel-slider-nav');
  if (dotsContainer) {
    // Remove old dots (keep arrows)
    var oldDots = dotsContainer.querySelectorAll('.intel-dot');
    oldDots.forEach(function(dot) { dot.remove(); });
    
    // Create new dots
    var dotsHtml = '';
    for (var i = 0; i < published.length; i++) {
      dotsHtml += '<button class="intel-dot ' + (i === 0 ? 'active' : '') + '" data-intel="' + i + '"></button>';
    }
    
    var prevBtn = dotsContainer.querySelector('#intel-prev');
    var nextBtn = dotsContainer.querySelector('#intel-next');
    
    // Clear container except arrows
    dotsContainer.innerHTML = '';
    if (prevBtn) dotsContainer.appendChild(prevBtn.cloneNode(true));
    
    var dotsDiv = document.createElement('div');
    dotsDiv.innerHTML = dotsHtml;
    while (dotsDiv.firstChild) {
      dotsContainer.appendChild(dotsDiv.firstChild);
    }
    
    if (nextBtn) dotsContainer.appendChild(nextBtn.cloneNode(true));
  }
  
  // Re-apply language switching
  if (typeof setLang === 'function') setLang(lang);
  
  // Reinitialize slider with new dot count
  setTimeout(function() {
    if (typeof window.reinitIntelSlider === 'function') {
      window.reinitIntelSlider();
    }
  }, 50);
}

/* =============================================
   ANIMATION STYLES (inject into page)
============================================= */
function injectAnimationStyles() {
  if (document.getElementById('dynamic-loader-styles')) return; // Already injected
  
  var style = document.createElement('style');
  style.id = 'dynamic-loader-styles';
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .skeleton-loader {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    
    .skeleton-card {
      background: var(--bg-light, #f5f5f5);
      border-radius: 8px;
      overflow: hidden;
      animation: pulse 1.5s infinite;
    }
    
    .skeleton-img {
      height: 200px;
      background: var(--gray-light, #ddd);
    }
    
    .skeleton-body {
      padding: 16px;
    }
    
    .skeleton-line {
      height: 12px;
      background: var(--gray-light, #ddd);
      border-radius: 4px;
      margin-bottom: 8px;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    
    .content-empty {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted, #999);
    }
    
    .content-empty p {
      font-size: 1rem;
      margin: 0;
    }
  `;
  document.head.appendChild(style);
}

// Inject styles on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAnimationStyles);
} else {
  injectAnimationStyles();
}
