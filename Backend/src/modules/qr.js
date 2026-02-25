// src/modules/qr.js
import { Router } from "express";
import fetch from "node-fetch";

const Qr = Router();

/* สร้าง QR Code สำหรับชำระเงินผ่าน PromptPay */
Qr.get("/:amount", async (req, res) => {
  try {
    const { amount } = req.params;

    /* หมายเลข PromptPay ที่ใช้รับเงิน */
    const promptpayId = "0611747731";

    /* ตรวจสอบว่าจำนวนเงินเป็นตัวเลขถูกต้อง */
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).send("จำนวนเงินไม่ถูกต้อง");
    }

    /* สร้าง URL QR Code จากบริการ promptpay.io */
    const url = `https://promptpay.io/${promptpayId}/${Number(
      amount
    ).toFixed(2)}.png`;

    /* เรียก API เพื่อดึงรูป QR Code */
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("ไม่สามารถสร้าง QR Code ได้");
    }

    /* แปลง response เป็น buffer รูปภาพ */
    const buffer = Buffer.from(await response.arrayBuffer());

    /* กำหนด header ให้ส่งกลับเป็นไฟล์ PNG */
    res.setHeader("Content-Type", "image/png");

    /* อนุญาต CORS สำหรับเรียกใช้จาก frontend */
    res.setHeader("Access-Control-Allow-Origin", "*");

    /* ส่งรูป QR Code กลับไปยัง client */
    res.send(buffer);

  } catch (err) {
    console.error("❌ [QR] Error:", err.message);
    res.status(500).send("ไม่สามารถสร้าง QR Code ได้");
  }
});

export default Qr;