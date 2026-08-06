import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  orderId: z.string().min(1),
  accountPayload: z.string().min(3).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { listing: true },
    });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    if (order.listing.sellerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bukan penjual order ini" }, { status: 403 });
    }
    if (order.status !== "PAID") {
      return NextResponse.json({ error: "Order harus berstatus PAID" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "DELIVERED",
        accountPayload: parsed.data.accountPayload,
        deliveredAt: new Date(),
      },
    });

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    console.error("[deliver]", err);
    return NextResponse.json({ error: err?.message || "Gagal deliver" }, { status: 500 });
  }
}
