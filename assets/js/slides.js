/* =============================================
   slides.js
   Dynamically loads additional hero slides from the dashboard API.
============================================= */

var API_BASE = 'http://localhost:5000/api';

function apiFetch(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}

async function loadSlides() {
  try {
    const slidesData = await apiFetch(API_BASE + '/slides');
    const sliderTrack = document.getElementById('slider-track');
    const sliderDots = document.querySelector('.slider-dots');

    let slideIndex = 3; // starting from 3 since 0,1,2 are static

    slidesData.forEach(function(slideData) {
      // create slide HTML
      const slideDiv = document.createElement('div');
      slideDiv.className = 'slide slide-' + (slideIndex + 1);
      slideDiv.innerHTML = `
        <div class="slide-img-placeholder"></div>
        <img class="slide-img" src="${escHtml(slideData.image)}" alt="${escHtml(slideData.title)}">
        <div class="container">
          <div class="slide-content">
            <div class="slide-eyebrow" data-en="Our Services" data-fr="Nos Services">Our Services</div>
            <h1 data-en="${escHtml(slideData.title)}" data-fr="${escHtml(slideData.title_fr || slideData.title)}">${escHtml(slideData.title)}</h1>
            <p data-en="${escHtml(slideData.description)}" data-fr="${escHtml(slideData.description_fr || slideData.description)}">${escHtml(slideData.description)}</p>
            <div class="slide-btns">
              <a href="${escHtml(slideData.link)}" class="btn btn-outline">
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
    console.error('Error loading slides:', error);
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

loadSlides();