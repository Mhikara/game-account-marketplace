import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL || "admin@marketplace.com";
const password = process.env.ADMIN_PASSWORD || "admin123";
const name = process.env.ADMIN_NAME || "Admin";

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      role: "ADMIN",
      name,
    },
    create: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("OK Admin siap:");
  console.log("  Email   :", user.email);
  console.log("  Role    :", user.role);
  console.log("  Password:", password);
}

main()
  .catch((e) => {
    console.error("GAGAL:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
