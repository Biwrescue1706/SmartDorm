import type { Bill } from "../types/All";

export type Props = {
  bill: Bill;
  formatThai: (d: string) => string;
};

export default function BillPayment({ bill, formatThai }: Props) {
  if (bill.billStatus !== 1 || !bill.paidAt) return null;

  return (
    <>
      <hr />

      <div className="card border mt-3">
        <div className="card-header text-center fw-bold py-2">
          ข้อมูลการชำระเงิน / Payment Information
        </div>

        <div className="card-body small">
          <div className="d-flex justify-content-between">
            <span>วิธีการชำระ :</span>
            <span>โอนเงิน / Transfer</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>ยอดที่ชำระ :</span>
            <span>{bill.total.toLocaleString()} บาท</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>วันที่ชำระ :</span>
            <span>{formatThai(bill.paidAt)}</span>
          </div>
        </div>
      </div>
    </>
  );
}