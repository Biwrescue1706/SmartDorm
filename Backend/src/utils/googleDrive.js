// src/utils/googleDrive.js
import axios from "axios";

const GAS_URL = process.env.GAS_UPLOAD_URL;

export const uploadToDrive = async (buffer, filename, mimeType, folderId) => {
  const base64 = buffer.toString("base64");

  const res = await axios.post(GAS_URL, {
    filename,
    mimeType,
    folderId,
    base64,
  });

  if (!res.data?.ok) {
    throw new Error(res.data?.error || "Upload failed");
  }

  return res.data.url;
};

// ถ้ายังไม่จำเป็น ลบได้ หรือค่อยทำทีหลัง
export const deleteFromDriveByUrl = async (_url) => {
  // ยังไม่รองรับลบผ่าน GAS
};
