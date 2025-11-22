(function () {
  function loadComponent(file, elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Elemento con id "${elementId}" no encontrado`);
      return;
    }

    const isLocal = window.location.protocol === "file:";

    if (isLocal) {
      console.warn(
        "Modo local detectado. El fetch puede no funcionar. Usa un servidor local."
      );
    }

    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error al cargar ${file}: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((data) => {
        if (data && data.trim()) {
          element.innerHTML = data;
          if (callback) {
            callback();
          }
        } else {
          throw new Error(`El archivo ${file} está vacío`);
        }
      })
      .catch((error) => {
        console.error(`Error cargando ${file}:`, error);
        console.error("Detalles:", {
          protocol: window.location.protocol,
          pathname: window.location.pathname,
          file: file,
        });
        element.innerHTML = `<div style="padding: 1rem; background: #fee; color: #c00; border: 1px solid #c00; border-radius: 4px; margin: 1rem;">
          <strong>Error al cargar ${file}</strong><br>
          ${
            isLocal
              ? "Estás abriendo el archivo localmente. Usa un servidor local (ej: python -m http.server) o sube los archivos a GitHub Pages."
              : "Por favor, recarga la página o verifica que el archivo existe."
          }
        </div>`;
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    setTimeout(function () {
      loadComponent("header.html", "header-placeholder", function () {
        setTimeout(function () {
          markActivePage();
          initHamburgerMenu();
        }, 50);
      });

      loadComponent("footer.html", "footer-placeholder");
    }, 10);
  }
})();

function markActivePage() {
  const currentPath = window.location.pathname;
  const currentPage =
    currentPath.split("/").pop().replace(".html", "") || "index";

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("data-page");
    if (
      linkPage === currentPage ||
      (currentPage === "" && linkPage === "index") ||
      (currentPath.endsWith("/") && linkPage === "index")
    ) {
      link.classList.add("active");
    }
  });
}

function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      const isActive = hamburger.classList.toggle("active");
      nav.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isActive);
    });

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
          hamburger.classList.remove("active");
          nav.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (window.innerWidth <= 768) {
        if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
          hamburger.classList.remove("active");
          nav.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
        }
      }
    });
  }
}
