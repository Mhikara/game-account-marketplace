import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@marketplace.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@marketplace.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin berhasil dibuat");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
