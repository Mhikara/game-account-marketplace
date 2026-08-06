import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Khusus admin" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { payment: true, listing: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }
  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "Order sudah tidak pending" }, { status: 400 });
  }

  const escrowReleaseAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 jam dari sekarang

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "ESCROW_HOLDING", escrowReleaseAt },
    }),
    prisma.payment.update({
      where: { orderId: order.id },
      data: { status: "SETTLEMENT" },
    }),
    prisma.gameAccountListing.update({
      where: { id: order.listingId },
      data: { status: "SOLD" },
    }),
    prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "PAYMENT_RECEIVED",
        title: "Pembayaran dikonfirmasi",
        message: `Pembayaran untuk "${order.listing.title}" sudah dikonfirmasi. Dana ditahan di escrow.`,
        link: `/dashboard/orders/${order.id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: "LISTING_SOLD",
        title: "Akun kamu terjual",
        message: `"${order.listing.title}" sudah dibayar pembeli. Dana akan cair otomatis 48 jam setelah tidak ada dispute.`,
        link: `/dashboard/orders/${order.id}`,
      },
    }),
  ]);

  return NextResponse.json({ message: "Pembayaran dikonfirmasi, escrow dimulai" });
}
