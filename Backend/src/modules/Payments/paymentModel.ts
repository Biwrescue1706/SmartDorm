// src/modules/Payments/paymentModel.ts

// 💰 โครงสร้างข้อมูลการส่งสลิปชำระเงิน
export interface PaymentInput {
  billId: string;              // ไอดีของบิล
  accessToken: string;         // token จาก LINE LIFF
  slip?: Express.Multer.File;  // ไฟล์สลิป (อัปโหลดผ่าน multipart)
}