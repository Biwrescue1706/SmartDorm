export const formatThai = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

export const statusText = (s: number) => {
  if (s === 0) return "ยังไม่ชำระ";
  if (s === 1) return "ชำระแล้ว";
  if (s === 2) return "กำลังตรวจสอบ";
  return "-";
};

export const statusColor = (s: number) => {
  if (s === 0) return "warning";
  if (s === 1) return "success";
  if (s === 2) return "info";
  return "-";
};