// src/modules/checkout.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const checkoutRouter = Router();

/* =========================
   Helpers
========================= */
const logTime = () =>
  new Date().toISOString().replace("T", " ").split(".")[0];

const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* =================================================
   📦 ดึงข้อมูลการคืนทั้งหมด (Admin)
================================================= */
checkoutRouter.get("/getall", authMiddleware, async (_req, res) => {
  try {
    const checkouts = await prisma.checkout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: true,
        room: true,
        customer: true,
      },
    });

    res.json(checkouts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =================================================
   🔍 ค้นหาข้อมูลการคืน (Admin)
================================================= */
checkoutRouter.get("/search", authMiddleware, async (req, res) => {
  try {
    const keyword = (req.query.keyword as string)?.trim() || "";

    const results = await prisma.checkout.findMany({
      where: keyword
        ? {
            OR: [
              { bookingId: { contains: keyword, mode: "insensitive" } },
              { customer: { userName: { contains: keyword, mode: "insensitive" } } },
              { room: { number: { contains: keyword, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: { booking: true, room: true, customer: true },
    });

    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =================================================
   🧾 Booking ของลูกค้าที่สามารถคืนได้ (LIFF)
================================================= */
checkoutRouter.post("/myBookings", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: "APPROVED",
        checkout: null, // ยังไม่เคยขอคืน
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =================================================
   📤 ลูกค้าส่งคำขอคืนห้อง
================================================= */
checkoutRouter.post("/request/:bookingId", async (req, res) => {
  try {
    const { accessToken, requestedCheckout } = req.body;
    const { bookingId } = req.params;

    if (!requestedCheckout) throw new Error("ต้องระบุวันที่ขอคืน");

    const { userId } = await verifyLineToken(accessToken);
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true },
    });
    if (!booking) throw new Error("ไม่พบ Booking");

    if (booking.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์คืนห้องนี้");

    const checkout = await prisma.checkout.create({
      data: {
        bookingId: booking.bookingId,
        roomId: booking.roomId,
        customerId: booking.customerId,
        requestedCheckout: new Date(requestedCheckout),
        status: "PENDING",
      },
      include: { room: true, customer: true },
    });

    // แจ้งลูกค้า
    await sendFlexMessage(
      customer.userId,
      "📤 SmartDorm ส่งคำขอคืนห้องแล้ว",
      [
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "📅 วันที่ขอคืน", value: formatThaiDate(checkout.requestedCheckout) },
        { label: "สถานะ", value: "⏳ รออนุมัติ", color: "#f39c12" },
      ],
      []
    );

    console.log(`[${logTime()}] ส่งคำขอคืนห้อง ${booking.bookingId}`);
    res.json({ message: "ส่งคำขอคืนห้องสำเร็จ", checkout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =================================================
   ✅ อนุมัติการคืนห้อง (Admin)
================================================= */
checkoutRouter.put(
  "/:checkoutId/approve",
  authMiddleware,
  async (req, res) => {
    try {
      const checkout = await prisma.checkout.update({
        where: { checkoutId: req.params.checkoutId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
        include: { room: true, customer: true },
      });

      res.json({ message: "อนุมัติการคืนห้องสำเร็จ", checkout });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =================================================
   🚪 CHECKOUT (เช็คเอาท์จริง)
================================================= */
checkoutRouter.put(
  "/:checkoutId/complete",
  authMiddleware,
  async (req, res) => {
    try {
      const checkout = await prisma.checkout.update({
        where: { checkoutId: req.params.checkoutId },
        data: {
          status: "COMPLETED",
          actualCheckout: new Date(),
        },
        include: { room: true },
      });

      await prisma.room.update({
        where: { roomId: checkout.roomId },
        data: { status: "AVAILABLE" },
      });

      res.json({ message: "เช็คเอาท์สำเร็จ", checkout });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =================================================
   ❌ ปฏิเสธการคืนห้อง (Admin)
================================================= */
checkoutRouter.put(
  "/:checkoutId/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const checkout = await prisma.checkout.update({
        where: { checkoutId: req.params.checkoutId },
        data: { status: "REJECTED" },
      });

      res.json({ message: "ปฏิเสธคำขอคืนห้องแล้ว", checkout });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =================================================
   ✏️ แก้ไขข้อมูลการคืน (Admin)
================================================= */
checkoutRouter.put(
  "/:checkoutId",
  authMiddleware,
  async (req, res) => {
    try {
      const { requestedCheckout, status } = req.body;

      const checkout = await prisma.checkout.update({
        where: { checkoutId: req.params.checkoutId },
        data: {
          ...(requestedCheckout && {
            requestedCheckout: new Date(requestedCheckout),
          }),
          ...(status && { status }),
        },
      });

      res.json({ message: "แก้ไขข้อมูลการคืนสำเร็จ", checkout });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =================================================
   🗑️ ลบข้อมูลการคืน (Admin)
================================================= */
checkoutRouter.delete(
  "/:checkoutId",
  authMiddleware,
  async (req, res) => {
    try {
      await prisma.checkout.delete({
        where: { checkoutId: req.params.checkoutId },
      });

      res.json({ message: "ลบข้อมูลการคืนสำเร็จ" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default checkoutRouter;
