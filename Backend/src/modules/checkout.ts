import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const checkoutRouter = Router();
const adminId = process.env.ADMIN_LINE_ID;

/* =======================
   Utils
======================= */
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* =====================================================
   Admin: ดู checkout ทั้งหมด
===================================================== */
checkoutRouter.get("/getall", async (_req, res) => {
  try {
    const checkouts = await prisma.checkout.findMany({
      orderBy: { createdAt: "desc" },
      include: { booking: true, room: true, customer: true },
    });
    res.json({ checkouts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   Admin: ดู checkout รายตัว
===================================================== */
checkoutRouter.get("/:checkoutId", async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { booking: true, room: true, customer: true },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล checkout");
    res.json({ checkout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   ลูกค้า: booking ที่ยังขอคืนได้
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
        approveStatus: 1,
        checkout: {
          none: {
            status: { in: [0, 1] },
            checkoutStatus: 0,
          },
        },
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookings });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   ลูกค้า: ส่งคำขอคืนห้อง (แจ้ง Admin + ลูกค้า)
===================================================== */
checkoutRouter.put("/:bookingId/request", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { accessToken, requestedCheckout } = req.body;
    if (!requestedCheckout) throw new Error("ต้องระบุวันที่ขอคืน");

    const { userId } = await verifyLineToken(accessToken);
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true },
    });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    if (booking.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์");

    const active = await prisma.checkout.findFirst({
      where: {
        bookingId,
        status: { in: [0, 1] },
        checkoutStatus: 0,
      },
    });
    if (active) throw new Error("มีคำขอที่ยังดำเนินการอยู่");

    const checkout = await prisma.checkout.create({
      data: {
        bookingId,
        roomId: booking.roomId,
        customerId: customer.customerId,
        requestedCheckout: new Date(requestedCheckout),
        status: 0,
        checkoutStatus: 0,
      },
      include: { room: true, customer: true },
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${checkout.checkoutId}`;

    // 🔔 แจ้ง Admin
    if (adminId) {
      await sendFlexMessage(
        adminId,
        "📥 มีคำขอคืนห้องใหม่",
        [
          { label: "ห้อง", value: checkout.room.number },
          {
            label: "วันที่ขอคืน",
            value: formatThaiDate(checkout.requestedCheckout),
          },
          {
            label: "ผู้เช่า",
            value: checkout.customer.userName || "-",
          },
        ],
        [{ label: "เปิดดูรายการ", url: detailUrl, style: "primary" }]
      );
    }

    // 🔔 แจ้ง ลูกค้า
    await sendFlexMessage(
      customer.userId,
      "📤 ส่งคำขอคืนห้องแล้ว",
      [
        { label: "ห้อง", value: checkout.room.number },
        {
          label: "วันที่ขอคืน",
          value: formatThaiDate(checkout.requestedCheckout),
        },
        { label: "สถานะ", value: "รอการตรวจสอบจากแอดมิน" },
      ],
      [{ label: "ดูสถานะคำขอ", url: detailUrl, style: "primary" }]
    );

    res.json({
      checkout,
      message: "ส่งคำขอคืนห้องเรียบร้อย",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   Admin: อนุมัติคำขอคืน (แจ้งลูกค้า)
===================================================== */
checkoutRouter.put("/:checkoutId/approve", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { room: true, customer: true },
    });
    if (!checkout) throw new Error("ไม่พบข้อมูล");
    if (checkout.status !== 0) throw new Error("คำขอถูกดำเนินการแล้ว");

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: { status: 1, approvedAt: new Date() },
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${checkout.checkoutId}`;

    await sendFlexMessage(
      checkout.customer.userId,
      "✅ อนุมัติคำขอคืนห้อง",
      [
        { label: "ห้อง", value: checkout.room.number },
        { label: "สถานะ", value: "รอวันเช็คเอาท์" },
      ],
      [{ label: "เปิดดูรายการ", url: detailUrl, style: "primary" }]
    );

    res.json({ checkout: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   Admin: ปฏิเสธคำขอคืน (แจ้งลูกค้า)
===================================================== */
checkoutRouter.put("/:checkoutId/reject", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { room: true, customer: true },
    });
    if (!checkout) throw new Error("ไม่พบข้อมูล");
    if (checkout.status !== 0) throw new Error("คำขอถูกดำเนินการแล้ว");

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: { status: 2 },
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${checkout.checkoutId}`;

    await sendFlexMessage(
      checkout.customer.userId,
      "❌ ไม่อนุมัติการคืนห้อง",
      [
        { label: "ห้อง", value: checkout.room.number },
        { label: "สถานะ", value: "ถูกปฏิเสธ" },
      ],
      [{ label: "เปิดดูรายการ", url: detailUrl, style: "primary" }]
    );

    res.json({ checkout: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   Admin: เช็คเอาท์จริง (แจ้งลูกค้า)
===================================================== */
checkoutRouter.put(
  "/:checkoutId/checkout",
  authMiddleware,
  async (req, res) => {
    try {
      const { checkoutId } = req.params;

      const checkout = await prisma.checkout.findUnique({
        where: { checkoutId },
        include: { room: true, customer: true },
      });
      if (!checkout) throw new Error("ไม่พบข้อมูล");
      if (checkout.status !== 1) throw new Error("ยังไม่ได้อนุมัติ");
      if (checkout.checkoutStatus === 1) throw new Error("เช็คเอาท์ไปแล้ว");

      await prisma.$transaction([
        prisma.checkout.update({
          where: { checkoutId },
          data: {
            checkoutStatus: 1,
            actualCheckout: new Date(),
          },
        }),
        prisma.room.update({
          where: { roomId: checkout.roomId },
          data: { status: 0 },
        }),
      ]);

      const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${checkout.checkoutId}`;

      await sendFlexMessage(
        checkout.customer.userId,
        "🚪 เช็คเอาท์เรียบร้อยแล้ว",
        [
          { label: "ห้อง", value: checkout.room.number },
          { label: "วันที่เช็คเอาท์", value: formatThaiDate(new Date()) },
          { label: "สถานะ", value: "คืนห้องเสร็จสิ้น" },
        ],
        [{ label: "ดูรายละเอียด", url: detailUrl, style: "primary" }]
      );

      res.json({ message: "เช็คเอาท์สำเร็จ" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =====================================================
   Admin: แก้ไขวันที่ขอคืน (ไม่แจ้งเตือน)
===================================================== */
checkoutRouter.put("/:checkoutId/date", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;
    const { requestedCheckout } = req.body;
    if (!requestedCheckout) throw new Error("ต้องระบุวันที่คืน");

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
    });
    if (!checkout) throw new Error("ไม่พบข้อมูล");
    if (checkout.checkoutStatus === 1)
      throw new Error("เช็คเอาท์แล้ว แก้ไม่ได้");

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: { requestedCheckout: new Date(requestedCheckout) },
    });

    res.json({ checkout: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   Admin: ลบ checkout (ไม่แจ้งเตือน)
===================================================== */
checkoutRouter.delete("/:checkoutId", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
    });
    if (!checkout) throw new Error("ไม่พบข้อมูล");
    if (checkout.checkoutStatus === 1)
      throw new Error("เช็คเอาท์แล้ว ลบไม่ได้");

    await prisma.checkout.delete({ where: { checkoutId } });
    res.json({ message: "ลบ checkout สำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default checkoutRouter;