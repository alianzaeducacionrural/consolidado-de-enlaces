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
  const TIPO_ICON = { publico: "🌐", formulario: "📝", panel: "📊", admin: "🔐", otro: "🔗" };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  };

  const rankCat = (cats) => (c) => { const i = cats.indexOf(c); return i === -1 ? cats.length + 1 : i; };
  const titulizar = (s) => s.replace(/[-_]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim().replace(/^\w/, (c) => c.toUpperCase());

  /* ---------- estado ---------- */
  let CAT = [];
  let TOOLS = [];
  let filtro = localStorage.getItem(LS_FILTRO) || "Todas";
  let busqueda = "";

  /* ---------- credenciales (solo en este navegador) ---------- */
  const leerCred = () => { try { return JSON.parse(localStorage.getItem(LS_CRED)) || {}; } catch { return {}; } };
  const guardarCred = (obj) => localStorage.setItem(LS_CRED, JSON.stringify(obj));
  const credDe = (id) => leerCred()[id] || { cuentas: [] };
  const setCredDe = (id, entry) => {
    const all = leerCred();
    if (!entry.cuentas || !entry.cuentas.length) delete all[id];
    else all[id] = { cuentas: entry.cuentas };
    guardarCred(all);
  };
  const tieneCred = (id) => { const c = leerCred()[id]; return !!c && c.cuentas && c.cuentas.length > 0; };

  /* ---------- tema ---------- */
  function aplicarTema(t, persistir) {
    document.documentElement.dataset.tema = t;
    const b = $("#btnTema");
    if (b) b.textContent = t === "dark" ? "☀️" : "🌙";
    if (persistir) localStorage.setItem(LS_TEMA, t);
  }
  (function initTema() {
    const g = localStorage.getItem(LS_TEMA);
    aplicarTema(g || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), false);
  })();

  /* ---------- catálogo local (ediciones desde la página) ---------- */
  const leerCat = () => { try { return JSON.parse(localStorage.getItem(LS_CAT)); } catch { return null; } };
  const guardarCat = (obj) => localStorage.setItem(LS_CAT, JSON.stringify(obj));
  const hayCatLocal = () => !!localStorage.getItem(LS_CAT);

  /* ---------- carga de datos ---------- */
  let ARCHIVO = null; // catálogo tal cual está en data/tools.json

  async function cargar() {
    try {
      const res = await fetch("./data/tools.json", { cache: "no-cache" });
      ARCHIVO = await res.json();
    } catch { ARCHIVO = { categorias: [], herramientas: [] }; }

    const local = leerCat();
    const fuente = local || ARCHIVO;
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
      emoji: t.emoji || "🔗",
      estado: t.estado || "activo",
      destacado: !!t.destacado,
      oculto: !!t.oculto,
      tags: t.tags || [],
      repo: t.repo || `https://github.com/${OWNER}/${t.id}`,
      enlaces: (t.enlaces || []).filter((e) => e && e.url),
    };
  }

  async function enriquecerGitHub() {
    const res = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated`, {
      headers: { Accept: "application/vnd.github+json" },
    });
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
      TOOLS.push(normalizar({
        id: r.name, nombre: titulizar(r.name), descripcion: r.description || "",
        categoria: "Por clasificar", emoji: "🆕", estado: r.archived ? "archivado" : "activo",
        tags: r.topics || [], repo: r.html_url, enlaces,
      }));
      nuevos++;
    }
    if (nuevos) render();
  }

  /* ---------- render ---------- */
  function render() {
    renderChips();
    renderLista();
    const conEnlace = TOOLS.filter((t) => t.enlaces.length).length;
    $("#pieInfo").textContent = `${TOOLS.length} herramientas · ${conEnlace} con enlace`;
    $("#brandSub").textContent = `Alianza Educación Rural · ${TOOLS.length} herramientas`;
  }

  function renderChips() {
    const cont = $("#chips");
    cont.textContent = "";
    const cats = ["Todas", ...[...new Set(TOOLS.map((t) => t.categoria))].sort((a, b) => rankCat(CAT)(a) - rankCat(CAT)(b))];
    for (const c of cats) {
      cont.append(el("button", {
        class: "chip" + (c === filtro ? " on" : ""),
        onclick: () => { filtro = c; localStorage.setItem(LS_FILTRO, c); render(); },
      }, c));
    }
  }

  function coincide(t) {
    if (filtro !== "Todas" && t.categoria !== filtro) return false;
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      t.nombre.toLowerCase().includes(q) ||
      t.descripcion.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.tags.some((x) => x.toLowerCase().includes(q)) ||
      t.enlaces.some((e) => (e.etiqueta + e.url).toLowerCase().includes(q))
    );
  }

  function renderLista() {
    const cont = $("#lista");
    cont.textContent = "";
    const vis = TOOLS.filter(coincide);
    $("#vacio").hidden = vis.length > 0;

    const grupos = new Map();
    for (const t of vis) (grupos.get(t.categoria) || grupos.set(t.categoria, []).get(t.categoria)).push(t);
    const ordenadas = [...grupos.keys()].sort((a, b) => rankCat(CAT)(a) - rankCat(CAT)(b));

    for (const cat of ordenadas) {
      const items = grupos.get(cat).sort((a, b) => (b.destacado - a.destacado) || a.nombre.localeCompare(b.nombre, "es"));
      const grid = el("div", { class: "grid" }, items.map(tarjeta));
      cont.append(el("section", { class: "grupo" },
        el("div", { class: "grupo-tit" }, cat, el("span", {}, String(items.length))),
        grid,
      ));
    }
  }

  function tarjeta(t) {
    const enlaces = t.enlaces.length
      ? t.enlaces.map((e) => el("a", {
          class: "lnk", "data-t": e.tipo, href: e.url, target: "_blank", rel: "noopener",
        }, `${TIPO_ICON[e.tipo] || "🔗"} ${e.etiqueta} ↗`))
      : [el("span", { class: "lnk-vacio" }, "Sin enlace todavía")];

    const meta = [el("span", { class: "tag-estado", "data-e": t.estado }, t.estado)];
    if (t.categoria === "Por clasificar") meta.push(el("span", { class: "tag-aviso" }, "por clasificar"));
    if (tieneCred(t.id)) meta.push(el("span", { class: "tag-estado tag-claves" }, "🔑 claves"));

    return el("article", { class: "card" + (t.destacado ? " destacado" : "") },
      t.destacado ? el("span", { class: "badge-destacado" }, "destacado") : null,
      el("div", { class: "card-head" },
        el("div", { class: "card-emoji" }, t.emoji),
        el("div", { style: "min-width:0;flex:1" },
          el("h3", { class: "card-title" }, t.nombre),
          el("div", { class: "card-meta" }, meta),
        ),
      ),
      t.descripcion ? el("p", { class: "card-desc" }, t.descripcion) : null,
      el("div", { class: "card-enlaces" }, enlaces),
      el("div", { class: "card-pie" },
        el("button", { class: "link-mini", onclick: () => modalClavesTool(t) }, tieneCred(t.id) ? "🔑 Ver claves" : "🔑 Guardar claves"),
        el("a", { class: "link-mini", href: t.repo, target: "_blank", rel: "noopener" }, "GitHub"),
        el("span", { class: "spacer" }),
        t.tags.length ? el("span", { class: "tags-mini" }, "#" + t.tags.slice(0, 3).join(" #")) : null,
      ),
    );
  }

  /* ---------- modal helpers ---------- */
  const modal = $("#modal");
  const modalBody = $("#modalContenido");
  function abrirModal(nodo) {
    modalBody.textContent = "";
    modalBody.append(nodo);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function cerrarModal() { modal.hidden = true; modalBody.textContent = ""; document.body.style.overflow = ""; }
  $$("[data-cerrar]", modal).forEach((n) => n.addEventListener("click", cerrarModal));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) cerrarModal(); });

  function copiar(txt, btn) {
    navigator.clipboard?.writeText(txt).then(() => {
      const o = btn.textContent; btn.textContent = "✓"; setTimeout(() => (btn.textContent = o), 1000);
    });
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

    function cuentaCard(c, i) {
      const box = el("div", { class: "cuenta" });

      const cabeza = el("div", { class: "cuenta-cab" },
        el("span", { class: "cuenta-num" }, `Cuenta ${i + 1}`),
        el("button", {
          class: "cuenta-del", title: "Eliminar esta cuenta",
          onclick: () => { entry.cuentas.splice(i, 1); guardar(false); pintar(); },
        }, "🗑"),
      );

      const filaTexto = (icono, ph, key, tipo) => {
        const inp = el("input", { type: tipo || "text", placeholder: ph, autocomplete: "off", spellcheck: "false" });
        inp.value = c[key] || "";
        inp.addEventListener("input", () => (c[key] = inp.value));
        const acc = el("div", { class: "cuenta-acc" });
        if (tipo === "password") {
          acc.append(el("button", {
            class: "ic-btn", title: "Mostrar / ocultar",
            onclick: (e) => {
              inp.type = inp.type === "password" ? "text" : "password";
              e.currentTarget.textContent = inp.type === "password" ? "👁" : "🙈";
            },
          }, "👁"));
        }
        acc.append(el("button", {
          class: "ic-btn", title: "Copiar",
          onclick: (e) => copiar(inp.value, e.currentTarget),
        }, "📋"));
        return el("label", { class: "cuenta-fila" },
          el("span", { class: "cuenta-ic" }, icono),
          inp, acc,
        );
      };

      const notas = el("textarea", { rows: "2", placeholder: "Notas: para qué sirve esta cuenta, permisos, a quién pertenece…" });
      notas.value = c.notas || "";
      notas.addEventListener("input", () => (c.notas = notas.value));

      box.append(
        cabeza,
        filaTexto("👤", "Usuario o correo", "usuario"),
        filaTexto("🔒", "Contraseña", "clave", "password"),
        el("label", { class: "cuenta-fila cuenta-fila-notas" }, el("span", { class: "cuenta-ic" }, "📝"), notas),
      );
      return box;
    }

    function pintar() {
      cont.textContent = "";
      cont.append(
        el("h2", {}, el("span", { class: "modal-emoji" }, t.emoji), ` ${t.nombre}`),
        el("p", { class: "sub" }, "Usuarios y contraseñas de esta herramienta. Se guardan solo en este navegador — nunca se suben a GitHub."),
      );

      if (!entry.cuentas.length) {
        cont.append(el("p", { class: "cuenta-vacio" }, "Todavía no has guardado ninguna cuenta."));
      } else {
        cont.append(el("div", { class: "cuentas-lista" }, entry.cuentas.map(cuentaCard)));
      }

      cont.append(el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-ghost btn-sm", onclick: () => { entry.cuentas.push({ usuario: "", clave: "", notas: "" }); pintar(); } }, "+ Agregar cuenta"),
        el("button", { class: "btn btn-verde btn-sm", onclick: () => guardar(true) }, "Guardar y cerrar"),
      ));
      cont.append(el("p", { class: "mini-aviso" }, "⚠️ Cualquiera que use este navegador puede ver estas claves. Úsalo en tu equipo personal."));
    }

    pintar();
    abrirModal(cont);
  }

  /* ---------- modal: exportar / importar claves ---------- */
  function modalClavesGlobal() {
    const cred = leerCred();
    const n = Object.keys(cred).length;
    const cont = el("div", {},
      el("h2", {}, "🔑 Claves guardadas"),
      el("p", { class: "sub" }, `Tienes claves para ${n} herramienta(s), guardadas solo en este navegador.`),
      el("h3", {}, "Mover a otro equipo o navegador"),
      el("p", { class: "sub" }, "Exporta un archivo, cópialo al otro equipo y ahí impórtalo. El archivo contiene contraseñas en texto plano: guárdalo con cuidado y bórralo cuando termines."),
      el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-primary btn-sm", onclick: exportarClaves }, "⬇ Exportar claves"),
        el("button", { class: "btn btn-ghost btn-sm", onclick: () => $("#importFile").click() }, "⬆ Importar claves"),
        el("button", { class: "btn btn-ghost btn-sm", onclick: () => {
          if (confirm("¿Borrar TODAS las claves guardadas en este navegador?")) { localStorage.removeItem(LS_CRED); cerrarModal(); renderLista(); }
        } }, "Borrar todo"),
      ),
    );
    abrirModal(cont);
  }

  function exportarClaves() {
    descargar("claves-consolidado.json", leerCred());
  }
  $("#importFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (typeof obj !== "object" || Array.isArray(obj)) throw 0;
        const actual = leerCred();
        guardarCred({ ...actual, ...obj });
        cerrarModal(); renderLista();
        alert("Claves importadas.");
      } catch { alert("El archivo no es válido."); }
      e.target.value = "";
    };
    r.readAsText(f);
  });

  /* ---------- modal: editar catálogo ---------- */
  function modalCatalogo() {
    // base: lo que se ve ahora, sin los repos "nuevos" detectados por GitHub
    const copia = structuredClone(TOOLS).filter((x) => x.emoji !== "🆕");
    let sel = copia[0]?.id;
    const cont = el("div");

    const construirArchivo = () => ({
      _comentario: "Catálogo de herramientas. Las contraseñas NO van aquí (se guardan solo en el navegador).",
      categorias: CAT,
      herramientas: copia.map((x) => ({
        id: x.id, nombre: x.nombre, descripcion: x.descripcion, categoria: x.categoria,
        emoji: x.emoji, estado: x.estado, destacado: !!x.destacado,
        ...(x.oculto ? { oculto: true } : {}),
        tags: (x.tags || []).map((s) => s.trim()).filter(Boolean),
        repo: x.repo, enlaces: (x.enlaces || []).filter((e) => e.url),
      })),
    });

    const aplicar = (recargar) => {
      guardarCat(construirArchivo());
      const f = leerCat();
      CAT = f.categorias;
      TOOLS = f.herramientas.map(normalizar).filter((t) => !t.oculto);
      render();
      if (recargar) { pintar(); } else { cerrarModal(); enriquecerGitHub().catch(() => {}); }
    };

    function pintar() {
      cont.textContent = "";
      cont.append(el("h2", {}, "✎ Editar catálogo"));
      cont.append(el("p", { class: "sub" },
        hayCatLocal()
          ? "Tus cambios se guardan en este navegador. Para que los vean todos, descarga tools.json y súbelo al repo."
          : "Edita nombres, descripciones y enlaces. Los cambios se guardan en tu navegador al pulsar Guardar."));

      const t = copia.find((x) => x.id === sel);

      const picker = el("select", { onchange: (e) => { sel = e.target.value; pintar(); } },
        copia.map((x) => el("option", { value: x.id, ...(x.id === sel ? { selected: "selected" } : {}) }, `${x.emoji} ${x.nombre}`)));
      cont.append(el("div", { class: "campo" }, el("label", {}, "Herramienta"),
        el("div", { class: "fila" }, picker,
          el("button", { class: "btn btn-ghost btn-sm", onclick: () => {
            const id = (prompt("Identificador corto (sin espacios). Si es un repo de GitHub, se enlaza solo:") || "").trim();
            if (!id || copia.some((x) => x.id === id)) return;
            copia.push({ id, nombre: titulizar(id), descripcion: "", categoria: "Por clasificar", emoji: "🔗", estado: "activo", destacado: false, oculto: false, tags: [], repo: `https://github.com/${OWNER}/${id}`, enlaces: [] });
            sel = id; pintar();
          } }, "+ Herramienta"))));
      if (!t) return;

      const campo = (label, key, tag = "input") => {
        const inp = el(tag, tag === "textarea" ? { rows: "3" } : {});
        inp.value = t[key] ?? "";
        inp.addEventListener("input", () => (t[key] = inp.value));
        return el("div", { class: "campo" }, el("label", {}, label), inp);
      };
      cont.append(campo("Nombre", "nombre"));
      cont.append(campo("Descripción (para qué sirve)", "descripcion", "textarea"));

      const cats = [...new Set([...CAT, ...copia.map((x) => x.categoria)])].filter(Boolean);
      const catInput = el("input", { list: "cat-list", value: t.categoria || "" });
      catInput.addEventListener("input", () => (t.categoria = catInput.value));
      const estadoSel = el("select", { onchange: (e) => (t.estado = e.target.value) },
        ["activo", "beta", "borrador", "archivado"].map((s) => el("option", { ...(s === t.estado ? { selected: "selected" } : {}) }, s)));
      cont.append(el("div", { class: "fila" },
        el("div", { class: "campo", style: "flex:2" }, el("label", {}, "Categoría"), catInput,
          el("datalist", { id: "cat-list" }, cats.map((c) => el("option", { value: c })))),
        campo("Emoji", "emoji"),
        el("div", { class: "campo" }, el("label", {}, "Estado"), estadoSel)));

      const tagsInp = el("input", { value: (t.tags || []).join(", ") });
      tagsInp.addEventListener("input", () => (t.tags = tagsInp.value.split(",").map((s) => s.trim()).filter(Boolean)));
      cont.append(el("div", { class: "campo" }, el("label", {}, "Etiquetas (separadas por coma)"), tagsInp));

      const destChk = el("input", { type: "checkbox", ...(t.destacado ? { checked: "checked" } : {}) });
      destChk.onchange = () => (t.destacado = destChk.checked);
      cont.append(el("label", { class: "chk" }, destChk, " Destacar (fijar arriba de su categoría)"));

      cont.append(el("h3", {}, "Enlaces"));
      (t.enlaces ||= []).forEach((lnk, i) => {
        cont.append(el("div", { class: "enlace-edit" },
          el("input", { placeholder: "Etiqueta (ej. Formulario)", value: lnk.etiqueta || "", oninput: (e) => (lnk.etiqueta = e.target.value) }),
          el("input", { placeholder: "https://…", value: lnk.url || "", oninput: (e) => (lnk.url = e.target.value) }),
          el("select", { onchange: (e) => (lnk.tipo = e.target.value) },
            TIPOS.map((tp) => el("option", { value: tp, ...(tp === (lnk.tipo || "publico") ? { selected: "selected" } : {}) }, TIPO_TXT[tp]))),
          el("button", { class: "btn btn-ghost btn-sm", title: "Quitar enlace", onclick: () => { t.enlaces.splice(i, 1); pintar(); } }, "✕"),
        ));
      });
      cont.append(el("button", { class: "btn btn-ghost btn-sm", onclick: () => { t.enlaces.push({ etiqueta: "", url: "", tipo: "publico" }); pintar(); } }, "+ Agregar enlace"));

      cont.append(el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-verde btn-sm", onclick: () => aplicar(false) }, "Guardar cambios"),
        el("button", { class: "btn btn-primary btn-sm", onclick: () => descargar("tools.json", construirArchivo()) }, "⬇ Descargar tools.json"),
        el("button", {
          class: "btn btn-ghost btn-sm",
          onclick: () => { if (confirm(`¿Quitar "${t.nombre}" del catálogo?`)) { const j = copia.findIndex((x) => x.id === t.id); copia.splice(j, 1); sel = copia[0]?.id; pintar(); } },
        }, "Quitar del catálogo"),
      ));

      if (hayCatLocal()) {
        cont.append(el("button", {
          class: "btn btn-ghost btn-sm", style: "margin-top:8px",
          onclick: () => { if (confirm("¿Descartar tus cambios locales y volver al catálogo del repositorio?")) { localStorage.removeItem(LS_CAT); cerrarModal(); cargar(); } },
        }, "↩ Descartar mis cambios locales"));
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

  /* ---------- eventos globales ---------- */
  $("#q").addEventListener("input", (e) => { busqueda = e.target.value; renderLista(); });
  $("#btnTema").addEventListener("click", () => aplicarTema(document.documentElement.dataset.tema === "dark" ? "light" : "dark", true));
  $("#btnClaves").addEventListener("click", modalClavesGlobal);
  $("#btnCatalogo").addEventListener("click", modalCatalogo);

  cargar().catch((err) => {
    $("#lista").innerHTML = `<p class="vacio">No se pudo cargar <code>data/tools.json</code>.<br>${String(err)}</p>`;
  });
})();
