import { cookies } from "next/headers";
import { COOKIE_NAME, authEnabled, sessionToken } from "@/lib/auth";

/** ¿El visitante actual inició sesión? (siempre false si no hay SITE_PASSWORD) */
export async function isAuthed(): Promise<boolean> {
  if (!authEnabled()) return false;
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  return !!cookie && cookie === (await sessionToken());
}
