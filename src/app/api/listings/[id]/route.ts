import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true } } },
    });
    if (!listing) {
      return NextResponse.json({ error: "Listing tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ listing });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal" }, { status: 500 });
  }
}

const updateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(5000).optional(),
  game: z.string().min(2).max(60).optional(),
  price: z.number().int().positive().max(100_000_000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN", "SOLD"]).optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { id } = await ctx.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    const isOwner = existing.sellerId === session.userId;
    const isAdmin = session.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
    }

    const body = await req.json();
    if (body.price && typeof body.price === "string") body.price = Number(body.price);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ listing });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { id } = await ctx.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    if (existing.sellerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal hapus" }, { status: 500 });
  }
}
