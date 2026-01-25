import fetch from "node-fetch";

// ---------------- ตรวจสอบ LINE LIFF Access Token ----------------
//  * ตรวจสอบ Access Token ของ LINE LIFF ผ่าน API
//  * - ถ้า token ถูกต้อง → คืน { userId, displayName }
//  * - ถ้า token หมดอายุ / invalid → throw error ให้ frontend จัดการ

export async function verifyLineToken(accessToken) {
  if (!accessToken) {
    console.error("❌ ไม่พบ accessToken ที่ส่งมาจาก Frontend");
    throw new Error("missing_token");
  }

  try {
    const res = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ LINE VERIFY FAIL:", errText);

      if (errText.includes("expired") || errText.includes("invalid")) {
        throw new Error("expired_token");
      }

      throw new Error("invalid_token");
    }

    const data = await res.json();

    if (!data?.userId || !data?.displayName) {
      throw new Error("invalid_response");
    }

    return {
      userId: data.userId,
      displayName: data.displayName,
    };
  } catch (err) {
    console.error("❌ verifyLineToken() error:", err.message || err);
    throw new Error(err.message || "verify_failed");
  }
}