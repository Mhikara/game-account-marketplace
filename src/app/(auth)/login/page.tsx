"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push(data.user?.role === "ADMIN" ? "/admin" : next);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h1 className="text-xl font-bold">Login</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
        />
        <input
          className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required
        />
        <button disabled={loading} className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 py-2 font-semibold">
          {loading ? "Masuk..." : "Masuk"}
        </button>
        <p className="text-sm text-zinc-400">
          Belum punya akun? <Link href="/register" className="text-violet-400">Daftar</Link>
        </p>
      </form>
    </div>
  );
}
