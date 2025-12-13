import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET must be defined in .env file");
}

/* =====================================================
   Extend Express Request Type
===================================================== */
declare global {
  namespace Express {
    interface Request {
      admin?: {
        adminId: string;
        username: string;
        name: string;
        role: AdminRole;
      };
    }
  }
}

/* =====================================================
   Auth Middleware (ตรวจ Token)
===================================================== */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    }) as jwt.JwtPayload;

    req.admin = {
      adminId: decoded.adminId,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role as AdminRole,
    };

    next();
  } catch (err: any) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

/* =====================================================
   Role Middleware (ตรวจสิทธิ์)
===================================================== */
export function roleMiddleware(requiredRole: AdminRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: "ยังไม่ได้เข้าสู่ระบบ" });
    }

    if (req.admin.role !== requiredRole) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" });
    }

    next();
  };
}
