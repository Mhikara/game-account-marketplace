"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  amount: number;
  status: string;
  midtransOrderId?: string | null;
  accountPayload?: string | null;
  listing?: { id: string; title: string; game: string };
  buyer?: { name: string; email: string };
};

export default function DashboardPage() {
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [payload, setPayload] = useState<Record<string, string>>({});

  const load = async (scope: "buyer" | "seller") => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/orders?scope=" + scope);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat");
      setOrders(data.orders || []);
    } catch (e: any) {
      setMsg(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const deliver = async (orderId: string) => {
    const accountPayload = payload[orderId]?.trim();
    if (!accountPayload) {
      setMsg("Isi data akun dulu");
      return;
    }
    setMsg("");
    try {
      const res = await fetch("/api/orders/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, accountPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setMsg("Akun terkirim (DELIVERED)");
      load("seller");
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const dispute = async (orderId: string) => {
    setMsg("");
    try {
      const res = await fetch("/api/orders/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: "Buyer dispute" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setMsg("Dispute dikirim");
      load("buyer");
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="text-zinc-400">Beranda</Link>
            <Link href="/dashboard/listings/new" className="text-violet-400">Jual akun</Link>
            <Link href="/admin/orders" className="text-amber-400">Admin</Link>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab("buyer")}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === "buyer" ? "bg-violet-600" : "bg-zinc-800"}`}
          >
            Pembelian saya
          </button>
          <button
            type="button"
            onClick={() => setTab("seller")}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === "seller" ? "bg-violet-600" : "bg-zinc-800"}`}
          >
            Penjualan saya
          </button>
        </div>

        {msg && <p className="text-sm text-amber-300 mb-3">{msg}</p>}
        {loading && <p className="text-zinc-500 text-sm">Memuat...</p>}

        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex justify-between gap-2 text-sm">
                <div>
                  <div className="font-semibold">{o.listing?.title || "Order"}</div>
                  <div className="text-xs text-zinc-500">{o.listing?.game}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">{formatRp(o.amount)}</div>
                  <div className="text-xs text-violet-300">{o.status}</div>
                </div>
              </div>

              {o.midtransOrderId && (
                <p className="text-xs text-zinc-500 mt-2">Kode: {o.midtransOrderId}</p>
              )}

              {tab === "buyer" && o.accountPayload && (
                <pre className="mt-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2 whitespace-pre-wrap">
                  {o.accountPayload}
                </pre>
              )}

              {tab === "buyer" && (o.status === "DELIVERED" || o.status === "PAID") && (
                <button
                  type="button"
                  onClick={() => dispute(o.id)}
                  className="mt-2 text-xs rounded-lg border border-red-800 text-red-300 px-2 py-1"
                >
                  Buka dispute
                </button>
              )}

              {tab === "seller" && o.status === "PAID" && (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs"
                    rows={3}
                    placeholder="Email/username/password akun..."
                    value={payload[o.id] || ""}
                    onChange={(e) => setPayload((p) => ({ ...p, [o.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => deliver(o.id)}
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold"
                  >
                    Kirim akun ke pembeli
                  </button>
                </div>
              )}
            </div>
          ))}
          {!loading && orders.length === 0 && (
            <p className="text-zinc-500 text-sm">Belum ada order.</p>
          )}
        </div>
      </div>
    </div>
  );
}
