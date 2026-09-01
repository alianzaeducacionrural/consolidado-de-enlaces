import Link from "next/link";
import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/auth";
import { isAuthed } from "@/lib/session";
import { fetchRepos } from "@/lib/github";
import { readOverrides, readAccounts } from "@/lib/store";
import PanelEditor, { type FilaEditable } from "@/components/PanelEditor";
import type { ToolStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function titulizar(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default async function PanelPage() {
  if (!authEnabled()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-3xl">🔒</p>
        <h1 className="mt-3 text-lg font-semibold">Panel desactivado</h1>
        <p className="mt-2 text-sm text-cafe-600 dark:text-cafe-300">
          Define la variable <code className="rounded bg-cafe-100 px-1 dark:bg-white/10">SITE_PASSWORD</code>{" "}
          para proteger el sitio y habilitar el panel de edición.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-cafe-700 underline dark:text-cafe-200">
          ← Volver al dashboard
        </Link>
      </div>
    );
  }
  if (!(await isAuthed())) redirect("/login?next=/panel");

  const [repos, ov, accounts] = await Promise.all([
    fetchRepos(),
    readOverrides(),
    readAccounts(),
  ]);

  const slugs = [
    ...new Set([...repos.map((r) => r.name), ...Object.keys(ov.tools)]),
  ].sort((a, b) => a.localeCompare(b, "es"));

  const repoByName = new Map(repos.map((r) => [r.name, r]));

  const filas: FilaEditable[] = slugs.map((slug) => {
    const o = ov.tools[slug] ?? {};
    const r = repoByName.get(slug);
    const acc = accounts[slug] ?? {};
    return {
      slug,
      enRepo: !!r,
      nombre: o.nombre ?? "",
      descripcion: o.descripcion ?? "",
      placeholderNombre: titulizar(slug),
      placeholderDescripcion: r?.description ?? "",
      categoria: o.categoria ?? "",
      emoji: o.emoji ?? "",
      estado: (o.estado ?? (r ? "activo" : "borrador")) as ToolStatus,
      destacado: o.destacado ?? false,
      oculto: o.oculto ?? false,
      notas: o.notas ?? "",
      tags: o.tags ?? [],
      enlaces: o.enlaces ?? [],
      cuentaNota: acc.nota ?? "",
      cuentas: acc.cuentas ?? [],
    };
  });

  return (
    <PanelEditor
      filasIniciales={filas}
      categorias={ov.meta?.ordenCategorias ?? []}
    />
  );
}
