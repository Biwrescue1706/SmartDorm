// src/modules/Bookings/bookingRouter.ts
import { Router } from "express";
import multer from "multer";
import QRCode from "qrcode";
import { bookingService } from "./bookingService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

//  ดึงข้อมูลทั้งหมด
router.get("/getall", async (_req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
  }
});

//  ดึงข้อมูลการจองตาม bookingId
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.bookingId);
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

//  ผู้ใช้ส่งคำขอจองห้อง
router.post("/create", upload.single("slip"), async (req, res) => {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      slip: req.file,
    });
    res.json({ message: "จองสำเร็จ", booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

//อนุมัติ /  ปฏิเสธ /  เช็คอิน /  เช็คเอาท์ /  แก้ไข /  ลบ

//  Admin อนุมัติการจอง
router.put("/:bookingId/approve", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.approveBooking(req.params.bookingId);
    res.json({ message: "อนุมัติการจองสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

//  Admin ปฏิเสธการจอง
router.put("/:bookingId/reject", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.rejectBooking(req.params.bookingId);
    res.json({ message: "ปฏิเสธสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// แอดมินเช็คอิน
router.put("/:bookingId/checkin", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.checkinBooking(req.params.bookingId);
    res.json({ message: "เช็คอินสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// แอดมินเช็คเอาท์
router.put("/:bookingId/checkout", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.checkoutBooking(req.params.bookingId);
    res.json({ message: "เช็คเอาท์สำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

//  Admin แก้ไขข้อมูลการจอง
router.put("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.updateBooking(
      req.params.bookingId,
      req.body
    );
    res.json({ message: "แก้ไขสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

//  Admin ลบการจอง
router.delete("/:bookingId", authMiddleware, async (req, res) => {
  try {
    await bookingService.deleteBooking(req.params.bookingId);
    res.json({ message: "ลบสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🎟️ สร้าง QR Code สำหรับแอดมินเข้าหน้าข้อมูลการจอง */
router.get("/:bookingId/qrcode", async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.bookingId);
    const adminUrl = `https://smartdorm-admin.biwbong.shop/booking/${booking.bookingId}`;
    const qr = await QRCode.toDataURL(adminUrl);
    res.json({ bookingId: booking.bookingId, adminUrl, qr });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
