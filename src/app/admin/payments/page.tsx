"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PendingOrder {
  id: string;
  amount: number;
  createdAt: string;
  listing: { title: string; game?: string };
  buyer: { name: string; email: string };
  payment: { midtransOrderId: string } | null;
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/orders/pending")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat");
        setOrders(data.orders || []);
        setMsg("");
      })
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function confirm(id: string) {
    setMsg("");
    const res = await fetch(`/api/admin/orders/${id}/confirm-payment`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setMsg("Order dikonfirmasi lunas");
    } else {
      setMsg(data.error || "Gagal konfirmasi");
    }
  }

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Konfirmasi Pembayaran QRIS</h1>
          <Link href="/admin/orders" className="text-sm text-zinc-400">
            Semua order
          </Link>
        </div>

        {msg && <p className="text-sm text-amber-300 mb-3">{msg}</p>}
        {loading && <p className="text-zinc-500 text-sm">Memuat...</p>}

        {!loading && orders.length === 0 && (
          <p className="text-zinc-500">Tidak ada pembayaran pending.</p>
        )}

        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl"
            >
              <p className="font-semibold">{o.listing.title}</p>
              <p className="text-sm text-emerald-400 mt-1">
                {formatRp(o.amount)} — kode:{" "}
                {o.payment?.midtransOrderId || "-"}
              </p>
              <p className="text-sm text-zinc-500">
                Pembeli: {o.buyer.name} ({o.buyer.email})
              </p>
              <button
                type="button"
                onClick={() => confirm(o.id)}
                className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
              >
                Konfirmasi Lunas
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
