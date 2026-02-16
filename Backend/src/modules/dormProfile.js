import { Router } from "express";
import multer from "multer";
import prisma from "../prisma.js";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const dormProfile = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET;

// helpers
function buildFullName(t, n, s) {
  return `${t ?? ""}${n ?? ""} ${s ?? ""}`.trim();
}

function toNum(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// ================= GET =================
dormProfile.get("/", async (_req, res) => {
  try {
    const profile = await prisma.dormProfile.findUnique({
      where: { key: "MAIN" },
    });
    if (!profile) return res.status(404).json({ error: "ยังไม่มีโปรไฟล์" });
    res.json(profile);
  } catch (err) {
    console.error("❌ getDormProfile:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= PUT =================
dormProfile.put(
  "/",
  authMiddleware,
  roleMiddleware(0),
  upload.single("signature"),
  async (req, res) => {
    try {
      const body = req.body;
      let signatureUrl = body.signatureUrl ?? null;

      // upload รูปถ้ามีไฟล์
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

        updatedAt: new Date(),
      };

      const updated = await prisma.dormProfile.upsert({
        where: { key: "MAIN" },
        update: data,
        create: { key: "MAIN", ...data, createdAt: new Date() },
      });

      res.json({ message: "บันทึกสำเร็จ", updated });
    } catch (err) {
      console.error("❌ updateDormProfile:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default dormProfile;