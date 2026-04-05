(() => {
  const deck = document.getElementById('slides');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const progressFill = document.getElementById('progressFill');
  const counterCurrent = document.getElementById('counterCurrent');
  const counterTotal = document.getElementById('counterTotal');
  const hint = document.getElementById('hint');
  const prevZone = document.getElementById('prevZone');
  const nextZone = document.getElementById('nextZone');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
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
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      dotsWrap.appendChild(dot);
    });
  }

  function refreshAnimations(slide) {
    const targets = slide.querySelectorAll('.animate, .clip-reveal, .scale-reveal, .swatch');
    targets.forEach((node) => {
      node.style.animation = 'none';
      void node.offsetWidth;
      node.style.animation = '';
    });
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
    progressFill.style.width = `${((current + 1) / total) * 100}%`;
    deck.style.transform = `translate3d(${-current * viewportWidth}px, 0, 0)`;
    refreshAnimations(slides[current]);
  }

  function goTo(index) {
    if (index < 0 || index >= total || index === current || isAnimating) return;
    isAnimating = true;
    current = index;
    updateUI();
    window.setTimeout(() => {
      isAnimating = false;
    }, prefersReducedMotion ? 20 : 720);
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
    }, 3000);
  }

  function handleDeckClick(event) {
    if (event.target.closest('button, a')) return;
    if (window.innerWidth <= 768) return;
    const x = event.clientX;
    if (x > window.innerWidth * 0.64) next();
    if (x < window.innerWidth * 0.36) prev();
  }

  buildDots();
  updateUI();
  setupHint();

  prevZone.addEventListener('click', prev);
  nextZone.addEventListener('click', next);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  deck.addEventListener('touchstart', onTouchStart, { passive: true });
  deck.addEventListener('touchend', onTouchEnd, { passive: true });
  deck.addEventListener('click', handleDeckClick);
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', onResize);
})();
