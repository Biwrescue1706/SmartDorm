// src/modules/qr.js
import { Router } from "express";
import fetch from "node-fetch";

const Qr = Router();

const KB_BASE = "https://openapi-sandbox.kasikornbank.com";

// ค่าตามโจทย์ Exercise
const PARTNER_ID = "PTR1051673";
const PARTNER_SECRET = "d4bded59200547bc85903574a293831b";
const MERCHANT_ID = "KB102057149704";

// ฟังก์ชันสร้าง Thai QR ด้วย KBank
Qr.get("/:amount", async (req, res) => {
  try {
    const { amount } = req.params;

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).send("จำนวนเงินไม่ถูกต้อง");
    }

    // ต้องมี access token จากขั้นตอน Get Credential
    const token = process.env.KBANK_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).send("ยังไม่ได้ตั้งค่า KBANK_ACCESS_TOKEN");
    }

    const body = {
      partnerTransactionUid: "PARTNERTEST0001",
      partnerId: PARTNER_ID,
      partnerSecret: PARTNER_SECRET,
      requestDt: new Date().toISOString(),
      merchantId: MERCHANT_ID,
      qrType: "3",
      amount: Number(amount).toFixed(2),
      currencyCode: "THB",
      reference1: "INV001",
      reference2: "HELLOWORLD",
      reference3: "INV001",
      reference4: "INV001",
    };

    const kbRes = await fetch(`${KB_BASE}/v1/qrpayment/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-test-mode": "true",
        "env-id": "QR002",
      },
      body: JSON.stringify(body),
    });

    const data = await kbRes.json();
    if (!kbRes.ok) {
      throw new Error(data?.message || "สร้าง QR ไม่สำเร็จ");
    }

    // KBank จะส่ง qrImage (base64) กลับมา
    if (data.qrImage) {
      const buffer = Buffer.from(data.qrImage, "base64");
      res.setHeader("Content-Type", "image/png");
      return res.send(buffer);
    }

    // หรือส่งเป็นข้อมูลดิบกลับไป
    return res.json(data);
  } catch (err) {
    console.error("❌ [KBANK QR] Error:", err.message);
    res.status(500).send(err.message || "ไม่สามารถสร้าง QR Code ได้");
  }
});

export default Qr;