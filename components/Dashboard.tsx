"use client";

import { useMemo, useState, useEffect } from "react";
import type { DashboardData } from "@/lib/tools";
import type { Tool } from "@/lib/types";
import ToolModal from "@/components/ToolModal";

export type ClientTool = Tool & { _tieneCuentas: boolean };
type ClientData = Omit<DashboardData, "tools"> & { tools: ClientTool[] };

const ESTADO_STYLE: Record<string, string> = {
  activo: "bg-verde-500/15 text-verde-600 dark:text-verde-400",
  beta: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  borrador: "bg-cafe-400/15 text-cafe-600 dark:text-cafe-300",
  archivado: "bg-zinc-500/15 text-zinc-500",
};

const LINK_STYLE: Record<string, string> = {
  publico: "bg-cafe-600 text-white hover:bg-cafe-700",
  formulario: "bg-cafe-600 text-white hover:bg-cafe-700",
  panel: "bg-verde-500/15 text-verde-700 hover:bg-verde-500/25 dark:text-verde-400",
  admin: "bg-verde-500/15 text-verde-700 hover:bg-verde-500/25 dark:text-verde-400",
  otro: "bg-cafe-100 text-cafe-600 hover:bg-cafe-200 dark:bg-white/5 dark:text-cafe-200",
};

const LINK_ICON: Record<string, string> = {
  publico: "🌐",
  formulario: "📝",
  panel: "📊",
  admin: "🔐",
  otro: "🔗",
};

function fechaRelativa(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const dias = Math.round((Date.now() - d.getTime()) / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  if (dias < 365) return `hace ${Math.round(dias / 30)} meses`;
  return `hace ${Math.round(dias / 365)} años`;
}

export default function Dashboard({
  data,
  authed,
  authEnabled,
}: {
  data: ClientData;
  authed: boolean;
  authEnabled: boolean;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [soloConLink, setSoloConLink] = useState(false);
  const [soloCuentas, setSoloCuentas] = useState(false);
  const [dark, setDark] = useState(false);
  const [sel, setSel] = useState<ClientTool | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTema() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tema", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.tools.filter((t) => {
      if (cat !== "Todas" && t.categoria !== cat) return false;
      if (soloConLink && !t.url) return false;
      if (soloCuentas && !t._tieneCuentas) return false;
      if (!term) return true;
      return (
        t.nombre.toLowerCase().includes(term) ||
        t.descripcion.toLowerCase().includes(term) ||
        t.slug.toLowerCase().includes(term) ||
        t.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }, [data.tools, q, cat, soloConLink, soloCuentas]);

  const grupos = useMemo(() => {
    const map = new Map<string, ClientTool[]>();
    for (const t of filtradas) {
      const arr = map.get(t.categoria) ?? [];
      arr.push(t);
      map.set(t.categoria, arr);
    }
    return [...map.entries()].sort(
      (a, b) =>
        data.categorias.indexOf(a[0]) - data.categorias.indexOf(b[0]),
    );
  }, [filtradas, data.categorias]);

  const conLink = data.tools.filter((t) => t.url).length;

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 card-shadow">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cafe-500 to-cafe-700 text-lg text-white shadow">
              ☕
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                Consolidado de enlaces
              </h1>
              <p className="truncate text-xs text-cafe-500 dark:text-cafe-300">
                Alianza Educación Rural · {data.tools.length} herramientas
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/alianzaeducacionrural"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-cafe-600 transition hover:bg-cafe-100 dark:text-cafe-200 dark:hover:bg-white/5 sm:block"
            >
              GitHub ↗
            </a>
            <button
              onClick={toggleTema}
              aria-label="Cambiar tema"
              className="grid h-9 w-9 place-items-center rounded-lg text-cafe-600 transition hover:bg-cafe-100 dark:text-cafe-200 dark:hover:bg-white/5"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            {authed && (
              <a
                href="/panel"
                className="rounded-lg bg-verde-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-verde-600"
              >
                Editar
              </a>
            )}
            {authEnabled &&
              (authed ? (
                <button
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    location.reload();
                  }}
                  className="rounded-lg bg-cafe-100 px-3 py-1.5 text-xs font-medium text-cafe-700 transition hover:bg-cafe-200 dark:bg-white/5 dark:text-cafe-200 dark:hover:bg-white/10"
                >
                  Salir
                </button>
              ) : (
                <a
                  href="/login"
                  className="rounded-lg bg-cafe-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cafe-700"
                >
                  Entrar
                </a>
              ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <h2 className="hero-text text-3xl font-extrabold tracking-tight sm:text-4xl">
            Todas tus herramientas, en un solo lugar
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-cafe-600 dark:text-cafe-300">
            Busca por nombre, categoría o etiqueta y abre cada plataforma sin
            perderte entre repos y despliegues.
            {!data.githubOk && (
              <span className="mt-1 block text-amber-600 dark:text-amber-400">
                ⚠️ No se pudo consultar GitHub ahora mismo; se muestran los
                datos definidos manualmente.
              </span>
            )}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Herramientas" value={data.tools.length} />
            <Stat label="Con enlace directo" value={conLink} />
            <Stat label="Categorías" value={data.categorias.length} />
            <Stat
              label="Repos en GitHub"
              value={data.totalRepos || data.tools.length}
            />
          </div>
        </section>

        {/* Controles */}
        <div className="glass card-shadow sticky top-[61px] z-10 mb-6 rounded-2xl p-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cafe-400">
                🔎
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar herramienta, etiqueta o repo…"
                className="w-full rounded-xl border border-cafe-200 bg-white/80 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cafe-400 focus:ring-2 focus:ring-cafe-400/30 dark:border-white/10 dark:bg-black/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Chip active={cat === "Todas"} onClick={() => setCat("Todas")}>
                Todas
              </Chip>
              {data.categorias.map((c) => (
                <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                  {c}
                </Chip>
              ))}

              <span className="mx-1 h-4 w-px bg-cafe-200 dark:bg-white/10" />
              <Toggle active={soloConLink} onClick={() => setSoloConLink((v) => !v)}>
                Solo con enlace
              </Toggle>
              {authed && (
                <Toggle
                  active={soloCuentas}
                  onClick={() => setSoloCuentas((v) => !v)}
                >
                  Con usuarios/claves
                </Toggle>
              )}
            </div>
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div className="glass card-shadow rounded-2xl p-10 text-center">
            <p className="text-3xl">🫙</p>
            <p className="mt-2 text-sm text-cafe-600 dark:text-cafe-300">
              No hay herramientas que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-9">
            {grupos.map(([categoria, tools]) => (
              <section key={categoria}>
                <div className="mb-3 flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-cafe-500 dark:text-cafe-300">
                    {categoria}
                  </h3>
                  <span className="text-xs text-cafe-400">{tools.length}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((t) => (
                    <Card key={t.slug} t={t} onOpen={() => setSel(t)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-14 border-t border-cafe-200/60 pt-6 text-xs text-cafe-400 dark:border-white/10">
          Datos sincronizados desde GitHub · última actualización{" "}
          {new Date(data.actualizado).toLocaleString("es-CO")}
        </footer>
      </main>

      {sel && (
        <ToolModal
          tool={sel}
          authed={authed}
          authEnabled={authEnabled}
          onClose={() => setSel(null)}
        />
      )}
    </div>
  );

  function Card({ t, onOpen }: { t: ClientTool; onOpen: () => void }) {
    return (
      <article
        className={`group glass card-shadow relative flex flex-col rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cafe-300 dark:hover:border-white/20 ${
          t.destacado ? "ring-1 ring-cafe-400/40" : ""
        }`}
      >
        {t.destacado && (
          <span className="absolute -top-2 right-3 rounded-full bg-gradient-to-r from-cafe-500 to-verde-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            destacado
          </span>
        )}
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cafe-100 to-cafe-200 text-xl dark:from-white/10 dark:to-white/5">
            {t.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-semibold">{t.nombre}</h4>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span
                className={`rounded px-1.5 py-0.5 font-medium ${ESTADO_STYLE[t.estado] ?? ESTADO_STYLE.borrador}`}
              >
                {t.estado}
              </span>
              {!t.clasificado && (
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                  por clasificar
                </span>
              )}
              {t._tieneCuentas && authed && (
                <span className="rounded bg-cafe-500/15 px-1.5 py-0.5 font-medium text-cafe-600 dark:text-cafe-300">
                  👤 usuarios
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-cafe-600 dark:text-cafe-300">
          {t.descripcion}
        </p>

        <div className="mt-3 flex flex-1 flex-wrap items-start gap-1.5 pt-1">
          {t.enlaces.length > 0 ? (
            t.enlaces.map((e, i) => (
              <a
                key={i}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                  LINK_STYLE[e.tipo] ?? LINK_STYLE.otro
                }`}
              >
                {LINK_ICON[e.tipo] ?? "🔗"} {e.etiqueta} ↗
              </a>
            ))
          ) : (
            <span className="rounded-lg bg-cafe-100 px-2 py-1 text-[11px] font-medium text-cafe-400 dark:bg-white/5">
              Sin enlace todavía
            </span>
          )}
        </div>

        {t.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {t.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-cafe-100/70 px-1.5 py-0.5 text-[11px] text-cafe-500 dark:bg-white/5 dark:text-cafe-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-cafe-200/50 pt-2 text-xs dark:border-white/5">
          <button
            onClick={onOpen}
            className="rounded-lg px-2.5 py-1 font-medium text-cafe-600 transition hover:bg-cafe-100 dark:text-cafe-200 dark:hover:bg-white/5"
          >
            Ver detalle
          </button>
          <a
            href={t.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-2.5 py-1 font-medium text-cafe-500 transition hover:bg-cafe-100 dark:text-cafe-300 dark:hover:bg-white/5"
          >
            GitHub
          </a>
          <span className="ml-auto text-cafe-400">
            {fechaRelativa(t.actualizado)}
          </span>
        </div>
      </article>
    );
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass card-shadow rounded-xl px-3 py-2.5">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] text-cafe-500 dark:text-cafe-300">{label}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-cafe-600 text-white"
          : "bg-cafe-100 text-cafe-600 hover:bg-cafe-200 dark:bg-white/5 dark:text-cafe-200 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-verde-500 bg-verde-500/15 text-verde-600 dark:text-verde-400"
          : "border-cafe-200 text-cafe-500 hover:bg-cafe-100 dark:border-white/10 dark:text-cafe-300 dark:hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
