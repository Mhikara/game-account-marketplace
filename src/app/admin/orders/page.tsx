"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?scope=all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal / bukan admin");
      setOrders(data.orders || []);
      setMsg("");
    } catch (e: any) {
      setMsg(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmQris = async (orderId: string) => {
    try {
      const res = await fetch("/api/payment/confirm-qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setMsg("Order dikonfirmasi PAID");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Admin · Orders</h1>
          <Link href="/dashboard" className="text-sm text-zinc-400">Dashboard</Link>
        </div>
        {msg && <p className="text-sm text-amber-300 mb-3">{msg}</p>}
        {loading && <p className="text-zinc-500 text-sm">Memuat...</p>}
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{o.listing?.title}</div>
                  <div className="text-xs text-zinc-500">{o.buyer?.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{formatRp(o.amount)}</div>
                  <div className="text-violet-300 text-xs">{o.status}</div>
                </div>
              </div>
              {o.midtransOrderId && (
                <p className="text-xs text-zinc-500 mt-1">Kode bayar: {o.midtransOrderId}</p>
              )}
              {o.status === "PENDING_PAYMENT" && (
                <button
                  type="button"
                  onClick={() => confirmQris(o.id)}
                  className="mt-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold"
                >
                  Konfirmasi QRIS sudah masuk
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
