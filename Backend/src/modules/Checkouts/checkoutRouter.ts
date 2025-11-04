import { Router } from "express";
import { checkoutService } from "./checkoutService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

/* 📋 ดึงข้อมูลทั้งหมด (Admin) */
router.get("/getall", async (_req, res) => {
  try {
    const checkouts = await checkoutService.getAllCheckouts();
    res.json(checkouts);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการคืนได้" });
  }
});

/* 🔍 ค้นหาการคืนห้อง (Admin) */
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    const results = await checkoutService.searchCheckouts(keyword || "");
    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 👤 ผู้เช่าดึง Booking ของตัวเอง (ที่ยังไม่คืนห้อง) */
router.post("/myBookings", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const bookings = await checkoutService.getMyBookings(accessToken);
    res.json({
      message: "ดึง Booking ที่สามารถคืนได้สำเร็จ",
      bookings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🚪 ผู้เช่าขอคืนห้อง */
router.put("/:bookingId/checkout", async (req, res) => {
  try {
    const updated = await checkoutService.requestCheckout(
      req.params.bookingId,
      req.body
    );
    res.json({ message: "ส่งคำขอคืนห้องสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ✅ อนุมัติคืนห้อง (Admin) */
router.put("/:bookingId/approveCheckout", authMiddleware, async (req, res) => {
  try {
    const updated = await checkoutService.approveCheckout(req.params.bookingId);
    res.json({ message: "อนุมัติการคืนสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ❌ ปฏิเสธคืนห้อง (Admin) */
router.put("/:bookingId/rejectCheckout", authMiddleware, async (req, res) => {
  try {
    const updated = await checkoutService.rejectCheckout(req.params.bookingId);
    res.json({ message: "ปฏิเสธการคืนสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ✏️ แก้ไขข้อมูลการคืน (Admin) */
router.put("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const updated = await checkoutService.updateCheckout(
      req.params.bookingId,
      req.body
    );
    res.json({ message: "แก้ไขข้อมูลสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* 🗑️ ลบข้อมูลการคืน (Admin) */
router.delete("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const deleted = await checkoutService.deleteCheckout(req.params.bookingId);
    res.json({ message: "ลบข้อมูลการคืนสำเร็จ", booking: deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
