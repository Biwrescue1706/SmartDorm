// src/modules/qr.ts
// 🚚 Imports
import { Router } from "express";
import fetch from "node-fetch";

// 🌐 Router
const qrRouter = Router();

//  สร้าง QR Code สำหรับ PromptPay Payment
qrRouter.get("/:amount", async (req, res) => {
  try {
    const { amount } = req.params;
    const promptpayId = "0611747731"; // 🔢 หมายเลข PromptPay ของ SmartDorm

    // ตรวจสอบจำนวนเงิน
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).send("จำนวนเงินไม่ถูกต้อง");
    }

    // เรียก API สร้าง QR
    const url = `https://promptpay.io/${promptpayId}/${amount}.png`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("ไม่สามารถสร้าง QR Code ได้");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // ส่งกลับภาพ QR
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Access-Control-Allow-Origin", "*"); //  ป้องกัน CORS
    res.send(buffer);
  } catch (err: any) {
    console.error("❌ [QR] Error:", err.message);
    res.status(500).send(err.message || "ไม่สามารถสร้าง QR Code ได้");
  }
});

export default qrRouter;
