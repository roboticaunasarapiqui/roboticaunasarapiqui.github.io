(() => {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  const meta = document.querySelector('meta[name="theme-color"]');

  if (!button) {
    return;
  }

  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : system.matches);

  // el botón refleja el tema activo y la barra del navegador toma el color de fondo real
  const sync = () => {
    button.setAttribute("aria-pressed", String(isDark()));
    meta?.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  };

  button.hidden = false;
  sync();

  button.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;

    try {
      localStorage.setItem("theme", next);
    } catch {
      // sin almacenamiento (modo privado): el cambio vale solo para esta visita
    }

    sync();
  });

  // sin elección guardada, seguir los cambios del sistema
  system.addEventListener("change", sync);
})();
