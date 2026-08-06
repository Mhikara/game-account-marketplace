"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Auto: kalau sudah login, langsung masuk
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.replace(data.user.role === "ADMIN" ? "/admin/payments" : next);
            return;
          }
        }
      } catch {
        /* ignore */
      } finally {
        setChecking(false);
      }
    })();
  }, [router, next]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal login");
      router.push(data.user?.role === "ADMIN" ? "/admin/payments" : next);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="text-center text-zinc-400 text-sm py-12">
        Mengecek sesi...
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-violet-950/20"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Game Account Marketplace
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-zinc-400">Email</label>
        <input
          className="w-full rounded-xl bg-zinc-950 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none px-3 py-2.5 text-sm"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-zinc-400">Password</label>
        <input
          className="w-full rounded-xl bg-zinc-950 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none px-3 py-2.5 text-sm"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition py-2.5 font-semibold text-sm disabled:opacity-50"
      >
        {loading ? "Masuk..." : "Masuk"}
      </button>

      <p className="text-sm text-zinc-400 text-center">
        Belum punya akun?{" "}
        <Link href="/register" className="text-violet-400 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-zinc-950 to-zinc-950" />
      <div className="relative z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <p className="text-zinc-400 text-sm">Memuat form...</p>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
