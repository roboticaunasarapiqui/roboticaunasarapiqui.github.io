// Piezas de electrónica de «¿Qué significa STEAM?» (_includes/pieza.html): las que se tocan responden.
//   LED (Arte): se encienden al tocarlos; al encender los cinco salen ladrillos y se apagan.
//   Servo (Ingeniería): detiene o reanuda su giro.
//   Placa Arduino (Tecnología): su LED parpadea rápido un momento.
//   Pantalla (Matemáticas): cambia los cm que se avanzan y calcula las vueltas de una rueda de EV3 (17,6 cm).
//   Sensor (Ciencia): la pantalla mide la distancia del cursor al sensor.
(() => {
  const WHEEL_CM = 17.6; // perímetro de la rueda del EV3 (5,6 cm de diámetro)

  const toggleLed = (led) => {
    const on = led.classList.toggle("is-on");
    led.setAttribute("aria-pressed", String(on));

    const all = [...led.parentElement.querySelectorAll(".led")];
    if (all.every((item) => item.classList.contains("is-on"))) {
      if (window.bricks) {
        window.bricks.burst(led.closest("svg"));
      }
      setTimeout(() => {
        all.forEach((item) => {
          item.classList.remove("is-on");
          item.setAttribute("aria-pressed", "false");
        });
      }, 1800);
    }
  };

  const distances = [50, 100, 150, 20];
  let distance = 0;

  const formatTurns = (cm) => (cm / WHEEL_CM).toFixed(1).replace(".", ",");

  document.addEventListener("click", (event) => {
    const led = event.target.closest(".led");
    if (led) {
      toggleLed(led);
      return;
    }

    const piece = event.target.closest(".steam-piece");
    if (!piece) {
      return;
    }

    if (piece.dataset.pieza === "servo") {
      const paused = piece.classList.toggle("is-paused");
      piece.setAttribute("aria-pressed", String(paused));
    } else if (piece.dataset.pieza === "arduino") {
      piece.classList.add("is-fast");
      setTimeout(() => piece.classList.remove("is-fast"), 1800);
    } else if (piece.dataset.pieza === "lcd") {
      distance = (distance + 1) % distances.length;
      const cm = distances[distance];
      piece.querySelector("[data-lcd-1]").textContent = `AVANZAR ${cm} CM`;
      piece.querySelector("[data-lcd-2]").textContent = `= ${formatTurns(cm)} VUELTAS`;
    }
  });

  document.addEventListener("keydown", (event) => {
    const led = event.target.closest && event.target.closest(".led");
    if (led && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggleLed(led);
    }
  });

  const sensor = document.querySelector('[data-pieza="sensor"]');

  if (sensor) {
    const line1 = sensor.querySelector("[data-lcd-1]");
    const line2 = sensor.querySelector("[data-lcd-2]");
    const body = sensor.querySelector(".c-us");
    const RANGE = 360; // px
    let point = null;
    let queued = false;

    const measure = () => {
      queued = false;

      // con el panel cerrado no hay nada que medir
      if (!sensor.offsetParent) {
        return;
      }

      const box = body.getBoundingClientRect();
      const px = Math.hypot(point.x - (box.left + box.width / 2), point.y - (box.top + box.height / 2));

      if (px < RANGE) {
        const cm = Math.max(2, Math.round(px / 8));
        line1.textContent = `DIST: ${cm} CM`;
        line2.textContent = cm < 10 ? "MUY CERCA" : "DETECTADO";
      } else {
        line1.textContent = "DIST: --- CM";
        line2.textContent = "SIN OBJETO";
      }
    };

    addEventListener(
      "pointermove",
      (event) => {
        point = { x: event.clientX, y: event.clientY };
        if (!queued) {
          queued = true;
          requestAnimationFrame(measure);
        }
      },
      { passive: true },
    );
  }
})();
