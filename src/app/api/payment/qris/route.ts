import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ listingId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Login dulu" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "listingId wajib" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: parsed.data.listingId },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json({ error: "Listing tidak tersedia" }, { status: 404 });
    }
    if (listing.sellerId === session.userId) {
      return NextResponse.json({ error: "Tidak bisa beli listing sendiri" }, { status: 400 });
    }

    // Cegah order pending dobel untuk listing yang sama
    const existing = await prisma.order.findFirst({
      where: {
        listingId: listing.id,
        status: { in: ["PENDING_PAYMENT", "PAID", "DELIVERED"] },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Listing ini sudah ada order aktif" },
        { status: 409 }
      );
    }

    const code = `QR\( {Date.now().toString().slice(-8)} \){Math.floor(Math.random() * 90 + 10)}`;

    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: session.userId,
        amount: listing.price,
        status: "PENDING_PAYMENT",
        midtransOrderId: code,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentCode: code,
      amount: listing.price,
      qrisImage: "/qris-merchant.png",
      merchantName: "Memet store",
      instruction:
        "Scan QRIS, bayar sesuai nominal. Cantumkan kode di berita transfer bila bisa. Setelah transfer, tunggu konfirmasi admin.",
    });
  } catch (err: any) {
    console.error("[qris]", err);
    return NextResponse.json({ error: err?.message || "Gagal" }, { status: 500 });
  }
}
