import prisma from "../prisma.js";
import { sendFlexMessage } from "../utils/lineFlex.js";
import { BASE_URL, ADMIN_URL } from "../utils/api.js";

const ADMIN_LINE_ID = process.env.ADMIN_LINE_ID;

// =========================
// UTILS
// =========================
const safeNumber = (val) => Math.max(0, Number(val) || 0);

const getTodayTH = () =>
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    })
  );

const calcOverdueDays = (today, dueDate) => {
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return Math.floor(
    (startOfToday - due) / (1000 * 60 * 60 * 24)
  );
};

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
// LOAD RATE (จาก DB จริง)
// =========================
const getDormRates = async () => {
  const profile = await prisma.dormProfile.findUnique({
    where: { key: "MAIN" },
    select: {
      overdueFinePerDay: true,
    },
  });

  if (!profile) throw new Error("ยังไม่ได้ตั้งค่า DormProfile");

  return safeNumber(profile.overdueFinePerDay);
};

// =========================
// MAIN
// =========================
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

  const today = getTodayTH();
  const overdueDays = calcOverdueDays(today, bill.dueDate);

  if (overdueDays <= 0) {
    throw new Error("บิลนี้ยังไม่เกินกำหนด");
  }

  // โหลดค่าปรับจาก DB จริง
  const overdueFinePerDay = await getDormRates();

  const fine =
    overdueDays *
    (bill.overdueFinePerDay ?? overdueFinePerDay);

  const total =
    safeNumber(bill.rent) +
    safeNumber(bill.service) +
    safeNumber(bill.waterCost) +
    safeNumber(bill.electricCost) +
    safeNumber(fine);

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

  // =========================
  // SEND CUSTOMER
  // =========================
  if (bill.customer?.userId) {
    await safeSend(() =>
      sendFlexMessage(
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
      )
    );
  }

  // =========================
  // SEND ADMIN
  // =========================
  if (ADMIN_LINE_ID) {
    await safeSend(() =>
      sendFlexMessage(
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
      )
    );
  }

  return updated;
};