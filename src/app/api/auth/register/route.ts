import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

function friendlyDbError(err: any) {
  const msg = String(err?.message || err || "");
  if (msg.includes("Can't reach database") || msg.includes("P1001")) {
    return "Database tidak bisa dihubungi. Cek Neon (nyalakan compute) dan DATABASE_URL di Vercel.";
  }
  if (msg.includes("does not exist") || msg.includes("P2021")) {
    return "Tabel belum dibuat. Jalankan SQL CREATE TABLE di Neon.";
  }
  if (msg.includes("DATABASE_URL") || msg.includes("Environment variable")) {
    return "DATABASE_URL belum di-set di Vercel.";
  }
  if (msg.includes("Unique constraint") || msg.includes("P2002")) {
    return "Email sudah terdaftar";
  }
  return msg.slice(0, 200) || "Gagal register";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (exists) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "CUSTOMER",
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "CUSTOMER",
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error("[register]", err);
    return NextResponse.json({ error: friendlyDbError(err) }, { status: 500 });
  }
}
