import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Khusus admin" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { status: "PENDING_PAYMENT" },
      include: {
        listing: { select: { id: true, title: true, game: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // midtransOrderId dipakai sebagai kode QRIS
    const mapped = orders.map((o) => ({
      id: o.id,
      amount: o.amount,
      createdAt: o.createdAt,
      listing: o.listing,
      buyer: o.buyer,
      payment: o.midtransOrderId
        ? { midtransOrderId: o.midtransOrderId }
        : null,
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err: any) {
    console.error("[admin pending]", err);
    return NextResponse.json({ error: err?.message || "Gagal" }, { status: 500 });
  }
}
