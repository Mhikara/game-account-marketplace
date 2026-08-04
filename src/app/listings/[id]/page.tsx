"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings/" + id);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal");
        setListing(data.listing);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-400 p-6">Memuat...</div>;
  }
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-zinc-950 text-red-400 p-6">
        {error || "Tidak ditemukan"} · <Link href="/" className="text-violet-400">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-sm text-zinc-400">← Kembali</Link>
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs text-violet-400 font-semibold">{listing.game}</div>
          <h1 className="text-xl font-bold mt-1">{listing.title}</h1>
          <p className="text-emerald-400 font-bold text-lg mt-2">{formatRp(listing.price)}</p>
          <p className="text-sm text-zinc-400 mt-1">Penjual: {listing.seller?.name || "-"}</p>
          <p className="text-sm text-zinc-300 mt-4 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          <p className="text-xs text-zinc-600 mt-4">Status: {listing.status}</p>
          <button
            type="button"
            disabled={listing.status !== "ACTIVE"}
            className="mt-6 w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 font-semibold disabled:opacity-40"
            onClick={() => alert("Checkout Midtrans = Fase 4")}
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
