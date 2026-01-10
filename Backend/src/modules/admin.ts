// src/modules/admin.ts
// 🚚 Imports
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import bcrypt from "bcryptjs";

// 🌐 Router
const admin = Router();

// 📋 ดึงผู้ดูแลระบบทั้งหมด
admin.get("/getall", async (_req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(admins);
  } catch (err: any) {
    console.error("❌ [getall] Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// 🔍 ดึงข้อมูลแอดมินรายตัว
admin.get("/:adminId", async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.params.adminId },
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) throw new Error("ไม่พบข้อมูลผู้ดูแลระบบ");
    res.json(admin);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ✏️ อัปเดตข้อมูลผู้ดูแลระบบ (เฉพาะ Super Admin)
admin.put("/:adminId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    const updateData: Record<string, any> = {};

    if (username) updateData.username = username.trim();
    if (name) updateData.name = name.trim();
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role !== undefined) updateData.role = Number(role);

    const updated = await prisma.admin.update({
      where: { adminId: req.params.adminId },
      data: updateData,
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({ message: "อัปเดตข้อมูลผู้ดูแลระบบสำเร็จ", updated });
  } catch (err: any) {
    console.error("❌ [updateAdmin] Error:", err.message);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

// 🗑️ ลบผู้ดูแลระบบ (เฉพาะ Super Admin)
admin.delete(
  "/:adminId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { adminId } = req.params;
      await prisma.admin.delete({ where: { adminId } });
      res.json({ message: "ลบผู้ดูแลระบบสำเร็จ" });
    } catch (err: any) {
      console.error("❌ [deleteAdmin] Error:", err.message);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" });
    }
  }
);

// ➕ เพิ่มผู้ดูแลระบบใหม่ (เฉพาะ Super Admin)
admin.post("/create", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    if (!username || !name || !password)
      throw new Error("กรุณากรอกข้อมูลให้ครบ");

    const exists = await prisma.admin.findUnique({ where: { username } });
    if (exists) throw new Error("ชื่อผู้ใช้นี้มีอยู่แล้วในระบบ");

    const hashed = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        username,
        name,
        password: hashed,
        role: role ?? 1,
      },
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: "สร้างผู้ดูแลระบบสำเร็จ", admin });
  } catch (err: any) {
    console.error("❌ [createAdmin] Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default admin;
