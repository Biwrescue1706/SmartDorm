// src/components/AllBills/BillManageDialog.tsx
import type { Bill } from "../../types/All";

interface Props {
  bill: Bill | null;
  onApprove: (billId: string, room: string) => void;
  onReject: (billId: string, room: string) => void;
  onClose: () => void;
}

export default function BillManageDialog({
  bill,
  onApprove,
  onReject,
  onClose,
}: Props) {
  if (!bill) return null;

  const slip = bill.payment?.slipUrl ?? bill.slipUrl;

  return (
    <div
      className="modal show d-block mx-2"
      style={{
        background: "#00000080", // โปร่งแสงกำลังดี
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000, // ⭐ สูงสุดในระบบ ลอยเหนือ nav + sidebar
      }}
    >
      {/* DIALOG WRAPPER */}
      <div
        className="modal-dialog modal-dialog-centered"
        style={{
          maxWidth: "480px",
          margin: "5px auto 5px auto", // ⭐ ชน navbar จะไม่ติดอีกแล้ว
        }}
      >
        <div className="modal-content rounded-4 shadow-lg border-0">
          {/* HEADER */}
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(135deg, #00a8ff, #0097e6)",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          >
            <h5 className="modal-title fw-bold">
              จัดการบิลห้อง {bill.room.number}
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* BODY */}
          <div
            className="modal-body text-center"
            style={{
              paddingBottom: "10px",
              overflowY: "auto",
              maxHeight: "65vh", // ⭐ scroll เฉพาะภาพ
            }}
          >
            <h6 className="fw-bold mb-3">สลิปการชำระเงิน</h6>

            {slip ? (
              <img
                src={slip}
                alt="slip"
                style={{
                  width: "360px",
                  maxWidth: "70%", 
                  height: "180px", 
                  maxHeight: "65vh",
                  objectFit: "contain",
                  borderRadius: "14px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            ) : (
              <p className="text-danger mt-3">ไม่มีสลิปแนบมา</p>
            )}
            <h6 className="fw-bold mt-4">ชื่อผู้ชำระ: {bill.customer?.userName ?? "-"} </h6>
            <h6 className="fw-bold mt-2">วันที่ชำระ: {new Date(bill.payment?.paidAt ?? "").toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })} </h6>
            <h6 className="fw-bold mt-4">ยอดชำระ: {bill.total.toLocaleString()} บาท </h6>
          </div>

          {/* FOOTER */}
          <div className="modal-footer d-flex justify-content-between px-4 pb-3">
            <button
              className="btn btn-success fw-semibold px-4"
              onClick={() => onApprove(bill.billId, bill.room.number)}
            >
              ✔️ ยืนยันการชำระ
            </button>

            <button
              className="btn btn-warning fw-semibold px-4"
              onClick={() => onReject(bill.billId, bill.room.number)}
            >
              ❌ ปฏิเสธ
            </button>

            <button
              className="btn btn-secondary fw-semibold px-4"
              onClick={onClose}
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
