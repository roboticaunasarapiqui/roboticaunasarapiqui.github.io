// Los robots miran hacia el cursor: mueve las pupilas con --lx y --ly (de -1 a 1, ver .r-pupil en components.css).
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const REACH = 260; // a esta distancia (px) las pupilas llegan al borde del ojo
  let point = null;
  let queued = false;

  const look = () => {
    queued = false;

    document.querySelectorAll(".robot").forEach((robot) => {
      const box = robot.getBoundingClientRect();

      if (box.bottom < 0 || box.top > innerHeight) {
        return;
      }

      const dx = point.x - (box.left + box.width / 2);
      const dy = point.y - (box.top + box.height * 0.4);
      const distance = Math.hypot(dx, dy) || 1;
      const strength = Math.min(distance / REACH, 1);

      robot.style.setProperty("--lx", ((dx / distance) * strength).toFixed(2));
      robot.style.setProperty("--ly", ((dy / distance) * strength).toFixed(2));
    });
  };

  addEventListener(
    "pointermove",
    (event) => {
      point = { x: event.clientX, y: event.clientY };
      if (!queued) {
        queued = true;
        requestAnimationFrame(look);
      }
    },
    { passive: true },
  );
})();
