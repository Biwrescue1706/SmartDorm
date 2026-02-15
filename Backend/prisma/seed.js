import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.admin.upsert({
    where: { username: "BiwBoong" },
    update: {},
    create: {
      username: "BiwBoong",
      name: "นายภูวณัฐ พาหะละ",
      password: hashedPassword,
      role: 0,
    },
  });

  console.log("✅ Admin seeded");

  await prisma.dormProfile.upsert({
    where: { key: "MAIN" },
    update: {},
    create: {
      key: "MAIN",
      dormName: "หอพักบิวเรสซิเดนซ์",
      address: "",
      phone: "",
      email: "",
      taxId: "",
    },
  });

  console.log("✅ DormProfile seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
