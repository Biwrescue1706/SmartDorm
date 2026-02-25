import prisma from "../prisma.js";
import { sendFlexMessage } from "../utils/lineFlex.js";
import cron from "node-cron";
import { BASE_URL, ADMIN_URL } from "../utils/api.js";

const adminId = process.env.ADMIN_LINE_ID;

// =========================
// ประมวลผลบิลค้างชำระ
// =========================
export const processOverdueAuto = async () => {
  try {
    const today = new Date();

    console.log("🔎 Running processOverdueAuto:", today.toString());

    const bills = await prisma.bill.findMany({
      where: {
        billStatus: 0,
        dueDate: { lte: today }, // ✅ ใช้ lte กันพลาด
      },
      include: {
        customer: true,
        room: true,
      },
    });

    console.log("📄 Bills found:", bills.length);

    for (const bill of bills) {
      const overdueDays = Math.floor(
        (today.getTime() - new Date(bill.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (overdueDays <= 0) continue;

      // ❌ กันแจ้งซ้ำวันเดียวกัน
      if (
        bill.lastOverdueNotifyAt &&
        new Date(bill.lastOverdueNotifyAt).toDateString() ===
          today.toDateString()
      ) {
        continue;
      }

      const fine = overdueDays * (bill.overdueFinePerDay ?? 0);

      const total =
        bill.rent +
        bill.service +
        bill.waterCost +
        bill.electricCost +
        fine;

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

      // 📲 แจ้งลูกค้า
      if (bill.customer?.userId) {
        await sendFlexMessage(
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
        );
      }

      // 📢 แจ้งแอดมิน
      if (adminId) {
        await sendFlexMessage(
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
        );
      }
    }
  } catch (err) {
    console.error("❌ processOverdueAuto error:", err);
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
      timezone: "Asia/Bangkok", // ✅ สำคัญมาก
    }
  );
};