import { Router } from "express";
import prisma from "../../prisma.js";
import { authMiddleware, roleMiddleware } from "../../middleware/authMiddleware.js";
import { processOverdueManual } from "../../services/overdue.manual.js";
import { deleteSlip } from "../../utils/deleteSlip.js";
import { thailandTime } from "../../utils/timezone.js";
import {
  notifyBillCreated,
  notifyBillApproved,
  notifyBillEdited
} from "../../services/LineNotify/billLineNotify.js";

const bill = Router();

const BILL_START_HOUR_UTC = 1;

// ================= CACHE =================
let billCache = null;
let billCacheTime = 0;
const CACHE_TTL = 1000 * 10;

const clearCache = () => {
  billCache = null;
  billCacheTime = 0;
};

// ================= UTILS =================
const normalizeBillMonthTH = (inputDate) => {
  const d = thailandTime(new Date(inputDate));
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    1,
    BILL_START_HOUR_UTC, 0, 0
  ));
};

const getDormRates = async () => {
  const profile = await prisma.dormProfile.findUnique({
    where: { key: "MAIN" },
    select: {
      service: true,
      waterRate: true,
      electricRate: true,
      overdueFinePerDay: true
    }
  });

  if (!profile) throw new Error("ยังไม่ได้ตั้งค่า DormProfile");

  return {
    service: profile.service ?? 0,
    waterRate: profile.waterRate ?? 0,
    electricRate: profile.electricRate ?? 0,
    overdueFinePerDay: profile.overdueFinePerDay ?? 0,
  };
};

const getDueDateNextMonth5th = (month) => {
  const d = new Date(month);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    5,
    1, 0, 0
  ));
};

const generateBillNumber = async (billMonth) => {
  const prefix = "RNT";

  const d = new Date(billMonth);
  const dateStr =
    d.getUTCFullYear() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0");

  const lastBill = await prisma.bill.findFirst({
    orderBy: { createdAt: "desc" },
    select: { billNumber: true }
  });

  let book = 8050;
  let number = 1;

  if (lastBill) {
    const parts = lastBill.billNumber.split("-");
    const lastBook = parseInt(parts[2]);
    const lastNumber = parseInt(parts[3]);

    if (lastNumber >= 50) {
      book = lastBook + 1;
      number = 1;
    } else {
      book = lastBook;
      number = lastNumber + 1;
    }
  }

  return `${prefix}-${dateStr}-${String(book).padStart(5, "0")}-${String(number).padStart(2, "0")}`;
};

// ================= GET ALL =================
bill.get("/getall", async (_req, res) => {
  try {
    if (billCache && Date.now() - billCacheTime < CACHE_TTL) {
      return res.json(billCache);
    }

    const bills = await prisma.bill.findMany({
  orderBy: { createdAt: "desc" },
  include: {
    room: true,
    booking: true,
    customer: true,
    payment: true,
    adminCreated: true,
  },
});

    billCache = bills;
    billCacheTime = Date.now();

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ONE =================
bill.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const where = key.startsWith("RNT-")
      ? { billNumber: key }
      : { billId: key };

    const billData = await prisma.bill.findUnique({
      where,
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
        adminCreated: {
          select: { adminId: true, name: true },
        },
      },
    });

    if (!billData) {
      return res.status(404).json({ error: "ไม่พบบิลนี้" });
    }

    res.json(billData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= CREATE =================
bill.post(
  "/createFromRoom/:roomId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const { month, wAfter, eAfter } = req.body;

      const { service, waterRate, electricRate } = await getDormRates();
      const billMonth = normalizeBillMonthTH(month);

      const [booking, prevBill, dup] = await Promise.all([
        prisma.booking.findFirst({
          where: { roomId, checkinStatus: 1 },
          orderBy: { createdAt: "desc" },
          include: { customer: true, room: true },
        }),
        prisma.bill.findFirst({
          where: { roomId, month: { lt: billMonth } },
          orderBy: { month: "desc" },
        }),
        prisma.bill.findFirst({
          where: {
            roomId,
            month: {
              gte: billMonth,
              lt: new Date(new Date(billMonth).setUTCMonth(billMonth.getUTCMonth() + 1))
            }
          }
        })
      ]);

      if (dup) throw new Error("มีบิลของเดือนนี้แล้ว");
      if (!booking) throw new Error("ไม่พบผู้เข้าพัก");

      const wBefore = prevBill?.wAfter ?? 0;
      const eBefore = prevBill?.eAfter ?? 0;

      const wUnits = wAfter - wBefore;
      const eUnits = eAfter - eBefore;

      const waterCost = wUnits * waterRate;
      const electricCost = eUnits * electricRate;

      const total =
        booking.room.rent +
        service +
        waterCost +
        electricCost;

      const billCreated = await prisma.bill.create({
        data: {
          billNumber: await generateBillNumber(billMonth),
          roomId,
          bookingId: booking.bookingId,
          customerId: booking.customerId,
          fullName: booking.fullName,
          cphone: booking.cphone,
          month: billMonth,
          dueDate: getDueDateNextMonth5th(billMonth),
          rent: booking.room.rent,
          service,
          wBefore,
          wAfter,
          wUnits,
          waterCost,
          eBefore,
          eAfter,
          eUnits,
          electricCost,
          total,
          billStatus: 0,
          billDate: thailandTime(),
          createdBy: req.admin.adminId,
        },
      });

      clearCache();

      try {
        await notifyBillCreated(booking, billCreated);
      } catch {}

      res.json({ message: "สร้างบิลสำเร็จ", bill: billCreated });

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ================= APPROVE =================
bill.put("/approve/:billId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { billId } = req.params;

    const billData = await prisma.bill.findUnique({
      where: { billId },
      include: { customer: true, room: true, payment: true },
    });

    if (!billData) throw new Error("ไม่พบบิล");

    const updated = await prisma.bill.update({
      where: { billId },
      data: {
        billStatus: 1,
        billDate: thailandTime(),
        updatedAt: thailandTime(),
        updatedBy: req.admin.adminId
      },
    });

    clearCache();

    try {
      await notifyBillApproved(billData, updated);
    } catch {}

    res.json({ message: "อนุมัติสำเร็จ", bill: updated });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= DELETE =================
bill.delete("/:billId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { billId } = req.params;

    const billData = await prisma.bill.findUnique({
      where: { billId },
      select: { slipUrl: true }
    });

    await prisma.$transaction(async (tx) => {
      if (billData?.slipUrl) {
        await deleteSlip(billData.slipUrl);
      }

      await tx.payment.deleteMany({ where: { billId } });
      await tx.bill.delete({ where: { billId } });
    });

    clearCache();

    res.json({ message: "ลบสำเร็จ" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default bill;