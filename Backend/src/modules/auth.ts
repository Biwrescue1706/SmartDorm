// src/modules/Auths/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { AdminRole } from "@prisma/client";

// ⚙️ Config
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");

const authRouter = Router();

/* =====================================================
   🧾 REGISTER (สมัครสมาชิก)
===================================================== */
authRouter.post("/register", async (req, res) => {
  try {
    const { username, name, password, role } = req.body;

    if (!username || !name || !password)
      throw new Error("กรุณากรอกข้อมูลให้ครบ");

    const exists = await prisma.admin.findUnique({ where: { username } });
    if (exists) throw new Error("Username นี้ถูกใช้ไปแล้ว");

    const hashed = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        name,
        password: hashed,

        // ✅ ใช้ enum เท่านั้น
        role:
          role && Object.values(AdminRole).includes(role)
            ? role
            : AdminRole.STAFF,
      },
    });

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      admin: {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   🔐 LOGIN
===================================================== */
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new Error("ไม่พบบัญชีผู้ใช้");

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new Error("รหัสผ่านไม่ถูกต้อง");

    const token = jwt.sign(
      {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        role: admin.role, // ✅ enum
      },
      JWT_SECRET,
      { expiresIn: "2h", algorithm: "HS256" }
    );

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      admin: {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   🚪 LOGOUT
===================================================== */
authRouter.post("/logout", (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "ออกจากระบบสำเร็จ" });
});

/* =====================================================
   🔍 VERIFY TOKEN
===================================================== */
authRouter.get("/verify", (req, res) => {
  const token = req.cookies?.token;
  if (!token)
    return res.status(401).json({ valid: false, error: "ไม่มี token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    res.json({ valid: true, admin: decoded });
  } catch (err: any) {
    res.status(401).json({ valid: false, error: err.message });
  }
});

/* =====================================================
   👤 PROFILE
===================================================== */
authRouter.get("/profile", authMiddleware, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.admin!.adminId },
    });
    if (!admin) throw new Error("ไม่พบข้อมูลผู้ใช้");
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   ✏️ UPDATE PROFILE NAME
===================================================== */
authRouter.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) throw new Error("กรุณากรอกชื่อใหม่");

    const updated = await prisma.admin.update({
      where: { adminId: req.admin!.adminId },
      data: { name: name.trim() },
    });

    res.json({ message: "อัปเดตชื่อสำเร็จ", admin: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   🔑 FORGOT PASSWORD
===================================================== */
authRouter.post("/forgot/check", async (req, res) => {
  try {
    const { username } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new Error("ไม่พบบัญชีผู้ใช้");
    res.json({ message: "พบผู้ใช้", name: admin.name });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

authRouter.put("/forgot/reset", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new Error("ไม่พบบัญชีผู้ใช้");

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { username },
      data: { password: hashed },
    });

    res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   🔒 CHANGE PASSWORD
===================================================== */
authRouter.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.admin!.adminId },
    });
    if (!admin) throw new Error("ไม่พบผู้ใช้");

    const valid = await bcrypt.compare(oldPassword, admin.password);
    if (!valid) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { adminId: admin.adminId },
      data: { password: hashed },
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default authRouter;
