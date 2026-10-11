// Galería circular: las fotos avanzan solas en bucle, sin botones ni inicio manual.
// Se duplica la tira (la copia queda oculta para lectores de pantalla) y el CSS la desplaza
// exactamente una tira de ancho, así que el bucle no tiene salto. Se detiene al pasar el mouse,
// tocar o enfocar la galería. Con movimiento reducido, o sin JavaScript, queda una tira que se desliza.
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const speed = Number(carousel.dataset.speed) || 40; // píxeles por segundo

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  [...track.children].forEach((slide) => {
    const copy = slide.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelector("img").alt = "";
    track.append(copy);
  });

  carousel.classList.add("is-looping");
  track.removeAttribute("tabindex");

  // la duración sale del ancho de una tira, para que la velocidad sea la misma con 5 o con 20 fotos
  const setSpeed = () => {
    track.style.setProperty("--carousel-loop", `${track.offsetWidth / 2 / speed}s`);
  };

  setSpeed();
  window.addEventListener("resize", setSpeed);
  window.addEventListener("load", setSpeed);
});
