import html2pdf from "html2pdf.js";
import type { Bill } from "../types/All";
import type { RefObject } from "react";

export const useExportBillPDF = () => {
  return (bill: Bill, ref: RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;

    const docName =
      bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน";

    const d = new Date(bill.month);

    const day = d.getDate();
    const month = d.toLocaleDateString("th-TH", { month: "long" });
    const year = d.getFullYear() + 543;

    const thaiDate = `${day}-${month}-${year}`;
    const room = bill.room?.number ?? "-";

    const filename = `${docName}-ห้อง${room}-${thaiDate}.pdf`;

    const opt = {
      margin: 5,
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    html2pdf().set(opt).from(ref.current).save();
  };
};