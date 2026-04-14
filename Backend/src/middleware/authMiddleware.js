// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET must be defined in .env file");
}

/* ================= ADMIN ================= */

export function authMiddleware(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: "ไม่พบ Token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.admin = {
      adminId: decoded.adminId,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

export function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: "ยังไม่ได้เข้าสู่ระบบ" });
    }

    if (req.admin.role !== requiredRole) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์" });
    }

    next();
  };
}

/* ================= USER (🔥 เพิ่มใหม่) ================= */

export function userAuthMiddleware(req, res, next) {
  try {
    const token =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    if (!token) {
      return res.status(401).json({ error: "ไม่พบ Token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      customerId: decoded.customerId,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}
