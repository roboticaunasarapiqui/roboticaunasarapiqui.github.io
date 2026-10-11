/* Motor de las guías semanales. No se edita por semana: cada guía solo define window.GUIA
   (ver docs/GUIAS.md y _templates/guia.html). Aquí viven el dibujo, el avance, y el copiar y pegar. */
(() => {
  "use strict";

  const D = window.GUIA;
  const app = document.getElementById("app");
  if (!D || !app) return;

  /* ---------------- ayudas fijas de los pasos de entrega ---------------- */

  const AYUDA_PDF = [
    ["No me deja pegar la captura", "Pruebe con el menú Insertar, Imagen, Subir desde el computador."],
    ["No uso Google Docs", "Use otro programa para escribir documentos, siempre que al final obtenga un PDF con el nombre correcto."]
  ];

  /* ---------------- utilidades ---------------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  /* **negrita** y `código` dentro de cualquier texto de la guía */
  const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
  /* en los bloques para copiar, ___ y NombreApellido se resaltan como "complete aquí" */
  const marked = (s) => esc(s).replace(/_{3,}/g, "<mark>___</mark>").replace(/NombreApellido/g, "<mark>NombreApellido</mark>");

  // mismo dibujo que _includes/robot.html (el robot del pie)
  const ROBOT = '<svg class="robot tab-bot" viewBox="0 0 36 28" aria-hidden="true" focusable="false"><g class="r-top"><rect class="r-stud" x="9" y="1" width="6" height="3" rx="1"/><rect class="r-stud" x="21" y="1" width="6" height="3" rx="1"/><rect class="r-body" x="4" y="4" width="28" height="15" rx="3"/><rect class="r-eye" x="9" y="8" width="18" height="6" rx="3"/><circle class="r-pupil" cx="14" cy="11" r="1.6"/><circle class="r-pupil" cx="22" cy="11" r="1.6"/></g><g class="r-wheel"><circle cx="11" cy="22" r="5"/><path d="M11 18v8"/></g><g class="r-wheel"><circle cx="25" cy="22" r="5"/><path d="M25 18v8"/></g></svg>';

  const CHECK = '<svg class="tick" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------------- estado (solo en este navegador) ---------------- */

  const KEY = "ire-guia-" + (D.id || "semana");
  const S = { tab: D.modulos[0].id, checks: {} };
  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    if (o && typeof o === "object") {
      if (D.modulos.some((m) => m.id === o.tab)) S.tab = o.tab;
      S.checks = o.checks || {};
    }
  } catch { /* sin almacenamiento: la guía funciona igual */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* ignorar */ } };

  /* ---------------- modelo: de los datos de la guía a pasos numerados ---------------- */

  function prepare(m) {
    const secs = m.secciones.map((s) => ({ ...s, parts: [] }));
    const byId = Object.fromEntries(secs.map((s) => [s.id, s]));

    const blocks = [
      { color: "t", eyebrow: "Primero", titulo: "Su documento", pasos: [{ kind: "doc", titulo: "Prepare su documento" }] },
      ...m.bloques,
      { color: "e", eyebrow: "Entrega", titulo: "Su PDF y Moodle",
        pasos: [{ kind: "pdf", titulo: "Revise y descargue el PDF" }, { kind: "moodle", titulo: "Suba el PDF a Moodle" }] }
    ];

    let n = 0;
    const ids = [];
    blocks.forEach((b) => b.pasos.forEach((p) => {
      p.num = ++n;
      p.id = m.id + "-" + p.num;
      p.color = b.color || "t";
      ids.push(p.id);
      if (p.doc) {
        if (!byId[p.doc.sec]) { console.error("Sección desconocida «" + p.doc.sec + "» en el paso " + p.num); p.doc = null; }
        else if (p.doc.text) byId[p.doc.sec].parts.push(p.doc.text);
      }
    }));

    const body = secs.map((s) => {
      const joined = s.parts.some((x) => x.includes("\n")) ? s.parts.join("\n") : s.parts.join(" ");
      return s.titulo.toLocaleUpperCase("es") + "\n" + (s.parts.length ? joined : "(" + (s.pega || "Pegue aquí lo que corresponde.") + ")");
    });
    const docText = [m.docTitulo || m.tab.toLocaleUpperCase("es")].concat(body).join("\n\n");

    return { m, blocks, byId, secs, ids, docText };
  }

  const mods = D.modulos.map(prepare);
  const modById = Object.fromEntries(mods.map((M) => [M.m.id, M]));

  /* ---------------- dibujo ---------------- */

  let nPre = 0;

  function codebox(label, text) {
    const id = "pre" + (++nPre);
    return '<div class="code"><div class="code-h"><span>' + esc(label) + '</span><button type="button" class="copy" data-copy="' + id + '">Copiar</button></div><pre id="' + id + '">' + marked(text) + "</pre></div>";
  }

  function helpHTML(items) {
    if (!items || !items.length) return "";
    return '<details class="help"><summary>¿Necesita ayuda?</summary><dl>' + items.map((q) => "<div><dt>" + fmt(q[0]) + "</dt><dd>" + fmt(q[1]) + "</dd></div>").join("") + "</dl></details>";
  }

  function linksHTML(links) {
    if (!links || !links.length) return "";
    return '<div class="links">' + links.map((l) => '<a class="action" href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + " ↗</a>").join("") + "</div>";
  }

  function stepBody(p, M) {
    const m = M.m;
    let h = "";

    if (p.kind === "doc") {
      const pre = "doc-" + m.id;
      h += "<p>" + fmt(m.docNota || "Va a armar **un solo documento** con todo lo de esta guía. Cópielo y péguelo en un Google Docs nuevo; después completa cada sección en el momento en que llegue a ese paso, y al final solo lo descarga.") + "</p>";
      h += '<div class="links"><button type="button" class="action" data-copy="' + pre + '">Copiar la estructura</button><a class="action ghost" href="https://docs.new" target="_blank" rel="noopener noreferrer">Abrir un Google Docs nuevo ↗</a></div>';
      h += '<details class="peek"><summary>Ver lo que se copia</summary><pre class="code" id="' + pre + '">' + marked(M.docText) + "</pre></details>";
      return h;
    }

    if (p.kind === "pdf") {
      const items = M.secs.map((s) => s.revisar || s.titulo).concat("El archivo es un PDF con el nombre correcto.");
      h += "<p>Compare su documento con esta lista antes de guardarlo.</p>";
      h += '<ul class="checks">' + items.map((t, i) => '<li><label><input type="checkbox" data-check="' + m.id + "-rev" + i + '"' + (S.checks[m.id + "-rev" + i] ? " checked" : "") + "><span>" + fmt(t) + "</span></label></li>").join("") + "</ul>";
      h += '<ol class="lista"><li>En Google Docs: Archivo, Descargar, Documento PDF (.pdf).</li><li>Ponga a su archivo este nombre:</li></ol>';
      h += codebox("Nombre del archivo", m.archivo);
      h += helpHTML(AYUDA_PDF);
      return h;
    }

    if (p.kind === "moodle") {
      const e = D.entrega || {};
      h += "<p>Fecha límite: <strong>" + esc(e.texto || "según el enunciado") + "</strong>.</p>";
      h += '<ol class="lista"><li>Entre al curso en Moodle y busque la entrega «' + esc(m.moodle) + "».</li><li>Agregue la entrega, adjunte el PDF y guarde los cambios.</li><li>Confirme que su archivo aparece en la entrega.</li></ol>";
      h += '<div class="ver"><span class="lb">Va bien si ve</span>Su archivo en la entrega de Moodle, antes de que venza el plazo.</div>';
      return h;
    }

    if (p.hacer) h += "<p>" + fmt(p.hacer) + "</p>";
    if (p.lista) h += '<ol class="lista">' + p.lista.map((x) => "<li>" + fmt(x) + "</li>").join("") + "</ol>";
    if (p.opcional) h += '<p class="opc"><b>Opcional, sin nota:</b> ' + fmt(p.opcional) + "</p>";
    h += linksHTML(p.links);
    if (p.copiar) h += codebox(p.copiar.label, p.copiar.text);
    if (p.doc) {
      const s = M.byId[p.doc.sec];
      h += p.doc.text
        ? codebox("Su documento · " + s.titulo, p.doc.text)
        : '<div class="to-doc"><span class="lb">Su documento · ' + esc(s.titulo) + "</span><span>" + fmt(s.pega || "Pegue aquí lo que corresponde.") + "</span></div>";
    }
    if (p.chequeo) h += '<ul class="checks">' + p.chequeo.map((t) => "<li><label><span>✓</span><span>" + fmt(t) + "</span></label></li>").join("") + "</ul>";
    if (p.ver) h += '<div class="ver"><span class="lb">Va bien si ve</span>' + fmt(p.ver) + "</div>";
    h += helpHTML(p.ayuda);
    return h;
  }

  function stepHTML(p, M) {
    return '<li class="step" id="' + p.id + '" data-done="false" style="--mark:var(--steam-' + p.color + ')">' +
      '<span class="num" aria-hidden="true"><b>' + p.num + "</b>" + CHECK + "</span>" +
      '<div class="card">' +
      '<div class="card-top"><h3><span class="sr-only">Paso ' + p.num + ": </span>" + fmt(p.titulo) + "</h3>" +
      '<label class="hecho"><input type="checkbox" data-check="' + p.id + '"><span>Hecho</span></label></div>' +
      stepBody(p, M) + "</div></li>";
  }

  function panelHTML(M) {
    const m = M.m;
    const blocks = M.blocks.map((b) =>
      '<section class="block" style="--mark:var(--steam-' + (b.color || "t") + ')"><header class="block-head"><p class="eyebrow">' + esc(b.eyebrow) + "</p><h2>" + fmt(b.titulo) + "</h2>" +
      (b.intro ? '<p class="intro">' + fmt(b.intro) + "</p>" : "") + '</header><ol class="steps">' + b.pasos.map((p) => stepHTML(p, M)).join("") + "</ol></section>"
    ).join("");
    return '<section class="section guia" id="panel-' + m.id + '" role="tabpanel" aria-labelledby="tab-' + m.id + '"' + (m.id === S.tab ? "" : " hidden") + ">" +
      (m.intro ? '<p class="mod-intro">' + fmt(m.intro) + "</p>" : "") + blocks + "</section>";
  }

  function render() {
    const e = D.entrega || {};
    app.innerHTML =
      '<section class="hero hero-guia"><div class="hero-copy"><p class="hero-kicker">' + esc(D.kicker || D.curso || "") + "</p><h1>" + esc(D.titulo) + "</h1>" +
      "<p>" + fmt(D.intro || "") + "</p>" +
      '<div class="guia-row"><button type="button" class="action" id="go">Empezar</button>' +
      (e.texto ? '<p class="guia-due">Entrega por ' + esc(e.donde || "Moodle") + ": <strong>" + esc(e.texto) + "</strong></p>" : "") + "</div></div>" +
      '<span class="steam-bar" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></section>' +
      '<div class="tabsbar"><div class="tabs" role="tablist" aria-label="Partes de la semana">' +
      mods.map((M) => '<button class="tab" role="tab" id="tab-' + M.m.id + '" aria-controls="panel-' + M.m.id + '" data-tab="' + M.m.id + '"><span class="tab-name">' + esc(M.m.tab) + '</span><span class="tab-meter"><span class="tab-bar" aria-hidden="true"><b id="bar-' + M.m.id + '"></b>' + ROBOT + '</span><span id="cnt-' + M.m.id + '"></span><span class="sr-only"> pasos hechos</span></span></button>').join("") +
      '</div></div>' +
      mods.map(panelHTML).join("") +
      '<section class="section guia"><button class="action ghost" type="button" id="reset">Borrar mis marcas</button> <span id="reset-msg" aria-live="polite"></span></section>' +
      '<div class="sr-only" id="live" aria-live="polite"></div>';

    $$("[data-check]").forEach((el) => { el.checked = !!S.checks[el.dataset.check]; });
    setTab(S.tab, false);
  }

  /* ---------------- estado visible ---------------- */

  function progress(M) {
    const done = M.ids.filter((id) => S.checks[id]).length;
    return { done, total: M.ids.length, pct: Math.round((done * 100) / M.ids.length), next: M.ids.find((id) => !S.checks[id]) };
  }

  // clase temporal para disparar una animación puntual (robot en movimiento, ladrillo que encaja)
  function flash(el, name, ms) {
    el.classList.add(name);
    clearTimeout(el["_" + name]);
    el["_" + name] = setTimeout(() => el.classList.remove(name), ms);
  }

  function refresh() {
    mods.forEach((M) => {
      const p = progress(M);
      $("#cnt-" + M.m.id).textContent = p.done + "/" + p.total;
      const bar = $("#bar-" + M.m.id), tab = $("#tab-" + M.m.id), before = Number(bar.dataset.pct || 0);
      bar.style.width = p.pct + "%";
      bar.parentElement.style.setProperty("--pf", p.pct / 100);
      if (p.pct !== before) {
        flash(tab, p.pct === 100 ? "cheer" : "moving", p.pct === 100 ? 1100 : 700);
      }
      bar.dataset.pct = p.pct;
      M.ids.forEach((id) => {
        const li = document.getElementById(id);
        li.dataset.done = S.checks[id] ? "true" : "false";
        const cur = M.m.id === S.tab && id === p.next;
        li.classList.toggle("is-current", cur);
        if (cur) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
    });
    const M = modById[S.tab];
    const p = progress(M);
    const go = $("#go");
    if (p.done === 0) go.textContent = "Empezar ↓";
    else if (p.next) go.textContent = "Seguir en el paso " + document.getElementById(p.next).querySelector(".num b").textContent + " ↓";
    else go.textContent = "Todo listo: revise y entregue ↓";
    go.dataset.target = p.next || M.ids[M.ids.length - 1];
  }

  function setTab(id, persist = true) {
    if (!modById[id]) id = mods[0].id;
    S.tab = id;
    mods.forEach((M) => {
      $("#panel-" + M.m.id).hidden = M.m.id !== id;
      const t = $("#tab-" + M.m.id);
      t.setAttribute("aria-selected", M.m.id === id ? "true" : "false");
      t.tabIndex = M.m.id === id ? 0 : -1;
    });
    try { history.replaceState(null, "", "#" + id); } catch { /* ignorar */ }
    if (persist) save();
    refresh();
  }

  /* ---------------- copiar ---------------- */

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* probar el método antiguo */ }
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0";
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* ignorar */ }
    ta.remove();
    return ok;
  }

  async function doCopy(btn) {
    const pre = document.getElementById(btn.dataset.copy);
    if (!pre) return;
    const label = btn.dataset.label || (btn.dataset.label = btn.textContent);
    const ok = await copyText(pre.textContent);
    if (!ok) {
      const r = document.createRange(); r.selectNodeContents(pre);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
    btn.textContent = ok ? "Copiado ✓" : "Presione Ctrl+C";
    $("#live").textContent = ok ? "Copiado al portapapeles" : "Texto seleccionado: presione Ctrl+C para copiar";
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = label; }, 2400);
  }

  /* ---------------- eventos ---------------- */

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.tab) return setTab(t.dataset.tab);
    if (t.dataset.copy) return doCopy(t);
    if (t.id === "go") {
      const el = document.getElementById(t.dataset.target);
      if (el) { el.scrollIntoView({ block: "center" }); }
      return;
    }
    if (t.id === "reset") {
      if (!t.dataset.sure) {
        t.dataset.sure = "1"; t.textContent = "Toque otra vez para borrar";
        setTimeout(() => { delete t.dataset.sure; t.textContent = "Borrar mis marcas"; }, 4000);
        return;
      }
      S.checks = {}; save();
      $$("[data-check]").forEach((el) => { el.checked = false; });
      refresh();
      delete t.dataset.sure; t.textContent = "Borrar mis marcas";
      $("#reset-msg").textContent = "Marcas borradas.";
      setTimeout(() => { $("#reset-msg").textContent = ""; }, 2600);
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.check) {
      S.checks[el.dataset.check] = el.checked; save(); refresh();
      const step = el.checked && el.closest(".step");
      if (step) flash(step, "just-done", 600);
      // módulo completo: el robot de la barra lanza ladrillos de colores
      const mod = mods.find((M) => M.ids.includes(el.dataset.check));
      if (el.checked && mod && progress(mod).pct === 100 && window.bricks) window.bricks.burst($("#tab-" + mod.m.id + " .tab-bot"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!e.target.matches('[role="tab"]') || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const tabs = $$('[role="tab"]'), i = tabs.indexOf(e.target);
    const j = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    e.preventDefault(); tabs[j].focus(); setTab(tabs[j].dataset.tab);
  });

  /* ---------------- arranque ---------------- */

  const fromHash = (location.hash || "").slice(1);
  if (modById[fromHash]) S.tab = fromHash;
  render();
})();
