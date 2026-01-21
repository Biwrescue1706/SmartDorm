import prisma from "../prisma.js";
import { sendFlexMessage } from "../utils/lineFlex.js";
import { OVERDUE_FINE_PER_DAY } from "../config/rate.js";
import { BASE_URL, ADMIN_URL } from "../utils/api.js";

const ADMIN_LINE_ID = process.env.ADMIN_LINE_ID;

export const processOverdueManual = async (billId) => {
  const bill = await prisma.bill.findUnique({
    where: { billId },
    include: {
      customer: true,
      room: true,
    },
  });

  if (!bill) throw new Error("ไม่พบบิล");
  if (bill.billStatus === 1) throw new Error("บิลนี้ชำระแล้ว");

  const today = new Date();
  const due = new Date(bill.dueDate);

  const overdueDays = Math.floor(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (overdueDays <= 0) throw new Error("บิลนี้ยังไม่เกินกำหนด");

  const fine = overdueDays * OVERDUE_FINE_PER_DAY;

  const total =
    bill.rent + bill.service + bill.waterCost + bill.electricCost + fine;

  const updated = await prisma.bill.update({
    where: { billId },
    data: {
      overdueDays,
      fine,
      total,
      billStatus: 0,
    },
  });

  const billUrl = `${BASE_URL}/bill/${bill.billId}`;

  // 📲 แจ้งลูกค้า
  if (bill.customer?.userId) {
    await sendFlexMessage(
      bill.customer.userId,
      "🏫SmartDorm🎉 แจ้งเตือนบิลค้างชำระ",
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

  // 📲 แจ้งแอดมิน
  if (ADMIN_LINE_ID) {
    await sendFlexMessage(
      ADMIN_LINE_ID,
      "📌 แจ้งเตือนบิลค้างชำระ (แอดมินกดเอง)",
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

  return updated;
};