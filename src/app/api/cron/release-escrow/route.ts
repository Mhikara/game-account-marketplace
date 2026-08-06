import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;
    if (secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const result = await prisma.order.updateMany({
      where: {
        status: "DELIVERED",
        deliveredAt: { lte: cutoff },
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      released: result.count,
      cutoff: cutoff.toISOString(),
    });
  } catch (err: any) {
    console.error("[cron release]", err);
    return NextResponse.json({ error: err?.message || "Cron failed" }, { status: 500 });
  }
}
