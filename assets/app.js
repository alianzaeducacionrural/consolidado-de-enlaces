/* Consolidado de enlaces — app estática (GitHub Pages) */
(() => {
  "use strict";

  const OWNER = "alianzaeducacionrural";
  const IGNORAR_REPOS = new Set(["consolidado-de-enlaces", "alianzaeducacionrural.github.io"]);
  const LS_CRED = "cde.credenciales.v1";
  const LS_CAT = "cde.catalogo.v1";
  const LS_TEMA = "cde.tema";
  const LS_FILTRO = "cde.filtro";

  const TIPOS = ["publico", "formulario", "panel", "admin", "otro"];
  const TIPO_TXT = { publico: "Público", formulario: "Formulario", panel: "Panel", admin: "Administración", otro: "Otro" };
  const TIPO_IC = { publico: "globe", formulario: "clipboard", panel: "activity", admin: "lock", otro: "link" };

  /* ---------- iconos (stroke, 24) ---------- */
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 3.9"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.3 6.3 0 0 0 20 14.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    external: '<path d="M8 6h10v10"/><path d="M18 6 6 18"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.7 6.2A10.5 10.5 0 0 1 12 6c6.4 0 10 6 10 6a17.6 17.6 0 0 1-3.3 3.9M6.5 6.6A17.4 17.4 0 0 0 2 12s3.6 6 10 6a10 10 0 0 0 3.3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9c0-1.1.1-1.5-.5-2.1 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.8 11.8 0 0 0-6.2 0C6.9 2.4 5.9 2.7 5.9 2.7a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.5 9c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
    clipboard: '<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/><path d="M9 12h6M9 16h4"/>',
    activity: '<path d="M4 4v16h16"/><path d="m8 14 3-4 3 3 4-6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    download: '<path d="M12 3v13M7 11l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V8M7 13l5-5 5 5M5 3h14"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6.5 8-6.5s8 2.5 8 6.5"/>',
    note: '<path d="M5 4h14v11l-5 5H5Z"/><path d="M14 20v-5h5"/><path d="M9 9h6M9 13h4"/>',
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.link}</svg>`;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  };
  const icon = (name, cls) => el("span", { class: "ic" + (cls ? " " + cls : ""), html: svg(name) });

  const rankCat = (cats) => (c) => { const i = cats.indexOf(c); return i === -1 ? cats.length + 1 : i; };
  const titulizar = (s) => s.replace(/[-_]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim().replace(/^\w/, (c) => c.toUpperCase());
  const slug = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  /* ---------- estado ---------- */
  let CAT = [];
  let TOOLS = [];
  let ARCHIVO = null;
  let filtro = localStorage.getItem(LS_FILTRO) || "Todas";
  let busqueda = "";

  /* ---------- credenciales ---------- */
  const leerCred = () => { try { return JSON.parse(localStorage.getItem(LS_CRED)) || {}; } catch { return {}; } };
  const guardarCred = (o) => localStorage.setItem(LS_CRED, JSON.stringify(o));
  const credDe = (id) => leerCred()[id] || { cuentas: [] };
  const setCredDe = (id, entry) => {
    const all = leerCred();
    if (!entry.cuentas || !entry.cuentas.length) delete all[id]; else all[id] = { cuentas: entry.cuentas };
    guardarCred(all);
  };
  const tieneCred = (id) => { const c = leerCred()[id]; return !!c && c.cuentas && c.cuentas.length > 0; };

  /* ---------- catálogo local ---------- */
  const leerCat = () => { try { return JSON.parse(localStorage.getItem(LS_CAT)); } catch { return null; } };
  const guardarCat = (o) => localStorage.setItem(LS_CAT, JSON.stringify(o));
  const hayCatLocal = () => !!localStorage.getItem(LS_CAT);

  /* ---------- tema ---------- */
  function aplicarTema(t, persistir) {
    document.documentElement.dataset.tema = t;
    const b = $("#btnTema .ic");
    if (b) b.innerHTML = svg(t === "dark" ? "sun" : "moon");
    if (persistir) localStorage.setItem(LS_TEMA, t);
  }

  /* ---------- carga ---------- */
  async function cargar() {
    try {
      const res = await fetch("./data/tools.json", { cache: "no-cache" });
      ARCHIVO = await res.json();
    } catch { ARCHIVO = { categorias: [], herramientas: [] }; }
    const fuente = leerCat() || ARCHIVO;
    CAT = fuente.categorias || [];
    TOOLS = (fuente.herramientas || []).map(normalizar).filter((t) => !t.oculto);
    render();
    enriquecerGitHub().catch(() => {});
  }

  function normalizar(t) {
    return {
      id: t.id,
      nombre: t.nombre || titulizar(t.id),
      descripcion: t.descripcion || "",
      categoria: t.categoria || "Por clasificar",
      emoji: t.emoji || "",
      estado: t.estado || "activo",
      destacado: !!t.destacado,
      oculto: !!t.oculto,
      tags: t.tags || [],
      repo: t.repo || `https://github.com/${OWNER}/${t.id}`,
      enlaces: (t.enlaces || []).filter((e) => e && e.url),
    };
  }

  async function enriquecerGitHub() {
    const res = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated`, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return;
    const repos = await res.json();
    if (!Array.isArray(repos)) return;
    const conocidos = new Set([
      ...TOOLS.map((t) => t.id.toLowerCase()),
      ...((ARCHIVO?.herramientas) || []).map((t) => t.id.toLowerCase()),
      ...((leerCat()?.herramientas) || []).map((t) => t.id.toLowerCase()),
    ]);
    let nuevos = 0;
    for (const r of repos) {
      if (r.fork || IGNORAR_REPOS.has(r.name.toLowerCase()) || conocidos.has(r.name.toLowerCase())) continue;
      const enlaces = [];
      if (r.homepage && /^https?:\/\//.test(r.homepage)) enlaces.push({ etiqueta: "Sitio", url: r.homepage, tipo: "publico" });
      TOOLS.push(normalizar({ id: r.name, nombre: titulizar(r.name), descripcion: r.description || "", categoria: "Por clasificar", emoji: "", estado: r.archived ? "archivado" : "activo", tags: r.topics || [], repo: r.html_url, enlaces, _nuevoRepo: true }));
      TOOLS[TOOLS.length - 1]._nuevoRepo = true;
      nuevos++;
    }
    if (nuevos) render();
  }
  const esRepoNuevo = (t) => !!t._nuevoRepo;

  /* ---------- render ---------- */
  function render() {
    renderIndice();
    renderLista();
    const conEnlace = TOOLS.filter((t) => t.enlaces.length).length;
    $("#pieInfo").textContent = `${TOOLS.length} herramientas · ${conEnlace} con enlace directo`;
    $("#brandSub").textContent = `Alianza Educación Rural · ${TOOLS.length} herramientas`;
  }

  function renderIndice() {
    const cont = $("#chips"); cont.textContent = "";
    const counts = new Map();
    TOOLS.forEach((t) => counts.set(t.categoria, (counts.get(t.categoria) || 0) + 1));
    const cats = [...counts.keys()].sort((a, b) => rankCat(CAT)(a) - rankCat(CAT)(b));
    const item = (label, on, n, go) => el("button", { class: "indice-item" + (on ? " on" : ""), type: "button", onclick: go },
      el("span", {}, label), n != null ? el("span", { class: "n" }, String(n)) : null);
    const pick = (c) => { filtro = c; localStorage.setItem(LS_FILTRO, c); render(); };
    cont.append(item("Todas", filtro === "Todas", TOOLS.length, () => pick("Todas")));
    cats.forEach((c) => cont.append(item(c, filtro === c, counts.get(c), () => pick(c))));
  }

  function coincide(t) {
    if (filtro !== "Todas" && t.categoria !== filtro) return false;
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return t.nombre.toLowerCase().includes(q) || t.descripcion.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) || t.tags.some((x) => x.toLowerCase().includes(q)) ||
      t.enlaces.some((e) => (e.etiqueta + e.url).toLowerCase().includes(q));
  }

  function renderLista() {
    const cont = $("#lista"); cont.textContent = "";
    const vis = TOOLS.filter(coincide);
    $("#vacio").hidden = vis.length > 0;

    const grupos = new Map();
    for (const t of vis) { if (!grupos.has(t.categoria)) grupos.set(t.categoria, []); grupos.get(t.categoria).push(t); }
    const ordenadas = [...grupos.keys()].sort((a, b) => rankCat(CAT)(a) - rankCat(CAT)(b));

    for (const cat of ordenadas) {
      const items = grupos.get(cat).sort((a, b) => (b.destacado - a.destacado) || a.nombre.localeCompare(b.nombre, "es"));
      cont.append(el("section", { class: "grupo" },
        el("div", { class: "grupo-cab" },
          el("h2", {}, cat),
          el("span", { class: "n" }, String(items.length)),
          el("span", { class: "rule" })),
        el("div", { class: "grid" }, items.map(tarjeta))));
    }
  }

  function tarjeta(t) {
    const acc = el("div", { class: "card-acc" },
      el("button", {
        class: "icobtn" + (tieneCred(t.id) ? " on" : ""), type: "button",
        title: tieneCred(t.id) ? "Ver claves guardadas" : "Guardar usuario y contraseña",
        "aria-label": "Claves", onclick: () => modalClavesTool(t),
      }, icon("key")),
      el("button", {
        class: "icobtn", type: "button", title: "Editar esta herramienta",
        "aria-label": "Editar", onclick: () => modalCatalogo(t.id),
      }, icon("pencil")),
    );

    const meta = el("div", { class: "card-tag-row" }, el("span", { class: "dot", "data-e": t.estado }, t.estado));
    if (t.categoria === "Por clasificar") meta.append(el("span", { class: "pin-clasif" }, "por clasificar"));

    const puertas = t.enlaces.length
      ? el("div", { class: "puertas" }, t.enlaces.map((e) =>
          el("a", { class: "puerta", "data-t": e.tipo, href: e.url, target: "_blank", rel: "noopener" },
            icon(TIPO_IC[e.tipo] || "link"),
            el("span", { class: "txt" }, e.etiqueta || "Abrir"),
            el("span", { class: "go", html: svg("external") }))))
      : el("p", { class: "puerta-vacia" }, "Sin enlace todavía. Pulsa el lápiz para agregar el formulario o el panel.");

    return el("article", { class: "card" + (t.destacado ? " destacado" : "") },
      el("div", { class: "card-top" },
        el("div", { class: "stamp" }, t.emoji || "·"),
        el("div", { class: "card-id" }, el("h3", { class: "card-nom" }, t.nombre), meta),
        acc),
      t.descripcion ? el("p", { class: "card-desc" }, t.descripcion) : null,
      puertas,
      el("div", { class: "card-pie" },
        t.tags.length ? el("span", { class: "tags" }, "#" + t.tags.slice(0, 3).join("  #")) : el("span", {}, ""),
        el("span", { class: "sp" }),
        el("a", { href: t.repo, target: "_blank", rel: "noopener" }, icon("github"), "Repositorio")));
  }

  /* ---------- modal base ---------- */
  const modal = $("#modal");
  const modalBody = $("#modalContenido");
  function abrirModal(nodo) {
    modalBody.textContent = ""; modalBody.append(nodo);
    modal.hidden = false; document.body.style.overflow = "hidden";
  }
  function cerrarModal() { modal.hidden = true; modalBody.textContent = ""; document.body.style.overflow = ""; }
  $$("[data-cerrar]", modal).forEach((n) => n.addEventListener("click", cerrarModal));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) cerrarModal(); });

  function copiar(txt, btn) {
    if (!txt) return;
    navigator.clipboard?.writeText(txt).then(() => {
      const prev = btn.innerHTML; btn.innerHTML = svg("check");
      setTimeout(() => { btn.innerHTML = prev; }, 1000);
    });
  }

  /* ---------- dropdown propio ---------- */
  function dropdown({ options, value, onChange, ariaLabel }) {
    const wrap = el("div", { class: "dd" });
    const label = () => (options.find((o) => o.value === value) || options[0] || {}).label || "";
    const btn = el("button", {
      type: "button", class: "dd-btn", "aria-haspopup": "listbox", "aria-expanded": "false",
      ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
    }, el("span", { class: "val" }, label()), icon("chevron"));
    let menu = null;
    const onDoc = (e) => { if (!wrap.contains(e.target)) cerrar(); };
    function cerrar() {
      if (!menu) return;
      menu.remove(); menu = null; btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", onDoc, true);
    }
    function abrir() {
      if (menu) return cerrar();
      menu = el("div", { class: "dd-menu", role: "listbox" }, options.map((o) =>
        el("button", {
          type: "button", class: "dd-opt" + (o.value === value ? " sel" : ""),
          onclick: () => { value = o.value; btn.querySelector(".val").textContent = o.label; cerrar(); onChange(o.value); },
        }, o.icon ? icon(o.icon) : null, el("span", {}, o.label), o.value === value ? icon("check") : null)));
      wrap.append(menu);
      btn.setAttribute("aria-expanded", "true");
      const r = menu.getBoundingClientRect();
      if (r.bottom > innerHeight - 8 && btn.getBoundingClientRect().top > innerHeight / 2) menu.classList.add("dd-menu-up");
      setTimeout(() => document.addEventListener("click", onDoc, true), 0);
    }
    btn.addEventListener("click", abrir);
    btn.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
    wrap.append(btn);
    return wrap;
  }

  function segmented({ options, value, onChange }) {
    const wrap = el("div", { class: "seg", role: "group" });
    const pintar = () => [...wrap.children].forEach((b, i) => b.classList.toggle("on", options[i].value === value));
    options.forEach((o) => wrap.append(el("button", { type: "button", onclick: () => { value = o.value; pintar(); onChange(o.value); } }, o.label)));
    pintar();
    return wrap;
  }

  /* ---------- modal: claves de una herramienta ---------- */
  function modalClavesTool(t) {
    const entry = structuredClone(credDe(t.id));
    entry.cuentas ||= [];
    const cont = el("div");

    const guardar = (cerrar) => {
      const limpio = entry.cuentas
        .map((c) => ({ usuario: (c.usuario || "").trim(), clave: (c.clave || "").trim(), notas: (c.notas || "").trim() }))
        .filter((c) => c.usuario || c.clave || c.notas);
      setCredDe(t.id, { cuentas: limpio });
      renderLista();
      if (cerrar) cerrarModal();
    };

    function credFila(icName, ph, key, c, tipo) {
      const inp = el("input", { type: tipo || "text", placeholder: ph, autocomplete: "off", spellcheck: "false", value: c[key] || "" });
      inp.addEventListener("input", () => (c[key] = inp.value));
      const acc = el("div", { class: "cred-acc" });
      if (tipo === "password") {
        acc.append(el("button", {
          type: "button", "aria-label": "Mostrar u ocultar", html: svg("eye"),
          onclick: (e) => { const b = e.currentTarget; inp.type = inp.type === "password" ? "text" : "password"; b.innerHTML = svg(inp.type === "password" ? "eye" : "eyeoff"); },
        }));
      }
      acc.append(el("button", { type: "button", "aria-label": "Copiar", html: svg("copy"), onclick: (e) => copiar(inp.value, e.currentTarget) }));
      return el("label", { class: "cred-fila" }, icon(icName), inp, acc);
    }

    function cuentaCard(c, i) {
      const notas = el("textarea", { rows: "2", placeholder: "Notas: para qué sirve, permisos, a quién pertenece…", value: c.notas || "" });
      notas.addEventListener("input", () => (c.notas = notas.value));
      return el("div", { class: "cuenta" },
        el("div", { class: "cuenta-cab" },
          el("span", { class: "cuenta-num" }, `Cuenta ${i + 1}`),
          el("button", { class: "cuenta-del", type: "button", "aria-label": "Eliminar cuenta", title: "Eliminar esta cuenta", html: svg("trash"), onclick: () => { entry.cuentas.splice(i, 1); guardar(false); pintar(); } })),
        credFila("user", "Usuario o correo", "usuario", c),
        credFila("lock", "Contraseña", "clave", c, "password"),
        el("label", { class: "cred-fila cred-fila-notas" }, icon("note"), notas));
    }

    function pintar() {
      cont.textContent = "";
      cont.append(
        el("h2", {}, t.emoji ? el("span", { class: "modal-emoji" }, t.emoji) : icon("key"), t.nombre),
        el("p", { class: "sub" }, "Usuarios y contraseñas de esta herramienta. Se guardan solo en este navegador — nunca se suben a GitHub."));
      cont.append(entry.cuentas.length
        ? el("div", { class: "cuentas" }, entry.cuentas.map(cuentaCard))
        : el("p", { class: "cuenta-vacia" }, "Todavía no has guardado ninguna cuenta."));
      cont.append(el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-line btn-sm", type: "button", onclick: () => { entry.cuentas.push({ usuario: "", clave: "", notas: "" }); pintar(); } }, icon("plus"), "Agregar cuenta"),
        el("button", { class: "btn btn-leaf btn-sm", type: "button", onclick: () => guardar(true) }, icon("check"), "Guardar y cerrar")));
      cont.append(el("p", { class: "mini-aviso" }, icon("lock"), "Cualquiera que use este navegador puede ver estas claves. Úsalo en tu equipo personal."));
    }
    pintar();
    abrirModal(cont);
  }

  /* ---------- modal: exportar / importar claves ---------- */
  function modalClavesGlobal() {
    const n = Object.keys(leerCred()).length;
    abrirModal(el("div", {},
      el("h2", {}, icon("key"), "Claves guardadas"),
      el("p", { class: "sub" }, `Tienes claves para ${n} herramienta(s), guardadas solo en este navegador.`),
      el("h3", {}, "Mover a otro equipo"),
      el("p", { class: "sub" }, "Exporta un archivo, cópialo al otro equipo y ahí impórtalo. El archivo lleva las contraseñas en texto plano: guárdalo con cuidado y bórralo al terminar."),
      el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-primary btn-sm", type: "button", onclick: () => descargar("claves-consolidado.json", leerCred()) }, icon("download"), "Exportar"),
        el("button", { class: "btn btn-line btn-sm", type: "button", onclick: () => $("#importFile").click() }, icon("upload"), "Importar"),
        el("button", { class: "btn btn-danger btn-sm", type: "button", onclick: () => { if (confirm("¿Borrar TODAS las claves guardadas en este navegador?")) { localStorage.removeItem(LS_CRED); cerrarModal(); renderLista(); } } }, icon("trash"), "Borrar todo"))));
  }
  $("#importFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (typeof obj !== "object" || Array.isArray(obj)) throw 0;
        guardarCred({ ...leerCred(), ...obj });
        cerrarModal(); renderLista(); alert("Claves importadas.");
      } catch { alert("El archivo no es válido."); }
      e.target.value = "";
    };
    r.readAsText(f);
  });

  /* ---------- modal: editar catálogo ---------- */
  function modalCatalogo(preId) {
    const copia = structuredClone(TOOLS).filter((x) => !esRepoNuevo(x));
    copia.forEach((x) => { delete x._nuevoRepo; });
    let sel;
    if (preId === "__nueva__") {
      const nueva = { id: "herramienta-" + Date.now().toString(36).slice(-4), nombre: "", descripcion: "", categoria: "Por clasificar", emoji: "", estado: "activo", destacado: false, oculto: false, tags: [], repo: "", enlaces: [], _nuevo: true };
      copia.push(nueva); sel = nueva.id;
    } else {
      sel = (preId && copia.some((x) => x.id === preId)) ? preId : copia[0]?.id;
    }
    const cont = el("div");

    const construir = () => ({
      _comentario: "Catálogo de herramientas. Las contraseñas NO van aquí (se guardan solo en el navegador).",
      categorias: CAT,
      herramientas: copia.map((x) => ({
        id: x.id, nombre: x.nombre, descripcion: x.descripcion, categoria: x.categoria,
        emoji: x.emoji, estado: x.estado, destacado: !!x.destacado,
        ...(x.oculto ? { oculto: true } : {}),
        tags: (x.tags || []).map((s) => s.trim()).filter(Boolean),
        repo: x.repo || `https://github.com/${OWNER}/${x.id}`,
        enlaces: (x.enlaces || []).filter((e) => e.url),
      })),
    });

    const aplicar = () => {
      copia.forEach((x) => { if (!x.id) x.id = slug(x.nombre) || "herramienta"; });
      guardarCat(construir());
      const f = leerCat();
      CAT = f.categorias;
      TOOLS = f.herramientas.map(normalizar).filter((t) => !t.oculto);
      render(); cerrarModal(); enriquecerGitHub().catch(() => {});
    };

    function pintar() {
      cont.textContent = "";
      cont.append(el("h2", {}, icon("pencil"), preId === "__nueva__" ? "Nueva herramienta" : "Editar herramienta"));
      cont.append(el("p", { class: "sub" }, hayCatLocal()
        ? "Tus cambios se guardan en este navegador. Para que los vean todos, descarga tools.json y súbelo al repositorio."
        : "Los cambios se guardan en tu navegador al pulsar Guardar. Para publicarlos a todos, descarga tools.json."));

      const t = copia.find((x) => x.id === sel);

      // selector de herramienta
      cont.append(el("div", { class: "campo" }, el("span", { class: "lbl" }, "Editando"),
        el("div", { class: "fila" },
          dropdown({
            options: copia.map((x) => ({ value: x.id, label: `${x.emoji || "•"}  ${x.nombre || "(sin nombre)"}` })),
            value: sel, ariaLabel: "Herramienta", onChange: (v) => { sel = v; pintar(); },
          }),
          el("button", { class: "btn btn-line btn-sm", type: "button", style: "flex:0 0 auto", onclick: () => { const nueva = { id: "herramienta-" + Date.now().toString(36).slice(-4), nombre: "", descripcion: "", categoria: "Por clasificar", emoji: "", estado: "activo", destacado: false, tags: [], repo: "", enlaces: [], _nuevo: true }; copia.push(nueva); sel = nueva.id; pintar(); } }, icon("plus"), "Nueva"))));
      if (!t) return;

      const campo = (label, key, tag) => {
        const inp = el(tag || "input", tag === "textarea" ? { rows: "3" } : {});
        inp.value = t[key] ?? "";
        inp.addEventListener("input", () => {
          t[key] = inp.value;
          if (t._nuevo && key === "nombre" && !t._idManual) t.id = slug(inp.value) || t.id;
        });
        return el("div", { class: "campo" }, el("label", {}, label), inp);
      };
      cont.append(campo("Nombre", "nombre"));
      cont.append(campo("Descripción — para qué sirve", "descripcion", "textarea"));

      // identificador
      const idInp = el("input", { value: t.id, ...(t._nuevo ? {} : { disabled: "disabled" }) });
      idInp.addEventListener("input", () => { t._idManual = true; t.id = slug(idInp.value); });
      cont.append(el("div", { class: "campo" }, el("label", {}, "Identificador (= nombre del repo en GitHub, si aplica)"), idInp));

      // categoría + emoji + estado
      const cats = [...new Set([...CAT, ...copia.map((x) => x.categoria)])].filter(Boolean);
      const catInp = el("input", { list: "cats-dl", value: t.categoria || "" });
      catInp.addEventListener("input", () => (t.categoria = catInp.value));
      cont.append(el("div", { class: "fila" },
        el("div", { class: "campo", style: "flex:2 1 180px" }, el("label", {}, "Categoría"), catInp,
          el("datalist", { id: "cats-dl" }, cats.map((c) => el("option", { value: c })))),
        (() => { const i = el("input", { value: t.emoji || "", maxlength: "4", style: "text-align:center" }); i.addEventListener("input", () => (t.emoji = i.value)); return el("div", { class: "campo", style: "flex:0 0 64px" }, el("label", {}, "Emoji"), i); })()));

      cont.append(el("div", { class: "campo" }, el("span", { class: "lbl" }, "Estado"),
        segmented({ options: ["activo", "beta", "borrador", "archivado"].map((s) => ({ value: s, label: s })), value: t.estado, onChange: (v) => (t.estado = v) })));

      const tagsInp = el("input", { value: (t.tags || []).join(", ") });
      tagsInp.addEventListener("input", () => (t.tags = tagsInp.value.split(",").map((s) => s.trim()).filter(Boolean)));
      cont.append(el("div", { class: "campo" }, el("label", {}, "Etiquetas (separadas por coma)"), tagsInp));

      const dChk = el("input", { type: "checkbox", ...(t.destacado ? { checked: "checked" } : {}) });
      dChk.addEventListener("change", () => (t.destacado = dChk.checked));
      cont.append(el("label", { class: "chk" }, dChk, "Destacar — fijar arriba de su categoría"));

      // enlaces
      cont.append(el("h3", {}, "Enlaces"));
      (t.enlaces ||= []).forEach((lnk, i) => {
        const eti = el("input", { class: "enl-eti", placeholder: "Etiqueta", value: lnk.etiqueta || "" });
        eti.addEventListener("input", () => (lnk.etiqueta = eti.value));
        const url = el("input", { placeholder: "https://…", value: lnk.url || "" });
        url.addEventListener("input", () => (lnk.url = url.value));
        cont.append(el("div", { class: "enl-row" }, eti, url,
          dropdown({ options: TIPOS.map((tp) => ({ value: tp, label: TIPO_TXT[tp], icon: TIPO_IC[tp] })), value: lnk.tipo || "publico", ariaLabel: "Tipo de enlace", onChange: (v) => (lnk.tipo = v) }),
          el("button", { class: "icobtn", type: "button", "aria-label": "Quitar enlace", html: svg("trash"), onclick: () => { t.enlaces.splice(i, 1); pintar(); } })));
      });
      cont.append(el("button", { class: "btn btn-line btn-sm", type: "button", onclick: () => { t.enlaces.push({ etiqueta: "", url: "", tipo: "publico" }); pintar(); } }, icon("plus"), "Agregar enlace"));

      cont.append(el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-leaf btn-sm", type: "button", onclick: aplicar }, icon("check"), "Guardar cambios"),
        el("button", { class: "btn btn-primary btn-sm", type: "button", onclick: () => descargar("tools.json", construir()) }, icon("download"), "Descargar tools.json"),
        el("button", { class: "btn btn-danger btn-sm", type: "button", onclick: () => { if (confirm(`¿Quitar "${t.nombre || t.id}" del catálogo?`)) { const j = copia.findIndex((x) => x.id === t.id); copia.splice(j, 1); sel = copia[0]?.id; pintar(); } } }, icon("trash"), "Quitar")));

      if (hayCatLocal()) {
        cont.append(el("button", { class: "btn btn-quiet btn-sm", type: "button", style: "margin-top:8px", onclick: () => { if (confirm("¿Descartar tus cambios locales y volver al catálogo del repositorio?")) { localStorage.removeItem(LS_CAT); cerrarModal(); cargar(); } } }, icon("rotate"), "Descartar mis cambios locales"));
      }
    }
    pintar();
    abrirModal(cont);
  }

  function descargar(nombre, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2) + "\n"], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: nombre });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- init ---------- */
  $$("[data-ic]").forEach((s) => { s.innerHTML = svg(s.dataset.ic); });
  aplicarTema(localStorage.getItem(LS_TEMA) === "light" ? "light" : "dark", false);

  $("#q").addEventListener("input", (e) => { busqueda = e.target.value; renderLista(); });
  $("#btnTema").addEventListener("click", () => aplicarTema(document.documentElement.dataset.tema === "dark" ? "light" : "dark", true));
  $("#btnClaves").addEventListener("click", modalClavesGlobal);
  $("#btnAgregar").addEventListener("click", () => modalCatalogo("__nueva__"));

  cargar().catch((err) => { $("#lista").innerHTML = `<p class="estado-vacio">No se pudo cargar <code>data/tools.json</code>.<br>${String(err)}</p>`; });
})();
