import { fetchRepos, type GitHubRepo } from "@/lib/github";
import { readOverrides, readAccounts } from "@/lib/store";
import type { Tool, ToolLink, ToolOverride } from "@/lib/types";

const SIN_CLASIFICAR = "Por clasificar";
const OWNER = process.env.GITHUB_OWNER ?? "alianzaeducacionrural";

function titulizar(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function esUrl(u?: string | null): u is string {
  return !!u && /^https?:\/\//.test(u);
}

function enlacePrincipal(enlaces: ToolLink[], homepage?: string): string | undefined {
  const orden = ["publico", "formulario", "panel", "admin", "otro"];
  const validos = enlaces.filter((e) => esUrl(e.url));
  validos.sort((a, b) => orden.indexOf(a.tipo) - orden.indexOf(b.tipo));
  return validos[0]?.url ?? (esUrl(homepage) ? homepage : undefined);
}

function construir(
  slug: string,
  o: ToolOverride,
  repo: GitHubRepo | null,
  acc: { nota?: string; cuentas?: Tool["cuentas"] } | undefined,
): Tool {
  const categoria = o.categoria?.trim() || SIN_CLASIFICAR;
  const enlaces: ToolLink[] = (o.enlaces ?? []).filter((e) => e && e.url);
  const homepage = repo?.homepage ?? undefined;

  return {
    slug,
    nombre: o.nombre?.trim() || titulizar(slug),
    descripcion:
      o.descripcion?.trim() ||
      repo?.description ||
      "Sin descripción todavía. Agrégala desde /panel.",
    url: enlacePrincipal(enlaces, homepage),
    enlaces:
      enlaces.length > 0 || !esUrl(homepage)
        ? enlaces
        : [{ etiqueta: "Sitio", url: homepage as string, tipo: "publico" }],
    repoUrl: repo?.html_url ?? `https://github.com/${OWNER}/${slug}`,
    categoria,
    tags: [...new Set([...(o.tags ?? []), ...(repo?.topics ?? [])])],
    emoji: o.emoji || "🔗",
    estado: o.estado ?? (repo?.archived ? "archivado" : repo ? "activo" : "borrador"),
    destacado: o.destacado ?? false,
    clasificado: categoria !== SIN_CLASIFICAR,
    enRepo: !!repo,
    lenguaje: repo?.language ?? undefined,
    actualizado: repo?.pushed_at,
    homepageGitHub: esUrl(homepage) ? homepage : undefined,
    notas: o.notas,
    cuentas: acc?.cuentas ?? [],
    notaCuentas: acc?.nota,
  };
}

export interface DashboardData {
  tools: Tool[];
  categorias: string[];
  tags: string[];
  totalRepos: number;
  githubOk: boolean;
  actualizado: string;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [repos, ov, accounts] = await Promise.all([
    fetchRepos(),
    readOverrides(),
    readAccounts(),
  ]);

  const orden = ov.meta?.ordenCategorias ?? [];
  const rank = (c: string) => {
    const i = orden.indexOf(c);
    return i === -1 ? orden.length + 1 : i;
  };

  const porNombre = new Map(repos.map((r) => [r.name, r]));
  const slugs = new Set<string>([
    ...repos.map((r) => r.name),
    ...Object.keys(ov.tools),
  ]);

  const tools: Tool[] = [];
  for (const slug of slugs) {
    const o = ov.tools[slug] ?? {};
    if (o.oculto) continue;
    tools.push(construir(slug, o, porNombre.get(slug) ?? null, accounts[slug]));
  }

  tools.sort((a, b) => {
    if (a.categoria !== b.categoria) return rank(a.categoria) - rank(b.categoria);
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    return a.nombre.localeCompare(b.nombre, "es");
  });

  const categorias = [...new Set(tools.map((t) => t.categoria))].sort(
    (a, b) => rank(a) - rank(b),
  );
  const tags = [...new Set(tools.flatMap((t) => t.tags))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  return {
    tools,
    categorias,
    tags,
    totalRepos: repos.length,
    githubOk: repos.length > 0,
    actualizado: new Date().toISOString(),
  };
}
