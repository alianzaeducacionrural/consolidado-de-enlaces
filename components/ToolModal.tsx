"use client";

import { useEffect, useState } from "react";
import type { ClientTool } from "@/components/Dashboard";

const LINK_ICON: Record<string, string> = {
  publico: "🌐",
  formulario: "📝",
  panel: "📊",
  admin: "🔐",
  otro: "🔗",
};
const TIPO_LABEL: Record<string, string> = {
  publico: "público",
  formulario: "formulario",
  panel: "panel",
  admin: "administración",
  otro: "",
};

export default function ToolModal({
  tool,
  authed,
  authEnabled,
  onClose,
}: {
  tool: ClientTool;
  authed: boolean;
  authEnabled: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="glass card-shadow max-h-[90vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-3xl border p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cafe-100 to-cafe-200 text-2xl dark:from-white/10 dark:to-white/5">
            {tool.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-tight">{tool.nombre}</h3>
            <p className="text-xs text-cafe-500 dark:text-cafe-300">
              {tool.categoria} · {tool.estado}
              {tool.lenguaje ? ` · ${tool.lenguaje}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cafe-500 hover:bg-cafe-100 dark:hover:bg-white/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm text-cafe-700 dark:text-cafe-200">
          {tool.descripcion}
        </p>

        {tool.notas && (
          <p className="mt-2 rounded-lg bg-cafe-100/60 p-2 text-xs text-cafe-600 dark:bg-white/5 dark:text-cafe-300">
            📝 {tool.notas}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {tool.enlaces.map((e, i) => (
            <a
              key={i}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-cafe-200 px-3 py-2 text-sm transition hover:border-cafe-400 hover:bg-cafe-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              <span>{LINK_ICON[e.tipo] ?? "🔗"}</span>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{e.etiqueta}</span>
                <span className="block truncate text-[11px] text-cafe-400">
                  {e.url}
                </span>
              </span>
              <span className="text-xs text-cafe-400">
                {TIPO_LABEL[e.tipo] ?? ""} ↗
              </span>
            </a>
          ))}
          <a
            href={tool.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-cafe-200 px-3 py-2 text-sm transition hover:border-cafe-400 hover:bg-cafe-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            <span>💻</span>
            <span className="flex-1 font-medium">Repositorio en GitHub</span>
            <span className="text-xs text-cafe-400">código ↗</span>
          </a>
        </div>

        {tool.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-cafe-100/70 px-1.5 py-0.5 text-[11px] text-cafe-500 dark:bg-white/5 dark:text-cafe-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Usuarios / cuentas */}
        <div className="mt-5 border-t border-cafe-200/60 pt-4 dark:border-white/10">
          <h4 className="mb-2 text-sm font-semibold">👤 Usuarios y accesos</h4>
          {!authEnabled ? (
            <p className="text-xs text-cafe-500 dark:text-cafe-300">
              Define <code className="rounded bg-cafe-100 px-1 dark:bg-white/10">SITE_PASSWORD</code>{" "}
              y añade los datos en{" "}
              <code className="rounded bg-cafe-100 px-1 dark:bg-white/10">data/accounts.local.json</code>{" "}
              (o la variable <code className="rounded bg-cafe-100 px-1 dark:bg-white/10">ACCOUNTS_JSON</code>)
              para ver aquí las cuentas de cada herramienta.
            </p>
          ) : !authed ? (
            <p className="text-xs text-cafe-500 dark:text-cafe-300">
              <a href="/login" className="font-medium text-cafe-700 underline dark:text-cafe-100">
                Inicia sesión
              </a>{" "}
              para ver usuarios y contraseñas.
            </p>
          ) : tool.cuentas.length === 0 && !tool.notaCuentas ? (
            <p className="text-xs text-cafe-500 dark:text-cafe-300">
              Sin datos de usuarios registrados para esta herramienta.
            </p>
          ) : (
            <div className="space-y-2">
              {tool.notaCuentas && (
                <p className="text-xs text-cafe-600 dark:text-cafe-300">
                  {tool.notaCuentas}
                </p>
              )}
              {tool.cuentas.map((c, i) => (
                <Cuenta key={i} c={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Cuenta({
  c,
}: {
  c: { rol?: string; usuario?: string; clave?: string; url?: string; notas?: string };
}) {
  const [ver, setVer] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  function copiar(txt: string, campo: string) {
    navigator.clipboard?.writeText(txt).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 1200);
    });
  }

  return (
    <div className="rounded-xl border border-cafe-200 p-2.5 text-xs dark:border-white/10">
      {c.rol && <div className="mb-1 font-semibold">{c.rol}</div>}
      {c.usuario && (
        <Row
          label="Usuario"
          value={c.usuario}
          onCopy={() => copiar(c.usuario!, "u")}
          copiado={copiado === "u"}
        />
      )}
      {c.clave && (
        <Row
          label="Clave"
          value={ver ? c.clave : "•".repeat(Math.min(c.clave.length, 12))}
          onCopy={() => copiar(c.clave!, "c")}
          copiado={copiado === "c"}
          extra={
            <button
              onClick={() => setVer((v) => !v)}
              className="text-cafe-500 hover:text-cafe-700 dark:hover:text-cafe-100"
            >
              {ver ? "ocultar" : "ver"}
            </button>
          }
        />
      )}
      {c.url && (
        <div className="mt-1">
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="text-cafe-600 underline dark:text-cafe-300"
          >
            {c.url}
          </a>
        </div>
      )}
      {c.notas && (
        <div className="mt-1 text-cafe-500 dark:text-cafe-400">{c.notas}</div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  copiado,
  extra,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copiado: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-14 shrink-0 text-cafe-400">{label}</span>
      <span className="min-w-0 flex-1 truncate font-mono">{value}</span>
      {extra}
      <button
        onClick={onCopy}
        className="shrink-0 text-cafe-500 hover:text-cafe-700 dark:hover:text-cafe-100"
      >
        {copiado ? "✓" : "copiar"}
      </button>
    </div>
  );
}
