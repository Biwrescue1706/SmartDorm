// src/modules/Payments/paymentService.ts
import { paymentRepository } from "./paymentRepository";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { PaymentInput } from "./paymentModel";
import { sendFlexMessage } from "../../utils/lineFlex";

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
    const [payment, updatedBill] =
      await paymentRepository.createPaymentAndUpdateBill(
        billId,
        slipUrl,
        bill.customerId
      );

    const customerDetailUrl = `https://smartdorm-paymentbill.biwbong.shop`;
    const adminUrl = `https://smartdorm-admin.biwbong.shop`;
    
    // ✅ แจ้งเตือนลูกค้าด้วย Flex Message
    await sendFlexMessage(
      bill.customer.userId,
      "💰 ส่งสลิปการชำระเงินสำเร็จแล้ว",
      [
        { label: "รหัสบิล", value: bill.billId },
        { label: "รหัสการชำระ", value: payment.paymentId },
        { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
        { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
        { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
        {
          label: "สถานะ",
          value: "ชำระเงินแล้ว",
          color: "#f39c12",
        },
      ],
      "🔗 ดูรายละเอียดบิลของคุณ",
      customerDetailUrl
    );

    /* ✅ แจ้งแอดมินด้วย Flex Message */
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีการชำระบิลใหม่เข้ามา",
        [
          { label: "รหัสบิล", value: bill.billId },
          { label: "ชื่อผู้เช่า", value: bill.customer.fullName },
          { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
          { label: "เบอร์โทร", value: bill.customer.cphone },
          { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
          { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
          {
            label :"สลิป" ,value : bill.slipUrl || "ไม่มี"
          },
        ],
        "🔗 เปิดในระบบ Admin",
        adminUrl
      );
    }

    return { payment, bill: updatedBill };
  },
};
