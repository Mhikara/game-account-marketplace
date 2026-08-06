"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // data dikirim via sessionStorage dari tombol beli
    try {
      const raw = sessionStorage.getItem("qris_pay_" + orderId);
      if (raw) setData(JSON.parse(raw));
      else setError("Data pembayaran tidak ditemukan. Ulangi dari halaman listing.");
    } catch {
      setError("Gagal memuat data bayar");
    }
  }, [orderId]);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-red-400 p-6">
        {error} · <Link href="/" className="text-violet-400">Beranda</Link>
      </div>
    );
  }
  if (!data) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-400 p-6">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-sm mx-auto text-center space-y-4">
        <h1 className="text-xl font-bold">Bayar QRIS</h1>
        <p className="text-sm text-zinc-400">{data.merchantName}</p>
        <p className="text-2xl font-bold text-emerald-400">{formatRp(data.amount)}</p>
        <p className="text-sm">
          Kode: <span className="font-mono text-violet-400">{data.paymentCode}</span>
        </p>
        <img
          src={data.qrisImage}
          alt="QRIS"
          className="mx-auto w-64 h-64 object-contain bg-white rounded-xl p-2"
        />
        <p className="text-xs text-zinc-500 text-left leading-relaxed">{data.instruction}</p>
        <Link href="/" className="inline-block text-sm text-violet-400">Kembali ke beranda</Link>
      </div>
    </div>
  );
}
