import { Router, Request, Response } from "express";
import { checkoutService } from "./checkoutService";

const router = Router();

/* ============================================================
   📋 ดึงข้อมูลการคืนทั้งหมด (Admin)
============================================================ */
router.get("/getall", async (_req: Request, res: Response) => {
  try {
    const checkouts = await checkoutService.getAllCheckouts();
    res.json(checkouts);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการคืนได้" });
  }
});

/* ============================================================
   👤 ผู้เช่าดึง Booking ของตัวเอง (ยังไม่คืนห้อง)
============================================================ */
router.post("/myBookings", async (req: Request, res: Response) => {
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

/* ============================================================
   🚪 ผู้เช่าขอคืนห้อง
============================================================ */
router.put("/:bookingId/checkout", async (req: Request, res: Response) => {
  try {
    const updated = await checkoutService.requestCheckout(
      req.params.bookingId,
      req.body
    );
    res.json({
      message: "ส่งคำขอคืนห้องสำเร็จ รอผู้ดูแลอนุมัติ",
      booking: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   ✅ แอดมินอนุมัติการคืนห้อง
============================================================ */
router.put("/:bookingId/approveCheckout", async (req: Request, res: Response) => {
  try {
    const updated = await checkoutService.approveCheckout(req.params.bookingId);
    res.json({
      message: "อนุมัติการคืนห้องสำเร็จ",
      booking: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   ❌ แอดมินปฏิเสธการคืนห้อง
============================================================ */
router.put("/:bookingId/rejectCheckout", async (req: Request, res: Response) => {
  try {
    const updated = await checkoutService.rejectCheckout(req.params.bookingId);
    res.json({
      message: "ปฏิเสธการคืนห้องสำเร็จ",
      booking: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   ✏️ แก้ไขข้อมูลการคืน (Admin)
============================================================ */
router.put("/:bookingId", async (req: Request, res: Response) => {
  try {
    const updated = await checkoutService.updateCheckout(
      req.params.bookingId,
      req.body
    );
    res.json({
      message: "แก้ไขข้อมูลการคืนสำเร็จ",
      booking: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   🗑️ ลบข้อมูลการคืน
============================================================ */
router.delete("/:bookingId", async (req: Request, res: Response) => {
  try {
    const updated = await checkoutService.deleteCheckout(req.params.bookingId);
    res.json({
      message: "ลบข้อมูลการคืนสำเร็จ",
      booking: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   🚪 แอดมินบันทึกการคืนห้องจริง (เหมือนปุ่มมาเช็คอิน)
============================================================ */
router.put("/:bookingId/confirm-return", async (req: Request, res: Response) => {
  try {
    const updated = await checkoutService.confirmReturn(req.params.bookingId);
    res.json({
      message: "บันทึกการคืนห้องจริงสำเร็จ",
      booking: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
