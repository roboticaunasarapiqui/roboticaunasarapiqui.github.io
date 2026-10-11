// Lluvia de ladrillos: window.bricks.burst(elemento, { colors, count }) lanza piezas de colores desde ese elemento.
// La usan las guías (módulo completo), el cartel de Contacto (correo copiado) y las letras de STEAM del inicio (clic).
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STEAM = ["s", "t", "e", "a", "m"];

  const burst = (source, options = {}) => {
    if (reduced.matches || !source) {
      return;
    }

    const box = source.getBoundingClientRect();
    const style = getComputedStyle(document.documentElement);
    const colors = options.colors || STEAM.map((key) => style.getPropertyValue(`--steam-${key}`).trim());
    const count = options.count || 14;
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    const layer = document.createElement("div");
    layer.className = "brick-burst";
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);

    let pending = count;

    for (let i = 0; i < count; i += 1) {
      const bit = document.createElement("i");
      bit.className = "brick-bit";
      bit.style.setProperty("--c", colors[i % colors.length]);
      layer.append(bit);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
      const speed = 140 + Math.random() * 230;
      const dx = Math.cos(angle) * speed;
      const up = Math.sin(angle) * speed;
      const fall = 260 + Math.random() * 260;
      const turn = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 420);
      const at = (px, py, deg) => `translate(${x + px}px, ${y + py}px) rotate(${deg}deg)`;

      const animation = bit.animate(
        [
          { transform: at(0, 0, 0), opacity: 1, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
          { transform: at(dx * 0.7, up, turn * 0.5), opacity: 1, offset: 0.4, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)" },
          { transform: at(dx, up + fall, turn), opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 500, delay: Math.random() * 90, fill: "both" },
      );

      animation.onfinish = () => {
        pending -= 1;
        if (pending === 0) {
          layer.remove();
        }
      };
    }
  };

  window.bricks = { burst };

  // Inicio: tocar una letra de STEAM lanza ladrillos de su color
  document.addEventListener("click", (event) => {
    const letter = event.target.closest(".steam-letter");
    if (letter) {
      burst(letter, { colors: [getComputedStyle(letter).color], count: 10 });
    }
  });

  // Contacto: al copiar el correo, la pantalla y el robot lo confirman, el robot salta y el cartel suelta ladrillos
  document.addEventListener("mail-copied", (event) => {
    const stage = event.target.closest(".contact-stage");
    if (!stage) {
      return;
    }

    // la pantalla del cartel y los ojos del robot confirman la copia un momento
    delete stage.dataset.copied;
    void stage.offsetWidth;
    stage.dataset.copied = "";
    clearTimeout(stage.copiedTimer);
    stage.copiedTimer = setTimeout(() => delete stage.dataset.copied, 2600);

    // Web Animations en vez de una clase CSS: una clase con su propia "animation" reemplazaría la de entrada
    // (roll-in) y, al quitarla, el robot volvería a entrar rodando.
    if (!reduced.matches) {
      stage.animate(
        [
          { translate: "0 0", scale: "1 1" },
          { translate: "0 -0.9rem", offset: 0.22 },
          { translate: "0 0", scale: "1.03 0.96", offset: 0.42 },
          { translate: "0 -0.45rem", scale: "1 1", offset: 0.62 },
          { translate: "0 0" },
        ],
        { duration: 1000, easing: "cubic-bezier(0.2, 0, 0, 1)" },
      );
      stage.querySelectorAll(".r-wheel").forEach((wheel) => {
        wheel.animate([{ rotate: "0deg" }, { rotate: "720deg" }], { duration: 800 });
      });
    }
    burst(stage.querySelector(".contact-sign"));
  });
})();
