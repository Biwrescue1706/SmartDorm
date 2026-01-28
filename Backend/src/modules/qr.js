// src/modules/qr.js
import { Router } from "express";
import fetch from "node-fetch";

const Qr = Router();

// สร้าง QR Code สำหรับ PromptPay Payment
Qr.get("/:amount", async (req, res) => {
  try {
    const { amount } = req.params;
    const promptpayId = "0611747731"; // หมายเลข PromptPay ของ SmartDorm

    // ตรวจสอบจำนวนเงิน
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).send("จำนวนเงินไม่ถูกต้อง");
    }

    // สร้าง URL QR จาก promptpay.io
    const url = `https://promptpay.io/${promptpayId}/${Number(amount).toFixed(
      2
    )}.png`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("ไม่สามารถสร้าง QR Code ได้");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // ส่งกลับเป็นรูป PNG
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(buffer);
  } catch (err) {
    console.error("❌ [QR] Error:", err.message);
    res.status(500).send("ไม่สามารถสร้าง QR Code ได้");
  }
});

export default Qr;