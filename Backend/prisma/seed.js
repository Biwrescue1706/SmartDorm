//prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

function buildFullName(title, name, surname) {
    return `${title ?? ""}${name ?? ""} ${surname ?? ""}`.trim();
}

async function main() {
    console.log("Start seeding...");

    // ===== Admin =====
    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = await prisma.admin.upsert({
        where: { username: "BiwBoong" },
        update: {},
        create: {
            username: "BiwBoong",
            name: "นายภูวณัฐ พาหะละ",
            password: hashedPassword,
            role: 0,
        },
    });

    console.log("Admin seeded:", admin.username);

    // ===== Dorm Profile =====
    const title = "นาย";
    const name = "ภูวณัฐ";
    const surname = "พาหะละ";

    const profile = await prisma.dormProfile.upsert({
        where: { dormName: "หอพักบิวเรสซิเดนซ์" },
        update: {},
        create: {
            dormName: "หอพักบิวเรสซิเดนซ์",
            address: "47/21 ม.1 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000",
            phone: "0611747731",
            email: "bewrockgame1@gmail.com",

            taxId: "1209000088280",
            taxType: 0,

            receiverTitle: title,
            receiverName: name,
            receiverSurname: surname,
            receiverFullName: buildFullName(title, name, surname),

            signatureUrl: null,
        },
    });

    console.log("DormProfile seeded:", profile.dormName);

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
