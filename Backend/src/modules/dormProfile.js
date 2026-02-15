import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const dormProfile = Router();

function buildFullName(t, n, s) {
  return `${t ?? ""}${n ?? ""} ${s ?? ""}`.trim();
}

// 📋 ดึงข้อมูลหอพัก (auto create MAIN ถ้ายังไม่มี)
dormProfile.get("/", async (_req, res) => {
  try {
    const profile = await prisma.dormProfile.upsert({
      where: { key: "MAIN" },
      update: {},
      create: {
        key: "MAIN",
        dormName: "",
        address: "",
        phone: "",
        email: "",
        taxId: "",
      },
    });

    res.json(profile);
  } catch (err) {
    console.error("❌ [getDormProfile] Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// ✏️ อัปเดตข้อมูลหอพัก (safe upsert)
dormProfile.put(
  "/",
  authMiddleware,
  roleMiddleware(0),
  async (req, res) => {
    try {
      const {
        dormName,
        address,
        phone,
        email,
        taxId,
        taxType,
        receiverTitle,
        receiverName,
        receiverSurname,
        signatureUrl,
      } = req.body;

      const data = {
        dormName,
        address,
        phone,
        email,
        taxId,
        taxType: Number(taxType),

        receiverTitle,
        receiverName,
        receiverSurname,
        receiverFullName: buildFullName(
          receiverTitle,
          receiverName,
          receiverSurname
        ),

        signatureUrl,
      };

      const updated = await prisma.dormProfile.upsert({
        where: { key: "MAIN" },
        update: data,
        create: { key: "MAIN", ...data },
      });

      res.json({ message: "อัปเดตข้อมูลหอพักสำเร็จ", updated });
    } catch (err) {
      console.error("❌ [updateDormProfile] Error:", err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
    }
  }
);

export default dormProfile;
