(() => {
  const presentation = document.getElementById('presentation');
  const deck = document.getElementById('slides');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const progressFill = document.getElementById('progressFill');
  const counterCurrent = document.getElementById('counterCurrent');
  const counterTotal = document.getElementById('counterTotal');
  const currentTitle = document.getElementById('currentTitle');
  const hint = document.getElementById('hint');
  const prevZone = document.getElementById('prevZone');
  const nextZone = document.getElementById('nextZone');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const preloader = document.getElementById('preloader');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let isAnimating = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let viewportWidth = window.innerWidth;
  const total = slides.length;

  counterTotal.textContent = String(total).padStart(2, '0');
  deck.style.width = `${total * 100}vw`;

  function buildDots() {
    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
      dot.setAttribute('title', slide.dataset.title || `Diapositiva ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      dotsWrap.appendChild(dot);
    });
  }

  function replayAnimations(slide) {
    if (prefersReducedMotion || window.innerWidth <= 1024) return;

    const targets = slide.querySelectorAll('.animate, .clip-reveal, .scale-reveal, .swatch');
    targets.forEach((node) => {
      node.style.animation = 'none';
      void node.offsetWidth;
      node.style.animation = '';
    });
  }

  function updateTone() {
    const activeSlide = slides[current];
    const isDark = activeSlide.classList.contains('theme-dark');
    presentation.classList.toggle('ui-on-dark', isDark);
    presentation.classList.toggle('ui-on-light', !isDark);
  }

  function updateUI() {
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    Array.from(dotsWrap.children).forEach((dot, index) => {
      dot.classList.toggle('active', index === current);
    });

    counterCurrent.textContent = String(current + 1).padStart(2, '0');
    currentTitle.textContent = slides[current].dataset.title || 'Presentación';
    progressFill.style.width = `${((current + 1) / total) * 100}%`;
    deck.style.transform = `translate3d(${-current * viewportWidth}px, 0, 0)`;
    updateTone();
    replayAnimations(slides[current]);
  }

  function goTo(index) {
    if (index < 0 || index >= total || index === current || isAnimating) return;
    isAnimating = true;
    current = index;
    updateUI();
    window.setTimeout(() => {
      isAnimating = false;
    }, prefersReducedMotion ? 10 : 720);
  }

  function next() {
    if (current < total - 1) goTo(current + 1);
  }

  function prev() {
    if (current > 0) goTo(current - 1);
  }

  function toggleFullscreen() {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      root.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function onKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      next();
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      prev();
    }
    if (event.key.toLowerCase() === 'f') {
      toggleFullscreen();
    }
  }

  function onTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
  }

  function onTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) next();
    if (delta > 0) prev();
  }

  function onResize() {
    viewportWidth = window.innerWidth;
    deck.style.transition = 'none';
    deck.style.transform = `translate3d(${-current * viewportWidth}px, 0, 0)`;
    requestAnimationFrame(() => {
      deck.style.transition = '';
    });
  }

  function setupHint() {
    window.setTimeout(() => {
      hint.classList.add('hide');
    }, 3200);
  }

  function handleDeckClick(event) {
    if (event.target.closest('button, a, .scroll-shell')) return;
    if (window.innerWidth <= 768) return;
    const x = event.clientX;
    if (x > window.innerWidth * 0.66) next();
    if (x < window.innerWidth * 0.34) prev();
  }

  function runPreloader() {
    if (prefersReducedMotion) {
      preloader.classList.add('is-hidden');
      presentation.classList.remove('is-loading');
      return;
    }

    preloader.classList.add('is-phase-word');

    window.setTimeout(() => {
      preloader.classList.remove('is-phase-word');
      preloader.classList.add('is-phase-spinner');
    }, 1900);

    window.setTimeout(() => {
      preloader.classList.add('is-hidden');
      presentation.classList.remove('is-loading');
      updateUI();
    }, 3550);
  }

  buildDots();
  updateUI();
  setupHint();
  runPreloader();

  prevZone.addEventListener('click', prev);
  nextZone.addEventListener('click', next);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  window.addEventListener('keydown', onKeydown);
  deck.addEventListener('touchstart', onTouchStart, { passive: true });
  deck.addEventListener('touchend', onTouchEnd, { passive: true });
  deck.addEventListener('click', handleDeckClick);
  window.addEventListener('resize', onResize);

  const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('imageLightboxImg');
const lightboxClose = document.getElementById('imageLightboxClose');
const lightboxBackdrop = document.getElementById('imageLightboxBackdrop');

const zoomableSelector = [
  '.physical-hero__image',
  '.media-panel img',
  '.ghost-card img',
  '.mockup__brand-band img',
  '.mockup__floating-brand img',
  '.avatar-ring img',
  '.before-mini img'
].join(', ');

document.querySelectorAll(zoomableSelector).forEach((img) => {
  img.setAttribute('draggable', 'false');
});

document.addEventListener('contextmenu', (event) => {
  if (
    event.target.closest(zoomableSelector) ||
    event.target.closest('#imageLightboxImg')
  ) {
    event.preventDefault();
  }
});

document.addEventListener('dragstart', (event) => {
  if (
    event.target.closest(zoomableSelector) ||
    event.target.closest('#imageLightboxImg')
  ) {
    event.preventDefault();
  }
});

document.addEventListener('click', (event) => {
  const target = event.target.closest(zoomableSelector);
  if (!target) return;

  lightboxImg.src = target.currentSrc || target.src;
  lightboxImg.alt = target.alt || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
});

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
  lightboxImg.alt = '';
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
    closeLightbox();
  }
});

const brandBadge = document.querySelector('.brand-badge');
const mobileBadgeQuery = window.matchMedia('(max-width: 1024px) and (pointer: coarse)');
let brandBadgeTimer = null;

function closeBrandBadge() {
  if (!brandBadge) return;
  window.clearTimeout(brandBadgeTimer);
  brandBadge.classList.remove('is-open');
  brandBadge.setAttribute('aria-expanded', 'false');
}

function openBrandBadge() {
  if (!brandBadge || !mobileBadgeQuery.matches) return;

  window.clearTimeout(brandBadgeTimer);
  brandBadge.classList.add('is-open');
  brandBadge.setAttribute('aria-expanded', 'true');

  brandBadgeTimer = window.setTimeout(() => {
    closeBrandBadge();
  }, 3000);
}

function syncBrandBadgeMode() {
  if (!brandBadge) return;

  if (mobileBadgeQuery.matches) {
    brandBadge.setAttribute('role', 'button');
    brandBadge.setAttribute('tabindex', '0');
    brandBadge.setAttribute('aria-expanded', brandBadge.classList.contains('is-open') ? 'true' : 'false');
  } else {
    window.clearTimeout(brandBadgeTimer);
    brandBadge.classList.remove('is-open');
    brandBadge.removeAttribute('role');
    brandBadge.removeAttribute('tabindex');
    brandBadge.removeAttribute('aria-expanded');
  }
}

if (brandBadge) {
  brandBadge.addEventListener('click', (event) => {
    if (!mobileBadgeQuery.matches) return;
    event.preventDefault();
    event.stopPropagation();

    if (brandBadge.classList.contains('is-open')) {
      closeBrandBadge();
      return;
    }

    openBrandBadge();
  });

  brandBadge.addEventListener('keydown', (event) => {
    if (!mobileBadgeQuery.matches) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (brandBadge.classList.contains('is-open')) {
        closeBrandBadge();
        return;
      }

      openBrandBadge();
    }
  });

  if (typeof mobileBadgeQuery.addEventListener === 'function') {
    mobileBadgeQuery.addEventListener('change', syncBrandBadgeMode);
  } else {
    window.addEventListener('resize', syncBrandBadgeMode);
  }

  syncBrandBadgeMode();
}

})();
