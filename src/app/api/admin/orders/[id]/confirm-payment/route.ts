import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Khusus admin" }, { status: 403 });
    }

    const { id } = await ctx.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }
    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "Order sudah tidak pending" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      }),
      prisma.listing.update({
        where: { id: order.listingId },
        data: { status: "SOLD" },
      }),
    ]);

    return NextResponse.json({
      message: "Pembayaran dikonfirmasi (PAID). Seller bisa kirim akun.",
    });
  } catch (err: any) {
    console.error("[confirm-payment]", err);
    return NextResponse.json({ error: err?.message || "Gagal" }, { status: 500 });
  }
}
