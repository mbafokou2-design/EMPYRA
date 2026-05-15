/* =============================================
   slides.js
   Dynamically loads hero slides from services API.
============================================= */

var API_BASE = 'https://empyrabackend-production.up.railway.app/api';

function apiFetch(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}

async function loadSlides() {
  try {
    const servicesData = await apiFetch(API_BASE + '/services');
    const sliderTrack = document.getElementById('slider-track');
    const sliderDots = document.querySelector('.slider-dots');

    // Don't clear existing slides - keep the first 3 static slides
    // Just append dynamic slides after them

    // Filter published services and limit to first few for slides
    const publishedServices = servicesData.filter(function(service) {
      return service.status === 'published';
    }).slice(0, 6); // Limit to 6 services for slides

    let slideIndex = 3; // starting from 3 since 0,1,2 are static slides

    publishedServices.forEach(function(service) {
      // create slide HTML
      const slideDiv = document.createElement('div');
      slideDiv.className = 'slide slide-' + (slideIndex + 1);
      const title = (localStorage.getItem('emi_lang') === 'fr' ? service.title_fr : service.title_en) || service.title;
      const description = (localStorage.getItem('emi_lang') === 'fr' ? service.description_fr : service.description_en) || service.description;
      const image = service.image_url || 'https://via.placeholder.com/1920x1080?text=Service';

      slideDiv.innerHTML = `
        <div class="slide-img-placeholder"></div>
        <img class="slide-img" src="${escHtml(image)}" alt="${escHtml(title)}">
        <div class="container">
          <div class="slide-content">
            <div class="slide-eyebrow" data-en="Our Services" data-fr="Nos Services">Our Services</div>
            <h1 data-en="${escHtml(service.title_en || service.title)}" data-fr="${escHtml(service.title_fr || service.title)}">${escHtml(title)}</h1>
            <p data-en="${escHtml(service.description_en || service.description)}" data-fr="${escHtml(service.description_fr || service.description)}">${escHtml(description)}</p>
            <div class="slide-btns">
              <a href="./services/service-detail.html?slug=${escHtml(service.slug || service.id)}" class="btn btn-outline">
                <i class="fa fa-arrow-right"></i>
                <span data-en="Discover the Service" data-fr="Découvrir le Service">Discover the Service</span>
              </a>
            </div>
          </div>
        </div>
      `;
      sliderTrack.appendChild(slideDiv);

      // create dot
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.dataset.index = slideIndex;
      dot.setAttribute('aria-label', 'Slide ' + (slideIndex + 1));
      sliderDots.appendChild(dot);

      slideIndex++;
    });

    // update the global variables
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');

    // re-add event listeners for dots
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() { goToSlide(+dot.dataset.index); resetAuto(); });
    });

    // restart auto slide
    clearInterval(autoSlide);
    startAuto();

  } catch (error) {
    console.error('Error loading services for slides:', error);
  }
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

// loadSlides() will be called from main.js
