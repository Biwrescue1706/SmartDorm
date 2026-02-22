import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { toThaiString } from "../utils/timezone.js";

const auth = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

/* ---------------- Helper ---------------- */
const formatAdmin = (a) => ({
  ...a,
  createdAt: toThaiString(a.createdAt),
  updatedAt: toThaiString(a.updatedAt),
});

/* ================= LOGIN ================= */
auth.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });

    // ✅ PostgreSQL optimized
    const admin = await prisma.admin.findUnique({
      where: { username },
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (!admin)
      return res.status(401).json({ error: "ไม่พบบัญชีผู้ใช้" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid)
      return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign(
      {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "90m" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 90 * 60 * 1000,
    });

    // ✅ ไม่ต้อง query profile ซ้ำ
    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      admin: {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ระบบมีปัญหา" });
  }
});

/* ================= LOGOUT ================= */
auth.post("/logout", (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.json({ message: "ออกจากระบบสำเร็จ" });
});

/* ================= VERIFY ================= */
/* ✅ ไม่มี DB CALL → เร็วมาก */
auth.get("/verify", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, admin: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});

/* ================= PROFILE ================= */
auth.get("/profile", authMiddleware, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.admin.adminId },
      select: {
        adminId: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin)
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });

    res.json(formatAdmin(admin));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE NAME ================= */
auth.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    const updated = await prisma.admin.update({
      where: { adminId: req.admin.adminId },
      data: { name: name.trim() },
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
      message: "อัปเดตชื่อสำเร็จ",
      admin: formatAdmin(updated),
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= RESET PASSWORD ================= */
auth.put("/forgot/reset", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const hashed = await bcrypt.hash(newPassword, 8); // ✅ เร็วขึ้น

    await prisma.admin.update({
      where: { username },
      data: { password: hashed },
    });

    res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= CHANGE PASSWORD ================= */
auth.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { adminId: req.admin.adminId },
      select: { password: true },
    });

    const valid = await bcrypt.compare(oldPassword, admin.password);
    if (!valid)
      return res.status(400).json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" });

    const hashed = await bcrypt.hash(newPassword, 8);

    await prisma.admin.update({
      where: { adminId: req.admin.adminId },
      data: { password: hashed },
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default auth;