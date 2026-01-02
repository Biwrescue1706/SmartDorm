import type { Bill } from "../../types/Bill";

interface Props {
  bill: Bill;
  role?: number | null;
  onViewSlip: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onEdit: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
}

export default function AllBillsCard({
  bill,
  role,
  onViewSlip,
  onDelete,
  onEdit,
  onManage,
}: Props) {
  // ✅ FIX: status → billStatus
  const isPaid = bill.billStatus === 1;
  const isPending = bill.billStatus === 2;
  const hasSlip = bill.payment?.slipUrl || bill.slipUrl;
  const isStaff = role === 1;

  return (
    <div
      className="p-3 shadow-sm rounded-4 border bg-white"
      style={{
        borderLeft: isPaid
          ? "6px solid #2ecc71"
          : isPending
          ? "6px solid #f1c40f"
          : "6px solid #e74c3c",
      }}
    >
      <h5 className="fw-bold mb-2">ห้อง {bill.room?.number}</h5>

      <p className="mb-1">
        <b>ผู้เช่า:</b> {bill.fullName || "-"}
      </p>
      <p className="mb-1">
        <b>LINE:</b> {bill.customer?.userName || "-"}
      </p>
      <p className="mb-1">
        <b>เบอร์:</b> {bill.cphone || "-"}
      </p>

      <p className="mb-1">
        <b>เดือน:</b>{" "}
        {new Date(bill.month).toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        })}
      </p>

      {!isPaid && !isPending && (
        <p className="mb-1">
          <b>กำหนดชำระ:</b>{" "}
          {new Date(bill.dueDate).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      <p className="mb-2">
        <b>ยอดรวม:</b> {bill.total.toLocaleString()} บาท
      </p>

      {/* STATUS */}
      {isPending && (
        <span className="badge bg-warning text-dark p-2">รอตรวจสอบ</span>
      )}
      {isPaid && <span className="badge bg-success p-2">ชำระแล้ว</span>}
      {!isPaid && !isPending && (
        <span className="badge bg-danger p-2">ค้างชำระ</span>
      )}

      {/* ================= ACTIONS ================= */}

      {/* 👷 STAFF → ดูสลิปอย่างเดียว */}
      {isStaff ? (
        hasSlip && (
          <button
            className="btn btn-outline-primary btn-sm w-100 mt-2"
            onClick={() => onViewSlip(bill)}
          >
            ดูสลิป
          </button>
        )
      ) : (
        /* 👑 ADMIN */
        <div className="mt-3 d-flex flex-column gap-2">
          {/* STATUS 2 → MANAGE */}
          {bill.billStatus === 2 && (
            <button
              className="btn btn-info btn-sm fw-semibold w-100 text-white"
              onClick={() => onManage(bill)}
            >
              จัดการ
            </button>
          )}

          {/* STATUS 0 → EDIT + DELETE */}
          {bill.billStatus === 0 && role === 0 && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-warning btn-sm w-50 fw-semibold"
                onClick={() => onEdit(bill)}
              >
                ✏️ แก้ไข
              </button>

              <button
                className="btn btn-danger btn-sm w-50 fw-semibold"
                onClick={() => onDelete(bill.billId, bill.room?.number ?? "-")}
              >
                🗑️ ลบ
              </button>
            </div>
          )}

          {/* STATUS 1 → VIEW SLIP + DELETE */}
          {bill.billStatus === 1 && (
            <div className="d-flex gap-2">
              {hasSlip && (
                <button
                  className="btn btn-primary btn-sm fw-semibold w-50"
                  onClick={() => onViewSlip(bill)}
                >
                  ดูสลิป
                </button>
              )}

              {role === 0 && (
                <button
                  className="btn btn-danger btn-sm fw-semibold w-50"
                  onClick={() => onDelete(bill.billId, bill.room?.number ?? "-")}
                >
                  🗑️ ลบ
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}