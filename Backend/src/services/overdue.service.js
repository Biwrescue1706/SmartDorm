import prisma from "../prisma.js";
import { sendFlexMessage } from "../utils/lineFlex.js";
import cron from "node-cron";
import { BASE_URL, ADMIN_URL } from "../utils/api.js";

const adminId = process.env.ADMIN_LINE_ID;

// กัน cron ยิงซ้ำ
let isRunning = false;

// retry helper
async function safeSend(fn, retry = 2) {
  while (retry >= 0) {
    try {
      return await fn();
    } catch (err) {
      console.error("🔁 Retry sendFlexMessage:", err.message);
      retry--;
      if (retry < 0) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

// =========================
// ประมวลผลบิลค้างชำระ
// =========================
export const processOverdueAuto = async () => {
  if (isRunning) {
    console.log("⏳ Skip duplicate cron");
    return;
  }

  isRunning = true;

  try {
    const today = new Date();
    console.log("🔎 Running processOverdueAuto:", today.toString());

    const bills = await prisma.bill.findMany({
      where: {
        billStatus: 0,
        dueDate: { lte: today },
      },
      include: {
        customer: true,
        room: true,
      },
    });

    console.log("📄 Bills found:", bills.length);

    await Promise.all(
      bills.map(async (bill) => {
        try {
          const overdueDays = Math.floor(
            (today.getTime() - new Date(bill.dueDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (overdueDays <= 0) return;

          // กันแจ้งซ้ำวันเดียวกัน
          if (
            bill.lastOverdueNotifyAt &&
            new Date(bill.lastOverdueNotifyAt).toDateString() ===
              today.toDateString()
          ) {
            return;
          }

          const fine = overdueDays * (bill.overdueFinePerDay ?? 0);

          const total =
            bill.rent +
            bill.service +
            bill.waterCost +
            bill.electricCost +
            fine;

          // update DB
          await prisma.bill.update({
            where: { billId: bill.billId },
            data: {
              overdueDays,
              fine,
              total,
              lastOverdueNotifyAt: new Date(),
            },
          });

          const billUrl = `${BASE_URL}/bill/${bill.billId}`;

          // แจ้งลูกค้า
          if (bill.customer?.userId) {
            await safeSend(() =>
              sendFlexMessage(
                bill.customer.userId,
                "🏫SmartDorm🎉 ระบบแจ้งเตือนบิลค้างชำระ",
                [
                  { label: "ห้อง", value: bill.room?.number ?? "-" },
                  { label: "ชื่อ", value: bill.fullName ?? "-" },
                  { label: "ค้าง", value: `${overdueDays} วัน` },
                  { label: "ค่าปรับ", value: `${fine} บาท` },
                  { label: "ยอดรวม", value: `${total.toLocaleString()} บาท` },
                ],
                [{ label: "ดูบิล", url: billUrl }]
              )
            );
          }

          // แจ้งแอดมิน
          if (adminId) {
            await safeSend(() =>
              sendFlexMessage(
                adminId,
                "🏫SmartDorm🎉 ระบบแจ้งเตือนบิลค้างชำระ",
                [
                  { label: "ห้อง", value: bill.room?.number ?? "-" },
                  { label: "ชื่อ", value: bill.fullName ?? "-" },
                  { label: "ค้าง", value: `${overdueDays} วัน` },
                  { label: "ค่าปรับ", value: `${fine} บาท` },
                  { label: "ยอดรวม", value: `${total.toLocaleString()} บาท` },
                ],
                [{ label: "ดูรายละเอียด", url: ADMIN_URL }]
              )
            );
          }
        } catch (err) {
          console.error("❌ BILL ERROR:", bill.billId, err);
        }
      })
    );
  } catch (err) {
    console.error("❌ processOverdueAuto error:", err);

    // reset connection กัน Prisma ค้าง
    await prisma.$disconnect();
  } finally {
    isRunning = false;
  }
};

// =========================
// ตั้ง Cron เวลาไทย 09:30
// =========================
export const scheduleOverdueAuto = () => {
  console.log("⏰ Scheduling overdue cron (Asia/Bangkok)...");
  console.log("🕒 Server current time:", new Date().toString());

  cron.schedule(
    "30 9 * * *",
    async () => {
      console.log("🔥 CRON TRIGGERED:", new Date().toString());
      await processOverdueAuto();
    },
    {
      timezone: "Asia/Bangkok",
    }
  );
};