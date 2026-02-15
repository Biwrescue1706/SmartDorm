import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const dormProfile = Router();

function buildFullName(t, n, s) {
  return `${t ?? ""}${n ?? ""} ${s ?? ""}`.trim();
}

// 📋 ดึงข้อมูลหอพัก
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
        service: 50,
        waterRate: 0,
        electricRate: 0,
        overdueFinePerDay: 0,
      },
    });

    res.json(profile);
  } catch (err) {
    console.error("❌ [getDormProfile] Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// ✏️ อัปเดตข้อมูลหอพัก
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
        service,
        waterRate,
        electricRate,
        overdueFinePerDay,
      } = req.body;

      const data = {
        dormName,
        address,
        phone,
        email,
        taxId,
        taxType: Number(taxType) || 0,

        receiverTitle,
        receiverName,
        receiverSurname,
        receiverFullName: buildFullName(
          receiverTitle,
          receiverName,
          receiverSurname
        ),

        signatureUrl,

        service: Number(service) || 0,
        waterRate: Number(waterRate) || 0,
        electricRate: Number(electricRate) || 0,
        overdueFinePerDay: Number(overdueFinePerDay) || 0,

        updatedAt: new Date(), // 👈 ใส่ timestamp ตอน update
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