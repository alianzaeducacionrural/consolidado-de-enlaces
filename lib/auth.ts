export const COOKIE_NAME = "ce_session";

/** ¿Está configurada la protección por contraseña? */
export function authEnabled(): boolean {
  return !!process.env.SITE_PASSWORD;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Token esperado en la cookie de sesión, derivado de SITE_PASSWORD. */
export function sessionToken(): Promise<string> {
  return sha256(`consolidado-de-enlaces::${process.env.SITE_PASSWORD ?? ""}`);
}

/** Compara la contraseña ingresada con SITE_PASSWORD. */
export function passwordMatches(input: string): boolean {
  const expected = process.env.SITE_PASSWORD ?? "";
  if (!expected || input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
