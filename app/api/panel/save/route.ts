import { NextResponse } from "next/server";
import { authEnabled } from "@/lib/auth";
import { isAuthed } from "@/lib/session";
import { writeStore } from "@/lib/store";
import type { AccountsFile, OverridesFile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!authEnabled() || !(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { overrides?: OverridesFile; accounts?: AccountsFile };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const overrides: OverridesFile = {
    meta: { ordenCategorias: body.overrides?.meta?.ordenCategorias ?? [] },
    tools: body.overrides?.tools ?? {},
  };
  const accounts: AccountsFile = body.accounts ?? {};

  if (typeof overrides.tools !== "object" || Array.isArray(overrides.tools)) {
    return NextResponse.json({ error: "Formato inesperado" }, { status: 400 });
  }

  const result = await writeStore(overrides, accounts);
  return NextResponse.json(result);
}
