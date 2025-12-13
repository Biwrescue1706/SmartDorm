// src/modules/payment.ts
import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";
import { BillStatus } from "@prisma/client";

const paymentRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ===================== Supabase ===================== */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/* ===================== Helpers ===================== */
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];

const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* =====================================================
   📌 CREATE PAYMENT + UPLOAD SLIP
===================================================== */
paymentRouter.post("/create", upload.single("slip"), async (req, res) => {
  try {
    const { billId, accessToken } = req.body;
    const slip = req.file;

    if (!billId) throw new Error("ไม่พบรหัสบิล");
    if (!accessToken) throw new Error("ไม่มี accessToken");
    if (!slip) throw new Error("ต้องแนบสลิปการชำระเงิน");

    /* 1️⃣ ตรวจสอบ LINE token */
    const { userId } = await verifyLineToken(accessToken);

    /* 2️⃣ หา customer */
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    /* 3️⃣ ดึงบิล */
    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: { room: true, booking: true, customer: true },
    });
    if (!bill) throw new Error("ไม่พบบิลนี้");

    if (bill.status === BillStatus.PAID)
      throw new Error("บิลนี้ชำระแล้ว");
    if (bill.status === BillStatus.VERIFYING)
      throw new Error("บิลนี้อยู่ระหว่างตรวจสอบ");

    /* 4️⃣ ตั้งชื่อไฟล์ */
    const created = new Date(bill.createdAt)
      .toISOString()
      .replace(/[:.]/g, "-");

    const filename = `Payment-slips/Payment-slip_${bill.billId}_${created}`;

    /* 5️⃣ Upload slip */
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filename, slip.buffer, {
        contentType: slip.mimetype,
        upsert: true,
      });

    if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    const slipUrl = data.publicUrl;

    /* 6️⃣ บันทึก DB (Transaction) */
    const [payment, updatedBill] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId,
          customerId: customer.customerId,
          slipUrl,
        },
      }),
      prisma.bill.update({
        where: { billId },
        data: {
          status: BillStatus.VERIFYING,
          slipUrl,
        },
      }),
    ]);

    const billUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;

    /* 🔔 แจ้งลูกค้า */
    if (bill.customer?.userId) {
      await sendFlexMessage(
        bill.customer.userId,
        "💰 SmartDorm รับสลิปชำระเงินแล้ว",
        [
          { label: "รหัสบิล", value: bill.billId },
          { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
          { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
          { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
          {
            label: "สถานะ",
            value: "รอตรวจสอบ",
            color: "#f1c40f",
          },
        ],
        [{ label: "ดูบิล", url: billUrl, style: "primary" }]
      );
    }

    /* 🔔 แจ้งแอดมิน */
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีการชำระบิลใหม่",
        [
          { label: "รหัสบิล", value: bill.billId },
          { label: "ผู้เช่า", value: bill.booking?.fullName ?? "-" },
          { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
          { label: "ยอด", value: `${bill.total.toLocaleString()} บาท` },
          { label: "วันที่", value: formatThaiDate(payment.createdAt) },
        ],
        [
          {
            label: "เปิดระบบ Admin",
            url: "https://smartdorm-admin.biwbong.shop",
            style: "primary",
          },
        ]
      );
    }

    console.log(`[${logTime()}] รับสลิปบิล ${bill.billId} สำเร็จ`);
    res.json({ message: "ส่งสลิปสำเร็จ", payment, bill: updatedBill });
  } catch (err: any) {
    console.error("❌ [payment/create]", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default paymentRouter;
