"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LinkKind, ToolAccount, ToolLink, ToolStatus } from "@/lib/types";

export interface FilaEditable {
  slug: string;
  enRepo: boolean;
  nombre: string;
  descripcion: string;
  placeholderNombre: string;
  placeholderDescripcion: string;
  categoria: string;
  emoji: string;
  estado: ToolStatus;
  destacado: boolean;
  oculto: boolean;
  notas: string;
  tags: string[];
  enlaces: ToolLink[];
  cuentaNota: string;
  cuentas: ToolAccount[];
}

const ESTADOS: ToolStatus[] = ["activo", "beta", "borrador", "archivado"];
const TIPOS: { v: LinkKind; t: string }[] = [
  { v: "publico", t: "Público" },
  { v: "formulario", t: "Formulario" },
  { v: "panel", t: "Panel" },
  { v: "admin", t: "Administración" },
  { v: "otro", t: "Otro" },
];

const fieldBase =
  "rounded-lg border border-cafe-200 bg-white/80 px-2.5 py-1.5 text-sm outline-none transition focus:border-cafe-400 focus:ring-2 focus:ring-cafe-400/25 dark:border-white/10 dark:bg-black/20";
const input = "w-full " + fieldBase;
const label = "text-xs font-medium text-cafe-500 dark:text-cafe-300";

export default function PanelEditor({
  filasIniciales,
  categorias,
}: {
  filasIniciales: FilaEditable[];
  categorias: string[];
}) {
  const [filas, setFilas] = useState<FilaEditable[]>(filasIniciales);
  const [selSlug, setSelSlug] = useState<string>(filasIniciales[0]?.slug ?? "");
  const [q, setQ] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sucio, setSucio] = useState(false);

  const catList = useMemo(() => {
    const s = new Set<string>(categorias);
    filas.forEach((f) => f.categoria && s.add(f.categoria));
    return [...s].sort((a, b) => a.localeCompare(b, "es"));
  }, [categorias, filas]);

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase();
    return filas.filter(
      (f) =>
        !term ||
        f.slug.toLowerCase().includes(term) ||
        f.nombre.toLowerCase().includes(term) ||
        f.categoria.toLowerCase().includes(term),
    );
  }, [filas, q]);

  const sel = filas.find((f) => f.slug === selSlug);

  function update(slug: string, patch: Partial<FilaEditable>) {
    setFilas((prev) =>
      prev.map((f) => (f.slug === slug ? { ...f, ...patch } : f)),
    );
    setSucio(true);
    setMsg(null);
  }

  function agregarManual() {
    const slug = prompt(
      "Identificador de la herramienta (sin espacios). Si coincide con un repo de GitHub, se enlaza solo.",
    )?.trim();
    if (!slug) return;
    if (filas.some((f) => f.slug === slug)) {
      setSelSlug(slug);
      return;
    }
    const nueva: FilaEditable = {
      slug,
      enRepo: false,
      nombre: "",
      descripcion: "",
      placeholderNombre: slug,
      placeholderDescripcion: "",
      categoria: "",
      emoji: "🔗",
      estado: "borrador",
      destacado: false,
      oculto: false,
      notas: "",
      tags: [],
      enlaces: [],
      cuentaNota: "",
      cuentas: [],
    };
    setFilas((p) => [...p, nueva]);
    setSelSlug(slug);
    setSucio(true);
  }

  function construirPayload() {
    const tools: Record<string, unknown> = {};
    const accounts: Record<string, unknown> = {};
    for (const f of filas) {
      const o: Record<string, unknown> = {};
      if (f.nombre.trim()) o.nombre = f.nombre.trim();
      if (f.descripcion.trim()) o.descripcion = f.descripcion.trim();
      if (f.categoria.trim()) o.categoria = f.categoria.trim();
      if (f.emoji.trim()) o.emoji = f.emoji.trim();
      if (f.estado !== "activo") o.estado = f.estado;
      if (f.destacado) o.destacado = true;
      if (f.oculto) o.oculto = true;
      if (f.notas.trim()) o.notas = f.notas.trim();
      const tags = f.tags.map((t) => t.trim()).filter(Boolean);
      if (tags.length) o.tags = tags;
      const enlaces = f.enlaces
        .filter((e) => e.url.trim())
        .map((e) => ({
          etiqueta: e.etiqueta.trim() || "Enlace",
          url: e.url.trim(),
          tipo: e.tipo,
        }));
      if (enlaces.length) o.enlaces = enlaces;
      if (Object.keys(o).length) tools[f.slug] = o;

      const cuentas = f.cuentas.filter(
        (c) => c.usuario?.trim() || c.clave?.trim() || c.rol?.trim(),
      );
      if (cuentas.length || f.cuentaNota.trim()) {
        accounts[f.slug] = {
          ...(f.cuentaNota.trim() ? { nota: f.cuentaNota.trim() } : {}),
          ...(cuentas.length ? { cuentas } : {}),
        };
      }
    }
    return {
      overrides: { meta: { ordenCategorias: categorias }, tools },
      accounts,
    };
  }

  async function guardar() {
    setGuardando(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(construirPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al guardar");
      setSucio(false);
      if (data.overrides === "escrito" && data.accounts === "escrito") {
        setMsg("✅ Guardado en el servidor. Recarga el dashboard para ver los cambios.");
      } else {
        setMsg(
          "⚠️ No se pudo escribir en disco (normal en Vercel). Usa los botones de descarga y sube los archivos al repositorio / variables de entorno.",
        );
      }
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Error"));
    } finally {
      setGuardando(false);
    }
  }

  function descargar(nombre: string, contenido: unknown) {
    const blob = new Blob([JSON.stringify(contenido, null, 2) + "\n"], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const payload = construirPayload();

  return (
    <div className="min-h-screen">
      <header className="glass card-shadow sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="text-sm font-semibold">
            ☕ Consolidado
          </Link>
          <span className="text-cafe-400">/</span>
          <span className="text-sm font-semibold">Panel de edición</span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => descargar("overrides.json", payload.overrides)}
              className="rounded-lg bg-cafe-100 px-2.5 py-1.5 text-xs font-medium text-cafe-700 hover:bg-cafe-200 dark:bg-white/5 dark:text-cafe-200"
            >
              ↓ overrides.json
            </button>
            <button
              onClick={() => descargar("accounts.local.json", payload.accounts)}
              className="rounded-lg bg-cafe-100 px-2.5 py-1.5 text-xs font-medium text-cafe-700 hover:bg-cafe-200 dark:bg-white/5 dark:text-cafe-200"
            >
              ↓ accounts.local.json
            </button>
            <button
              onClick={guardar}
              disabled={guardando || !sucio}
              className="rounded-lg bg-cafe-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cafe-700 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : sucio ? "Guardar cambios" : "Sin cambios"}
            </button>
          </div>
        </div>
        {msg && (
          <div className="border-t border-cafe-200/60 px-4 py-2 text-xs dark:border-white/10">
            {msg}
          </div>
        )}
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* Lista */}
        <aside className="glass card-shadow h-fit rounded-2xl p-2 md:sticky md:top-24">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar…"
            className={input + " mb-2"}
          />
          <div className="max-h-[60vh] space-y-0.5 overflow-y-auto">
            {visibles.map((f) => (
              <button
                key={f.slug}
                onClick={() => setSelSlug(f.slug)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                  f.slug === selSlug
                    ? "bg-cafe-600 text-white"
                    : "hover:bg-cafe-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{f.emoji || "🔗"}</span>
                <span className="min-w-0 flex-1 truncate">
                  {f.nombre || f.placeholderNombre}
                </span>
                {f.oculto && <span title="Oculto">🙈</span>}
                {!f.enRepo && <span title="Sin repo">✎</span>}
              </button>
            ))}
          </div>
          <button
            onClick={agregarManual}
            className="mt-2 w-full rounded-lg border border-dashed border-cafe-300 px-2 py-1.5 text-xs text-cafe-600 hover:bg-cafe-100 dark:border-white/15 dark:text-cafe-300 dark:hover:bg-white/5"
          >
            + Herramienta manual
          </button>
        </aside>

        {/* Editor */}
        {sel ? (
          <section className="glass card-shadow rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-base font-semibold">{sel.slug}</h2>
              <span className="rounded bg-cafe-100 px-1.5 py-0.5 text-[11px] text-cafe-500 dark:bg-white/5">
                {sel.enRepo ? "repo de GitHub" : "manual"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>Nombre</span>
                <input
                  className={input}
                  value={sel.nombre}
                  placeholder={sel.placeholderNombre}
                  onChange={(e) => update(sel.slug, { nombre: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Descripción (para qué sirve)</span>
                <textarea
                  className={input}
                  rows={3}
                  value={sel.descripcion}
                  placeholder={
                    sel.placeholderDescripcion || "Explica la intención de esta herramienta…"
                  }
                  onChange={(e) =>
                    update(sel.slug, { descripcion: e.target.value })
                  }
                />
              </div>

              <div>
                <span className={label}>Categoría</span>
                <input
                  className={input}
                  list="cats"
                  value={sel.categoria}
                  placeholder="Por clasificar"
                  onChange={(e) =>
                    update(sel.slug, { categoria: e.target.value })
                  }
                />
                <datalist id="cats">
                  {catList.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className={label}>Emoji</span>
                  <input
                    className={input}
                    value={sel.emoji}
                    maxLength={4}
                    onChange={(e) => update(sel.slug, { emoji: e.target.value })}
                  />
                </div>
                <div>
                  <span className={label}>Estado</span>
                  <select
                    className={input}
                    value={sel.estado}
                    onChange={(e) =>
                      update(sel.slug, { estado: e.target.value as ToolStatus })
                    }
                  >
                    {ESTADOS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className={label}>Etiquetas (separadas por coma)</span>
                <input
                  className={input}
                  value={sel.tags.join(", ")}
                  onChange={(e) =>
                    update(sel.slug, {
                      tags: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sel.destacado}
                  onChange={(e) =>
                    update(sel.slug, { destacado: e.target.checked })
                  }
                />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sel.oculto}
                  onChange={(e) => update(sel.slug, { oculto: e.target.checked })}
                />
                Ocultar del dashboard
              </label>
            </div>

            {/* Enlaces */}
            <Bloque
              titulo="Enlaces"
              onAdd={() =>
                update(sel.slug, {
                  enlaces: [
                    ...sel.enlaces,
                    { etiqueta: "", url: "", tipo: "publico" },
                  ],
                })
              }
            >
              {sel.enlaces.length === 0 && (
                <p className="text-xs text-cafe-400">
                  Sin enlaces. Agrega el formulario, el panel de administración, etc.
                </p>
              )}
              {sel.enlaces.map((e, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    className={fieldBase + " w-40 flex-none"}
                    placeholder="Etiqueta"
                    value={e.etiqueta}
                    onChange={(ev) => {
                      const n = [...sel.enlaces];
                      n[i] = { ...e, etiqueta: ev.target.value };
                      update(sel.slug, { enlaces: n });
                    }}
                  />
                  <input
                    className={fieldBase + " min-w-[200px] flex-1"}
                    placeholder="https://…"
                    value={e.url}
                    onChange={(ev) => {
                      const n = [...sel.enlaces];
                      n[i] = { ...e, url: ev.target.value };
                      update(sel.slug, { enlaces: n });
                    }}
                  />
                  <select
                    className={fieldBase + " w-40 flex-none"}
                    value={e.tipo}
                    onChange={(ev) => {
                      const n = [...sel.enlaces];
                      n[i] = { ...e, tipo: ev.target.value as LinkKind };
                      update(sel.slug, { enlaces: n });
                    }}
                  >
                    {TIPOS.map((t) => (
                      <option key={t.v} value={t.v}>
                        {t.t}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      update(sel.slug, {
                        enlaces: sel.enlaces.filter((_, j) => j !== i),
                      })
                    }
                    className="text-xs text-red-500 hover:underline"
                  >
                    quitar
                  </button>
                </div>
              ))}
            </Bloque>

            {/* Cuentas */}
            <Bloque
              titulo="Usuarios y contraseñas"
              onAdd={() =>
                update(sel.slug, {
                  cuentas: [
                    ...sel.cuentas,
                    { rol: "", usuario: "", clave: "", url: "", notas: "" },
                  ],
                })
              }
            >
              <input
                className={input + " mb-2"}
                placeholder="Nota general (ej. cómo se entra, dónde están las claves…)"
                value={sel.cuentaNota}
                onChange={(e) =>
                  update(sel.slug, { cuentaNota: e.target.value })
                }
              />
              {sel.cuentas.map((c, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-xl border border-cafe-200 p-2 dark:border-white/10 sm:grid-cols-2"
                >
                  <input
                    className={input}
                    placeholder="Rol (Admin, Consulta…)"
                    value={c.rol ?? ""}
                    onChange={(ev) =>
                      updCuenta(sel, i, { rol: ev.target.value }, update)
                    }
                  />
                  <input
                    className={input}
                    placeholder="URL de acceso (opcional)"
                    value={c.url ?? ""}
                    onChange={(ev) =>
                      updCuenta(sel, i, { url: ev.target.value }, update)
                    }
                  />
                  <input
                    className={input}
                    placeholder="Usuario / correo"
                    value={c.usuario ?? ""}
                    onChange={(ev) =>
                      updCuenta(sel, i, { usuario: ev.target.value }, update)
                    }
                  />
                  <input
                    className={input}
                    placeholder="Contraseña"
                    value={c.clave ?? ""}
                    onChange={(ev) =>
                      updCuenta(sel, i, { clave: ev.target.value }, update)
                    }
                  />
                  <input
                    className={input + " sm:col-span-2"}
                    placeholder="Notas"
                    value={c.notas ?? ""}
                    onChange={(ev) =>
                      updCuenta(sel, i, { notas: ev.target.value }, update)
                    }
                  />
                  <button
                    onClick={() =>
                      update(sel.slug, {
                        cuentas: sel.cuentas.filter((_, j) => j !== i),
                      })
                    }
                    className="justify-self-start text-xs text-red-500 hover:underline"
                  >
                    quitar cuenta
                  </button>
                </div>
              ))}
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                ⚠️ Las contraseñas se guardan como texto plano en{" "}
                <code>accounts.local.json</code> (fuera de Git) o en la variable{" "}
                <code>ACCOUNTS_JSON</code>. No subas ese archivo a un repo público.
              </p>
            </Bloque>

            <div className="mt-4">
              <span className={label}>Notas internas</span>
              <textarea
                className={input}
                rows={2}
                value={sel.notas}
                onChange={(e) => update(sel.slug, { notas: e.target.value })}
              />
            </div>
          </section>
        ) : (
          <section className="glass card-shadow grid place-items-center rounded-2xl p-10 text-sm text-cafe-500">
            Selecciona una herramienta de la lista.
          </section>
        )}
      </main>
    </div>
  );
}

function updCuenta(
  sel: FilaEditable,
  i: number,
  patch: Partial<ToolAccount>,
  update: (slug: string, patch: Partial<FilaEditable>) => void,
) {
  const n = [...sel.cuentas];
  n[i] = { ...n[i], ...patch };
  update(sel.slug, { cuentas: n });
}

function Bloque({
  titulo,
  onAdd,
  children,
}: {
  titulo: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-cafe-200/60 pt-4 dark:border-white/10">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <button
          onClick={onAdd}
          className="rounded-lg bg-cafe-100 px-2 py-1 text-xs font-medium text-cafe-700 hover:bg-cafe-200 dark:bg-white/5 dark:text-cafe-200"
        >
          + Agregar
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
