// src/components/AllBills/BillManageDialog.tsx
import type { Bill } from "../../types/Bill";

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
    <div className="modal show d-block" style={{ background: "#00000070" }}>
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "600px" }}
      >
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title fw-bold">
              จัดการบิลห้อง {bill.room.number}
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body text-center">
            <h6 className="fw-bold">สลิปการชำระ</h6>

            {slip ? (
              <img
                src={slip}
                alt="slip"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <p className="text-danger mt-3">ไม่มีสลิปแนบมา</p>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between px-4">
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
