import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { processOverdueManual } from "../services/overdue.manual.js";
import { deleteSlip } from "../utils/deleteSlip.js"; // ✅ เพิ่มแค่นี้
import { thailandTime } from "../utils/timezone.js";
import {
  notifyBillCreated,
  notifyBillApproved,
  notifyBillEdited
} from "../services/billLineNotify.js";

const bill = Router();

const BILL_START_HOUR_UTC = 1;

// normalize เดือนบิล → วันที่ 1 เวลา 08:00 (TH) = 01:00 UTC
const normalizeBillMonthTH = (inputDate) => {
  const d = thailandTime(new Date(inputDate));

  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth()+1,
      1,
      BILL_START_HOUR_UTC,
      0,
      0
    )
  );
};

// ================= Dorm Profile Rates =================
const getDormRates = async () => {
  const profile = await prisma.dormProfile.findUnique({
    where: { key: "MAIN" },
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
    d.getUTCMonth()+1,
    5,
    1, 0, 0 // 08:00 ไทย
  ));
};

const generateBillNumber = async (billMonth) => {

  const prefix = "RNT";

  const d = new Date(billMonth);

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  const dateStr = `${year}${month}${day}`;

  const searchPrefix = `${prefix}-${dateStr}-`;

  const lastBill = await prisma.bill.findFirst({
    where: {
      billNumber: {
        startsWith: searchPrefix
      }
    },
    orderBy: {
      billNumber: "desc"
    }
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

  const bookStr = String(book).padStart(5, "0");

  // 01-09 มี 0 ข้างหน้า
  const numberStr = number < 10 ? `0${number}` : `${number}`;

  return `${prefix}-${dateStr}-${bookStr}-${numberStr}`;
};

// ================= Routes =================
// ดึงบิลทั้งหมด
bill.get("/getall", async (_req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
        adminCreated: {
          select: {
            adminId: true,
            name: true,
          },
        },
      },
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงบิลตาม ID
bill.get("/:billId", async (req, res) => {
  try {
    const billData = await prisma.bill.findUnique({
      where: { billId: req.params.billId },
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
        adminCreated: {
          select: {
            adminId: true,
            name: true,
          },
        },
      },
    });

    if (!billData)
      return res.status(404).json({ error: "ไม่พบบิลนี้" });

    res.json(billData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= CREATE FROM ROOM =================
bill.post(
  "/createFromRoom/:roomId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const { month, wAfter, eAfter } = req.body;
      const {
        service,
        waterRate,
        electricRate,
      } = await getDormRates();
      if (!month) throw new Error("กรุณาระบุเดือน");
      if (wAfter === undefined) throw new Error("กรุณาระบุเลขมิเตอร์น้ำ");
      if (eAfter === undefined) throw new Error("กรุณาระบุเลขมิเตอร์ไฟ");

      const billMonth = normalizeBillMonthTH(month);
const billNumber = await generateBillNumber(billMonth);

      const start = billMonth;

const end = new Date(billMonth);
end.setUTCMonth(end.getUTCMonth() + 1);

const dup = await prisma.bill.findFirst({
  where: {
    roomId,
    month: {
      gte: start,
      lt: end
    }
  }
});

      if (dup) throw new Error("มีบิลของเดือนนี้แล้ว");

      const booking = await prisma.booking.findFirst({
        where: { roomId, checkinStatus: 1 },
        orderBy: { createdAt: "desc" },
        include: { customer: true, room: true },
      });
      if (!booking) throw new Error("ไม่พบผู้เข้าพัก");

      const prevBill = await prisma.bill.findFirst({
        where: { roomId, month: { lt: billMonth } },
        orderBy: { month: "desc" },
      });

      const wBefore = prevBill ? prevBill.wAfter : 0;
      const eBefore = prevBill ? prevBill.eAfter : 0;

      if (wAfter < wBefore)
        throw new Error("ค่าน้ำต้องมากกว่าหรือเท่าครั้งก่อน");
      if (eAfter < eBefore)
        throw new Error("ค่าไฟต้องมากกว่าหรือเท่าครั้งก่อน");

      const rent = booking.room.rent;

      const wUnits = wAfter - wBefore;
      const eUnits = eAfter - eBefore;

      const waterCost = wUnits * waterRate;
      const electricCost = eUnits * electricRate;

      const total = rent + service + waterCost + electricCost;

      const billCreated = await prisma.bill.create({
        data: {
          billNumber,
          roomId,
          bookingId: booking.bookingId,
          customerId: booking.customerId,
          ctitle: booking.ctitle,
          cname: booking.cname,
          csurname: booking.csurname,
          fullName: booking.fullName,
          cphone: booking.cphone,
          month: billMonth,
          dueDate: getDueDateNextMonth5th(billMonth),
          rent,
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

      try {
        await notifyBillCreated(booking, billCreated, billNumber, service);
      } catch (e) {
        console.error("แจ้งบิลใหม่ล้มเหลว:", e.message);
      }

      res.json({ message: "สร้างบิลจากห้องสำเร็จ", bill: billCreated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// แจ้งค้างชำระ (manual)
bill.put(
  "/overdue/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const b = await processOverdueManual(req.params.billId);
      res.json({ message: "แจ้งเตือนบิลค้างชำระเรียบร้อย", bill: b });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✅ อนุมัติการชำระเงิน
bill.put(
  "/approve/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const billData = await prisma.bill.findUnique({
        where: { billId },
        include: { customer: true, room: true, payment: true },
      });

      if (!billData) throw new Error("ไม่พบบิล");

const newBillNumber = await generateBillNumber(billData.month);

      if (billData.billStatus !== 2)
        throw new Error("บิลนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.bill.update({
          where: { billId },
          data: {
            billStatus: 1,
            billNumber: newBillNumber,
            billDate: thailandTime()
          },
        });

        if (billData.payment) {
          await tx.payment.update({
            where: { billId },
            data: { updatedAt: thailandTime() },
          });
        }

        return b;
      });

      try {
        await notifyBillApproved(billData, updated);
      } catch (e) {
        console.error("แจ้งอนุมัติบิลล้มเหลว:", e.message);
      }

      res.json({ message: "อนุมัติการชำระเงินสำเร็จ", bill: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ❌ ปฏิเสธสลิป + ลบ Supabase
bill.put(
  "/reject/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const billData = await prisma.bill.findUnique({
        where: { billId },
        include: { customer: true, room: true, payment: true },
      });

      if (!billData) throw new Error("ไม่พบบิล");

      const updated = await prisma.$transaction(async (tx) => {
        if (billData.slipUrl) {
          await deleteSlip(billData.slipUrl); // ✅ ลบไฟล์จริง
        }

        await tx.payment.deleteMany({ where: { billId } });

        return tx.bill.update({
          where: { billId },
          data: {
            billStatus: 0,
            slipUrl: null,
            paidAt: null,
            billDate: thailandTime(),
          },
        });
      });

      try {
        await notifyBillEdited(billData, updated);
      } catch (e) {
        console.error("แจ้งปฏิเสธบิลล้มเหลว:", e.message);
      }

      res.json({ message: "ปฏิเสธการชำระเงินแล้ว", bill: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✏️ แก้ไขบิล (แก้ได้ทุกค่า)
bill.put(
  "/edit/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;
      const {
        wBefore,
        wAfter,
        eBefore,
        eAfter,
        month,
        dueDate,
        billStatus,
      } = req.body;
      const {
        overdueFinePerDay,
        waterRate,
        electricRate,
        service
      } = await getDormRates();

      const billData = await prisma.bill.findUnique({
        where: { billId },
        include: { customer: true, room: true },
      });

      if (!billData) throw new Error("ไม่พบบิล");

      if (![0, 2, 3].includes(billData.billStatus)) {
        throw new Error("ไม่สามารถแก้ไขบิลนี้ได้");
      }

const newMonth = month
  ? normalizeBillMonthTH(month)
  : billData.month;

      let newBillNumber = billData.billNumber;

      if (
        typeof billStatus === "number" &&
        billStatus === 1 &&
        billData.billStatus !== 1
      ) {
        newBillNumber = await generateBillNumber(newMonth);
      }

      // ✅ ใช้ค่าที่ส่งมา หรือ fallback ค่าเดิม
      const newWBefore =
        wBefore !== undefined ? Number(wBefore) : billData.wBefore;

      const newWAfter =
        wAfter !== undefined ? Number(wAfter) : billData.wAfter;

      const newEBefore =
        eBefore !== undefined ? Number(eBefore) : billData.eBefore;

      const newEAfter =
        eAfter !== undefined ? Number(eAfter) : billData.eAfter;

      // ✅ validation
      if (newWAfter < newWBefore)
        throw new Error("ค่าน้ำหลังต้องมากกว่าหรือเท่าก่อน");

      if (newEAfter < newEBefore)
        throw new Error("ค่าไฟหลังต้องมากกว่าหรือเท่าก่อน");

      // ✅ คำนวณใหม่
      const wUnits = newWAfter - newWBefore;
      const eUnits = newEAfter - newEBefore;

      const waterCost = wUnits * waterRate;
      const electricCost = eUnits * electricRate;

      let newOverdueDays = billData.overdueDays ?? 0;
      let newFine = billData.fine ?? 0;

      if (dueDate) {
        const today = thailandTime();
        const newDue = thailandTime(new Date(dueDate));

        if (today > newDue) {
          const diffDays = Math.floor(
            (today.getTime() - newDue.getTime()) /
            (1000 * 60 * 60 * 24)
          );
          newOverdueDays = diffDays;
          newFine = diffDays * overdueFinePerDay;
        } else {
          newOverdueDays = 0;
          newFine = 0;
        }
      }

      const total =
        billData.rent +
        service +
        waterCost +
        electricCost +
        newFine;

      const updated = await prisma.bill.update({
        where: { billId },
        data: {
          billNumber: newBillNumber,
          wBefore: newWBefore,
          wAfter: newWAfter,
          wUnits,
          waterCost,
          eBefore: newEBefore,
          eAfter: newEAfter,
          eUnits,
          service,
          electricCost,
          total,
          month: newMonth,
          dueDate: dueDate ? thailandTime(dueDate) : billData.dueDate,
          overdueDays: newOverdueDays,
          fine: newFine,
          billStatus:
            typeof billStatus === "number"
              ? billStatus
              : billData.billStatus,
          billDate: thailandTime(),
        },
      });

      try {
        await notifyBillEdited(billData, updated);
      } catch (e) {
        console.error("แจ้งแก้ไขบิลล้มเหลว:", e.message);
      }

      res.json({ message: "แก้ไขบิลสำเร็จ", bill: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ลบบิล + payment + ลบไฟล์สลิป
bill.delete("/:billId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { billId } = req.params;

    const billData = await prisma.bill.findUnique({
      where: { billId },
      include: { payment: true },
    });

    if (!billData) throw new Error("ไม่พบบิล");

    await prisma.$transaction(async (tx) => {
      // ✅ ลบไฟล์ใน Supabase
      if (billData.slipUrl) {
        await deleteSlip(billData.slipUrl);
      }
      // ✅ ลบ payment
      await tx.payment.deleteMany({ where: { billId } });
      // ✅ ลบบิล
      await tx.bill.delete({ where: { billId } });
    });

    res.json({ message: "ลบบิล + payment + สลิป สำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default bill;