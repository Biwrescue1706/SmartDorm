// src/modules/checkout.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const checkoutRouter = Router();

/* =======================
   Helpers
======================= */
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const logTime = () =>
  new Date().toISOString().replace("T", " ").split(".")[0];

/* =====================================================
   📦 ดึงข้อมูลการคืนทั้งหมด (Admin)
===================================================== */
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

    res.json({
      message: "ดึงข้อมูลการคืนทั้งหมดสำเร็จ",
      count: checkouts.length,
      checkouts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🔍 ค้นหาข้อมูลการคืน (Admin)
===================================================== */
checkoutRouter.get("/search", authMiddleware, async (req, res) => {
  try {
    const keyword = req.query.keyword?.toString().trim() || "";

    const checkouts = await prisma.checkout.findMany({
      where: keyword
        ? {
            OR: [
              { checkoutId: { contains: keyword, mode: "insensitive" } },
              {
                booking: {
                  OR: [
                    {
                      fullName: {
                        contains: keyword,
                        mode: "insensitive",
                      },
                    },
                    {
                      cphone: {
                        contains: keyword,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
              { room: { number: { contains: keyword } } },
            ],
          }
        : undefined,
      include: {
        booking: true,
        room: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "ค้นหาข้อมูลการคืนสำเร็จ",
      count: checkouts.length,
      checkouts,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   🧾 Booking ที่ลูกค้าสามารถขอคืนได้
===================================================== */
checkoutRouter.post("/myBookings", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: 1, // APPROVED
        checkout: null, // ยังไม่เคยสร้าง Checkout
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "ดึง Booking ที่สามารถคืนได้สำเร็จ",
      bookings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   📤 ลูกค้าส่งคำขอคืนห้อง
===================================================== */
checkoutRouter.put("/:bookingId/request", async (req, res) => {
  try {
    const { accessToken, requestedCheckout } = req.body;
    const { bookingId } = req.params;

    if (!requestedCheckout)
      throw new Error("ต้องระบุวันที่ขอคืนห้อง");

    const { userId } = await verifyLineToken(accessToken);
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true, customer: true },
    });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    if (booking.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์คืนห้องนี้");

    const checkout = await prisma.checkout.create({
      data: {
        bookingId,
        roomId: booking.roomId,
        customerId: customer.customerId,
        requestedCheckout: new Date(requestedCheckout),
        status: 0, // PENDING
      },
      include: { room: true, customer: true },
    });

    // 🔔 แจ้งลูกค้า
    await sendFlexMessage(
      booking.customer.userId,
      "📤 ส่งคำขอคืนห้องสำเร็จ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "ห้อง", value: booking.room.number },
        {
          label: "วันที่ขอคืน",
          value: formatThaiDate(checkout.requestedCheckout),
        },
        { label: "สถานะ", value: "⏳ รออนุมัติ", color: "#f39c12" },
      ],
      []
    );

    // 🔔 แจ้งแอดมิน
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอคืนห้องใหม่",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "ห้อง", value: booking.room.number },
          { label: "ผู้เช่า", value: booking.fullName ?? "-" },
          {
            label: "วันที่ขอคืน",
            value: formatThaiDate(checkout.requestedCheckout),
          },
        ],
        [
          {
            label: "เปิดระบบ Admin",
            url: "https://smartdorm-admin.biwbong.shop",
            style: "primary",
          },
        ]
      );
    }

    console.log(
      `[${logTime()}] ส่งคำขอคืนห้องของ ${booking.fullName} สำเร็จ`
    );

    res.json({ message: "ส่งคำขอคืนห้องสำเร็จ", checkout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   ✅ อนุมัติการคืนห้อง (Admin)
===================================================== */
checkoutRouter.put(
  "/:checkoutId/approve",
  authMiddleware,
  async (req, res) => {
    try {
      const { checkoutId } = req.params;

      const checkout = await prisma.checkout.findUnique({
        where: { checkoutId },
        include: { room: true, customer: true, booking: true },
      });
      if (!checkout) throw new Error("ไม่พบข้อมูลการคืน");

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.checkout.update({
          where: { checkoutId },
          data: {
            approvedAt: new Date(),
            actualCheckout: new Date(),
            status: 2, // COMPLETED
          },
        });

        await tx.room.update({
          where: { roomId: checkout.roomId },
          data: { status: 0 },
        });

        return result;
      });

      await sendFlexMessage(
        checkout.customer.userId,
        "✅ อนุมัติการคืนห้องสำเร็จ",
        [
          { label: "รหัสการจอง", value: checkout.booking.bookingId },
          { label: "ห้อง", value: checkout.room.number },
          {
            label: "วันที่คืน",
            value: formatThaiDate(updated.actualCheckout),
          },
          { label: "สถานะ", value: "คืนห้องสำเร็จ", color: "#27ae60" },
        ],
        []
      );

      res.json({ message: "อนุมัติการคืนสำเร็จ", checkout: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =====================================================
   ❌ ปฏิเสธการคืนห้อง (Admin)
===================================================== */
checkoutRouter.put(
  "/:checkoutId/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const { checkoutId } = req.params;

      const checkout = await prisma.checkout.findUnique({
        where: { checkoutId },
        include: { room: true, customer: true, booking: true },
      });
      if (!checkout) throw new Error("ไม่พบข้อมูลการคืน");

      const updated = await prisma.checkout.update({
        where: { checkoutId },
        data: { status: 3 }, // REJECTED
      });

      await sendFlexMessage(
        checkout.customer.userId,
        "❌ คำขอคืนห้องถูกปฏิเสธ",
        [
          { label: "รหัสการจอง", value: checkout.booking.bookingId },
          { label: "ห้อง", value: checkout.room.number },
          {
            label: "วันที่ขอคืน",
            value: formatThaiDate(checkout.requestedCheckout),
          },
          {
            label: "สถานะ",
            value: "ปฏิเสธการคืน",
            color: "#e74c3c",
          },
        ],
        [
          {
            label: "ติดต่อแอดมิน",
            url: "https://smartdorm-detail.biwbong.shop",
            style: "secondary",
          },
        ]
      );

      res.json({ message: "ปฏิเสธการคืนสำเร็จ", checkout: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =====================================================
   🗑️ ลบข้อมูลการคืน (Admin)
===================================================== */
checkoutRouter.delete(
  "/:checkoutId",
  authMiddleware,
  async (req, res) => {
    try {
      const { checkoutId } = req.params;

      await prisma.checkout.delete({ where: { checkoutId } });

      res.json({ message: "ลบข้อมูลการคืนสำเร็จ" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default checkoutRouter;
