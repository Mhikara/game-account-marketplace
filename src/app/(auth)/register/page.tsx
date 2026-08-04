"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal daftar");
      router.push("/");
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
        <h1 className="text-xl font-bold">Daftar</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2" type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button disabled={loading} className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 py-2 font-semibold">
          {loading ? "Mendaftar..." : "Daftar"}
        </button>
        <p className="text-sm text-zinc-400">
          Sudah punya akun? <Link href="/login" className="text-violet-400">Login</Link>
        </p>
      </form>
    </div>
  );
}
