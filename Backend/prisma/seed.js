import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function buildFullName(t, n, s) {
  return [t, n, s].filter(Boolean).join(" ");
}

/* ================= ADMIN ================= */

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

  console.log(`✅ Admin: ${username}`);
}

/* ================= DORM PROFILE ================= */

async function seedDormProfile() {

  const receiverTitle = "นาย";
  const receiverName = "ภูวณัฐ";
  const receiverSurname = "พาหะละ";

  const data = {
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


    signatureUrl:
      "https://ufbrdtubwtuxfsowyqlm.supabase.co/storage/v1/object/public/uploads/Dorm-signature_1771264191611",

    service: 100,
    waterRate: 19,
    electricRate: 8,
    overdueFinePerDay: 50,
  };

  await prisma.dormProfile.upsert({
    where: { key: "MAIN" },
    update: {},
    create: {
      key: "MAIN",
      ...data,
    },
  });

  console.log("✅ DormProfile");
}

/* ================= ROOMS ================= */

async function seedRooms() {

  const admin = await prisma.admin.findUnique({
    where: { username: "BiwBoong" },
  });

  if (!admin) {
    console.log("❌ ไม่พบ Admin BiwBoong");
    return;
  }

  const rooms = [];

  for (let floor = 1; floor <= 5; floor++) {
    for (let room = 1; room <= 16; room++) {

      const number = `${floor}${room.toString().padStart(2, "0")}`;

      let size = "";
      let rent = 0;
      let deposit = 0;

      if (room <= 4) {
        size = "19.25 ตร.ม. ( 3.5 x 5.5 ม. )";
        rent = 2500;
        deposit = 2500;
      }
      else if (room <= 8) {
        size = "24.75 ตร.ม. ( 4.5 x 5.5 ม. )";
        rent = 3200;
        deposit = 3200;
      }
      else if (room <= 12) {
        size = "35.75 ตร.ม. ( 5.5 x 6.5 ม. )";
        rent = 4000;
        deposit = 4000;
      }
      else if (room <= 16) {
        size = "48.75 ตร.ม. ( 6.5 x 7.5 ม. )";
        rent = 4500;
        deposit = 4500;
      }
      else {
        size = "63.75 ตร.ม. ( 7.5 x 8.5 ม. )";
        rent = 5000;
        deposit = 5000;
      }

      rooms.push({
        number,
        size,
        rent,
        deposit,
        bookingFee: 500,
        status: 0,
        createdBy: admin.adminId,
      });
    }
  }

  await prisma.room.createMany({
    data: rooms,
    skipDuplicates: true,
  });

  console.log(`✅ Rooms ${rooms.length} ห้อง`);
}

/* ================= MAIN ================= */

async function main() {

  console.log("🌱 Seeding...");

  await seedAdmin("BiwBoong", "นายภูวณัฐ พาหะละ", 0);
  await seedAdmin("Admin", "Admin", 0);
  await seedAdmin("Biw", "Biw", 1);

  await seedDormProfile();

  await seedRooms();

  console.log("🎉 Seed เสร็จสมบูรณ์");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });