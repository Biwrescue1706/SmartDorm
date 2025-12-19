// src/modules/bill.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import { sendFlexMessage } from "../utils/lineFlex";
import { createClient } from "@supabase/supabase-js";

const billRouter = Router();

/*
status (Int)
0 = UNPAID
1 = PAID
2 = VERIFYING
*/

// ---------------- Supabase ----------------
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// ---------------- Helpers ----------------
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
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

// =================================================
// 📋 ดึงบิลทั้งหมด (Admin)
// =================================================
billRouter.get(
  "/getall",
  authMiddleware,
  roleMiddleware(0),
  async (_req, res) => {
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
  }
);

// =================================================
// ➕ สร้างบิลใหม่ (Admin)
// =================================================
billRouter.post(
  "/create",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const {
        roomId,
        bookingId,
        customerId,
        month,
        dueDate,
        rent,
        wBefore,
        wAfter,
        eBefore,
        eAfter,
        total,
      } = req.body;

      if (!roomId || !bookingId || !month || total == null)
        throw new Error("ข้อมูลไม่ครบ");

      const bill = await prisma.bill.create({
        data: {
          roomId,
          bookingId,
          customerId,

          month: new Date(month),
          dueDate: dueDate ? new Date(dueDate) : new Date(),

          rent: Number(rent ?? 0),
          service: 50,

          wBefore: Number(wBefore ?? 0),
          wAfter: Number(wAfter ?? 0),
          wUnits: Number(wAfter ?? 0) - Number(wBefore ?? 0),
          wPrice: 19,
          waterCost:
            (Number(wAfter ?? 0) - Number(wBefore ?? 0)) * 19,

          eBefore: Number(eBefore ?? 0),
          eAfter: Number(eAfter ?? 0),
          eUnits: Number(eAfter ?? 0) - Number(eBefore ?? 0),
          ePrice: 7,
          electricCost:
            (Number(eAfter ?? 0) - Number(eBefore ?? 0)) * 7,

          fine: 0,
          overdueDays: 0,
          total: Number(total),

          status: 0,
          createdBy: req.admin!.adminId,
        },
      });

      res.json({ message: "สร้างบิลสำเร็จ", bill });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// =================================================
// ➕ สร้างบิลจากห้อง (Admin)
// =================================================
billRouter.post(
  "/createFromRoom/:roomId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const { month, wBefore, wAfter, eBefore, eAfter } = req.body;

      if (!roomId || !month)
        throw new Error("ข้อมูลไม่ครบ");

      // 1. หา booking ล่าสุดที่อนุมัติแล้ว + เข้าพักจริง
      const booking = await prisma.booking.findFirst({
        where: {
          roomId,
          approveStatus: 1,
          actualCheckin: { not: 0 },
        },
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          room: true,
        },
      });

      if (!booking) throw new Error("ไม่พบการจองที่สามารถออกบิลได้");

      // 2. คำนวณหน่วย
      const wUnits = Number(wAfter ?? 0) - Number(wBefore ?? 0);
      const eUnits = Number(eAfter ?? 0) - Number(eBefore ?? 0);

      if (wUnits < 0 || eUnits < 0)
        throw new Error("เลขมิเตอร์ไม่ถูกต้อง");

      const waterCost = wUnits * 19;
      const electricCost = eUnits * 7;
      const service = 50;
      const rent = booking.room.rent;

      const total =
        rent + service + waterCost + electricCost;

      // 3. สร้างบิล
      const bill = await prisma.bill.create({
        data: {
          roomId,
          bookingId: booking.bookingId,
          customerId: booking.customerId,

          month: new Date(month),
          dueDate: new Date(),

          rent,
          service,

          wBefore: Number(wBefore ?? 0),
          wAfter: Number(wAfter ?? 0),
          wUnits,
          wPrice: 19,
          waterCost,

          eBefore: Number(eBefore ?? 0),
          eAfter: Number(eAfter ?? 0),
          eUnits,
          ePrice: 7,
          electricCost,

          fine: 0,
          overdueDays: 0,
          total,

          status: 0,
          createdBy: req.admin!.adminId,
        },
      });

      res.json({ message: "สร้างบิลสำเร็จ", bill });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// =================================================
// ✅ อนุมัติการชำระเงิน (Admin)
// =================================================
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
          payment: true, // ✅ สำคัญ
        },
      });

      if (!bill) throw new Error("ไม่พบบิล");
      if (bill.status !== 2)
        throw new Error("บิลนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.bill.update({
          where: { billId },
          data: { status: 1 },
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
            {
              label: "ยอดชำระ",
              value: `${bill.total.toLocaleString()} บาท`,
            },
            { label: "วันที่ยืนยัน", value: formatThaiDate(new Date()) },
          ],
          [] // ✅ ต้องมี
        );
      }

      res.json({ message: "อนุมัติการชำระเงินสำเร็จ", bill: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// =================================================
// ❌ ปฏิเสธสลิป (Admin)
// =================================================
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
            status: 0,
            slipUrl: null,
          },
        });
      });

      res.json({ message: "ปฏิเสธการชำระเงินแล้ว" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// =================================================
// 🗑️ ลบบิล (Admin)
// =================================================
billRouter.delete(
  "/:billId",
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
        await tx.bill.delete({ where: { billId } });
      });

      res.json({ message: "ลบบิลสำเร็จ" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default billRouter;
