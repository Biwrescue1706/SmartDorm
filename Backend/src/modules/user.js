import { Router } from "express";
import prisma from "../prisma.js";
import { verifyLineToken } from "../utils/verifyLineToken.js";
import {
  authMiddleware,
  roleMiddleware,
  userAuthMiddleware,
} from "../middleware/authMiddleware.js";
import { thailandTime } from "../utils/timezone.js";
import { deleteSlip } from "../utils/deleteSlip.js";

const user = Router();

/* ---------- helpers ---------- */

async function getOrCreateCustomer(userId, displayName) {
  let customer = await prisma.customer.findFirst({
    where: { userId },
  });

  if (customer) {
    customer = await prisma.customer.update({
      where: { customerId: customer.customerId },
      data: {
        userName: displayName,
        updatedAt: thailandTime(),
      },
    });
  } else {
    customer = await prisma.customer.create({
      data: {
        userId,
        userName: displayName,
        createdAt: thailandTime(),
      },
    });
  }

  return customer;
}

/* ================= USER ================= */

// ✅ LOGIN / REGISTER (ใช้ LINE แค่ตรงนี้)
user.post("/register", async (req, res) => {
  try {
    const { accessToken } = req.body;

    const { userId, displayName } = await verifyLineToken(accessToken);

    const customer = await getOrCreateCustomer(userId, displayName);

    res.json({
      message: "สมัครหรืออัปเดตข้อมูลสำเร็จ",
      customer,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👤 profile
user.post("/me", userAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    res.json({
      success: true,
      profile: customer,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// 💸 บิลที่ชำระแล้ว
user.post("/payments", userAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (!customer) return res.json({ bills: [] });

    const bills = await prisma.bill.findMany({
      where: {
        billStatus: 1,
        customerId: customer.customerId,
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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 💰 บิลยังไม่ชำระ
user.post("/bills/unpaid", userAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (!customer) return res.json({ bills: [] });

    const bills = await prisma.bill.findMany({
      where: {
        billStatus: 0,
        customerId: customer.customerId,
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

// 🚪 คืนห้อง
user.post("/bookings/returnable", userAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

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
    });

    res.json({
      message: "ดึงรายการคืนห้องสำเร็จ",
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= ADMIN DELETE ================= */

user.delete(
  "/:customerId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
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

        await tx.payment.deleteMany({ where: { customerId } });
        await tx.bill.deleteMany({ where: { customerId } });
        await tx.checkout.deleteMany({ where: { customerId } });
        await tx.booking.deleteMany({ where: { customerId } });

        await tx.customer.delete({ where: { customerId } });
      });

      res.json({ message: "ลบลูกค้าสำเร็จ" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default user;
