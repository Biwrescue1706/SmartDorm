// src/components/AllBills/AllBillsCard.tsx
import type { Bill } from "../../types/Bill";

interface Props {
  bill: Bill;
  role?: number | null;
  onViewSlip: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onEdit: (bill: Bill) => void;
}

export default function AllBillsCard({
  bill,
  role,
  onViewSlip,
  onDelete,
  onEdit,
}: Props) {
  const isPaid = bill.status === 1;
  const hasSlip = bill.payment?.slipUrl || bill.slipUrl;

  const isStaff = role === 1;

  return (
    <div
      className="p-3 shadow-sm rounded-4 border bg-white"
      style={{
        borderLeft: isPaid ? "6px solid #2ecc71" : "6px solid #f1c40f",
      }}
    >
      <h5 className="fw-bold mb-2">ห้อง {bill.room.number}</h5>

      <p className="mb-1">
        <b>ผู้เช่า:</b> {bill.booking?.fullName || "-"}
      </p>
      <p className="mb-1">
        <b>LINE:</b> {bill.customer?.userName || "-"}
      </p>
      <p className="mb-1">
        <b>เบอร์:</b> {bill.booking?.cphone || "-"}
      </p>

      <p className="mb-1">
        <b>เดือน:</b>{" "}
        {new Date(bill.month).toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        })}
      </p>

      {bill.status === 0 && (
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
        <b>ยอดรวม:</b> {bill.total?.toLocaleString()} บาท
      </p>

      <div className="mb-3">
        {isPaid ? (
          <span className="badge bg-success p-2">ชำระแล้ว</span>
        ) : (
          <span className="badge bg-warning text-dark p-2">ค้างชำระ</span>
        )}
      </div>

      {/* ⭐ STAFF โหมดพิเศษ: เห็น "เฉพาะปุ่มดูสลิป" และเฉพาะตอนที่มีสลิป */}
      {isStaff ? (
        <>
          {hasSlip && (
            <button
              className="btn btn-outline-primary btn-sm fw-semibold w-100 mt-2"
              onClick={() => onViewSlip(bill)}
            >
              ดูสลิป
            </button>
          )}
        </>
      ) : (
        /* ⭐ ADMIN MODE: มีปุ่มครบ (ตามสถานะบิล) */
        <div className="d-flex justify-content-between mt-2">
          {/* ค้างชำระ → แก้ไข + ลบ */}
          {!isPaid && (
            <>
              <button
                className="btn btn-warning btn-sm fw-semibold"
                style={{ width: "48%", color: "black" }}
                onClick={() => onEdit(bill)}
              >
                ✏️
              </button>

              <button
                className="btn btn-danger btn-sm fw-semibold"
                style={{ width: "48%" }}
                onClick={() => onDelete(bill.billId, bill.room.number)}
              >
                🗑️
              </button>
            </>
          )}

          {/* ชำระแล้ว → ดูสลิป + ลบ */}
          {isPaid && (
            <>
              {hasSlip ? (
                <button
                  className="btn btn-outline-primary btn-sm fw-semibold"
                  style={{ width: "48%" }}
                  onClick={() => onViewSlip(bill)}
                >
                  ดูสลิป
                </button>
              ) : (
                <span style={{ width: "48%" }} />
              )}

              <button
                className="btn btn-danger btn-sm fw-semibold"
                style={{ width: "48%" }}
                onClick={() => onDelete(bill.billId, bill.room.number)}
              >
                ลบ
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
