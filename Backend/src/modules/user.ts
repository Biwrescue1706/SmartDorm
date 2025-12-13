// src/modules/user.ts

import { Router } from "express";
import prisma from "../prisma";
import { verifyLineToken } from "../utils/verifyLineToken";
import { deleteSlip } from "./booking";

const userRouter = Router();

/* =====================================================
   📋 ดึงลูกค้าทั้งหมด (Admin)
===================================================== */
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

/* =====================================================
   🧍‍♂️ Register / Update (LINE Login)
===================================================== */
userRouter.post("/register", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } = await verifyLineToken(accessToken);

    let customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (customer) {
      customer = await prisma.customer.update({
        where: { customerId: customer.customerId },
        data: { userName: displayName },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          userId,
          userName: displayName,
        },
      });
    }

    res.json({
      message: "สมัครหรืออัปเดตข้อมูลสำเร็จ",
      customer,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   👤 /user/me (ตรวจ token)
===================================================== */
userRouter.post("/me", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } = await verifyLineToken(accessToken);

    let customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          userName: displayName,
        },
      });
    }

    res.json({
      success: true,
      profile: customer,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
});

/* =====================================================
   💸 บิลที่ชำระแล้ว
===================================================== */
userRouter.post("/payments", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const bills = await prisma.bill.findMany({
      where: {
        status: 1,
        customer: {
          userId,
        },
      },
      include: {
        room: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "ดึงรายการบิลที่ชำระแล้วสำเร็จ",
      count: bills.length,
      bills,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   💰 บิลที่ยังไม่ชำระ
===================================================== */
userRouter.post("/bills/unpaid", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const bills = await prisma.bill.findMany({
      where: {
        status: 0,
        customer: {
          userId,
        },
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
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

/* =====================================================
   🚪 ห้องที่สามารถคืนได้
   ✔ ใช้ customerId เป็นหลัก
===================================================== */
userRouter.post("/bookings/returnable", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (!customer) {
      return res.json({
        message: "ไม่พบข้อมูลลูกค้า",
        count: 0,
        bookings: [],
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: 1,
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

/* =====================================================
   🔍 ค้นหาลูกค้า (Admin)
===================================================== */
userRouter.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword?.toString().trim();
    if (!keyword) return res.json({ users: [] });

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
      include: {
        bookings: { include: { room: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: `ค้นหาสำเร็จ (${users.length})`,
      users,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   ❌ ลบลูกค้า (Admin)
===================================================== */
userRouter.delete("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    await prisma.$transaction(async (tx) => {
      const bookings = await tx.booking.findMany({
        where: { customerId },
        select: { slipUrl: true, roomId: true },
      });

      const roomIds = bookings.map((b) => b.roomId);
      if (roomIds.length) {
        await tx.room.updateMany({
          where: { roomId: { in: roomIds } },
          data: { status: 0 },
        });
      }

      for (const b of bookings) {
        if (b.slipUrl) await deleteSlip(b.slipUrl);
      }

      await tx.booking.deleteMany({ where: { customerId } });
      await tx.customer.delete({ where: { customerId } });
    });

    res.json({ message: "ลบลูกค้าสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default userRouter;