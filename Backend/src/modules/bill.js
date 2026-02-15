import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { sendFlexMessage } from "../utils/lineFlex.js";
import { processOverdueManual } from "../services/overdue.manual.js";
import { BASE_URL } from "../utils/api.js";
import { deleteSlip } from "../utils/deleteSlip.js"; // ✅ เพิ่มแค่นี้

const bill = Router();

// ================= Helpers =================

// บิลใช้เวลาไทย (+7) → เก็บเป็น UTC
const TH_UTC_OFFSET_HOUR = 7;
const BILL_START_HOUR_TH = 8; // 08:00 ไทย
const BILL_START_HOUR_UTC = BILL_START_HOUR_TH - TH_UTC_OFFSET_HOUR; // = 1

// normalize เดือนบิล → วันที่ 1 เวลา 08:00 (TH) = 01:00 UTC
const normalizeBillMonthTH = (inputDate) => {
  const d = new Date(inputDate);

  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
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

const getMonthRange = (month) => {
  const start = normalizeBillMonthTH(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end };
};

const getDueDateNextMonth5th = (month) => {
  const d = new Date(month);

  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    5,
    1, 0, 0 // 08:00 ไทย
  ));
};

const generateBillNumber = async (status) => {
  const prefix = status === 1 ? "RC" : "INV";
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const searchPrefix = `${prefix}${year}${month}`;

  const lastBill = await prisma.bill.findFirst({
    where: {
      billNumber: {
        startsWith: searchPrefix,
      },
    },
    orderBy: { billNumber: "desc" },
  });

  let nextNumber = 1;

  if (lastBill) {
    const lastSeq = lastBill.billNumber.slice(-8);
    nextNumber = Number(lastSeq) + 1;
  }

  const seq = String(nextNumber).padStart(8, "0");

  return `${searchPrefix}${seq}`;
};

const formatThaiDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "-";

const formatThaiMonth = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

const getBillStatusText = (status) => {
  switch (status) {
    case 0:
      return "รอการชำระเงิน";
    case 1:
      return "ชำระเงินแล้ว";
    case 2:
      return "รอตรวจสอบ";
    case 3:
      return "ปฏิเสธการชำระเงิน";
    default:
      return "ไม่ทราบสถานะ";
  }
};

const getBillStatusColour = (status) => {
  switch (status) {
    case 0:
      return "#9CA3AF";
    case 1:
      return "#16A34A";
    case 2:
      return "#FACC15";
    case 3:
      return "#DC2626";
    default:
      return "#6B7280";
  }
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
  overdueFinePerDay
} = await getDormRates();
      if (!month) throw new Error("กรุณาระบุเดือน");

      // ✅ FIX: normalize month → วันที่ 1 ของเดือนเสมอ
      const billNumber = await generateBillNumber(0);
      const billMonth = normalizeBillMonthTH(month);

      // 🔒 กันออกบิลซ้ำ (เช็คตามเดือนที่ normalize แล้ว)
      const dup = await prisma.bill.findFirst({
        where: { roomId, month: billMonth },
      });
      if (dup) throw new Error("มีบิลของเดือนนี้แล้ว");

      const booking = await prisma.booking.findFirst({
        where: { roomId, checkinStatus: 1 },
        orderBy: { createdAt: "desc" },
        include: { customer: true, room: true },
      });
      if (!booking) throw new Error("ไม่พบผู้เข้าพัก");

      // 🔒 rule 25
      const cutoff = new Date(
        billMonth.getFullYear(),
        billMonth.getMonth() - 1,
        25,
        23, 59, 59
      );

      if (new Date(booking.checkin) > cutoff) {
        throw new Error(
          "ผู้เช่าเข้าพักหลังวันที่ 25 ของเดือนก่อน ไม่สามารถออกบิลรอบนี้ได้"
        );
      }

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
          billDate: new Date(),
          createdBy: req.admin.adminId,
        },
      });

      const detailedBill = `${BASE_URL}/bill/${billCreated.billId}`;

      if (booking.customer?.userId) {
        await sendFlexMessage(
          booking.customer.userId,
          `📄 แจ้งบิลค่าเช่าห้อง ประจำเดือน ${formatThaiMonth(
            billCreated.month
          )}`,
          [
            { label: "รหัสบิล", value: billCreated.billId },
            { label: "เลขที่บิล", value: billNumber },
            { label: "ห้อง", value: booking.room.number },
            { label: "ค่าเช่าห้อง", value: `${rent} บาท` },
            {
              label: "ค่าน้ำ",
              value: `${billCreated.wUnits} หน่วย (${billCreated.waterCost} บาท)`,
            },
            {
              label: "ค่าไฟ",
              value: `${billCreated.eUnits} หน่วย (${billCreated.electricCost} บาท)`,
            },
            { label: "ค่าส่วนกลาง", value: `${service} บาท` },
            {
              label: "ยอดรวมทั้งหมด",
              value: `${billCreated.total.toLocaleString()} บาท`,
            },
            {
              label: "ครบกำหนดชำระ",
              value: formatThaiDate(billCreated.dueDate),
            },
            {
              label: "สถานะ",
              value: getBillStatusText(billCreated.billStatus),
              color: getBillStatusColour(billCreated.billStatus),
            },
          ],
          [{ label: "ดูรายละเอียดและชำระเงิน", url: detailedBill }]
        );
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

      const newBillNumber = await generateBillNumber(1);

      if (!billData) throw new Error("ไม่พบบิล");
      if (billData.billStatus !== 2)
        throw new Error("บิลนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.bill.update({
          where: { billId },
          data: {
            billStatus: 1,
            billNumber: newBillNumber,
            billDate: new Date()
          },
        });

        if (billData.payment) {
          await tx.payment.update({
            where: { billId },
            data: { updatedAt: new Date() },
          });
        }

        return b;
      });

      const detailedBill = `${BASE_URL}/bill/${updated.billId}`;

      if (billData.customer?.userId) {
        await sendFlexMessage(
          billData.customer.userId,
          "🏫SmartDorm🎉 แจ้งผลการชำระเงิน",
          [
            { label: "รหัสบิล", value: updated.billId },
            { label: "เลขที่บิล", value: updated.billNumber },
            { label: "ห้อง", value: billData.room?.number ?? "-" },
            { label: "เดือนที่ชำระ", value: formatThaiMonth(updated.month) },
            {
              label: "ยอดชำระ",
              value: `${updated.total.toLocaleString()} บาท`,
            },
            {
              label: "สถานะ",
              value: getBillStatusText(updated.billStatus),
              color: getBillStatusColour(updated.billStatus),
            },
            { label: "วันที่ยืนยัน", value: formatThaiDate(updated.billDate) },
          ],
          [{ label: "ดูรายละเอียดและชำระเงิน", url: detailedBill }]
        );
      }

      res.json({ message: "อนุมัติการชำระเงินสำเร็จ", bill: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ❌ ปฏิเสธสลิป
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
        if (billData.slipUrl) await deleteSlip(billData.slipUrl);

        // ลบ payment อย่างเดียว
        await tx.payment.deleteMany({
          where: { billId },
        });

        // บิลยังอยู่ แต่เปลี่ยนสถานะ
        return tx.bill.update({
          where: { billId },
          data: {
            billStatus: 0,
            billDate: new Date(),
          },
        });
      });

      const detailedBill = `${BASE_URL}/bill/${updated.billId}`;

      if (billData.customer?.userId) {
        await sendFlexMessage(
          billData.customer.userId,
          "🏫SmartDorm🎉 แจ้งผลการชำระเงิน",
          [
            { label: "รหัสบิล", value: updated.billId },
            { label: "ห้อง", value: billData.room?.number ?? "-" },
            { label: "เดือนที่ชำระ", value: formatThaiMonth(updated.month) },
            {
              label: "ยอดชำระ",
              value: `${updated.total.toLocaleString()} บาท`,
            },
            {
              label: "สถานะ",
              value: getBillStatusText(updated.billStatus),
              color: getBillStatusColour(updated.billStatus),
            },
            { label: "วันที่ยืนยัน", value: formatThaiDate(updated.billDate) },
          ],
          [{ label: "ดูรายละเอียดและชำระเงิน", url: detailedBill }]
        );
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
        const today = new Date();
        const newDue = new Date(dueDate);

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
          month: month ? normalizeBillMonthTH(month) : billData.month,
          dueDate: dueDate ? new Date(dueDate) : billData.dueDate,
          overdueDays: newOverdueDays,
          fine: newFine,
          billStatus:
            typeof billStatus === "number"
              ? billStatus
              : billData.billStatus,
          billDate: new Date(),
        },
      });

      const detailedBill = `${BASE_URL}/bill/${updated.billId}`;

      if (billData.customer?.userId) {
        await sendFlexMessage(
          billData.customer.userId,
          "🏫SmartDorm🎉 แก้ไขบิลค่าเช่าห้อง",
          [
            { label: "รหัสบิล", value: updated.billId },
            { label: "ห้อง", value: billData.room?.number ?? "-" },
            { label: "ประจำเดือน", value: formatThaiMonth(updated.month) },
            {
              label: "ค่าน้ำ",
              value: `${updated.wUnits} หน่วย (${updated.waterCost} บาท)`,
            },
            {
              label: "ค่าไฟ",
              value: `${updated.eUnits} หน่วย (${updated.electricCost} บาท)`,
            },
            {
              label: "ยอดรวมใหม่",
              value: `${updated.total.toLocaleString()} บาท`,
            },
            {
              label: "ครบกำหนดชำระ",
              value: formatThaiDate(updated.dueDate),
            },
            {
              label: "สถานะ",
              value: getBillStatusText(updated.billStatus),
              color: getBillStatusColour(updated.billStatus),
            },
          ],
          [{ label: "ดูรายละเอียดบิล", url: detailedBill }]
        );
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
      // ✅ ลบไฟล์สลิปใน Supabase
      if (billData.slipUrl) {
        await deleteSlip(billData.slipUrl);
      }

      // ✅ ลบ payment
      if (billData.payment) {
        await tx.payment.deleteMany({ where: { billId } });
      }

      // ✅ ลบบิล
      await tx.bill.delete({ where: { billId } });
    });

    res.json({ message: "ลบบิล + payment + สลิป สำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default bill;