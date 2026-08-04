import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const game = searchParams.get("game")?.trim() || "";
    const min = Number(searchParams.get("min") || 0);
    const max = Number(searchParams.get("max") || 0);
    const status = searchParams.get("status") || "ACTIVE";

    const where: any = {};
    if (status) where.status = status;
    if (game) where.game = { contains: game, mode: "insensitive" };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { game: { contains: q, mode: "insensitive" } },
      ];
    }
    if (min > 0 || max > 0) {
      where.price = {};
      if (min > 0) where.price.gte = min;
      if (max > 0) where.price.lte = max;
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        seller: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ listings });
  } catch (err: any) {
    console.error("[listings GET]", err);
    return NextResponse.json({ error: err?.message || "Gagal ambil listing" }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  game: z.string().min(2).max(60),
  price: z.number().int().positive().max(100_000_000),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Login dulu" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse({
      ...body,
      price: typeof body.price === "string" ? Number(body.price) : body.price,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        game: data.game,
        price: data.price,
        status: data.status || "ACTIVE",
        sellerId: session.userId,
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err: any) {
    console.error("[listings POST]", err);
    return NextResponse.json({ error: err?.message || "Gagal buat listing" }, { status: 500 });
  }
}
