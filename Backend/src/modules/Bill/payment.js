import { Router } from "express";
import multer from "multer";
import prisma from "../../prisma.js";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../../utils/verifyLineToken.js";

const payments = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

payments.post("/create", upload.single("slip"), async (req, res) => {
  try {
    console.log("🔥 START PAYMENT");

    const { billId, accessToken } = req.body;
    const slip = req.file;

    if (!billId) return res.status(400).json({ error: "no billId" });
    if (!accessToken) return res.status(400).json({ error: "no token" });
    if (!slip) return res.status(400).json({ error: "no file" });

    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) return res.status(400).json({ error: "no customer" });

    const bill = await prisma.bill.findUnique({
      where: { billId },
    });

    if (!bill) return res.status(400).json({ error: "bill not found" });

    // 🔥 safe
    if (bill.slipPath) {
      try {
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .remove([bill.slipPath]);
      } catch (e) {
        console.log("delete fail (skip)");
      }
    }

    // 🔥 filename
    const ext = slip.originalname.split(".").pop();
    const filename = `slip_${Date.now()}.${ext}`;

    // 🔥 upload
    let slipUrl = null;

    try {
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filename, slip.buffer, {
          contentType: slip.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(filename);

      slipUrl = data.publicUrl;
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      return res.status(500).json({ error: "upload failed" });
    }

    // 🔥 save payment
    const payment = await prisma.payment.upsert({
      where: { billId },
      update: {
        slipUrl,
        slipPath: filename,
        paidAt: new Date(),
      },
      create: {
        billId,
        customerId: customer.customerId,
        slipUrl,
        slipPath: filename,
        paidAt: new Date(),
      },
    });

    // 🔥 update bill (กันพัง)
    try {
      await prisma.bill.update({
        where: { billId },
        data: {
          billStatus: 2,
          slipUrl,
          slipPath: filename,
          paidAt: new Date(),
        },
      });
    } catch (err) {
      console.error("BILL UPDATE FAIL:", err);
    }

    console.log("✅ SUCCESS");

    res.json({ message: "ok", payment });

  } catch (err) {
    console.error("💥 PAYMENT CRASH:", err);
    res.status(500).json({ error: err.message });
  }
});

export default payments;