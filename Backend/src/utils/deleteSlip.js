//utils/deleteSlip.js

import { createClient } from "@supabase/supabase-js";

// 🔹 ใช้ env ของคุณ
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/*
URL ตัวอย่าง:
https://xxx.supabase.co/storage/v1/object/public/uploads/Payment-slips/file.png

bucket = uploads
objectPath = Payment-slips/file.png
*/

export const deleteSlip = async (url) => {
  try {
    if (!url) return;

    // แยก path หลัง /object/public/
    const parts = url.split("/storage/v1/object/public/");
    if (parts.length < 2) {
      console.warn("⚠️ URL ไม่ถูกต้อง:", url);
      return;
    }

    const fullPath = parts[1];
    const [bucket, ...rest] = fullPath.split("/");

    if (!bucket || rest.length === 0) {
      console.warn("⚠️ ไม่พบ bucket/path:", fullPath);
      return;
    }

    // 🔒 กันลบ bucket อื่นโดยไม่ตั้งใจ
    if (bucket !== "uploads") {
      console.warn("⚠️ ไม่อนุญาตลบ bucket นี้:", bucket);
      return;
    }

    const objectPath = rest.join("/");

    const { error } = await supabase.storage
      .from(bucket)
      .remove([objectPath]);

    if (error) throw error;

    console.log("🗑 ลบสลิปสำเร็จ:", objectPath);
  } catch (err) {
    console.error("❌ deleteSlip error:", err.message);
  }
};