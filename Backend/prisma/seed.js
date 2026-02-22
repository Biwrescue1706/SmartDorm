import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/* จำกัด connection สำหรับ Supabase pooler */
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

function buildFullName(t, n, s) {
  return `${t}${n} ${s}`.trim();
}

/* ================= ADMIN ================= */
async function seedAdmin(username, name, role = 0) {
  const hashed = await bcrypt.hash("123456", 8);

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

/* ================= DORM PROFILE ================= */
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

/* ================= ROOMS ================= */
async function seedRooms() {
  const admin = await prisma.admin.findUnique({
    where: { username: "BiwBoong" },
    select: { adminId: true },
  });

  if (!admin) throw new Error("Admin BiwBoong not found");

  const rooms = [];

  for (let floor = 1; floor <= 11; floor++) {
    for (let room = 1; room <= 4; room++) {
      rooms.push({
        number: `${floor}0${room}`,
        size: "3.5 x 5.5 ม.",
        rent: 2500,
        deposit: 2500,
        bookingFee: 500,
        status: 0,
        createdBy: admin.adminId,
      });
    }
  }

  /* insert ทีเดียว ลด connection */
  await prisma.room.createMany({
    data: rooms,
    skipDuplicates: true,
  });

  console.log(`✅ Rooms ready: ${rooms.length}`);
}

/* ================= MAIN ================= */
async function main() {
  console.log("🌱 Seeding started...");

  await prisma.$transaction(async () => {
    await seedAdmin("BiwBoong", "นายภูวณัฐ พาหะละ", 0);
    await seedAdmin("Admin", "Admin", 0);
    await seedAdmin("Biw", "Biw", 1);

    await seedDormProfile();
  });

  await seedRooms();

  console.log("🎉 Seeding completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });