import { Router } from "express";
import prisma from "../prisma.js";
import { verifyLineToken } from "../utils/verifyLineToken.js";
import { deleteSlip } from "./ManageRooms/booking.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { thailandTime } from "../utils/timezone.js";

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

/* ================= ADMIN ================= */

// 📋 ดึงลูกค้าทั้งหมด
user.get("/getall", authMiddleware, roleMiddleware(0), async (_req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 ค้นหาลูกค้า
user.get("/search", authMiddleware, roleMiddleware(0), async (req, res) => {
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
                  {
                    room: {
                      number: { contains: keyword, mode: "insensitive" },
                    },
                  },
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
      take: 20,
    });

    res.json({
      message: `ค้นหาสำเร็จ (${users.length})`,
      users,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= USER ================= */

// 🧍‍♂️ Register / Update (LINE)
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

// 👤 ตรวจ token
user.post("/me", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } = await verifyLineToken(accessToken);

    const customer = await getOrCreateCustomer(userId, displayName);

    res.json({
      success: true,
      profile: customer,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
});

// 💸 บิลที่ชำระแล้ว
user.post("/payments", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

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

// 💰 บิลที่ยังไม่ชำระ
user.post("/bills/unpaid", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

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

// 🚪 ห้องที่สามารถคืนได้
user.post("/bookings/returnable", async (req, res) => {
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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= DELETE ================= */

user.delete("/:customerId", authMiddleware, roleMiddleware(0), async (req, res) => {
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
});

export default user;