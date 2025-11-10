// src/modules/payment.ts
import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const paymentRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ⚙️ ตั้งค่า Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🕒 Helper
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// 💸 สร้าง Payment + ส่งสลิป
paymentRouter.post("/create", upload.single("slip"), async (req, res) => {
  try {
    const { billId, accessToken } = req.body;
    const slip = req.file;

    if (!billId) throw new Error("ไม่พบรหัสบิล");
    if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE LIFF");
    if (!slip) throw new Error("ต้องแนบสลิปการชำระเงิน");

    //  ตรวจสอบ token จาก LINE
    const { userId } = await verifyLineToken(accessToken);

    //  ดึงข้อมูลลูกค้า
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้าในระบบ");

    //  ดึงข้อมูลบิล
    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: {
        room: true,
        booking: true,
        customer: true,
      },
    });

    if (!bill) throw new Error("ไม่พบบิลนี้");
    if (bill.status === 1) throw new Error("บิลนี้ชำระแล้ว");

    //  อัปโหลดสลิปขึ้น Supabase
    const filename = `slip_${Date.now()}_${slip.originalname}`;
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

    //  บันทึกลงฐานข้อมูล (transaction)
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
        data: { status: 1 },
      }),
    ]);

    const customerUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;
    const adminUrl = `https://smartdorm-admin.biwbong.shop`;

    // 🔹 แจ้งลูกค้า
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
            { label: "สถานะ", value: " ชำระเงินแล้ว", color: "#27ae60" },
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

    // 🔹 แจ้งแอดมิน
    try {
      if (process.env.ADMIN_LINE_ID) {
        await sendFlexMessage(
          process.env.ADMIN_LINE_ID,
          "📢 มีการชำระบิลใหม่เข้ามา",
          [
            { label: "รหัสบิล", value: bill.billId },
            { label: "ชื่อผู้เช่า", value: bill.booking?.fullName ?? "-" },
            { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
            { label: "เบอร์โทร", value: bill.booking?.cphone ?? "-" },
            { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
            { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
          ],
          [
            {
              label: "เปิดในระบบ Admin",
              url: adminUrl,
              style: "secondary",
            },
          ]
        );
      }
    } catch (err: any) {
      console.warn("⚠️ แจ้งเตือนแอดมินไม่สำเร็จ:", err.message);
    }

    //  ส่ง Response กลับ
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
