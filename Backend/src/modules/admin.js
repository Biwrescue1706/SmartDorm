import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

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
  } catch (err) {
    console.error("❌ [getall] Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// 🔍 ดึงข้อมูลแอดมินรายตัว
admin.get("/:adminId", async (req, res) => {
  try {
    const adminData = await prisma.admin.findUnique({
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

    if (!adminData) throw new Error("ไม่พบข้อมูลผู้ดูแลระบบ");
    res.json(adminData);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

admin.put("/:adminId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { username, name, password, role } = req.body;

    const updateData = {
      updatedAt: new Date(),
    };

    if (typeof username === "string" && username.trim())
      updateData.username = username.trim();

    if (typeof name === "string" && name.trim())
      updateData.name = name.trim();

    if (typeof password === "string" && password.trim())
      updateData.password = await bcrypt.hash(password, 10);

    if (role !== undefined && !isNaN(Number(role)))
      updateData.role = Number(role);

    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({ error: "ไม่มีข้อมูลให้อัปเดต" });
    }

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
  } catch (err) {
    console.error("❌ [updateAdmin] Error:", err.message);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

// 🗑️ ลบผู้ดูแลระบบ
admin.delete("/:adminId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { adminId } = req.params;
    await prisma.admin.delete({ where: { adminId } });
    res.json({ message: "ลบผู้ดูแลระบบสำเร็จ" });
  } catch (err) {
    console.error("❌ [deleteAdmin] Error:", err.message);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" });
  }
});

// ➕ เพิ่มผู้ดูแลระบบใหม่
admin.post("/create", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    if (!username || !name || !password)
      throw new Error("กรุณากรอกข้อมูลให้ครบ");

    const exists = await prisma.admin.findUnique({ where: { username } });
    if (exists) throw new Error("ชื่อผู้ใช้นี้มีอยู่แล้วในระบบ");

    const hashed = await bcrypt.hash(password, 10);
    const adminData = await prisma.admin.create({
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

    res.status(201).json({ message: "สร้างผู้ดูแลระบบสำเร็จ", admin: adminData });
  } catch (err) {
    console.error("❌ [createAdmin] Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default admin;