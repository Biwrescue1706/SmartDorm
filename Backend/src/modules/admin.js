import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import { thailandTime } from "../utils/timezone.js";

const admin = Router();

/* แปลงเวลาเป็นเวลาไทยก่อนส่งกลับ */
const formatAdmin = (a) => ({
  ...a,
  createdAt: thailandTime(a.createdAt),
  updatedAt: thailandTime(a.updatedAt),
});

/* ดึงรายการแอดมินทั้งหมดแบบแบ่งหน้า */
admin.get("/getall", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const admins = await prisma.admin.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(admins.map(formatAdmin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ดึงข้อมูลล้มเหลว" });
  }
});

/* ดึงข้อมูลแอดมินตาม adminId */
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

    if (!adminData)
      return res.status(404).json({ error: "ไม่พบข้อมูล" });

    res.json(formatAdmin(adminData));
  } catch {
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

/* อัปเดตข้อมูลแอดมิน (เฉพาะ super admin) */
admin.put(
  "/:adminId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { username, name, password, role } = req.body;

      const data = {};

      if (username?.trim()) data.username = username.trim();
      if (name?.trim()) data.name = name.trim();

      if (password?.trim()) {
        data.password = await bcrypt.hash(password, 8);
      }

      if (role !== undefined) data.role = Number(role);

      if (!Object.keys(data).length)
        return res.status(400).json({ error: "ไม่มีข้อมูลให้อัปเดต" });

      const updated = await prisma.admin.update({
        where: { adminId: req.params.adminId },
        data,
        select: {
          adminId: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: "อัปเดตสำเร็จ",
        updated: formatAdmin(updated),
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ลบแอดมิน (ห้ามลบ Super Admin คนแรกของระบบ) */
admin.delete(
  "/:adminId",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { adminId } = req.params;

      // ✅ หา super admin คนแรก
      const firstSuperAdmin = await prisma.admin.findFirst({
        where: { role: 0 },
        orderBy: { createdAt: "asc" },
        select: { adminId: true },
      });

      if (!firstSuperAdmin) {
        return res.status(400).json({
          error: "ไม่พบ Super Admin ในระบบ",
        });
      }

      // ✅ ห้ามลบคนแรก
      if (firstSuperAdmin.adminId === adminId) {
        return res.status(403).json({
          error: "ไม่สามารถลบ Super Admin คนแรกของระบบได้",
        });
      }

      // ✅ เช็คต้องเหลือ admin อย่างน้อย 1 คน
      const count = await prisma.admin.count();

      if (count <= 1) {
        return res.status(400).json({
          error: "ต้องมีแอดมินอย่างน้อย 1 คน",
        });
      }

      await prisma.admin.delete({
        where: { adminId },
      });

      res.json({ message: "ลบสำเร็จ" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* สร้างผู้ดูแลระบบใหม่ */
admin.post(
  "/create",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const { username, name, password, role } = req.body;

      if (!username || !name || !password)
        return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

      const exists = await prisma.admin.findUnique({
        where: { username },
        select: { adminId: true },
      });

      if (exists)
        return res.status(400).json({
          error: "Username ถูกใช้แล้ว",
        });

      const adminData = await prisma.admin.create({
        data: {
          username,
          name,
          password: await bcrypt.hash(password, 10),
          role: role ?? 1,
        },
        select: {
          adminId: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(201).json({
        message: "สร้างสำเร็จ",
        admin: formatAdmin(adminData),
      });

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default admin;