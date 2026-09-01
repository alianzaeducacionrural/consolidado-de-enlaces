"use client";

import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = next.startsWith("/") ? next : "/";
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        className="w-full rounded-xl border border-cafe-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-cafe-400 focus:ring-2 focus:ring-cafe-400/30 dark:border-white/10 dark:bg-black/20"
      />
      {error && (
        <p className="text-xs text-red-500">Contraseña incorrecta.</p>
      )}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-xl bg-cafe-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-cafe-700 disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
