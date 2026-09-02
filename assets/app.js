/* Consolidado de enlaces — app estática (GitHub Pages) */
(() => {
  "use strict";

  const OWNER = "alianzaeducacionrural";
  const IGNORAR_REPOS = new Set(["consolidado-de-enlaces", "alianzaeducacionrural.github.io"]);
  const LS_CRED = "cde.credenciales.v1";
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
  const credDe = (id) => leerCred()[id] || { nota: "", cuentas: [] };
  const setCredDe = (id, entry) => {
    const all = leerCred();
    if ((!entry.cuentas || !entry.cuentas.length) && !entry.nota) delete all[id];
    else all[id] = entry;
    guardarCred(all);
  };
  const tieneCred = (id) => { const c = leerCred()[id]; return !!c && ((c.cuentas && c.cuentas.length) || c.nota); };

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

  /* ---------- carga de datos ---------- */
  async function cargar() {
    const res = await fetch("./data/tools.json", { cache: "no-cache" });
    const data = await res.json();
    CAT = data.categorias || [];
    TOOLS = (data.herramientas || []).map(normalizar);
    render();
    // Enriquecer con repos nuevos de GitHub (opcional, sin bloquear)
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
    const conocidos = new Set(TOOLS.map((t) => t.id.toLowerCase()));
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
    let entry = structuredClone(credDe(t.id));
    const cont = el("div");

    function pintar() {
      cont.textContent = "";
      cont.append(
        el("h2", {}, `🔑 Claves · ${t.nombre}`),
        el("p", { class: "sub" }, "Se guardan solo en este navegador. Nunca se suben a GitHub."),
      );

      const nota = el("textarea", { rows: "2", placeholder: "Nota general (cómo se entra, dónde está la clave maestra, etc.)" });
      nota.value = entry.nota || "";
      nota.addEventListener("input", () => (entry.nota = nota.value));
      cont.append(el("div", { class: "campo" }, el("label", {}, "Nota general"), nota));

      (entry.cuentas || []).forEach((c, i) => {
        const box = el("div", { class: "cuenta" });
        const mk = (ph, key, val) => {
          const inp = el("input", { placeholder: ph });
          inp.value = val || "";
          inp.addEventListener("input", () => (entry.cuentas[i][key] = inp.value));
          return inp;
        };
        box.append(
          el("div", { class: "fila" }, mk("Rol (Admin, Consulta…)", "rol", c.rol), mk("URL de acceso (opcional)", "url", c.url)),
          el("div", { class: "fila", style: "margin-top:8px" }, mk("Usuario / correo", "usuario", c.usuario), mk("Contraseña", "clave", c.clave)),
          el("input", { placeholder: "Notas", style: "margin-top:8px", oninput: (e) => (entry.cuentas[i].notas = e.target.value), value: c.notas || "" }),
          el("button", {
            class: "btn btn-ghost btn-sm", style: "margin-top:8px",
            onclick: () => { entry.cuentas.splice(i, 1); pintar(); },
          }, "Quitar cuenta"),
        );
        cont.append(box);
      });

      cont.append(el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-ghost btn-sm", onclick: () => { (entry.cuentas ||= []).push({ rol: "", usuario: "", clave: "", url: "", notas: "" }); pintar(); } }, "+ Agregar cuenta"),
        el("button", { class: "btn btn-verde btn-sm", onclick: () => {
          entry.cuentas = (entry.cuentas || []).filter((c) => c.usuario || c.clave || c.rol || c.notas);
          setCredDe(t.id, entry);
          cerrarModal(); renderLista();
        } }, "Guardar"),
      ));
      cont.append(el("p", { class: "mini-aviso" }, "⚠️ Cualquiera con acceso a este equipo puede ver estas claves. Usa el navegador de tu equipo personal."));
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
    const copia = structuredClone(TOOLS);
    let sel = copia[0]?.id;
    const cont = el("div");

    function pintar() {
      cont.textContent = "";
      cont.append(
        el("h2", {}, "✎ Editar catálogo"),
        el("p", { class: "sub" }, "Cambia enlaces y textos, descarga el archivo y reemplaza data/tools.json en el repo (git commit + push)."),
      );

      const t = copia.find((x) => x.id === sel);
      const picker = el("select", { onchange: (e) => { sel = e.target.value; pintar(); } },
        copia.map((x) => el("option", { value: x.id, ...(x.id === sel ? { selected: "selected" } : {}) }, x.nombre)));
      cont.append(el("div", { class: "campo" }, el("label", {}, "Herramienta"), picker));
      if (!t) return;

      const campo = (label, key, tag = "input") => {
        const inp = el(tag, tag === "textarea" ? { rows: "3" } : {});
        inp.value = t[key] ?? "";
        inp.addEventListener("input", () => (t[key] = inp.value));
        return el("div", { class: "campo" }, el("label", {}, label), inp);
      };
      cont.append(campo("Nombre", "nombre"));
      cont.append(campo("Descripción", "descripcion", "textarea"));
      cont.append(el("div", { class: "fila" }, campo("Categoría", "categoria"), campo("Emoji", "emoji")));

      cont.append(el("h3", {}, "Enlaces"));
      (t.enlaces ||= []).forEach((lnk, i) => {
        cont.append(el("div", { class: "enlace-edit" },
          el("input", { placeholder: "Etiqueta", value: lnk.etiqueta || "", oninput: (e) => (lnk.etiqueta = e.target.value) }),
          el("input", { placeholder: "https://…", value: lnk.url || "", oninput: (e) => (lnk.url = e.target.value) }),
          el("select", { onchange: (e) => (lnk.tipo = e.target.value) },
            TIPOS.map((tp) => el("option", { value: tp, ...(tp === (lnk.tipo || "publico") ? { selected: "selected" } : {}) }, TIPO_TXT[tp]))),
          el("button", { class: "btn btn-ghost btn-sm", onclick: () => { t.enlaces.splice(i, 1); pintar(); } }, "✕"),
        ));
      });
      cont.append(el("button", { class: "btn btn-ghost btn-sm", onclick: () => { t.enlaces.push({ etiqueta: "", url: "", tipo: "publico" }); pintar(); } }, "+ Enlace"));

      cont.append(el("div", { class: "modal-acciones" },
        el("button", { class: "btn btn-primary btn-sm", onclick: () => {
          const salida = {
            _comentario: "Catálogo de herramientas. Las contraseñas NO van aquí (se guardan solo en el navegador).",
            categorias: CAT,
            herramientas: copia.filter((x) => x.emoji !== "🆕").map((x) => ({
              id: x.id, nombre: x.nombre, descripcion: x.descripcion, categoria: x.categoria,
              emoji: x.emoji, estado: x.estado, destacado: !!x.destacado, tags: x.tags || [],
              repo: x.repo, enlaces: (x.enlaces || []).filter((e) => e.url),
            })),
          };
          descargar("tools.json", salida);
        } }, "⬇ Descargar tools.json"),
        el("button", { class: "btn btn-verde btn-sm", onclick: () => {
          t.enlaces = (t.enlaces || []).filter((e) => e.url);
          const idx = TOOLS.findIndex((x) => x.id === t.id);
          if (idx >= 0) TOOLS[idx] = normalizar(t);
          render();
        } }, "Aplicar solo aquí (sin descargar)"),
      ));
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
