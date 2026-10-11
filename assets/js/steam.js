(() => {
  const root = document.querySelector("[data-steam-explorer]");
  const word = document.querySelector("[data-steam-trigger]");
  const reveal = document.getElementById("steam-reveal");

  if (!root || !word || !reveal) {
    return;
  }

  const tiles = [...root.querySelectorAll(".steam-tile")];
  const panels = [...root.querySelectorAll(".steam-panel")];
  const tablist = root.querySelector(".steam-tiles");

  const select = (index, focus) => {
    tiles.forEach((tile, i) => {
      const on = i === index;
      tile.setAttribute("aria-selected", String(on));
      tile.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) {
      tiles[index].focus();
    }
  };

  tablist.hidden = false;

  tiles.forEach((tile, i) => {
    tile.addEventListener("click", () => select(i));
    tile.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (step) {
        event.preventDefault();
        select((i + step + tiles.length) % tiles.length, true);
      } else if (event.key === "Home") {
        event.preventDefault();
        select(0, true);
      } else if (event.key === "End") {
        event.preventDefault();
        select(tiles.length - 1, true);
      }
    });
  });

  select(0);

  // La palabra STEAM del texto se vuelve un botón: cada letra con su color y un engranaje.
  const button = document.createElement("button");
  button.type = "button";
  button.className = "steam-trigger";
  button.setAttribute("aria-controls", reveal.id);
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "STEAM: ver qué significa cada letra");
  const colors = ["s", "t", "e", "a", "m"];
  button.innerHTML =
    "<span>" +
    [...word.textContent.trim()]
      .map((letter, n) => `<span class="steam-trigger-letter" aria-hidden="true" style="--c: var(--steam-${colors[n]}); --n: ${n}">${letter}</span>`)
      .join("") +
    "</span>" +
    '<svg class="steam-gear" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="3.38 3.38"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
  word.replaceWith(button);

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    reveal.hidden = !open;
    if (open) {
      // la ficha y el texto vuelven a entrar con su animación
      root.classList.remove("is-ready");
      void root.offsetWidth;
      root.classList.add("is-ready");
    }
  };

  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  setOpen(false);
})();
