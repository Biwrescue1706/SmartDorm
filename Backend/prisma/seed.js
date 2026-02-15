import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function buildFullName(t, n, s) {
  return `${t}${n} ${s}`.trim();
}

async function seedAdmin(username, name, role = 0) {
  const exists = await prisma.admin.findUnique({ where: { username } });

  if (!exists) {
    const hashed = await bcrypt.hash("123456", 10);

    await prisma.admin.create({
      data: { username, name, password: hashed, role },
    });

    console.log(`✅ Admin created: ${username}`);
  } else {
    console.log(`⏭ Admin exists: ${username}`);
  }
}

async function main() {
  console.log("🌱 Safe seeding...");

  // ===== Admins =====
  await seedAdmin("BiwBoong", "นายภูวณัฐ พาหะละ", 0);
  await seedAdmin("Admin", "System Admin", 0);

  // ===== Dorm Profile =====
  const receiverTitle = "นาย";
  const receiverName = "ภูวณัฐ";
  const receiverSurname = "พาหะละ";

  const existsDorm = await prisma.dormProfile.findUnique({
    where: { key: "MAIN" },
  });

  if (!existsDorm) {
    await prisma.dormProfile.create({
      data: {
        key: "MAIN",
        dormName: "หอพักบิวเรสซิเดนซ์",
        address: "47/21 ม.1 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000",
        phone: "0611747731",
        email: "bewrockgame1@gmail.com",
        taxId: "1209000088280",
        taxType: 0,

        receiverTitle,
        receiverName,
        receiverSurname,
        receiverFullName: buildFullName(
          receiverTitle,
          receiverName,
          receiverSurname
        ),
      },
    });

    console.log("✅ DormProfile created");
  } else {
    console.log("⏭ DormProfile already exists");
  }

  console.log("🎉 Safe seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());