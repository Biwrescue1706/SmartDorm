// src/utils/thaiDate.ts
export const formatThaiDate = (date?: string | null) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatThaiTime = (date?: string | null) => {
  if (!date) return "-";

  const time = new Date(date).toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${time.replace(":", ":")} น.`;
};