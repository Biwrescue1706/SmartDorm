import { Router } from "express";
import prisma from "../prisma.js";
import { verifyLineToken } from "../utils/verifyLineToken.js";
import { deleteSlip } from "./booking.js";
import { toThaiString } from "../utils/timezone.js";

const user = Router();

/* แปลงข้อมูล booking เป็นเวลาไทย */
const formatBooking = (b) => ({
  ...b,
  createdAt: toThaiString(b.createdAt),
  bookingDate: toThaiString(b.bookingDate),
  checkin: toThaiString(b.checkin),
  checkinAt: toThaiString(b.checkinAt),
  approvedAt: toThaiString(b.approvedAt),
});

/* แปลงข้อมูลบิลและการชำระเงินเป็นเวลาไทย */
const formatBill = (bill) => ({
  ...bill,
  createdAt: toThaiString(bill.createdAt),
  month: toThaiString(bill.month),
  dueDate: toThaiString(bill.dueDate),
  paidAt: toThaiString(bill.paidAt),
  billDate: toThaiString(bill.billDate),
  payment: bill.payment
    ? {
        ...bill.payment,
        createdAt: toThaiString(bill.payment.createdAt),
        paidAt: toThaiString(bill.payment.paidAt),
      }
    : null,
});

/* แปลงข้อมูลลูกค้าและ booking เป็นเวลาไทย */
const formatCustomer = (c) => ({
  ...c,
  createdAt: toThaiString(c.createdAt),
  updatedAt: toThaiString(c.updatedAt),
  bookings: c.bookings?.map(formatBooking),
});

/* ดึงข้อมูลลูกค้าทั้งหมดแบบแบ่งหน้า */
user.get("/getall", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = 20;

    const users = await prisma.customer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { bookings: { include: { room: true } } },
    });

    res.json({
      count: users.length,
      users: users.map(formatCustomer),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* สมัครสมาชิกหรืออัปเดตข้อมูลจาก LINE */
user.post("/register", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } =
      await verifyLineToken(accessToken);

    const customer = await prisma.customer.upsert({
      where: { userId },
      update: { userName: displayName },
      create: { userId, userName: displayName },
    });

    res.json({
      message: "สมัครหรืออัปเดตสำเร็จ",
      customer: formatCustomer(customer),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน */
user.post("/me", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { userId, displayName } =
      await verifyLineToken(accessToken);

    const customer = await prisma.customer.upsert({
      where: { userId },
      update: {},
      create: { userId, userName: displayName },
    });

    res.json({
      success: true,
      profile: formatCustomer(customer),
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
});

/* ดึงรายการบิลที่ชำระเงินแล้ว */
user.post("/payments", async (req, res) => {
  try {
    const { userId } =
      await verifyLineToken(req.body.accessToken);

    const bills = await prisma.bill.findMany({
      where: { billStatus: 1, customer: { userId } },
      include: { room: true, payment: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      count: bills.length,
      bills: bills.map(formatBill),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ดึงรายการบิลที่ยังไม่ชำระ */
user.post("/bills/unpaid", async (req, res) => {
  try {
    const { userId } =
      await verifyLineToken(req.body.accessToken);

    const bills = await prisma.bill.findMany({
      where: { billStatus: 0, customer: { userId } },
      include: { room: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      count: bills.length,
      bills: bills.map(formatBill),
    });
  } catch {
    res.status(400).json({ error: "Token ไม่ถูกต้อง" });
  }
});

/* ดึงรายการจองที่สามารถคืนห้องได้ */
user.post("/bookings/returnable", async (req, res) => {
  try {
    const { userId } =
      await verifyLineToken(req.body.accessToken);

    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer)
      return res.json({ count: 0, bookings: [] });

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customer.customerId,
        approveStatus: 1,
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      count: bookings.length,
      bookings: bookings.map(formatBooking),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ค้นหาลูกค้าจากชื่อ userId หรือข้อมูลการจอง */
user.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword?.toString().trim();
    if (!keyword) return res.json({ users: [] });

    const users = await prisma.customer.findMany({
      where: {
        OR: [
          { userName: { contains: keyword, mode: "insensitive" } },
          { userId: { contains: keyword, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      users: users.map(formatCustomer),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ลบลูกค้า พร้อมคืนสถานะห้องและลบสลิป */
user.delete("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    await prisma.$transaction(async (tx) => {
      const bookings = await tx.booking.findMany({
        where: { customerId },
        select: { slipUrl: true, roomId: true },
      });

      await tx.room.updateMany({
        where: { roomId: { in: bookings.map(b => b.roomId) } },
        data: { status: 0 },
      });

      await Promise.all(
        bookings
          .filter(b => b.slipUrl)
          .map(b => deleteSlip(b.slipUrl))
      );

      await tx.booking.deleteMany({ where: { customerId } });
      await tx.customer.delete({ where: { customerId } });
    });

    res.json({ message: "ลบลูกค้าสำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default user;