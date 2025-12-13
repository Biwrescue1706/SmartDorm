// src/modules/admin.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import bcrypt from "bcryptjs";
import { AdminRole } from "@prisma/client";

const adminRouter = Router();

/* =====================================================
   📋 ดึงผู้ดูแลระบบทั้งหมด
===================================================== */
adminRouter.get("/getall", authMiddleware, async (_req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🔍 ดึงแอดมินรายตัว
===================================================== */
adminRouter.get("/:adminId", authMiddleware, async (req, res) => {
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

/* =====================================================
   ✏️ อัปเดตผู้ดูแลระบบ (SUPER_ADMIN เท่านั้น)
===================================================== */
adminRouter.put(
  "/:adminId",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const { username, name, password, role } = req.body;

      const updateData: any = {};

      if (username) updateData.username = username.trim();
      if (name) updateData.name = name.trim();
      if (password) updateData.password = await bcrypt.hash(password, 10);

      // ✅ role ต้องเป็น enum เท่านั้น
      if (role && Object.values(AdminRole).includes(role)) {
        updateData.role = role;
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
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================================================
   🗑️ ลบผู้ดูแลระบบ (SUPER_ADMIN)
===================================================== */
adminRouter.delete(
  "/:adminId",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  async (req, res) => {
    try {
      await prisma.admin.delete({
        where: { adminId: req.params.adminId },
      });
      res.json({ message: "ลบผู้ดูแลระบบสำเร็จ" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================================================
   ➕ เพิ่มผู้ดูแลระบบใหม่ (SUPER_ADMIN)
===================================================== */
adminRouter.post(
  "/create",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const { username, name, password, role } = req.body;

      if (!username || !name || !password)
        throw new Error("กรุณากรอกข้อมูลให้ครบ");

      const exists = await prisma.admin.findUnique({
        where: { username },
      });
      if (exists) throw new Error("ชื่อผู้ใช้นี้มีอยู่แล้ว");

      const hashed = await bcrypt.hash(password, 10);

      const admin = await prisma.admin.create({
        data: {
          username,
          name,
          password: hashed,
          role:
            role && Object.values(AdminRole).includes(role)
              ? role
              : AdminRole.STAFF,
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
      res.status(400).json({ error: err.message });
    }
  }
);

export default adminRouter;
