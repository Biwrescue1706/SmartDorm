// src/modules/bill.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import { sendFlexMessage } from "../utils/lineFlex";
import { createClient } from "@supabase/supabase-js";

const billRouter = Router();

/*
billStatus (Int)
0 = ยังไม่จ่าย
1 = จ่ายแล้ว
2 = รอตรวจสอบ
*/

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

// 📋 ดึงบิลทั้งหมด (Admin)
billRouter.get("/getall", async (_req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 ดึงบิลตาม ID (Customer / Admin)
billRouter.get("/:billId", async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
      },
    });

    if (!bill) {
      return res.status(404).json({ error: "ไม่พบบิลนี้" });
    }

    res.json(bill);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ➕ สร้างบิลจากห้อง (Admin)
billRouter.post(
  "/createFromRoom/:roomId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
try {
      const { roomId } = req.params;
      const { month, wAfter, eAfter } = req.body;

      if (!month) throw new Error("กรุณาระบุเดือน");

      const billMonth = new Date(month);

      // ❌ ห้ามสร้างซ้ำเดือนเดียวกัน
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

      // 🔍 ดึงบิลก่อนหน้า
      const prevBill = await prisma.bill.findFirst({
        where: { roomId, month: { lt: billMonth } },
        orderBy: { month: "desc" },
      });

      const wBefore = prevBill ? prevBill.wAfter : 0;
      const eBefore = prevBill ? prevBill.eAfter : 0;

      // 🔒 validation มิเตอร์
      if (wAfter < wBefore)
        throw new Error("ค่าน้ำปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");
      if (eAfter < eBefore)
        throw new Error("ค่าไฟปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");

      const rent = booking.room.rent;
      const service = 50;
      const wPrice = 19;
      const ePrice = 7;

      const wUnits = wAfter - wBefore;
      const eUnits = eAfter - eBefore;

      const waterCost = wUnits * wPrice;
      const electricCost = eUnits * ePrice;

      const total = rent + service + waterCost + electricCost;

      const bill = await prisma.bill.create({
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

      // 📲 แจ้งเตือน LINE
      if (booking.customer.userId) {
        await sendFlexMessage(
          booking.customer.userId,
          `📄 แจ้งบิลค่าเช่าห้อง ประจำเดือน ${formatThaiMonth(bill.month)}`,
          [
            { label: "ห้อง", value: booking.room?.number },
            { label: "ค่าเช่าห้อง", value: `${rent} บาท` },
            {
              label: "ค่าน้ำ",
              value: `${bill.wUnits} หน่วย (${bill.waterCost} บาท)`,
            },
            {
              label: "ค่าไฟ",
              value: `${bill.eUnits} หน่วย (${bill.electricCost} บาท)`,
            },
            { label: "ค่าส่วนกลาง", value: `${service} บาท` },
            {
              label: "ยอดรวมทั้งหมด",
              value: `${bill.total.toLocaleString()} บาท`,
            },
            {
              label: "ครบกำหนดชำระ",
              value: formatThaiDate(bill.dueDate),
            },
          ],
          [
            {
              label: "ดูรายละเอียดและชำระเงิน",
              url: `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`,
            },
          ]
        );
      }

      res.json({ message: "สร้างบิลจากห้องสำเร็จ", bill });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✅ อนุมัติการชำระเงิน (Admin)
billRouter.put(
  "/approve/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const bill = await prisma.bill.findUnique({
        where: { billId },
        include: {
          customer: true,
          room: true,
          payment: true,
        },
      });

      if (!bill) throw new Error("ไม่พบบิล");
      if (bill.billStatus !== 2)
        throw new Error("บิลนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.bill.update({
          where: { billId },
          data: { billStatus: 1, billDate: new Date() },
        });

        if (bill.payment) {
          await tx.payment.update({
            where: { billId },
            data: { updatedAt: new Date() },
          });
        }

        return b;
      });

      if (bill.customer?.userId) {
        await sendFlexMessage(
          bill.customer.userId,
          "✅ การชำระเงินของคุณได้รับการยืนยันแล้ว",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "ห้อง", value: bill.room?.number ?? "-" },
            { label: "เดือนที่ชำระ", value: formatThaiMonth(bill.month) },
            {
              label: "ยอดชำระ",
              value: `${bill.total.toLocaleString()} บาท`,
            },
            { label: "วันที่ยืนยัน", value: formatThaiDate(new Date()) },
          ],
          []
        );
      }

      res.json({ message: "อนุมัติการชำระเงินสำเร็จ", bill: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ❌ ปฏิเสธสลิป (Admin)
billRouter.put(
  "/reject/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const bill = await prisma.bill.findUnique({
        where: { billId },
        include: { payment: true },
      });

      if (!bill) throw new Error("ไม่พบบิล");

      await prisma.$transaction(async (tx) => {
        if (bill.slipUrl) await deleteSlip(bill.slipUrl);
        if (bill.payment) {
          await tx.payment.delete({ where: { billId } });
        }
        await tx.bill.update({
          where: { billId },
          data: {
            billStatus: 0,
            billDate: new Date()
          },
        });
      });

      res.json({ message: "ปฏิเสธการชำระเงินแล้ว" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ⚠️ แจ้งเตือนค้างชำระ (Admin)
billRouter.put(
  "/overdue/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const bill = await prisma.bill.findUnique({
        where: { billId },
        include: { customer: true, room: true },
      });

      if (!bill) throw new Error("ไม่พบบิล");
      if (bill.billStatus === 1) throw new Error("บิลนี้ชำระแล้ว");

      const today = new Date();
      const due = new Date(bill.dueDate);

      let diffTime = today.getTime() - due.getTime();
      let overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (overdueDays < 0) overdueDays = 0;

      const fine = overdueDays * 50;

      // อัปเดตบิล
      const updated = await prisma.bill.update({
        where: { billId },
        data: {
          overdueDays,
          fine,
          billStatus: 0, // ยังไม่ชำระ
        },
      });

      // แจ้งเตือนลูกค้า
      if (bill.customer?.userId) {
        await sendFlexMessage(
          bill.customer.userId,
          "⚠️ แจ้งเตือนบิลค้างชำระ",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "ห้อง", value: bill.room?.number ?? "-" },
            { label: "ยอดรวม", value: `${bill.total.toLocaleString()} บาท` },
            { label: "ค้างชำระ", value: `${overdueDays} วัน` },
            { label: "ค่าปรับ", value: `${fine} บาท` },
            { label: "ครบกำหนดชำระ", value: formatThaiDate(bill.dueDate) },
          ],
          [
            {
              label: "ดูบิลและชำระเงิน",
              url: `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`,
            },
          ]
        );
      }

      res.json({
        message: `อัปเดตบิลค้างชำระเรียบร้อย (${overdueDays} วัน, ค่าปรับ ${fine} บาท)`,
        bill: updated,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✏️ แก้ไขบิล (ห้ามแก้ถ้า billStatus = 1,2)
billRouter.put(
  "/edit/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;
      const { wBefore, wAfter, eBefore, eAfter, month, dueDate } = req.body;

      const bill = await prisma.bill.findUnique({ where: { billId } });
      if (!bill) throw new Error("ไม่พบบิล");

      // ❌ lock สถานะ
      if (bill.billStatus !== 0)
        throw new Error("ไม่สามารถแก้ไขบิลนี้ได้");

      if (wAfter < wBefore)
        throw new Error("ค่าน้ำปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");
      if (eAfter < eBefore)
        throw new Error("ค่าไฟปัจจุบันต้องมากกว่าหรือเท่าก่อนหน้า");

      const wUnits = wAfter - wBefore;
      const eUnits = eAfter - eBefore;

      const waterCost = wUnits * bill.wPrice;
      const electricCost = eUnits * bill.ePrice;

      const total =
        bill.rent + bill.service + waterCost + electricCost;

      const updated = await prisma.bill.update({
        where: { billId },
        data: {
          wBefore,
          wAfter,
          wUnits,
          waterCost,
          eBefore,
          eAfter,
          eUnits,
          electricCost,
          total,
          month: month ? new Date(month) : bill.month,
          dueDate: dueDate ? new Date(dueDate) : bill.dueDate,
          billDate: new Date(),
        },
      });

      res.json({ message: "แก้ไขบิลสำเร็จ", bill: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 🗑️ ลบบิลและ payment (Admin)
billRouter.delete(
  "/:billId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const bill = await prisma.bill.findUnique({
        where: { billId },
        include: { payment: true }, // ตรวจสอบว่ามี payment หรือไม่
      });

      if (!bill) throw new Error("ไม่พบบิล");

      await prisma.$transaction(async (tx) => {
        // ลบสลิปจาก Supabase ถ้ามี
        if (bill.slipUrl) await deleteSlip(bill.slipUrl);

        // ลบ payment ทั้งหมดของบิลนี้
        if (bill.payment) {
          await tx.payment.deleteMany({ where: { billId } });
        }

        // ลบบิล
        await tx.bill.delete({ where: { billId } });
      });

      res.json({ message: "ลบบิลและ payment สำเร็จ" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default billRouter;
