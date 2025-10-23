import { userRepository } from "../modules/Users/userRepository";
import { Request, Response, NextFunction } from "express";

export async function lineAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    if (!accessToken) return res.status(401).json({ error: "Missing LINE token" });

    const profile = await userRepository.verifyLineToken(accessToken);
    (req as any).lineProfile = profile; // เก็บไว้ให้ route ใช้ต่อ
    next();
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Invalid LINE token" });
  }
}
