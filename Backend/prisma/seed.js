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

    console.log("✅ สร้างโปรไฟล์หอพักแล้ว");
    return;
  }

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

    console.log("✅ เติมข้อมูลโปรไฟล์หอพักที่ขาด");
  } else {
    console.log("⏭ โปรไฟล์หอพักครบแล้ว");
  }
}

// ===== Room seed =====
async function seedRooms() {
  const admin = await prisma.admin.findUnique({
    where: { username: "BiwBoong" },
  });

  if (!admin) {
    console.log("❌ ไม่พบ Admin BiwBoong");
    return;
  }

  for (let floor = 1; floor <= 11; floor++) {
    for (let room = 1; room <= 4; room++) {
      const number = `${floor}0${room}`;

      const exists = await prisma.room.findUnique({ where: { number } });

      if (!exists) {
        await prisma.room.create({
          data: {
            number,
            size: "3.5 x 5.5 ม.",
            rent: 2500,
            deposit: 2500,
            bookingFee: 500,
            status: 0,
            createdBy: admin.adminId,
          },
        });

        console.log(`✅ สร้างห้อง ${number}`);
      } else {
        console.log(`⏭ ห้อง ${number} มีอยู่แล้ว`);
      }
    }
  }
}

// ===== main =====
async function main() {
  console.log("🌱 Safe merge seeding...");

  await seedAdmin("BiwBoong", "นายภูวณัฐ พาหะละ", 0);
  await seedAdmin("Admin", "Admin", 0);
  await seedAdmin("Biw", "Biw", 1);

  await seedDormProfile();
  await seedRooms();

  console.log("🎉 Seed เสร็จสมบูรณ์");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());