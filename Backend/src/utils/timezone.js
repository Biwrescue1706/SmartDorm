// utils/timezone.js

// คืนค่า Date ตามเวลาไทย (UTC+7)
export const thailandTime = (date = new Date()) => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60000);
};

// แปลง Date เป็น string ภาษาไทย
export const toThaiString = (date) => {
  if (!date) return null;

  return new Date(date).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// แปลง Date เป็นวันที่ไทย (ไม่มีเวลา)
export const toThaiDate = (date) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};