import fetch from "node-fetch";

export interface LineProfile {
  userId: string;
  displayName: string;
}

/**
 * ✅ ตรวจสอบ Token จาก LINE LIFF แล้วดึง userId + displayName
 * - ถ้า token หมดอายุ จะโยน error กลับไปให้ frontend จัดการ login ใหม่
 */
export async function verifyLineToken(accessToken: string): Promise<LineProfile> {
  if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE");

  const res = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ LINE VERIFY FAIL:", errText);

    // ✅ เพิ่มข้อความเฉพาะกรณี token หมดอายุ
    if (errText.includes("expired") || errText.includes("invalid")) {
      throw new Error("Token LINE หมดอายุหรือไม่ถูกต้อง กรุณา login ใหม่");
    }

    throw new Error(`ไม่สามารถตรวจสอบ token จาก LINE: ${errText}`);
  }

  const data = (await res.json()) as { userId: string; displayName: string };
  return { userId: data.userId, displayName: data.displayName };
}
