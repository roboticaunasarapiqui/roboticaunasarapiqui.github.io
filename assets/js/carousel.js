document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const controls = carousel.querySelector(".carousel-controls");
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const toggle = carousel.querySelector("[data-carousel-toggle]");
  const current = carousel.querySelector("[data-carousel-current]");
  const slides = [...track.children];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = Number(carousel.dataset.autoplay) || 0;
  let queued = false;
  let paused = false; // con movimiento reducido también avanza, pero de golpe y sin deslizar (ver scrollTo)
  let onScreen = false;

  const atStart = () => track.scrollLeft <= 1;
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  const scrollTo = (left) => track.scrollTo({ left, behavior: reducedMotion.matches ? "auto" : "smooth" });

  // la foto cuyo borde izquierdo queda más cerca del borde de la tira
  const leading = () => {
    const distances = slides.map((slide) => Math.abs(slide.offsetLeft - track.scrollLeft));
    return distances.indexOf(Math.min(...distances));
  };

  const update = () => {
    queued = false;
    current.textContent = (atEnd() ? slides.length - 1 : leading()) + 1;
    prev.setAttribute("aria-disabled", String(atStart()));
    next.setAttribute("aria-disabled", String(atEnd()));
  };

  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  // aria-disabled y no disabled: el botón conserva el foco al llegar a un extremo
  const go = (button, step) => {
    if (button.getAttribute("aria-disabled") === "true") {
      return;
    }

    scrollTo(slides[Math.min(Math.max(leading() + step, 0), slides.length - 1)].offsetLeft);
  };

  const setPaused = (value) => {
    paused = value;
    toggle.dataset.playing = String(!value);
    toggle.setAttribute("aria-label", value ? "Reanudar el avance automático" : "Pausar el avance automático");
  };

  // Avance automático: se detiene si la persona toma el control (flechas, arrastre, rueda, teclado
  // o el botón de pausa), la pestaña queda oculta o el carrusel sale de pantalla.
  const tick = () => {
    if (paused || document.hidden || !onScreen) {
      return;
    }

    if (atEnd()) {
      scrollTo(0);
    } else {
      go(next, 1);
    }
  };

  prev.addEventListener("click", () => {
    if (interval) {
      setPaused(true);
    }
    go(prev, -1);
  });

  next.addEventListener("click", () => {
    if (interval) {
      setPaused(true);
    }
    go(next, 1);
  });

  track.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  if (interval) {
    toggle.hidden = false;
    setPaused(paused);

    toggle.addEventListener("click", () => setPaused(!paused));

    // tocar, usar la rueda o el teclado sobre la tira es tomar el control
    ["pointerdown", "wheel", "keydown"].forEach((type) => {
      track.addEventListener(type, () => setPaused(true), { passive: true });
    });

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    }, { threshold: 0.3 }).observe(carousel);

    setInterval(tick, interval);
  }

  controls.hidden = false;
  update();
});
