import { promises as fs } from "node:fs";
import path from "node:path";
import type { OverridesFile, AccountsFile } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const OVERRIDES_PATH = path.join(DATA_DIR, "overrides.json");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.local.json");

const EMPTY_OVERRIDES: OverridesFile = { meta: { ordenCategorias: [] }, tools: {} };

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function readOverrides(): Promise<OverridesFile> {
  if (process.env.OVERRIDES_JSON) {
    return normalizeOverrides(parse(process.env.OVERRIDES_JSON, EMPTY_OVERRIDES));
  }
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    return normalizeOverrides(parse(raw, EMPTY_OVERRIDES));
  } catch {
    return EMPTY_OVERRIDES;
  }
}

function normalizeOverrides(o: Partial<OverridesFile>): OverridesFile {
  return {
    meta: { ordenCategorias: o.meta?.ordenCategorias ?? [] },
    tools: o.tools ?? {},
  };
}

export async function readAccounts(): Promise<AccountsFile> {
  if (process.env.ACCOUNTS_JSON) {
    return parse(process.env.ACCOUNTS_JSON, {} as AccountsFile);
  }
  try {
    const raw = await fs.readFile(ACCOUNTS_PATH, "utf8");
    return parse(raw, {} as AccountsFile);
  } catch {
    return {};
  }
}

export interface WriteResult {
  overrides: "escrito" | "no-escrito";
  accounts: "escrito" | "no-escrito";
  motivo?: string;
}

/** Intenta escribir los archivos en disco (funciona en local; en Vercel el FS es de solo lectura). */
export async function writeStore(
  overrides: OverridesFile,
  accounts: AccountsFile,
): Promise<WriteResult> {
  const result: WriteResult = { overrides: "no-escrito", accounts: "no-escrito" };
  try {
    await fs.writeFile(
      OVERRIDES_PATH,
      JSON.stringify(overrides, null, 2) + "\n",
      "utf8",
    );
    result.overrides = "escrito";
    await fs.writeFile(
      ACCOUNTS_PATH,
      JSON.stringify(accounts, null, 2) + "\n",
      "utf8",
    );
    result.accounts = "escrito";
  } catch (err) {
    result.motivo =
      "El sistema de archivos es de solo lectura (normal en Vercel). " +
      "Descarga los archivos y súbelos al repositorio.";
    if (err instanceof Error) console.error("writeStore:", err.message);
  }
  return result;
}
