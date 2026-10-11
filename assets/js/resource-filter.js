(() => {
  const bar = document.querySelector("[data-resource-filter]");

  if (!bar) {
    return;
  }

  const rows = [...document.querySelectorAll(".resource-row")];
  const groups = [...document.querySelectorAll("[data-resource-group]")];
  const status = bar.querySelector(".filter-status");
  const chips = [...bar.querySelectorAll(".chip")];

  const apply = (platform) => {
    let shown = 0;

    // los recursos sin plataforma (por ejemplo, los que se piden por correo) solo se ven en «Todos»
    rows.forEach((row) => {
      const match = platform === "all" || row.dataset.platform === platform;
      row.hidden = !match;
      if (match) {
        shown += 1;
      }
    });

    groups.forEach((group) => {
      group.hidden = !group.querySelector(".resource-row:not([hidden])");
    });

    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.platform === platform)));
    status.textContent = platform === "all" ? "" : shown + (shown === 1 ? " recurso" : " recursos");
  };

  bar.hidden = false;
  chips.forEach((chip) => chip.addEventListener("click", () => apply(chip.dataset.platform)));
  apply("all");
})();
