// src/modules/Payments/paymentService.ts
import { paymentRepository } from "./paymentRepository";
import { notifyUser } from "../../utils/lineNotify";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { PaymentInput } from "./paymentModel";

// 🗓️ ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบไทย
const formatThaiDate = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const paymentService = {
  // 💸 ฟังก์ชันสร้างข้อมูลการชำระเงิน
  async createPayment(input: PaymentInput) {
    const { billId, accessToken, slip } = input;

    if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE LIFF");
    if (!slip) throw new Error("ต้องแนบสลิปการชำระ");

    // ✅ ตรวจสอบ token จาก LINE และดึง userId + displayName
    const { userId } = await verifyLineToken(accessToken);

    // 👤 ตรวจสอบลูกค้า
    const customer = await paymentRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    // 🧾 ตรวจสอบบิล
    const bill = await paymentRepository.findBillById(billId);
    if (!bill) throw new Error("ไม่พบบิล");
    if (bill.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์ส่งสลิปสำหรับบิลนี้");
    if (bill.status === 1) throw new Error("บิลนี้ชำระแล้ว");

    // ✅ ตรวจสอบว่ามีข้อมูลลูกค้าใน bill จริง
    if (!bill.customer) {
      throw new Error("ไม่พบข้อมูลลูกค้าของบิลนี้");
    }

    // 📤 อัปโหลดสลิปไป Supabase
    const slipUrl = await paymentRepository.uploadSlipToSupabase(slip);

    // 💾 บันทึกข้อมูลลงฐานข้อมูล
    const [payment, updatedBill] = await paymentRepository.createPaymentAndUpdateBill(
      billId,
      slipUrl,
      bill.customerId
    );

    // ✅ สร้างข้อความแจ้งเตือนผู้ดูแล
    const adminMsg = `📢 มีการชำระบิลใหม่เข้ามา
ของคุณ : ${bill.customer.userName}
-----------ข้อมูลลูกค้า----------
ชื่อ : ${bill.customer.fullName}
ห้อง : ${bill.room?.number ?? "-"}
เบอร์โทร : ${bill.customer.cphone}
รหัสบิล : ${bill.billId}
วันที่ชำระ : ${formatThaiDate(bill.createdAt)}
สลิป: ${bill.slipUrl || "ไม่มี"}
-------------------
สามารถตรวจสอบได้ที่ : https://smartdorm-admin.biwbong.shop`;

    // ✅ สร้างข้อความแจ้งเตือนลูกค้า
    const userMsg = `📢 คุณได้ส่งสลิปการชำระบิลเรียบร้อยแล้ว
-----------ข้อมูลลูกค้า----------
รหัสบิล : ${bill.billId}
รหัสการชำระบิล : ${payment.paymentId}
ยอดชำระ : ${bill.total} บาท
วันที่ชำระ : ${formatThaiDate(payment.createdAt)}
--------------------
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉 ครับ`;

    // 📲 ส่งแจ้งเตือนผ่าน LINE
    await notifyUser(bill.customer.userId, userMsg);
    if (process.env.ADMIN_LINE_ID) {
      await notifyUser(process.env.ADMIN_LINE_ID, adminMsg);
    }

    return { payment, bill: updatedBill };
  },
};