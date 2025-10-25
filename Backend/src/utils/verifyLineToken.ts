// src/utils/verifyLineToken.ts
import fetch from "node-fetch";

export interface LineProfile {
  userId: string;
  displayName: string;
}

/**
 * ✅ ตรวจสอบ Access Token ของ LINE LIFF ผ่าน API
 * - ถ้า token ถูกต้อง → คืน userId + displayName
 * - ถ้า token หมดอายุ / invalid → โยน error ให้ frontend จัดการ
 */
export async function verifyLineToken(
  accessToken: string
): Promise<LineProfile> {
  if (!accessToken) {
    console.error("❌ ไม่พบ accessToken ที่ส่งมาจาก Frontend");
    throw new Error("missing_token");
  }

  try {
    const res = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // ✅ ถ้า Token หมดอายุ / ผิดพลาด
    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ LINE VERIFY FAIL:", errText);

      if (errText.includes("expired") || errText.includes("invalid")) {
        throw new Error("expired_token");
      }

      throw new Error("invalid_token");
    }

    // ✅ ถ้า Token ถูกต้อง
    const data = (await res.json()) as { userId: string; displayName: string };

    // ตรวจสอบว่าได้ข้อมูลจริงไหม
    if (!data?.userId || !data?.displayName) {
      throw new Error("invalid_response");
    }

    return { userId: data.userId, displayName: data.displayName };
  } catch (err: any) {
    console.error("❌ verifyLineToken() error:", err.message || err);
    throw new Error(err.message || "verify_failed");
  }
}
