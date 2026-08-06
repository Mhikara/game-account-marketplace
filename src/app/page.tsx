"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  description: string;
  game: string;
  price: number;
  seller?: { name: string };
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings?status=ACTIVE");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat listing");
        setListings(data.listings || []);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-4 flex flex-wrap gap-2 items-center justify-between max-w-5xl mx-auto">
        <h1 className="font-bold text-lg">Game Account Market</h1>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/dashboard" className="rounded-lg bg-zinc-800 px-3 py-1.5">Dashboard</Link>
          <Link href="/dashboard/listings/new" className="rounded-lg bg-violet-600 px-3 py-1.5 font-semibold">Jual Akun</Link>
          <Link href="/login" className="rounded-lg border border-zinc-700 px-3 py-1.5">Login</Link>
          <Link href="/register" className="rounded-lg border border-zinc-700 px-3 py-1.5">Daftar</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {loading && <p className="text-zinc-500 text-sm">Memuat...</p>}
        {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
        {!loading && listings.length === 0 && (
          <p className="text-zinc-500 text-sm">Belum ada listing. <Link href="/dashboard/listings/new" className="text-violet-400">Jual akun pertama</Link></p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => (
            <Link
              key={item.id}
              href={"/listings/" + item.id}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-violet-500/50"
            >
              <div className="text-xs text-violet-400 font-semibold">{item.game}</div>
              <h2 className="font-semibold mt-1">{item.title}</h2>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{item.description}</p>
              <p className="text-emerald-400 font-bold mt-3">{formatRp(item.price)}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
