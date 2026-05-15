/* =============================================
   service-links.js
   Converts legacy service page URLs into the new slug-based
   dynamic service detail route on pages that still contain old
   static anchors.
============================================= */

var SERVICE_SLUG_MAP = {
  'service-environmental-geochemistry.html': 'environmental-geochemistry-dma',
  'service-social-environmental.html': 'environmental-social-management',
  'service-water.html': 'mine-water-management',
  'service-institutional-support.html': 'institutional-support-advocacy',
  'service-modeling.html': 'mineral-resource-modeling-estimation',
  'service-research-development.html': 'research-development',
  'service-feasibility.html': 'feasibility-studies',
  'service-exploration.html': 'exploration-services',
  'service-traning.html': 'training',
  'service-audit.html': 'independent-expertise-audits',
  'service-risk.html': 'risk-management',
  'service-contaminated-sites.html': 'contaminated-site-assessment',
  'service-traceability.html': 'mineral-resource-traceability',
  'service-operations.html': 'mining-operations-assistance',
  'service-openpit.html': 'open-pit-mines',
  'service-underground.html': 'underground-mines',
  'services-rock.html': 'tailings-waste-rock-engineering',
  'service-closure.html': 'mine-closure-rehabilitation'
};

/* ─── ROOT_URL: always points to the project root ───────────────────
   Walks up the pathname and stops just before /services/
   Works for file://, localhost, and deployed domains.

   Example (local):
     file:///C:/Users/STEVODIGITAL/EMPYRA/services/service-detail.html
     → ROOT_URL = "file:///C:/Users/STEVODIGITAL/EMPYRA/"

   Example (deployed):
     https://emi.stevodigital.com/services/service-detail.html
     → ROOT_URL = "https://emi.stevodigital.com/"
──────────────────────────────────────────────────────────────────── */
var ROOT_URL = (function () {
  var loc   = window.location;
  var parts = loc.pathname.split('/');
  var root  = [];
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].toLowerCase() === 'services') break;
    root.push(parts[i]);
  }
  return loc.protocol + '//' + loc.host + root.join('/') + '/';
})();

function buildServiceDetailUrl(slug) {
  return ROOT_URL + 'services/service-detail.html?slug=' + encodeURIComponent(slug);
}

function normalizeServiceHref(href) {
  var normalized = href.trim().replace(/^[^\w]*(\.\.\/|\.\/)?/, '');
  var match = normalized.match(/^(?:services\/)?((?:service|services)-[^?#]+\.html)/i);
  return match ? match[1].toLowerCase() : null;
}

function rewriteLegacyServiceLinks() {
  var links = document.querySelectorAll('a[href]');
  var serviceLinks = [];

  links.forEach(function(link) {
    var href = link.getAttribute('href');
    if (!href || href.indexOf('service-') === -1) return;

    var fileName = normalizeServiceHref(href);
    if (!fileName) return;

    var slug = SERVICE_SLUG_MAP[fileName];
    if (slug) {
      link.setAttribute('href', buildServiceDetailUrl(slug));
      return;
    }

    serviceLinks.push({ link: link, fileName: fileName });
  });

  if (serviceLinks.length === 0) return;

  /* Attempt a fallback using the API if any legacy anchors remain. */
  if (typeof fetch !== 'function') return;

  fetch('https://empyrabackend-production.up.railway.app/services')
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(services) {
      var slugCandidates = services.map(function(service) {
        return {
          slug: service.slug,
          title: (service.title_en || '') + ' ' + (service.title_fr || ''),
          category: service.category || ''
        };
      });

      serviceLinks.forEach(function(item) {
        var key = item.fileName.replace(/\.html$/, '');
        var sourceWords = key.replace(/^(?:service|services)-/, '').split(/[-_]+/).filter(Boolean);

        var best = slugCandidates.find(function(candidate) {
          var slug = candidate.slug || '';
          return sourceWords.every(function(word) {
            return slug.indexOf(word) !== -1 || candidate.title.toLowerCase().indexOf(word) !== -1;
          });
        });

        if (best && best.slug) {
          item.link.setAttribute('href', buildServiceDetailUrl(best.slug));
        }
      });
    })
    .catch(function(err) {
      console.warn('service-links.js: failed to resolve legacy service URLs', err);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rewriteLegacyServiceLinks);
} else {
  rewriteLegacyServiceLinks();
}