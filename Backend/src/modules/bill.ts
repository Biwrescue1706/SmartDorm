// src/modules/bill.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import { sendFlexMessage } from "../utils/lineFlex";
import { createClient } from "@supabase/supabase-js";
import {
  WATER_PRICE,
  ELECTRIC_PRICE,
  OVERDUE_FINE_PER_DAY,
  SERVICE_FEE,
} from "../config/rate";
import { processOverdueManual } from "../services/overdue.manual";

const bill = Router();

/*
billStatus (Int)
0 = ยังไม่จ่าย
1 = จ่ายแล้ว
2 = รอตรวจสอบ
3 = ปฏิเสธ
*/

const BASE_URL = "https://smartdorm-detail.biwbong.shop";

// ---------------- Supabase ----------------
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// ---------------- Helpers ----------------
const getDueDateNextMonth5th = (month: string | Date) => {
  const d = new Date(month);
  return new Date(d.getFullYear(), d.getMonth() + 1, 5);
};

const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const formatThaiMonth = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      })
    : "-";

const deleteSlip = async (url?: string | null) => {
  try {
    if (!url) return;
    const bucket = process.env.SUPABASE_BUCKET!;
    const marker = `/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;

    const path = url.substring(idx + marker.length);
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    console.warn("⚠️ ลบสลิปไม่สำเร็จ");
  }
};

// ---------------- Status Helpers ----------------
const getBillStatusText = (status: number) => {
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

const getBillStatusColour = (status: number) => {
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

// 📋 ดึงบิลทั้งหมด (Admin)
bill.get("/getall", async (_req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: { room: true, booking: true, customer: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 ดึงบิลตาม ID
bill.get("/:billId", async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: { room: true, booking: true, customer: true, payment: true },
    });
    if (!bill) return res.status(404).json({ error: "ไม่พบบิลนี้" });
    res.json(bill);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ➕ สร้างบิลจากห้อง
bill.post(
  "/createFromRoom/:roomId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const { month, wAfter, eAfter } = req.body;
      if (!month) throw new Error("กรุณาระบุเดือน");

      const billMonth = new Date(month);

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

      const prevBill = await prisma.bill.findFirst({
        where: { roomId, month: { lt: billMonth } },
        orderBy: { month: "desc" },
      });

      const wBefore = prevBill ? prevBill.wAfter : 0;
      const eBefore = prevBill ? prevBill.eAfter : 0;

      if (wAfter < wBefore)
        throw new Error("ค่าน้ำปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");
      if (eAfter < eBefore)
        throw new Error("ค่าไฟปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");

      const rent = booking.room.rent;
      const service = SERVICE_FEE;

      const wUnits = wAfter - wBefore;
      const eUnits = eAfter - eBefore;

      const waterCost = wUnits * WATER_PRICE;
      const electricCost = eUnits * ELECTRIC_PRICE;

      const total = rent + service + waterCost + electricCost;

      const billCreated = await prisma.bill.create({
        data: {
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
          createdBy: req.admin!.adminId,
        },
      });

      const detailedBill = `${BASE_URL}/bill/${billCreated.billId}`;

      if (booking.customer.userId) {
        await sendFlexMessage(
          booking.customer.userId,
          `📄 แจ้งบิลค่าเช่าห้อง ประจำเดือน ${formatThaiMonth(
            billCreated.month
          )}`,
          [
            { label: "ห้อง", value: booking.room?.number },
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
    } catch (err: any) {
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
      if (billData.billStatus !== 2)
        throw new Error("บิลนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.bill.update({
          where: { billId },
          data: { billStatus: 1, billDate: new Date() },
        });

        if (billData.payment) {
          await tx.payment.update({
            where: { billId },
            data: { updatedAt: new Date() },
          });
        }

        return b;
      });

      const detailedBill = `${BASE_URL}/bill/${bill.billId}`;

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

      res.json({ message: "อนุมัติการชำระเงินสำเร็จ", bill: updated });
    } catch (err: any) {
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
        if (billData.payment) {
          await tx.payment.delete({ where: { billId } });
        }

        return tx.bill.update({
          where: { billId },
          data: { billStatus: 3, billDate: new Date() },
        });
      });

      const detailedBill = `${BASE_URL}/bill/${bill.billId}`;

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
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ⚠️ แจ้งเตือนค้างชำระ
bill.put(
  "/overdue/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const b = await processOverdueManual(req.params.billId);
      res.json({ message: "แจ้งเตือนบิลค้างชำระเรียบร้อย", bill: b });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✏️ แก้ไขบิล
bill.put(
  "/edit/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;
      const { wAfter, eAfter, month, dueDate, billStatus } = req.body;

      const billData = await prisma.bill.findUnique({
        where: { billId },
        include: { customer: true, room: true },
      });

      if (!billData) throw new Error("ไม่พบบิล");

      if (![0, 2, 3].includes(billData.billStatus)) {
        throw new Error("ไม่สามารถแก้ไขบิลนี้ได้");
      }

      const wBefore = billData.wBefore;
      const eBefore = billData.eBefore;

      const newWAfter = wAfter ?? billData.wAfter;
      const newEAfter = eAfter ?? billData.eAfter;

      if (newWAfter < wBefore)
        throw new Error("ค่าน้ำปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");
      if (newEAfter < eBefore)
        throw new Error("ค่าไฟปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");

      const wUnits = newWAfter - wBefore;
      const eUnits = newEAfter - eBefore;

      const waterCost = wUnits * WATER_PRICE;
      const electricCost = eUnits * ELECTRIC_PRICE;

      let newOverdueDays = billData.overdueDays ?? 0;
      let newFine = billData.fine ?? 0;

      if (dueDate) {
        const today = new Date();
        const newDue = new Date(dueDate);

        if (today > newDue) {
          const diffDays = Math.floor(
            (today.getTime() - newDue.getTime()) / (1000 * 60 * 60 * 24)
          );
          newOverdueDays = diffDays;
          newFine = diffDays * OVERDUE_FINE_PER_DAY;
        } else {
          newOverdueDays = 0;
          newFine = 0;
        }
      }

      const total =
        billData.rent +
        billData.service +
        waterCost +
        electricCost +
        newFine;

      const updated = await prisma.bill.update({
        where: { billId },
        data: {
          wAfter: newWAfter,
          wUnits,
          waterCost,
          eAfter: newEAfter,
          eUnits,
          electricCost,
          total,
          month: month ? new Date(month) : billData.month,
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

      const detailedBill = `${BASE_URL}/bill/${bill.billId}`;

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
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 🗑️ ลบบิล
bill.delete("/:billId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { billId } = req.params;

    const billData = await prisma.bill.findUnique({
      where: { billId },
      include: { payment: true },
    });

    if (!billData) throw new Error("ไม่พบบิล");

    await prisma.$transaction(async (tx) => {
      if (billData.slipUrl) await deleteSlip(billData.slipUrl);
      if (billData.payment) {
        await tx.payment.deleteMany({ where: { billId } });
      }
      await tx.bill.delete({ where: { billId } });
    });

    res.json({ message: "ลบบิลและ payment สำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bill;