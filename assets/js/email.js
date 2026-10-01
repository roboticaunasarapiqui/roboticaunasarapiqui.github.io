document.querySelectorAll("a[data-mail-user][data-mail-domain]").forEach((link) => {
  const address = `${link.dataset.mailUser}@${link.dataset.mailDomain}`;

  link.href = `mailto:${address}`;
  if (!link.textContent.trim()) {
    link.textContent = address;
  }
});
