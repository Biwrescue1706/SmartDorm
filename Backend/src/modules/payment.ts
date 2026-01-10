// src/modules/payment.ts
import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const payments = Router();
const upload = multer({ storage: multer.memoryStorage() });
const BASE_URL = "https://smartdorm-detail.biwbong.shop";
const ADMIN_URL = "https://smartdorm-admin.biwbong.shop";

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Helpers
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// CREATE PAYMENT + UPLOAD SLIP
payments.post("/create", upload.single("slip"), async (req, res) => {
  try {
    const { billId, accessToken } = req.body;
    const slip = req.file;

    if (!billId) throw new Error("ไม่พบรหัสบิล");
    if (!accessToken) throw new Error("ไม่มี accessToken");
    if (!slip) throw new Error("ต้องแนบสลิป");

    const { userId } = await verifyLineToken(accessToken);

    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: { room: true, booking: true, customer: true },
    });
    if (!bill) throw new Error("ไม่พบบิลนี้");
    if (bill.billStatus === 1) throw new Error("บิลนี้ชำระแล้ว");
    if (bill.billStatus === 2) throw new Error("บิลนี้รอตรวจสอบอยู่");

    // กันจ่ายบิลคนอื่น
    if (bill.customerId && bill.customerId !== customer.customerId) {
      throw new Error("คุณไม่มีสิทธิ์ชำระบิลนี้");
    }

    const created = new Date(bill.createdAt)
      .toISOString()
      .replace(/[:.]/g, "-");

    const filename = `Payment-slips/Payment-slip_${bill.billId}_${created}`;

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filename, slip.buffer, {
        contentType: slip.mimetype,
        upsert: true,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    const slipUrl = data.publicUrl;

    // สร้าง Payment + อัปเดต Bill
    const [payment, updatedBill] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId,
          customerId: customer.customerId,
          slipUrl,
          paidAt: new Date(),
        },
      }),
      prisma.bill.update({
        where: { billId },
        data: {
          billStatus: 2, // รอตรวจสอบ
          slipUrl,
          billDate: new Date(),
        },
      }),
    ]);

    const customerUrl = `${BASE_URL}/bill/${bill.billId}`;

    // แจ้งลูกค้า
    if (bill.customer?.userId) {
      await sendFlexMessage(
        bill.customer.userId,
        "💰 รับสลิปการชำระเงินแล้ว",
        [
          { label: "รหัสบิล", value: bill.billId },
          { label: "ห้อง", value: bill.room?.number ?? "-" },
          { label: "ยอด", value: `${bill.total.toLocaleString()} บาท` },
          { label: "วันที่ชำระ", value: formatThaiDate(payment.paidAt) },
          { label: "สถานะ", value: "รอตรวจสอบ", color: "#f1c40f" },
        ],
        [{ label: "ดูบิล", url: customerUrl, style: "primary" }]
      );
    }

    // แจ้งแอดมิน
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
            url: "https://smartdorm-admin.biwbong.shop",
            style: "primary",
          },
        ]
      );
    }

    console.log(`[${logTime()}] รับสลิปชำระเงิน บิล ${bill.billId} สำเร็จ`);

    res.json({ message: "ส่งสลิปสำเร็จ", payment, bill: updatedBill });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default payments;
