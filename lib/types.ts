export type ToolStatus = "activo" | "beta" | "borrador" | "archivado";

export type LinkKind = "publico" | "formulario" | "admin" | "panel" | "otro";

export interface ToolLink {
  etiqueta: string;
  url: string;
  tipo: LinkKind;
}

/** Enriquecimiento manual de un repo. La clave es el nombre exacto del repo en GitHub. */
export interface ToolOverride {
  /** Nombre visible (si se omite, se usa el nombre del repo formateado). */
  nombre?: string;
  /** Descripción de la intención de la herramienta. */
  descripcion?: string;
  /** Enlaces: formulario público, panel de administración, etc. */
  enlaces?: ToolLink[];
  /** Categoría para agrupar en el dashboard. */
  categoria?: string;
  /** Etiquetas para filtrar/buscar. */
  tags?: string[];
  /** Emoji que se muestra como ícono de la tarjeta. */
  emoji?: string;
  /** Estado de la herramienta. */
  estado?: ToolStatus;
  /** Fijar arriba en su categoría. */
  destacado?: boolean;
  /** Ocultar del dashboard. */
  oculto?: boolean;
  /** Notas internas visibles en el detalle. */
  notas?: string;
}

export interface OverridesFile {
  meta?: { ordenCategorias?: string[] };
  tools: Record<string, ToolOverride>;
}

export interface ToolAccount {
  rol?: string;
  usuario?: string;
  clave?: string;
  url?: string;
  notas?: string;
}

export interface ToolAccountsEntry {
  nota?: string;
  cuentas?: ToolAccount[];
}

export type AccountsFile = Record<string, ToolAccountsEntry>;

/** Herramienta ya resuelta (override + datos de GitHub + cuentas). */
export interface Tool {
  slug: string;
  nombre: string;
  descripcion: string;
  /** Enlace principal (el primero público/formulario, si hay). */
  url?: string;
  enlaces: ToolLink[];
  repoUrl: string;
  categoria: string;
  tags: string[];
  emoji: string;
  estado: ToolStatus;
  destacado: boolean;
  clasificado: boolean;
  enRepo: boolean;
  lenguaje?: string;
  actualizado?: string;
  homepageGitHub?: string;
  notas?: string;
  cuentas: ToolAccount[];
  notaCuentas?: string;
}
