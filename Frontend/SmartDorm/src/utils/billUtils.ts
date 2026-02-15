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

export const numberToThaiBaht = (num: number) => {
  const th = [
    "ศูนย์","หนึ่ง","สอง","สาม","สี่",
    "ห้า","หก","เจ็ด","แปด","เก้า",
  ];
  const unit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const readInt = (n: number) => {
    let s = "";
    const str = n.toString();
    for (let i = 0; i < str.length; i++) {
      const d = parseInt(str[i]);
      const u = unit[str.length - i - 1];
      if (d === 0) continue;
      if (u === "สิบ" && d === 1) s += "สิบ";
      else if (u === "สิบ" && d === 2) s += "ยี่สิบ";
      else if (u === "" && d === 1 && str.length > 1) s += "เอ็ด";
      else s += th[d] + u;
    }
    return s;
  };

  const [i, f] = num.toFixed(2).split(".");
  let result = readInt(parseInt(i)) + "บาท";
  if (f === "00") result += "ถ้วน";
  else result += readInt(parseInt(f)) + "สตางค์";
  return result;
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