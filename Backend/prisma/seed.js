import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function buildFullName(t, n, s) {
  return `${t}${n} ${s}`.trim();
}

// ===== Admin seed =====
async function seedAdmin(username, name, role = 0) {
  const exists = await prisma.admin.findUnique({ where: { username } });

  if (!exists) {
    const hashed = await bcrypt.hash("123456", 10);

    await prisma.admin.create({
      data: { username, name, password: hashed, role },
    });

    console.log(`✅ สร้าง Admin: ${username}`);
  } else {
    console.log(`⏭ Admin ${username} มีอยู่แล้ว`);
  }
}

// ===== DormProfile merge seed =====
async function seedDormProfile() {
  const receiverTitle = "นาย";
  const receiverName = "ภูวณัฐ";
  const receiverSurname = "พาหะละ";

  const defaultData = {
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
  };

  const exists = await prisma.dormProfile.findUnique({
    where: { key: "MAIN" },
  });

  if (!exists) {
    await prisma.dormProfile.create({
      data: { key: "MAIN", ...defaultData },
    });

    console.log("✅ สร้าง DormProfile แล้ว");
    return;
  }

  // เติมเฉพาะ field ที่ยังไม่มี
  const updateData = {};
  for (const key in defaultData) {
    if (exists[key] === null || exists[key] === undefined) {
      updateData[key] = defaultData[key];
    }
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.dormProfile.update({
      where: { key: "MAIN" },
      data: updateData,
    });

    console.log("✅ เติมข้อมูล DormProfile ที่ขาด");
  } else {
    console.log("⏭ DormProfile ครบแล้ว");
  }
}

// ===== main =====
async function main() {
  console.log("🌱 Safe merge seeding...");

  await seedAdmin("BiwBoong", "นายภูวณัฐ พาหะละ", 0);
  await seedAdmin("Admin", "Admin", 0);
  await seedAdmin("Biw", "Biw", 1);

  await seedDormProfile();

  console.log("🎉 Seed เสร็จสมบูรณ์");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());