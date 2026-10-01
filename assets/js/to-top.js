(() => {
  const button = document.querySelector(".to-top");
  const footer = document.querySelector(".site-footer");

  if (!button) {
    return;
  }

  const SHOW_AFTER = 300;
  let queued = false;

  const update = () => {
    queued = false;
    button.classList.toggle("is-visible", window.scrollY > SHOW_AFTER);

    // sobre el footer (grafito) el botón cambia de color para no desaparecer
    const overFooter = footer && footer.getBoundingClientRect().top < button.getBoundingClientRect().bottom;
    button.classList.toggle("is-over-footer", Boolean(overFooter));
  };

  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
})();
