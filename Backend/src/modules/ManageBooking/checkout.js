// src/modules/checkout.js
import { Router } from "express";
import prisma from "../../prisma.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { verifyLineToken } from "../../utils/verifyLineToken.js";
import { thailandTime } from "../../utils/timezone.js";
import { BASE_URL } from "../../utils/api.js";

import {
  notifyCheckoutRequestAdmin,
  notifyCheckoutRequestCustomer,
  notifyCheckoutApproved,
  notifyCheckoutRejected,
  notifyCheckoutSuccess
} from "../services/checkout.notify.js";

const checkouts = Router();

/* ================= ดึง checkout ทั้งหมด ================= */

checkouts.get("/getall", async (_req, res) => {
  try {
    const list = await prisma.checkout.findMany({
      orderBy: { createdAt: "desc" },
      include: { booking: true, room: true, customer: true },
    });

    res.json({ checkouts: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ดึง checkout ตาม id ================= */

checkouts.get("/:checkoutId", async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { booking: true, room: true, customer: true },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล checkout");

    res.json({ checkout });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= booking ที่ขอ checkout ได้ ================= */

checkouts.post("/myBookings", async (req, res) => {
  try {
    const { accessToken } = req.body;

    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: 1,
        checkout: null,
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= ลูกค้าขอคืนห้อง ================= */

checkouts.put("/:bookingId/request", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { accessToken, checkout: requestedCheckout } = req.body;

    if (!requestedCheckout) throw new Error("ต้องระบุวันที่ขอคืน");

    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true },
    });

    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    if (booking.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์");

    const active = await prisma.checkout.findFirst({
      where: { bookingId, checkoutStatus: 0 },
    });

    if (active) throw new Error("มีคำขอคืนที่ยังดำเนินการอยู่");

    const checkout = await prisma.checkout.create({
      data: {
        bookingId,
        roomId: booking.roomId,
        customerId: customer.customerId,
        checkout: new Date(requestedCheckout),
        checkoutStatus: 0,
      },
      include: { room: true, customer: true },
    });

    await notifyCheckoutRequestAdmin(checkout);

    await notifyCheckoutRequestCustomer(checkout, customer.userId);

    res.json({ checkout });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= อนุมัติคืนห้อง ================= */

checkouts.put("/:checkoutId/approve", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { room: true, customer: true },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล");

    if (checkout.ReturnApprovalStatus !== 0)
      throw new Error("คำขอถูกดำเนินการแล้ว");

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: {
        ReturnApprovalStatus: 1,
        RefundApprovalDate: thailandTime(),
        updatedAt: thailandTime(),
      },
    });

    await notifyCheckoutApproved(checkout, updated);

    res.json({ checkout: updated });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= ปฏิเสธ ================= */

checkouts.put("/:checkoutId/reject", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { room: true, customer: true },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล");

    if (checkout.ReturnApprovalStatus !== 0)
      throw new Error("คำขอถูกดำเนินการแล้ว");

    await prisma.checkout.delete({
      where: { checkoutId },
    });

    await notifyCheckoutRejected(checkout);

    res.json({ message: "ปฏิเสธแล้ว สามารถขอใหม่ได้" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= เช็คเอาท์จริง ================= */

checkouts.put("/:checkoutId/checkout", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
      include: { room: true, customer: true },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล checkout");

    if (checkout.ReturnApprovalStatus !== 1)
      throw new Error("ยังไม่ได้รับการอนุมัติคำขอคืน");

    if (checkout.checkoutStatus === 1)
      throw new Error("เช็คเอาท์ไปแล้ว");

    const deposit = checkout.room.deposit || 0;

    await prisma.$transaction(async (tx) => {

      await tx.checkout.update({
        where: { checkoutId },
        data: {
          checkoutStatus: 1,
          checkoutAt: thailandTime(),
          updatedAt: thailandTime(),
        },
      });

      await tx.room.update({
        where: { roomId: checkout.roomId },
        data: {
          status: 0,
          updatedAt: thailandTime(),
        },
      });

    });

    await notifyCheckoutSuccess(checkout);

    res.json({
      message: "เช็คเอาท์สำเร็จ",
      refundAmount: deposit,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= แก้วันที่คืน ================= */

checkouts.put("/:checkoutId/date", authMiddleware, async (req, res) => {
  try {

    const { checkoutId } = req.params;
    const { checkout: newCheckoutDate } = req.body;

    if (!newCheckoutDate)
      throw new Error("ต้องระบุวันที่คืน");

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล");

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: {
        checkout: thailandTime(newCheckoutDate),
        updatedAt: thailandTime(),
      },
    });

    res.json({ checkout: updated });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= ลบ checkout ================= */

checkouts.delete("/:checkoutId", authMiddleware, async (req, res) => {
  try {

    const { checkoutId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
    });

    if (!checkout) throw new Error("ไม่พบข้อมูล");

    await prisma.checkout.delete({
      where: { checkoutId },
    });

    res.json({ message: "ลบ checkout สำเร็จ" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default checkouts;