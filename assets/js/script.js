document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    ".card, .stat-box, .contact-info, .gallery-item"
  );
  animatedElements.forEach((el) => {
    observer.observe(el);
  });

  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      img.src = img.dataset.src || img.src;
    });
  } else {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js";
    document.body.appendChild(script);
  }

  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.querySelector("#name");
      const email = document.querySelector("#email");
      const message = document.querySelector("#message");

      let isValid = true;

      if (!name.value.trim()) {
        showError(name, "El nombre es requerido");
        isValid = false;
      } else {
        clearError(name);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        showError(email, "El email es requerido");
        isValid = false;
      } else if (!emailRegex.test(email.value)) {
        showError(email, "El email no es válido");
        isValid = false;
      } else {
        clearError(email);
      }

      if (!message.value.trim()) {
        showError(message, "El mensaje es requerido");
        isValid = false;
      } else {
        clearError(message);
      }

      if (isValid) {
        alert("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.");
        contactForm.reset();
      }
    });
  }

  function showError(input, message) {
    clearError(input);
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.color = "#4a4a4a";
    errorDiv.style.fontSize = "0.875rem";
    errorDiv.style.marginTop = "0.25rem";
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = "#4a4a4a";
  }

  function clearError(input) {
    const errorDiv = input.parentNode.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
    input.style.borderColor = "";
  }
});
