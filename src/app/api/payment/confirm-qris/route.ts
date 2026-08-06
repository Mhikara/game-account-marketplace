import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "orderId wajib" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "Status order bukan pending" }, { status: 400 });
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

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal" }, { status: 500 });
  }
}
