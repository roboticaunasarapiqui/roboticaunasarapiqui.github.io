const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // sin Clipboard API (página sin HTTPS, navegador antiguo) o permiso denegado: método clásico
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();

  if (!copied) {
    throw new Error("copy failed");
  }
};

document.querySelectorAll("a[data-mail-user][data-mail-domain]").forEach((link) => {
  const address = `${link.dataset.mailUser}@${link.dataset.mailDomain}`;

  link.href = `mailto:${address}`;
  if (!link.textContent.trim()) {
    link.textContent = address;
  }
});

// Botón "Copiar correo": va junto al enlace y se muestra solo si hay JavaScript.
document.querySelectorAll("[data-copy-mail]").forEach((button) => {
  const link = button.parentElement.querySelector("a[data-mail-user]");
  const label = button.querySelector(".copy-label");
  const status = button.parentElement.querySelector("[role='status']");
  const idle = label.textContent;
  let timer;

  if (!link) {
    return;
  }

  button.hidden = false;

  button.addEventListener("click", async () => {
    let message = "Correo copiado";

    try {
      await copyText(`${link.dataset.mailUser}@${link.dataset.mailDomain}`);
    } catch {
      message = "No se pudo copiar";
    }

    label.textContent = message === "Correo copiado" ? "Copiado" : "No se pudo copiar";
    status.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = idle;
      status.textContent = "";
    }, 2400);
  });
});
