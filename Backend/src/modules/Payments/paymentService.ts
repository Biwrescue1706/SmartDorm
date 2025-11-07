// src/modules/Payments/paymentService.ts
import { paymentRepository } from "./paymentRepository";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { PaymentInput } from "./paymentModel";
import { sendFlexMessage } from "../../utils/lineFlex";

// 🗓️ แปลงวันที่ไทย
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

    // ✅ ตรวจสอบ token จาก LINE
    const { userId } = await verifyLineToken(accessToken);

    // 👤 ตรวจสอบลูกค้า
    const customer = await paymentRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    // 🧾 ตรวจสอบบิล
    const bill = await paymentRepository.findBillById(billId);
    if (!bill) throw new Error("ไม่พบบิล");
    if (!bill.booking) throw new Error("ไม่พบข้อมูล Booking ของบิลนี้");
    if (bill.status === 1) throw new Error("บิลนี้ชำระแล้ว");

    // 📤 อัปโหลดสลิป
    const slipUrl = await paymentRepository.uploadSlipToSupabase(slip);

    // 💾 บันทึกข้อมูลการชำระ
    const [payment, updatedBill] =
      await paymentRepository.createPaymentAndUpdateBill(
        billId,
        slipUrl,
        customer.customerId
      );

    const customerDetailUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;
    const adminUrl = `https://smartdorm-admin.biwbong.shop`;

    // ✅ แจ้งลูกค้า (ใช้ userId จาก customer)
    if (bill.customer?.userId) {
      await sendFlexMessage(
        bill.customer.userId,
        "💰 ส่งสลิปการชำระเงินสำเร็จแล้ว",
        [
          { label: "รหัสบิล", value: bill.billId },
          { label: "รหัสการชำระ", value: payment.paymentId },
          { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
          { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
          { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
          { label: "สถานะ", value: "ชำระเงินแล้ว", color: "#f39c12" },
        ],
        "🔗 ดูรายละเอียดบิลของคุณ",
        customerDetailUrl
      );
    }

    // ✅ แจ้งแอดมิน
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีการชำระบิลใหม่เข้ามา",
        [
          { label: "รหัสบิล", value: bill.billId },
          { label: "ชื่อผู้เช่า", value: bill.booking.fullName ?? "-" },
          { label: "🏠 ห้อง", value: bill.room?.number ?? "-" },
          { label: "เบอร์โทร", value: bill.booking.cphone ?? "-" },
          { label: "ยอดชำระ", value: `${bill.total.toLocaleString()} บาท` },
          { label: "วันที่ชำระ", value: formatThaiDate(payment.createdAt) },
          { label: "สลิป", value: "[ดูสลิป](" + slipUrl + ")" },
        ],
        "🔗 เปิดในระบบ Admin",
        adminUrl
      );
    }

    return { payment, bill: updatedBill };
  },
};