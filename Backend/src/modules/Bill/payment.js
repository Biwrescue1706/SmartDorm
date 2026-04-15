//src/modules/Bill/payment.js
import { Router } from "express";
import multer from "multer";
import prisma from "../../prisma.js";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../../utils/verifyLineToken.js";
import { sendFlexMessage } from "../../utils/lineFlex.js";
import { toThaiString } from "../../utils/timezone.js";

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

    // 🔥 verify user
    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });
    if (!customer) return res.status(400).json({ error: "no customer" });

    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: {
        customer: true,
        room: true,
        booking: true,
      },
    });
    if (!bill) return res.status(400).json({ error: "bill not found" });

    // 🔥 1. create/update payment
    const payment = await prisma.payment.upsert({
      where: { billId },
      update: {
        paidAt: new Date(),
      },
      create: {
        billId,
        customerId: customer.customerId,
        paidAt: new Date(),
      },
    });

    // 🔥 2. delete old slip
    if (bill.slipPath) {
      try {
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .remove([bill.slipPath]);
      } catch {
        console.log("⚠️ delete old slip fail (skip)");
      }
    }

    // 🔥 3. generate filename
    const ext = slip.originalname.split(".").pop();
    const now = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `Payment-slips/payment-${payment.paymentId}-${now}.${ext}`;

    // 🔥 4. upload
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
      console.error("❌ UPLOAD ERROR:", err);
      return res.status(500).json({ error: "upload failed" });
    }

    // 🔥 5. update payment
    await prisma.payment.update({
      where: { paymentId: payment.paymentId },
      data: {
        slipUrl,
        slipPath: filename,
      },
    });

    // 🔥 6. update bill
    await prisma.bill.update({
      where: { billId },
      data: {
        billStatus: 2,
        slipUrl,
        slipPath: filename,
        paidAt: new Date(),
      },
    });

    // 🔥 7. LINE NOTIFY
    try {
      const ADMIN_URL = process.env.ADMIN_URL;
      const customerUrl = `${process.env.details_URL}/bill/${bill.billId}`;

      console.log("📩 LINE USER:", bill.customer?.userId);
      console.log("🌐 CUSTOMER URL:", customerUrl);

      // 👉 แจ้งลูกค้า
      if (bill.customer?.userId) {
        await sendFlexMessage(
          bill.customer.userId,
          "💰 รับสลิปการชำระเงินแล้ว",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "ห้อง", value: bill.room?.number ?? "-" },
            { label: "ยอด", value: `${bill.total.toLocaleString()} บาท` },
            { label: "วันที่ชำระ", value: toThaiString(payment.paidAt) },
            { label: "สถานะ", value: "รอตรวจสอบ", color: "#f1c40f" },
          ],
          [
            {
              label: "ดูบิล",
              url: customerUrl,
              style: "primary",
            },
          ]
        );
      }

      // 👉 แจ้งแอดมิน
      if (process.env.ADMIN_LINE_ID) {
        await sendFlexMessage(
          process.env.ADMIN_LINE_ID,
          "📢 มีการชำระเงินใหม่",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "ผู้เช่า", value: bill.booking?.fullName ?? "-" },
            { label: "ห้อง", value: bill.room?.number ?? "-" },
            { label: "ยอด", value: `${bill.total.toLocaleString()} บาท` },
          ],
          [
            {
              label: "เปิดระบบ Admin",
              url: ADMIN_URL,
              style: "primary",
            },
          ]
        );
      }
    } catch (err) {
      console.error("❌ LINE NOTIFY FAIL:", err.response?.data || err.message);
    }

    console.log("✅ SUCCESS");

    res.json({
      message: "ok",
      paymentId: payment.paymentId,
      slipUrl,
    });

  } catch (err) {
    console.error("💥 PAYMENT CRASH:", err);
    res.status(500).json({ error: err.message });
  }
});

export default payments;