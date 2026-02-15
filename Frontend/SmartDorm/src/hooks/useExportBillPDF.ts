import html2pdf from "html2pdf.js";
import { Bill } from "../types/All";

export const useExportBillPDF = () => {
  return (bill: Bill, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;

    const docName = bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน";
    const filename = `${docName}-${bill.room?.number ?? "-"}.pdf`;

    html2pdf()
      .set({
        margin: 5,
        filename,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(ref.current)
      .save();
  };
};