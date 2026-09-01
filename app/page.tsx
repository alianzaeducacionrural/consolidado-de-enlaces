import { getDashboardData } from "@/lib/tools";
import { isAuthed } from "@/lib/session";
import { authEnabled } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600;

export default async function Page() {
  const data = await getDashboardData();
  const authed = await isAuthed();

  // Nunca enviamos claves al cliente si no hay sesión iniciada.
  const tools = data.tools.map((t) => ({
    ...t,
    cuentas: authed ? t.cuentas : [],
    notaCuentas: authed ? t.notaCuentas : undefined,
    _tieneCuentas: t.cuentas.length > 0 || !!t.notaCuentas,
  }));

  return (
    <Dashboard
      data={{ ...data, tools }}
      authed={authed}
      authEnabled={authEnabled()}
    />
  );
}
