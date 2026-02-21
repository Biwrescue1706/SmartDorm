import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function buildFullName(t, n, s) {
  return `${t}${n} ${s}`.trim();
}

// ===== Admin seed =====
async function seedAdmin(username, name, role = 0) {
  const hashed = await bcrypt.hash("123456", 10);

  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: {
      username,
      name,
      password: hashed,
      role,
    },
  });

  console.log(`✅ Admin ready: ${username}`);
}

// ===== DormProfile seed =====
async function seedDormProfile() {
  const receiverTitle = "นาย";
  const receiverName = "ภูวณัฐ";
  const receiverSurname = "พาหะละ";

  await prisma.dormProfile.upsert({
    where: { key: "MAIN" },
    update: {},
    create: {
      key: "MAIN",
      dormName: "หอพักบิว",
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

  console.log("✅ DormProfile ready");
}

// ===== Room seed =====
async function seedRooms() {
  const admin = await prisma.admin.findUnique({
    where: { username: "BiwBoong" },
  });

  if (!admin) {
    console.log("❌ Admin BiwBoong not found");
    return;
  }

  for (let floor = 1; floor <= 11; floor++) {
    for (let room = 1; room <= 4; room++) {
      const number = `${floor}0${room}`;

      await prisma.room.upsert({
        where: { number },
        update: {},
        create: {
          number,
          size: "3.5 x 5.5 ม.",
          rent: 2500,
          deposit: 2500,
          bookingFee: 500,
          status: 0,
          createdBy: admin.adminId,
        },
      });

      console.log(`✅ Room ready: ${number}`);
    }
  }
}

// ===== main =====
async function main() {
  console.log("🌱 Seeding started...");

  await seedAdmin("BiwBoong", "นายภูวณัฐ พาหะละ", 0);
  await seedAdmin("Admin", "Admin", 0);
  await seedAdmin("Biw", "Biw", 1);

  await seedDormProfile();
  await seedRooms();

  console.log("🎉 Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });