import html2pdf from "html2pdf.js";
import type { Bill } from "../types/All";

export const useExportBillPDF = () => {
  return (bill: Bill, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;

    const docName =
      bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน";

    const filename = `${docName}-${bill.billId}.pdf`;

    html2pdf()
      .set({
        margin: 5,
        filename,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      })
      .from(ref.current)
      .save();
  };
};