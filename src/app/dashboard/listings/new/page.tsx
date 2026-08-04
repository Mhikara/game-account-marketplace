"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          game,
          description,
          price: Number(price),
          status: "ACTIVE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      router.push("/listings/" + data.listing.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-zinc-400">← Beranda</Link>
        <h1 className="text-xl font-bold mt-4 mb-4">Jual Akun Game</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <input className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2" placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2" placeholder="Game (MLBB, Free Fire...)" value={game} onChange={(e) => setGame(e.target.value)} required />
          <input className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2" type="number" placeholder="Harga (Rp)" value={price} onChange={(e) => setPrice(e.target.value)} required min={1000} />
          <textarea className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2" rows={5} placeholder="Deskripsi akun (rank, skin, dll)" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 py-3 font-semibold disabled:opacity-60">
            {loading ? "Menyimpan..." : "Pasang Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
