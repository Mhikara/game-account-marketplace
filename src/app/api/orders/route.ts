import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const scope = new URL(req.url).searchParams.get("scope") || "buyer";

    if (session.role === "ADMIN" && scope === "all") {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          listing: { select: { id: true, title: true, game: true, sellerId: true } },
          buyer: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json({ orders });
    }

    if (scope === "seller") {
      const orders = await prisma.order.findMany({
        where: { listing: { sellerId: session.userId } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          listing: { select: { id: true, title: true, game: true } },
          buyer: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json({ orders });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        listing: { select: { id: true, title: true, game: true, sellerId: true } },
      },
    });
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("[orders GET]", err);
    return NextResponse.json({ error: err?.message || "Gagal" }, { status: 500 });
  }
}
