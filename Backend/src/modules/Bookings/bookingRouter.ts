import { Router } from "express";
import multer from "multer";
import QRCode from "qrcode";
import { bookingService } from "./bookingService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/* 📋 ดึงข้อมูลทั้งหมด */
router.get("/getall", async (_req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
  }
});

/* 🔍 ค้นหาการจอง */
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    const results = await bookingService.searchBookings(keyword || "");
    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🔎 ดึงข้อมูลการจองตาม bookingId */
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.bookingId);
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🧾 ผู้ใช้ส่งคำขอจองห้อง */
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

/* ✅ Admin อนุมัติการจอง */
router.put("/:bookingId/approve", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.approveBooking(req.params.bookingId);
    res.json({ message: "อนุมัติการจองสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🚫 Admin ปฏิเสธการจอง */
router.put("/:bookingId/reject", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.rejectBooking(req.params.bookingId);
    res.json({ message: "ปฏิเสธการจองสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🏠 Admin เช็คอิน */
router.put("/:bookingId/checkin", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.checkinBooking(req.params.bookingId);
    res.json({ message: "เช็คอินสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🚪 Admin เช็คเอาท์ */
router.put("/:bookingId/checkout", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.checkoutBooking(req.params.bookingId);
    res.json({ message: "เช็คเอาท์สำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ✏️ Admin แก้ไขข้อมูลการจอง */
router.put("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const result = await bookingService.updateBooking(
      req.params.bookingId,
      req.body
    );
    res.json({ message: "แก้ไขข้อมูลสำเร็จ", booking: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🗑️ Admin ลบการจอง */
router.delete("/:bookingId", authMiddleware, async (req, res) => {
  try {
    await bookingService.deleteBooking(req.params.bookingId);
    res.json({ message: "ลบข้อมูลการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🎟️ สร้าง QR Code สำหรับเปิดหน้าข้อมูลการจองในแอดมิน */
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