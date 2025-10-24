import fetch from "node-fetch";

export interface LineProfile {
  userId: string;
  displayName: string;
}

/**
 * ตรวจสอบ Token จาก LINE LIFF แล้วดึง userId + displayName
 */
export async function verifyLineToken(
  accessToken: string
): Promise<LineProfile> {
  if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE");

  const res = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token LINE ไม่ถูกต้องหรือหมดอายุ: ${err}`);
  }

  const data = (await res.json()) as { userId: string; displayName: string };
  return { userId: data.userId, displayName: data.displayName };
}
