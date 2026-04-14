// utils/verifyLineToken.js

// ❌ ไม่ต้องใช้ node-fetch แล้ว (ลบทิ้ง)
// import fetch from "node-fetch";

export async function verifyLineToken(accessToken) {
  if (!accessToken) {
    console.error("❌ ไม่พบ accessToken");
    throw new Error("missing_token");
  }

  try {
    console.log("🔑 TOKEN:", accessToken.slice(0, 20), "...");

    // 🔥 กันค้าง (timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await res.text();

    if (!res.ok) {
      console.error("❌ LINE VERIFY FAIL:", text);

      if (text.includes("expired") || text.includes("invalid")) {
        throw new Error("expired_token");
      }

      throw new Error("invalid_token");
    }

    const data = JSON.parse(text);

    if (!data?.userId) {
      throw new Error("invalid_response");
    }

    return {
      userId: data.userId,
      displayName: data.displayName,
    };
  } catch (err) {
    console.error("❌ verifyLineToken ERROR:", err);

    // 🔥 แยก error ให้ชัด (จะ debug ง่ายขึ้นมาก)
    if (err.name === "AbortError") {
      throw new Error("timeout_line_api");
    }

    if (err.code === "ENOTFOUND") {
      throw new Error("dns_error");
    }

    if (err.message === "fetch failed") {
      throw new Error("line_api_unreachable");
    }

    throw new Error(err.message || "verify_failed");
  }
}
