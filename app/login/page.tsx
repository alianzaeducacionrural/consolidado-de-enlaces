import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/auth";
import { isAuthed } from "@/lib/session";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!authEnabled()) redirect("/");
  if (await isAuthed()) redirect("/");
  const { next } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="glass card-shadow w-full max-w-sm rounded-3xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cafe-500 to-cafe-700 text-lg text-white">
            ☕
          </div>
          <div>
            <h1 className="text-sm font-semibold">Consolidado de enlaces</h1>
            <p className="text-xs text-cafe-500 dark:text-cafe-300">
              Acceso restringido
            </p>
          </div>
        </div>
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
