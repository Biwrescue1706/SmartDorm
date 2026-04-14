// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET must be defined in .env file");
}

// ✅ ตรวจสอบว่ามี token และถูกต้องหรือไม่
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
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // แนบข้อมูล admin เข้า req ตรง ๆ
    req.admin = {
      adminId: decoded.adminId,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// ✅ Middleware ตรวจ role เฉพาะ
export function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: "ยังไม่ได้เข้าสู่ระบบ" });
    }

    if (req.admin.role !== requiredRole) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" });
    }

    next();
  };
}