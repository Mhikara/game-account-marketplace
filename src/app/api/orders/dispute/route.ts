import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(5).max(1000).optional(),
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

    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    if (order.buyerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bukan pembeli order ini" }, { status: 403 });
    }
    if (order.status !== "DELIVERED" && order.status !== "PAID") {
      return NextResponse.json({ error: "Status tidak bisa di-dispute" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "DISPUTED" },
    });

    return NextResponse.json({ order: updated, reason: parsed.data.reason || null });
  } catch (err: any) {
    console.error("[dispute]", err);
    return NextResponse.json({ error: err?.message || "Gagal dispute" }, { status: 500 });
  }
}
