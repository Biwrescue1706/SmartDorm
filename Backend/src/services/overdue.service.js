import prisma from "../prisma.js";
import { sendFlexMessage } from "../utils/lineFlex.js";
import cron from "node-cron";
import { BASE_URL, ADMIN_URL } from "../utils/api.js";

const adminId = process.env.ADMIN_LINE_ID;

// =========================
// STATE CONTROL
// =========================
let isRunning = false;
let isScheduled = false;

// =========================
// CACHE DormProfile
// =========================
let dormCache = null;
let lastFetch = 0;

const safeNumber = (val) => Math.max(0, Number(val) || 0);

export const getDormRates = async () => {
  const now = Date.now();

  // cache 5 นาที
  if (dormCache && now - lastFetch < 5 * 60 * 1000) {
    return dormCache;
  }

  const profile = await prisma.dormProfile.findUnique({
    where: { key: "MAIN" },
    select: {
      service: true,
      waterRate: true,
      electricRate: true,
      overdueFinePerDay: true,
    },
  });

  if (!profile) throw new Error("ยังไม่ได้ตั้งค่า DormProfile");

  dormCache = {
    service: safeNumber(profile.service),
    waterRate: safeNumber(profile.waterRate),
    electricRate: safeNumber(profile.electricRate),
    overdueFinePerDay: safeNumber(profile.overdueFinePerDay),
  };

  lastFetch = now;

  return dormCache;
};

// =========================
// RETRY SEND
// =========================
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
// TIMEZONE (TH)
// =========================
const getTodayTH = () =>
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    })
  );

// =========================
// CALCULATE OVERDUE DAYS
// =========================
const calcOverdueDays = (today, dueDate) => {
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return Math.floor(
    (startOfToday - due) / (1000 * 60 * 60 * 24)
  );
};

// =========================
// PROCESS 1 BILL
// =========================
const processBill = async (bill, rates, today) => {
  try {
    const overdueDays = calcOverdueDays(today, bill.dueDate);

    if (overdueDays <= 0) return;

    // กันแจ้งซ้ำวันเดียวกัน
    if (
      bill.lastOverdueNotifyAt &&
      new Date(bill.lastOverdueNotifyAt).toDateString() ===
        today.toDateString()
    ) {
      return;
    }

    const fine =
      overdueDays *
      (bill.overdueFinePerDay ?? rates.overdueFinePerDay);

    const total =
      safeNumber(bill.rent) +
      safeNumber(bill.service) +
      safeNumber(bill.waterCost) +
      safeNumber(bill.electricCost) +
      safeNumber(fine);

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

    // =========================
    // SEND TO CUSTOMER
    // =========================
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

    // =========================
    // SEND TO ADMIN
    // =========================
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
};

// =========================
// MAIN PROCESS
// =========================
export const processOverdueAuto = async () => {
  if (isRunning) {
    console.log("⏳ Skip duplicate cron");
    return;
  }

  isRunning = true;

  try {
    const today = getTodayTH();
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

    if (!bills.length) return;

    // โหลด config ครั้งเดียว
    const rates = await getDormRates();

    await Promise.allSettled(
      bills.map((bill) => processBill(bill, rates, today))
    );
  } catch (err) {
    console.error("❌ processOverdueAuto error:", err);
  } finally {
    isRunning = false;
  }
};

// =========================
// CRON SCHEDULER
// =========================
export const scheduleOverdueAuto = () => {
  if (isScheduled) return;

  isScheduled = true;

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