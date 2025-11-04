import { Router, Request, Response } from "express";
import { userService } from "./userService";
import { verifyLineToken } from "../../utils/verifyLineToken";

const router = Router();

// 📋 ดึงลูกค้าทั้งหมด (Admin)
router.get("/getall", async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      message: "ดึงข้อมูลลูกค้าทั้งหมดสำเร็จ",
      count: users.length,
      users,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🧩 สมัครหรืออัปเดตข้อมูลลูกค้า
router.post("/register", async (req: Request, res: Response) => {
  try {
    const customer = await userService.register(req.body);
    res.json({ message: "สมัครหรืออัปเดตข้อมูลสำเร็จ", customer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 👤 ดึงข้อมูลโปรไฟล์ลูกค้า (พร้อม bookings / bills)
router.post("/me", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const profile = await userService.getProfile(accessToken);

    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
});

// 💰 ดึงรายการบิลที่ชำระแล้ว
router.post("/payments", async (req: Request, res: Response) => {
  try {
    const bills = await userService.getPaidBills(req.body.accessToken);
    res.json({
      message: "ดึงรายการบิลที่ชำระแล้วสำเร็จ",
      count: bills.length,
      bills,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 💸 ดึงรายการบิลที่ยังไม่ชำระ
router.post("/bills/unpaid", async (req: Request, res: Response) => {
  try {
    const bills = await userService.getUnpaidBills(req.body.accessToken);
    res.json({
      message: "ดึงรายการบิลที่ยังไม่ชำระสำเร็จ",
      count: bills.length,
      bills,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🚪 ดึงรายการห้องที่สามารถคืนได้
router.post("/bookings/returnable", async (req: Request, res: Response) => {
  try {
    const bookings = await userService.getReturnableBookings(
      req.body.accessToken
    );
    res.json({
      message: "ดึงรายการที่สามารถคืนได้สำเร็จ",
      count: bookings.length,
      bookings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🔍 ค้นหาลูกค้าจากชื่อ / เบอร์โทร / ห้อง
router.get("/search", async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword?.toString().trim() || "";

    // ✅ ป้องกันการค้นหาว่าง
    if (!keyword) {
      return res.json({
        message: "ไม่พบคำค้นหา",
        users: [],
        bookings: [],
        rooms: [],
      });
    }

    const users = await userService.searchUsers(keyword);
    res.json({
      message: `ค้นหาสำเร็จ (${users.length} รายการ)`,
      keyword,
      users,
    });
  } catch (err: any) {
    console.error("❌ Search error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ❌ ลบลูกค้า
router.delete("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) throw new Error("customerId is required");

    await userService.deleteUser(customerId);
    res.json({ message: "ลบลูกค้าสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
