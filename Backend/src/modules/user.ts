// src/modules/user.ts

// 🚚 Imports
import { Router } from "express";
import prisma from "../prisma";
import { verifyLineToken } from "../utils/verifyLineToken";
import { deleteSlip } from "../modules/booking"; // ⭐ ใช้งานได้แล้ว

// 🌐 Router
const userRouter = Router();

/* ===========================================================
   📋 ดึงลูกค้าทั้งหมด
=========================================================== */
userRouter.get("/getall", async (_req, res) => {
  try {
    const users = await prisma.customer.findMany({
      include: {
        bookings: { include: { room: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "ดึงข้อมูลลูกค้าทั้งหมดสำเร็จ",
      count: users.length,
      users,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   🧍‍♂️ สมัครหรือลงทะเบียน (จาก LINE Login)
=========================================================== */
userRouter.post("/register", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } = await verifyLineToken(accessToken);

    let customer = await prisma.customer.findFirst({ where: { userId } });

    if (customer) {
      customer = await prisma.customer.update({
        where: { customerId: customer.customerId },
        data: { userName: displayName },
      });
    } else {
      customer = await prisma.customer.create({
        data: { userId, userName: displayName },
      });
    }

    res.json({ message: "สมัครหรืออัปเดตข้อมูลสำเร็จ", customer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   👤 ดึงข้อมูลโปรไฟล์
=========================================================== */
userRouter.post("/me", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } = await verifyLineToken(accessToken);

    let customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { userId, userName: displayName },
      });
    }

    res.json({ success: true, profile: customer });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

/* ===========================================================
   💸 ดึงบิลที่ชำระแล้ว
=========================================================== */
userRouter.post("/payments", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบลูกค้า");

    const bills = await prisma.bill.findMany({
      where: { customerId: customer.customerId, status: 1 },
      orderBy: { createdAt: "desc" },
      include: { room: true, payment: true },
    });

    const formatted = bills.map((b) => ({
      billCode: b.billId.slice(-6).toUpperCase(),
      roomNumber: b.room.number,
      total: b.total,
      slipUrl: b.payment?.slipUrl,
      paidAt: b.payment?.createdAt,
    }));

    res.json({
      message: "ดึงรายการบิลที่ชำระแล้วสำเร็จ",
      count: formatted.length,
      bills: formatted,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   💰 ดึงบิลที่ยังไม่ชำระ
=========================================================== */
userRouter.post("/bills/unpaid", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบลูกค้า");

    const bills = await prisma.bill.findMany({
      where: { customerId: customer.customerId, status: 0 },
      orderBy: { createdAt: "desc" },
      include: { room: true },
    });

    res.json({
      message: "ดึงรายการบิลที่ยังไม่ชำระสำเร็จ",
      count: bills.length,
      bills,
    });
  } catch {
    res.status(400).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
});

/* ===========================================================
   🚪 ดึงรายการที่สามารถคืนห้องได้
=========================================================== */
userRouter.post("/bookings/returnable", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบลูกค้า");

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: 1,
        checkinStatus: 1,
        checkoutStatus: 0,
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "ดึงรายการที่สามารถคืนห้องได้สำเร็จ",
      count: bookings.length,
      bookings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   🔍 ค้นหาลูกค้า
=========================================================== */
userRouter.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword?.toString().trim() || "";
    if (!keyword) {
      return res.json({ message: "ไม่พบคำค้นหา", users: [] });
    }

    const users = await prisma.customer.findMany({
      where: {
        OR: [
          { userName: { contains: keyword, mode: "insensitive" } },
          { userId: { contains: keyword, mode: "insensitive" } },
          {
            bookings: {
              some: {
                OR: [
                  { fullName: { contains: keyword, mode: "insensitive" } },
                  { cphone: { contains: keyword, mode: "insensitive" } },
                  { room: { number: { contains: keyword, mode: "insensitive" } } },
                ],
              },
            },
          },
        ],
      },
      include: { bookings: { include: { room: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: `ค้นหาสำเร็จ (${users.length} รายการ)`,
      keyword,
      users,
    });
  } catch (err: any) {
    console.error("❌ Search error:", err);
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   ❌ ลบลูกค้า (ลบ booking + ห้องว่าง + ลบ slip)
=========================================================== */
userRouter.delete("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) throw new Error("customerId is required");

    await prisma.$transaction(async (tx) => {
      // 1) ดึง booking ทั้งหมดของลูกค้า
      const bookings = await tx.booking.findMany({
        where: { customerId },
        select: { slipUrl: true, roomId: true },
      });

      // 2) ปลดห้องเป็นว่าง
      const roomIds = bookings.map((b) => b.roomId).filter(Boolean);
      if (roomIds.length > 0) {
        await tx.room.updateMany({
          where: { roomId: { in: roomIds } },
          data: { status: 0 },
        });
      }

      // 3) ลบสลิปจาก Supabase
      for (const booking of bookings) {
        if (booking.slipUrl) await deleteSlip(booking.slipUrl);
      }

      // 4) ลบ booking และ customer
      await tx.booking.deleteMany({ where: { customerId } });
      await tx.customer.delete({ where: { customerId } });
    });

    res.json({ message: "ลบลูกค้าสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default userRouter;