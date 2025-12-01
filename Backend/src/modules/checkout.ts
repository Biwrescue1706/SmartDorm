// src/modules/checkout.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const checkoutRouter = Router();

// 🧮 Helper
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];
const formatThaiDate = (dateInput?: string | Date | null) => {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 📦 ดึงข้อมูลการคืนทั้งหมด
checkoutRouter.get("/getall", async (_req, res) => {
  try {
    const checkouts = await prisma.booking.findMany({
      where: { checkout: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
    res.json(checkouts);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการคืนได้" });
  }
});

// 🔍 ค้นหาข้อมูลการคืน
checkoutRouter.get("/search", async (req, res) => {
  try {
    const keyword = (req.query.keyword as string)?.trim() || "";
    const results = await prisma.booking.findMany({
      where: {
        checkout: { not: null },
        OR: keyword
          ? [
              { bookingId: { contains: keyword, mode: "insensitive" } },
              { fullName: { contains: keyword, mode: "insensitive" } },
              { cphone: { contains: keyword, mode: "insensitive" } },
              { room: { number: { contains: keyword, mode: "insensitive" } } },
            ]
          : undefined,
      },
      include: { room: true, customer: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🧾 ดึง Booking ของลูกค้าที่สามารถคืนได้
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
        checkoutStatus: 0,
      },
      orderBy: { createdAt: "desc" },
      include: { room: true },
    });

    res.json({ message: "ดึง Booking ที่สามารถคืนได้สำเร็จ", bookings });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 📤 ลูกค้าส่งคำขอคืนห้อง
checkoutRouter.put("/:bookingId/checkout", async (req, res) => {
  try {
    const { accessToken, checkout } = req.body;
    const { bookingId } = req.params;

    if (!accessToken) throw new Error("accessToken หายไป");
    if (!checkout) throw new Error("ต้องระบุวันที่ขอคืนห้อง");

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

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: {
        checkout: new Date(checkout),
        checkoutStatus: 0,
        returnStatus: 0,
      },
      include: { room: true, customer: true },
    });

    // 🔔 แจ้งเตือนแอดมิน
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอคืนห้องใหม่",
        [
          { label: "รหัสการจอง", value: updated.bookingId },
          { label: "🏠 ห้อง", value: updated.room.number ?? "-" },
          { label: "👤 ผู้ขอคืน", value: updated.fullName ?? "-" },
          { label: "📞 เบอร์", value: updated.cphone ?? "-" },
          { label: "📅 วันที่ขอคืน", value: formatThaiDate(updated.checkout) },
        ],
        [
          {
            label: "เปิดในระบบ Admin",
            url: "https://smartdorm-admin.biwbong.shop",
            style: "secondary",
          },
        ]
      );
    }

    // 🔔 แจ้งลูกค้า
    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${updated.bookingId}`;
    await sendFlexMessage(
      updated.customer.userId,
      "📢 SmartDorm ส่งคำขอคืนห้องสำเร็จแล้ว",
      [
        { label: "รหัสการจอง", value: updated.bookingId },
        { label: "🏠 ห้อง", value: updated.room.number ?? "-" },
        { label: "📅 วันที่คืน", value: formatThaiDate(updated.checkout) },
        { label: "สถานะ", value: "⏳ รออนุมัติ", color: "#f39c12" },
      ],
      [
        {
          label: "ดูรายละเอียดการคืนห้อง",
          url: detailUrl,
          style: "primary",
        },
      ]
    );
    console.log(
      `[${logTime()}] ส่งแจ้งเตือนไลน์ คำขอคืนห้อง ของ ${updated.customer?.userName} สำเร็จแล้ว`
    );
    res.json({ message: "ส่งคำขอคืนห้องสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

//  อนุมัติการคืนห้อง (Admin)
checkoutRouter.put(
  "/:bookingId/approveCheckout",
  authMiddleware,
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { bookingId },
        include: { room: true, customer: true },
      });
      if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.booking.update({
          where: { bookingId },
          data: {
            actualCheckout: new Date(),
            checkoutStatus: 1,
            returnStatus: 1,
          },
          include: { room: true, customer: true },
        });
        await tx.room.update({
          where: { roomId: booking.roomId },
          data: { status: 0 },
        });
        return result;
      });

      const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;
      await sendFlexMessage(
        booking.customer.userId,
        "📢 SmartDorm การคืนห้องของคุณได้รับการอนุมัติแล้ว",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง", value: booking.room.number ?? "-" },
          { label: "📅 วันที่ขอคืน", value: formatThaiDate(booking.checkout) },
          { label: "📅 วันที่อนุมัติ", value: formatThaiDate(new Date()) },
          { label: "สถานะ", value: " คืนห้องสำเร็จ", color: "#27ae60" },
        ],
        [
          {
            label: "ดูรายละเอียดการคืนห้อง",
            url: detailUrl,
            style: "primary",
          },
        ]
      );
      console.log(
        `[${logTime()}] ส่งแจ้งเตือนไลน์ การคืนห้อง ของ ${updated.customer?.userName} สำเร็จแล้ว`
      );
      res.json({ message: "อนุมัติการคืนสำเร็จ", booking: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

//  ปฏิเสธการคืนห้อง (Admin)
checkoutRouter.put(
  "/:bookingId/rejectCheckout",
  authMiddleware,
  async (req, res) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { bookingId: req.params.bookingId },
        include: { room: true, customer: true },
      });
      if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

      const updated = await prisma.booking.update({
        where: { bookingId: req.params.bookingId },
        data: { returnStatus: 2 },
        include: { room: true, customer: true },
      });

      const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;
      await sendFlexMessage(
        booking.customer.userId,
        "SmartDorm แจ้งผลของคำขอคืน ",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง", value: booking.room.number ?? "-" },
          { label: "📅 วันที่ขอคืน", value: formatThaiDate(booking.checkout) },
          {
            label: "สถานะ",
            value: "ปฏิเสธคำขอคืนห้องของคุณ",
            color: "#e74c3c",
          },
        ],
        [
          {
            label: "ติดต่อผู้ดูแลระบบ",
            url: detailUrl,
            style: "secondary",
          },
        ]
      );

      res.json({ message: "ปฏิเสธการคืนสำเร็จ", booking: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✏️ แก้ไขข้อมูลการคืน
checkoutRouter.put("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const { checkout, returnStatus } = req.body;
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: {
        ...(checkout && { checkout: new Date(checkout) }),
        ...(returnStatus !== undefined && { returnStatus }),
      },
      include: { room: true, customer: true },
    });
    res.json({ message: "แก้ไขข้อมูลสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ ลบข้อมูลการคืน
checkoutRouter.delete("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: {
        checkout: null,
        actualCheckout: null,
        returnStatus: null,
        checkoutStatus: 0,
      },
      include: { room: true, customer: true },
    });
    res.json({ message: "ลบข้อมูลการคืนสำเร็จ", booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default checkoutRouter;
