
export default function BillPayment({ bill, formatThai }: any) {
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

      <div className="row mt-4 text-center">
        {/* ผู้รับ */}
        <div className="col">
          <div className="fw-bold">ผู้รับ</div>

          <div>
            <img
              src="/assets/signature.webp"
              alt="ลายเซ็นต์"
              width={150}
              height={75}
            />
          </div>

          <div>( นายภูวณัฐ พาหะละ )</div>

          <div className="text-muted">
            {formatThai(bill.paidAt)}
          </div>
        </div>

        {/* ผู้จ่าย */}
        <div className="col">
          <div className="fw-bold">ผู้จ่าย</div>

          {bill.fullName === "นายภูวณัฐ พาหะละ" ? (
            <img
              src="/assets/signature.webp"
              alt="ลายเซ็นต์"
              width={150}
              height={75}
            />
          ) : (
            <>
              <br />
              <div>
                {bill.cname || bill.csurname
                  ? `${bill.cname ?? ""} ${bill.csurname ?? ""}`
                  : "-"}
              </div>
              <br />
            </>
          )}

          <div>({bill.fullName})</div>

          <div className="text-muted">
            {formatThai(bill.paidAt)}
          </div>
        </div>
      </div>
    </>
  );
}