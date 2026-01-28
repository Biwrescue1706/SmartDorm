// src/modules/qr.js
import { Router } from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const Qr = Router();

const SCB_BASE = "https://api-sandbox.partners.scb";
const API_KEY = process.env.SCB_API_KEY;
const API_SECRET = process.env.SCB_API_SECRET;
const BILLER_ID = process.env.SCB_BILLER_ID || "259434802061397";

// ขอ Access Token จาก SCB
async function getAccessToken() {
  const res = await fetch(`${SCB_BASE}/v1/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      requestUId: crypto.randomUUID(),
      resourceOwnerId: API_KEY,
    },
    body: JSON.stringify({
      applicationKey: API_KEY,
      applicationSecret: API_SECRET,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.status?.description || "ขอ token ไม่สำเร็จ");
  }

  return data.data.accessToken;
}

// สร้าง QR จากจำนวนเงิน
Qr.get("/:amount", async (req, res) => {
  try {
    const { amount } = req.params;

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).send("จำนวนเงินไม่ถูกต้อง");
    }

    const token = await getAccessToken();

    const body = {
      qrType: "PP",
      ppType: "BILLERID",
      ppId: BILLER_ID,
      amount: Number(amount).toFixed(2),
      ref1: "SMARTDORM",
      ref2: Date.now().toString(),
      ref3: "QR",
    };

    const scbRes = await fetch(`${SCB_BASE}/v2/payment/qrcode/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        requestUId: crypto.randomUUID(),
        resourceOwnerId: API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await scbRes.json();
    if (!scbRes.ok) {
      throw new Error(data?.status?.description || "สร้าง QR ไม่สำเร็จ");
    }

    const { qrImage, qrUrl } = data.data;

    // ถ้า SCB ส่งเป็น URL
    if (qrUrl) {
      return res.json({ qrUrl });
    }

    // ถ้า SCB ส่งเป็น base64 image
    if (qrImage) {
      const buffer = Buffer.from(qrImage, "base64");
      res.setHeader("Content-Type", "image/png");
      return res.send(buffer);
    }

    throw new Error("ไม่พบข้อมูล QR จาก SCB");
  } catch (err) {
    console.error("❌ [SCB QR] Error:", err.message);

    // fallback เป็น QR PromptPay ปกติแทน
    const promptpayId = "0611747731"; // เบอร์หอ
    const { amount } = req.params;
    const url = `https://promptpay.io/${promptpayId}/${amount}.png`;

    try {
      const r = await fetch(url);
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader("Content-Type", "image/png");
      return res.send(buf);
    } catch {
      return res.status(500).send("ไม่สามารถสร้าง QR ได้");
    }
  }
});

export default Qr;