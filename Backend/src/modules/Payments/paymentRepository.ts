// src/modules/Payments/paymentRepository.ts
import prisma from "../../prisma";
import { createClient } from "@supabase/supabase-js";

// ⚙️ ตั้งค่า Supabase client สำหรับอัปโหลดสลิป
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const paymentRepository = {
  // 👤 ค้นหาลูกค้าจาก userId (ที่ได้จาก verifyLineToken)
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findFirst({ where: { userId } });
  },

  // 🧾 ดึงข้อมูลบิลตาม billId
  async findBillById(billId: string) {
    return prisma.bill.findUnique({
      where: { billId },
      include: { customer: true, room: true },
    });
  },

  // 📸 อัปโหลดสลิปไปยัง Supabase Storage
  async uploadSlipToSupabase(file: Express.Multer.File) {
    const filename = `slip_${Date.now()}_${file.originalname}`;
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    return data.publicUrl;
  },
  // 💾 บันทึกข้อมูลการชำระเงินและอัปเดตสถานะบิล
  async createPaymentAndUpdateBill(
    billId: string,
    slipUrl: string,
    customerId: string
  ) {
    return prisma.$transaction([
      prisma.payment.create({
        data: { slipUrl, billId, customerId },
      }),
      prisma.bill.update({
        where: { billId },
        data: { status: 1, slipUrl }, // 2 = รอตรวจสอบ
      }),
    ]);
  },
};
