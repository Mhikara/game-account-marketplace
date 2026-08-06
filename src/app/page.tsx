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
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);

  const load = async (query = "") => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams({ status: "ACTIVE" });
      if (query) params.set("q", query);
      const res = await fetch("/api/listings?" + params.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat");
      setListings(data.listings || []);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="font-bold text-lg tracking-tight">
              Game<span className="text-violet-400">Market</span>
            </Link>
            <p className="text-[10px] text-zinc-500">Jual beli akun game</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {user ? (
              <>
                <span className="text-zinc-500 px-2 py-1.5 hidden sm:inline">
                  Hi, {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/listings/new"
                  className="rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 font-semibold"
                >
                  Jual Akun
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin/payments"
                    className="rounded-lg border border-amber-700/50 text-amber-300 px-3 py-1.5"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-zinc-700 px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-violet-600 px-3 py-1.5 font-semibold"
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Temukan akun game
        </h2>
        <p className="text-zinc-400 text-sm mt-1 mb-4">
          Listing aktif dari penjual terverifikasi di platform.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load(q);
          }}
        >
          <input
            className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            placeholder="Cari ML, FF, judul..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-sm font-semibold"
          >
            Cari
          </button>
        </form>
      </section>

      <main className="max-w-5xl mx-auto px-4 pb-12">
        {loading && <p className="text-zinc-500 text-sm">Memuat listing...</p>}
        {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
        {!loading && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-sm">
            Belum ada listing aktif.{" "}
            <Link href="/dashboard/listings/new" className="text-violet-400">
              Jual akun pertama
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => (
            <Link
              key={item.id}
              href={"/listings/" + item.id}
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 hover:border-violet-500/40 hover:bg-zinc-900 transition"
            >
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-violet-400 bg-violet-950/50 px-2 py-0.5 rounded">
                {item.game}
              </span>
              <h3 className="font-semibold mt-2 group-hover:text-violet-200 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-emerald-400">
                  {formatRp(item.price)}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {item.seller?.name || "Seller"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
