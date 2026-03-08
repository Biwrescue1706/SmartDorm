import { useEffect, useState } from "react";
import type { Bill, DormProfile } from "../types/All";

export type Props = {
  bill: Bill;
  formatThai: (d: string) => string;
};

export default function BillPayment({ bill, formatThai }: Props) {
  const [dormProfile, setDormProfile] = useState<DormProfile | null>(null);

  useEffect(() => {
    fetch("https://hub.smartdorm-biwboong.shop/dorm-profile/")
      .then((res) => res.json())
      .then((data) => {
        setDormProfile(data);
      })
      .catch((err) => console.error("โหลด dorm profile ไม่ได้", err));
  }, []);

  const isPaid = bill.billStatus === 1 && bill.paidAt;

  if (!isPaid) return null;

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
            <span>{bill.paidAt && formatThai(bill.paidAt)}</span>
          </div>
        </div>
      </div>

      <div className="row mt-4 text-center">
        <div className="col">
          <div className="fw-bold">ผู้รับ</div>

          {dormProfile?.signatureUrl && (
            <img
              src={dormProfile.signatureUrl}
              alt="Signature"
              style={{ maxHeight: 100 }}
            />
          )}

          <div>( {dormProfile?.receiverFullName} )</div>

          <div className="text-muted">
            {bill.paidAt && formatThai(bill.paidAt)}
          </div>
        </div>

        <div className="col">
          <div className="fw-bold">ผู้จ่าย</div>

          {bill.fullName === dormProfile?.receiverFullName ? (
            dormProfile?.signatureUrl && (
              <img
                src={dormProfile.signatureUrl}
                alt="Signature"
                style={{ maxHeight: 100 }}
              />
            )
          ) : (
            <>
              <br />
              <div>{`${bill.cname ?? ""} ${bill.csurname ?? ""}`}</div>
              <br />
              <br />
            </>
          )}
          <div>( {bill.fullName} )</div>

          <div className="text-muted">
            {bill.paidAt && formatThai(bill.paidAt)}
          </div>
        </div>
      </div>
    </>
  );
}
