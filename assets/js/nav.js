(() => {
  const header = document.querySelector(".site-header");
  const toggle = header?.querySelector(".nav-toggle");

  if (!header || !toggle) {
    console.error("nav.js: no se encontró .site-header con .nav-toggle");
    return;
  }

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  document.addEventListener("click", (event) => {
    if (isOpen() && !header.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
})();
