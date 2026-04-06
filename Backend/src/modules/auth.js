import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { thailandTime } from "../utils/timezone.js";

const auth = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

/* ================= LOGIN ================= */

auth.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "กรุณากรอก username และ password",
      });
    }

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

    if (!admin) {
      return res.status(401).json({ error: "ไม่พบบัญชีผู้ใช้" });
    }

    if (!admin.password) {
      return res.status(500).json({ error: "บัญชีนี้ไม่มีรหัสผ่านในระบบ" });
    }

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }

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
domain: ".smartdorm-biwboong.shop",
      path: "/",
      maxAge: 90 * 60 * 1000,
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

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      error: err.message || "ระบบมีปัญหา",
    });
  }
});

/* ================= LOGOUT ================= */

auth.post("/logout", (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
domain: ".smartdorm-biwboong.shop",
    path: "/",
  });

  res.json({ message: "ออกจากระบบสำเร็จ" });
});

/* ================= VERIFY ================= */

auth.get("/verify", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      valid: true,
      admin: decoded,
    });

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

    if (!admin) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    res.json(admin);

  } catch (err) {
    console.error("PROFILE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ================= UPDATE NAME ================= */

auth.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "กรุณากรอกชื่อ",
      });
    }

    const updated = await prisma.admin.update({
      where: { adminId: req.admin.adminId },
      data: {
        name: name.trim(),
        updatedAt: thailandTime(),
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

    res.json({
      message: "อัปเดตชื่อสำเร็จ",
      admin: updated,
    });

  } catch (err) {
    console.error("UPDATE NAME ERROR:", err);

    res.status(400).json({
      error: err.message,
    });
  }
});

/* ================= RESET PASSWORD ================= */

auth.put("/forgot/reset", async (req, res) => {
  try {
    const { username, newPassword } = req.body || {};

    if (!username || !newPassword) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
    }

    const hashed = await bcrypt.hash(newPassword, 8);

    await prisma.admin.update({
      where: { username },
      data: {
        password: hashed,
        updatedAt: thailandTime(),
      },
    });

    res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);

    res.status(400).json({
      error: err.message,
    });
  }
});

/* ================= CHANGE PASSWORD ================= */

auth.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
    }

    const admin = await prisma.admin.findUnique({
      where: { adminId: req.admin.adminId },
      select: { password: true },
    });

    if (!admin || !admin.password) {
      return res.status(400).json({ error: "ไม่พบข้อมูลผู้ใช้" });
    }

    const valid = await bcrypt.compare(oldPassword, admin.password);

    if (!valid) {
      return res.status(400).json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" });
    }

    const hashed = await bcrypt.hash(newPassword, 8);

    await prisma.admin.update({
      where: { adminId: req.admin.adminId },
      data: {
        password: hashed,
        updatedAt: thailandTime(),
      },
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);

    res.status(400).json({
      error: err.message,
    });
  }
});

export default auth;