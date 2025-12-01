// src/modules/payment.ts
import { Router } from "express";
import multer from "multer";
import prisma  from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const paymentRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ⚙️ Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🕒 Helper
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ========================================================
   📌 CREATE PAYMENT + UPLOAD SLIP
   โครงสร้างสลิปใหม่:
   Payment-slips/Payment-slip_<billId>_<bill.createdAt>
======================================================== */
paymentRouter.post("/create", upload.single("slip"), async (req, res) => {
  try {
    const { billId, accessToken } = req.body;
    const slip = req.file;

    if (!billId) throw new Error("ไม่พบรหัสบิล");
    if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE LIFF");
    if (!slip) throw new Error("ต้องแนบสลิปการชำระเงิน");

    // 1) ตรวจสอบ token LINE
    const { userId } = await verifyLineToken(accessToken);

    // 2) หา customer
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้าในระบบ");

    // 3) ดึงข้อมูลบิล
    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: { room: true, booking: true, customer: true },
    });

    if (!bill) throw new Error("ไม่พบบิลนี้");
    if (bill.status === 1) throw new Error("บิลนี้ชำระแล้ว");
    if (bill.status === 2) throw new Error("บิลนี้รอการตรวจสอบสลิปอยู่");

    // --------------------------
    // 4) ตั้งชื่อไฟล์ใหม่ตามรูปแบบที่ต้องการ
    // --------------------------
    const created = new Date(bill.createdAt)
      .toISOString()
      .replace(/[:.]/g, "-");

    const filename = `Payment-slips/Payment-slip_${bill.billId}_${created}`;

    // 5) อัปโหลด Slip ไป Supabase
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filename, slip.buffer, {
        contentType: slip.mimetype,
        upsert: true,
      });

    if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ: " + error.message);

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    const slipUrl = data.publicUrl;

    // 6) บันทึกลง DB (Transaction)
    const [payment, updatedBill] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          slipUrl,
          billId,
          customerId: customer.customerId,
        },
      }),
      prisma.bill.update({
        where: { billId },
        data: {
          status: 2,
          slipUrl, // ให้ Bill ใช้ slip เดียวกับ Payment
        },
      }),
    ]);

    const customerUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;

    // ============================
    // 🔔 LINE Notify ผู้เช่า
    // ============================
    try {
      if (bill.customer?.userId) {
        await sendFlexMessage(
          bill.customer.userId,
          "💰 SmartDorm รับสลิปชำระเงินของคุณแล้ว",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "รหัสการชำระ", value: payment.paymentId },
            { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
            { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
            { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
            {
              label: "สถานะ",
              value: "รอตรวจสอบการชำระเงิน",
              color: "#fff204ff",
            },
          ],
          [
            {
              label: "ดูรายละเอียดบิลของคุณ",
              url: customerUrl,
              style: "primary",
            },
          ]
        );
      }
    } catch (err: any) {
      console.warn("⚠️ แจ้งเตือนลูกค้าไม่สำเร็จ:", err.message);
    }

    // ============================
    // 🔔 LINE Notify แอดมิน
    // ============================
    try {
      if (process.env.ADMIN_LINE_ID) {
        await sendFlexMessage(
          process.env.ADMIN_LINE_ID,
          "📢 มีการชำระบิลใหม่เข้ามา",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "ชื่อผู้เช่า", value: bill.booking?.fullName ?? "-" },
            { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
            { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
            { label: "เบอร์โทร", value: bill.booking?.cphone ?? "-" },
            { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
          ],
          [
            {
              label: "เปิดในระบบ Admin",
              url: "https://smartdorm-admin.biwbong.shop",
              style: "primary",
            },
          ]
        );
      }

      console.log(
        `[${logTime()}] แจ้งเตือนการชำระเงิน รหัสบิล ${bill.billId} สำเร็จ`
      );
    } catch (err: any) {
      console.warn("⚠️ แจ้งเตือนแอดมินไม่สำเร็จ:", err.message);
    }

    res.json({
      message: "ส่งสลิปสำเร็จ",
      payment,
      bill: updatedBill,
    });
  } catch (err: any) {
    console.error("❌ [payment/create] Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default paymentRouter;
