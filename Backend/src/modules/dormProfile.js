// src/modules/dormProfile.js
import { Router } from "express";
import multer from "multer";
import prisma from "../prisma.js";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { thailandTime, toThaiString } from "../utils/timezone.js";

const dormProfile = Router();

/* ใช้ multer รับไฟล์แบบ memory สำหรับ upload */
const upload = multer({ storage: multer.memoryStorage() });

/* สร้าง Supabase client สำหรับจัดการ storage */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* ชื่อ bucket สำหรับเก็บไฟล์ลายเซ็น */
const BUCKET = process.env.SUPABASE_BUCKET;

/* ---------------- Helpers ---------------- */

/* รวมคำนำหน้า ชื่อ และนามสกุล */
function buildFullName(t, n, s) {
  return `${t ?? ""}${n ?? ""} ${s ?? ""}`.trim();
}

/* แปลงค่าเป็นตัวเลข หากไม่ใช่ให้เป็น 0 */
function toNum(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/* แปลงเวลาโปรไฟล์เป็นเวลาไทยก่อนส่งกลับ */
const formatProfile = (p) => ({
  ...p,
  createdAt: toThaiString(p.createdAt),
  updatedAt: toThaiString(p.updatedAt),
});

/* ================= GET ================= */

/* ดึงข้อมูลโปรไฟล์หอพักหลัก */
dormProfile.get("/", async (_req, res) => {
  try {
    const profile = await prisma.dormProfile.findUnique({
      where: { key: "MAIN" },
    });

    if (!profile)
      return res.status(404).json({ error: "ยังไม่มีโปรไฟล์" });

    res.json(formatProfile(profile));

  } catch (err) {
    console.error("❌ getDormProfile:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= PUT ================= */

/* อัปเดตหรือสร้างโปรไฟล์หอพัก พร้อมอัปโหลดลายเซ็น */
dormProfile.put(
  "/",
  authMiddleware,
  roleMiddleware(0),
  upload.single("signature"),
  async (req, res) => {
    try {
      const body = req.body;
      let signatureUrl = body.signatureUrl ?? null;

      /* อัปโหลดลายเซ็นใหม่ไปยัง Supabase storage หากมีไฟล์ */
      if (req.file) {
        const fileName = `Dorm-signature_${Date.now()}`;

        await supabase.storage
          .from(BUCKET)
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(fileName);

        signatureUrl = data.publicUrl;
      }

      /* เตรียมข้อมูลโปรไฟล์สำหรับบันทึก */
      const data = {
        dormName: body.dormName,
        address: body.address,
        phone: body.phone,
        email: body.email,
        taxId: body.taxId,
        taxType: toNum(body.taxType),

        receiverTitle: body.receiverTitle,
        receiverName: body.receiverName,
        receiverSurname: body.receiverSurname,
        receiverFullName: buildFullName(
          body.receiverTitle,
          body.receiverName,
          body.receiverSurname
        ),

        signatureUrl,

        service: toNum(body.service),
        waterRate: toNum(body.waterRate),
        electricRate: toNum(body.electricRate),
        overdueFinePerDay: toNum(body.overdueFinePerDay),

        updatedAt: thailandTime(),
      };

      /* อัปเดตหรือสร้างโปรไฟล์หลักของระบบ */
      const updated = await prisma.dormProfile.upsert({
        where: { key: "MAIN" },
        update: data,
        create: {
          key: "MAIN",
          ...data,
          createdAt: thailandTime(),
        },
      });

      res.json({
        message: "บันทึกสำเร็จ",
        updated: formatProfile(updated),
      });

    } catch (err) {
      console.error("❌ updateDormProfile:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default dormProfile;