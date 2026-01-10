// src/services/overdue.service.ts
import prisma from "../prisma";
import { sendFlexMessage } from "../utils/lineFlex";
import { OVERDUE_FINE_PER_DAY } from "../config/rate";
import cron from "node-cron";

const BASE_URL = "https://smartdorm-detail.biwbong.shop";
const ADMIN_URL = "https://smartdorm-admin.biwbong.shop";
const adminId = process.env.ADMIN_LINE_ID;

//  * ประมวลผลบิลค้างชำระอัตโนมัติ
//  * - ส่งแจ้งเตือนลูกค้าและแอดมิน
//  * - ไม่ส่งซ้ำเกินวันละ 1 ครั้ง
export const processOverdueAuto = async () => {
  const today = new Date();

  const bills = await prisma.bill.findMany({
    where: {
      billStatus: 0,
      dueDate: { lt: today },
    },
    include: {
      customer: true,
      room: true,
    },
  });

  for (const bill of bills) {
    const overdueDays = Math.floor(
      (today.getTime() - new Date(bill.dueDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (overdueDays <= 0) continue;

    // ❌ กันแจ้งซ้ำเกินวันละ 1 ครั้ง
    if (bill.lastOverdueNotifyAt?.toDateString() === today.toDateString())
      continue;

    const fine = overdueDays * OVERDUE_FINE_PER_DAY;
    const total =
      bill.rent + bill.service + bill.waterCost + bill.electricCost + fine;

    await prisma.bill.update({
      where: { billId: bill.billId },
      data: {
        overdueDays,
        fine,
        total,
        lastOverdueNotifyAt: new Date(), // บันทึกเวลาส่ง
      },
    });

    const billUrl = `${BASE_URL}/bill/${bill.billId}`;

    // 📲 แจ้งลูกค้า
    if (bill.customer?.userId) {
      await sendFlexMessage(
        bill.customer.userId,
        "🏫SmartDorm🎉 ระบบแจ้งเตือนบิลค้างชำระ ( อัตโนมัติ )",
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
        "🏫SmartDorm🎉 ระบบแจ้งเตือนบิลค้างชำระ ( อัตโนมัติ )",
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
};

// ตั้ง Cron Job รันทุกวันเวลา 09:30

export const scheduleOverdueAuto = () => {
  cron.schedule("30 9 * * *", async () => {
    console.log("⏰ รันแจ้งเตือนบิลค้างชำระอัตโนมัติ");
    try {
      await processOverdueAuto();
    } catch (err) {
      console.error("❌ processOverdueAuto error:", err);
    }
  });
};
