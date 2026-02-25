// src/utils/thaiDate.ts
const normalizeDate = (date?: string | null) => {
  if (!date) return null;

  // แปลง "2026-02-21 04:59:51.506"
  // → "2026-02-21T04:59:51.506"
  const iso = date.replace(" ", "T");

  const d = new Date(iso);

  if (isNaN(d.getTime())) return null;

  return d;
};

export const formatThaiDate = (date?: string | null) => {
  const d = normalizeDate(date);
  if (!d) return null;

  return d.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatThaiTime = (date?: string | null) => {
  const d = normalizeDate(date);
  if (!d) return null;

  const time = d.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${time.replace(":", ".")} น.`;
};