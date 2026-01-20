// src/modules/checkout.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const checkouts = Router();
const adminId = process.env.ADMIN_LINE_ID;
const BASE_URL = "https://smartdorm-detail.biwbong.shop";
const ADMIN_URL = "https://smartdorm-admin.biwbong.shop";

const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

checkouts.get("/getall", async (_req, res) => {
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

checkouts.get("/:checkoutId", async (req, res) => {
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

checkouts.post("/myBookings", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: 1,
        checkout: { none: { checkoutStatus: 0 } },
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookings });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

checkouts.put("/:bookingId/request", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { accessToken, checkout: requestedCheckout } = req.body;
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

    const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;

    if (adminId) {
      await sendFlexMessage(
        adminId,
        "📥 มีคำขอคืนห้องใหม่",
        [
          { label: "รหัสการคืน", value: checkout.checkoutId },
          { label: "ห้อง", value: checkout.room.number },
          { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
          { label: "ผู้เช่า", value: checkout.customer.userName || "-" },
        ],
        [{ label: "เปิดดูรายการ", url: ADMIN_URL, style: "primary" }]
      );
    }

    await sendFlexMessage(
      customer.userId,
      "🏫SmartDorm🎉 ส่งคำขอคืนห้องแล้ว",
      [
        { label: "รหัสการคืน", value: checkout.checkoutId },
        { label: "ห้อง", value: checkout.room.number },
        { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
        { label: "สถานะ", value: "รอการตรวจสอบจากแอดมิน", color: "#f39c12" },
      ],
      [{ label: "ดูสถานะคำขอ", url: detailUrl, style: "primary" }]
    );

    res.json({ checkout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

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
      data: { ReturnApprovalStatus: 1, RefundApprovalDate: new Date() },
    });

    const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;

    await sendFlexMessage(
      checkout.customer.userId,
      "🏫SmartDorm🎉 แจ้งผลคำขอการคืนห้อง",
      [
        { label: "รหัสการคืน", value: checkout.checkoutId },
        { label: "ห้อง", value: checkout.room.number },
        { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
        { label: "วันที่อนุมัติ", value: formatThaiDate(updated.RefundApprovalDate) },
        { label: "สถานะ", value: "รอวันเช็คเอาท์", color: "#f39c12" },
      ],
      [{ label: "เปิดดูรายการ", url: detailUrl, style: "primary" }]
    );

    res.json({ checkout: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

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

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: { ReturnApprovalStatus: 2, RefundApprovalDate: new Date() },
    });

    const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;

    await sendFlexMessage(
      checkout.customer.userId,
      "🏫SmartDorm🎉 แจ้งผลคำขอการคืนห้อง",
      [
        { label: "รหัสการคืน", value: checkout.checkoutId },
        { label: "ห้อง", value: checkout.room.number },
        { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
        { label: "วันที่ปฏิเสธ", value: formatThaiDate(updated.RefundApprovalDate) },
        { label: "สถานะ", value: "ถูกปฏิเสธ" },
        { label: "เหตุผล", value: "กรุณาติดต่อแอดมินเพื่อสอบถามเพิ่มเติม" },
      ],
      [{ label: "เปิดดูรายการ", url: detailUrl, style: "primary" }]
    );

    res.json({ checkout: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

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
    if (checkout.checkoutStatus === 1) throw new Error("เช็คเอาท์ไปแล้ว");

    const deposit = checkout.room.deposit || 0;

    await prisma.checkout.update({
      where: { checkoutId },
      data: { checkoutStatus: 1, checkoutAt: new Date() },
    });

    const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;

    await sendFlexMessage(
      checkout.customer.userId,
      "🏫SmartDorm🎉 เช็คเอาท์เรียบร้อยแล้ว",
      [
        { label: "รหัสการคืน", value: checkout.checkoutId },
        { label: "ห้อง", value: checkout.room.number },
        { label: "วันที่เช็คเอาท์", value: formatThaiDate(new Date()) },
        { label: "เงินมัดจำ", value: `${deposit.toLocaleString()} บาท` },
        { label: "ยอดคืน", value: `${deposit.toLocaleString()} บาท` },
        {
          label: "แจ้งโอนเงิน",
          value: "กรุณาพิมพ์หมายเลขบัญชี\nธนาคาร\nxxx-xxx-xxxx\nชื่อ-นามสกุล",
        },
      ],
      [{ label: "ดูรายละเอียด", url: detailUrl, style: "primary" }]
    );

    res.json({ message: "เช็คเอาท์สำเร็จ", refundAmount: deposit });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

checkouts.put("/:checkoutId/date", authMiddleware, async (req, res) => {
  try {
    const { checkoutId } = req.params;
    const { checkout: newCheckoutDate } = req.body;

    if (!newCheckoutDate) throw new Error("ต้องระบุวันที่คืน");

    const checkout = await prisma.checkout.findUnique({
      where: { checkoutId },
    });
    if (!checkout) throw new Error("ไม่พบข้อมูล");

    const updated = await prisma.checkout.update({
      where: { checkoutId },
      data: { checkout: new Date(newCheckoutDate) },
    });

    res.json({ checkout: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

checkouts.delete("/:checkoutId", authMiddleware, async (req, res) => {
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

export default checkouts;