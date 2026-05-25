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
        phone : true,
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
        phone: admin.phone,
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
        phone: admin.phone,
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
        phone: true,
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
        phone: true,
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

// 🔑 ลืมรหัสผ่าน - ตรวจสอบผู้ใช้
auth.post("/forgot/check", async (req, res) => {

  try {

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: "กรุณากรอก username",
      });
    }

    // ✅ ตรวจสอบ user
    const user = await prisma.admin.findUnique({

      where: { username },

      select: {
        name: true,
        phone: true,
      },

    });

    if (!user) {
      return res.status(404).json({
        error: "ไม่พบผู้ใช้",
      });
    }

    // ✅ เช็กว่ามีคำร้องไหม
    const existingRequest =
      await prisma.passwordResetRequest.findUnique({

        where: {
          username,
        },

      });

    // ✅ ถ้ามีแล้ว
    if (existingRequest) {

      return res.json({

        alreadyRequested: true,

        message:
          "คุณได้ส่งคำร้องไปแล้ว กรุณารอ Admin ติดต่อกลับ",

        name: user.name,

        phone:
          user.phone
            ? user.phone.replace(
                /^(\d{3})\d{4}(\d{3})$/,
                "$1-xxxx-$2"
              )
            : null,

      });

    }

    // ✅ สร้างคำร้องใหม่
    await prisma.passwordResetRequest.create({

      data: {

        username,

        phone: user.phone,

      },

    });

    res.json({

      alreadyRequested: false,

      message:
        "ส่งคำร้องรีเซ็ตรหัสผ่านสำเร็จ",

      name: user.name,

      phone:
        user.phone
          ? user.phone.replace(
              /^(\d{3})\d{4}(\d{3})$/,
              "$1-xxxx-$2"
            )
          : null,

    });

  } catch (err) {

    console.error(
      "FORGOT CHECK ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });

  }

});

/* ================= RESET PASSWORD ================= */
auth.post(
  "/admin/reset-requests",
  authMiddleware,
  async (req, res) => {

    try {

      const { requestId } = req.body;

      // ✅ หาคำร้อง
      const request =
        await prisma.passwordResetRequest.findUnique({

          where: {
            requestId,
          },

        });

      if (!request) {

        return res.status(404).json({
          error: "ไม่พบคำร้อง",
        });

      }

      // ✅ รหัสใหม่
      const tempPassword = "123456";

      // ✅ hash password
      const hashed =
        await bcrypt.hash(
          tempPassword,
          8
        );

      // ✅ update password
      await prisma.admin.update({

        where: {
          username: request.username,
        },

        data: {
          password: hashed,
          updatedAt: thailandTime(),
        },

      });

      // ✅ ลบคำร้อง
      await prisma.passwordResetRequest.delete({

        where: {
          requestId,
        },

      });

      res.json({

        message:
          "รีเซ็ตรหัสผ่านสำเร็จ",

        tempPassword,

      });

    } catch (err) {

      console.error(
        "RESET PASSWORD ERROR:",
        err
      );

      res.status(500).json({
        error: err.message,
      });

    }

  }
);

// 🔑 จำนวนคำร้องรีเซ็ตรหัส
auth.get(
  "/admin/reset-requests/count",
  async (req, res) => {

    try {

      const count =
        await prisma.passwordResetRequest.count();

      res.json({
        count,
      });

    } catch (err) {

      console.error(
        "RESET REQUEST COUNT ERROR:",
        err
      );

      res.status(500).json({
        error: err.message,
      });

    }

  }
);

export default auth;