// src/components/AllBills/AllBillsCard.tsx
import type { Bill } from "../../types/Bill";

interface Props {
  bill: Bill;
  role?: number | null;
  onViewSlip: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onEdit: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (billId: string, room: string) => void; // ⭐ เพิ่ม
}

export default function AllBillsCard({
  bill,
  role,
  onViewSlip,
  onDelete,
  onEdit,
  onManage,
  onOverdue,
}: Props) {
  const isPaid = bill.billStatus === 1;
  const isPending = bill.billStatus === 2;
  const isUnpaid = bill.billStatus === 0;
  const hasSlip = bill.payment?.slipUrl || bill.slipUrl;
  const overdueDays = bill.overdueDays ?? 0;

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
      <h5 className="fw-bold mb-2"> ห้อง {bill.room?.number}</h5>

      <p className="mb-1">
        <b>ผู้เช่า : </b> {bill.fullName || " "}
      </p>
      <p className="mb-1">
        <b>LINE : </b> {bill.customer?.userName || " "}
      </p>
      <p className="mb-1">
        <b>เบอร์ : </b> {bill.cphone || " "}
      </p>

      <p className="mb-1">
        <b>เดือน : </b>{" "}
        {new Date(bill.month).toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        })}
      </p>

      {!isPaid && !isPending && (
        <p className="mb-1">
          <b>กำหนดชำระ : </b>{" "}
          {new Date(bill.dueDate).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </p>
      )}

      <p className="mb-2">
        <b>ยอดรวม : </b> {bill.total.toLocaleString()} บาท
      </p>

      {/* ⭐ เกินกำหนด + แจ้งเตือน */}
      {isUnpaid && overdueDays > 0 && (
        <p className="mb-2 ">
          <b className="fw-semibold">เกินกำหนด : </b>
          {overdueDays > 0 ? `${overdueDays} วัน` : "-"}
        </p>
      )}

      {/* STATUS */}
      {isPending && (
        <span className="badge bg-warning text-dark p-2">รอตรวจสอบ</span>
      )}
      {isPaid && <span className="badge bg-success p-2">ชำระแล้ว</span>}
      {isUnpaid && <span className="badge bg-danger p-2">ค้างชำระ</span>}

      {hasSlip && (
        <button
          className="btn btn-outline-primary btn-sm w-100 mt-2"
          onClick={() => onViewSlip(bill)}
        >
          ดูสลิป
        </button>
      )}

      <div className="mt-3 d-flex flex-column gap-2">
        {bill.billStatus === 2 && role === 0 && (
          <button
            className="btn btn-info btn-sm fw-semibold w-100 text-white"
            onClick={() => onManage(bill)}
          >
            จัดการ
          </button>
        )}

        {isUnpaid && overdueDays > 0 && role === 0 && (
          <button
            className="btn btn-info btn-sm fw-semibold w-100 text-white"
            onClick={() => onOverdue(bill.billId, bill.room?.number ?? "-")}
          >
            แจ้งเตือน
          </button>
        )}

        <div className="d-flex gap-2">
          <button
            className="btn btn-warning btn-sm w-50 fw-semibold"
            onClick={() => onEdit(bill)}
          >
            ✏️ แก้ไข
          </button>

          {bill.billStatus === 0 && role === 0 && (
            <button
              className="btn btn-danger btn-sm w-50 fw-semibold"
              onClick={() => onDelete(bill.billId, bill.room?.number ?? " ")}
            >
              🗑️ ลบ
            </button>
          )}
        </div>

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
                onClick={() => onDelete(bill.billId, bill.room?.number ?? " ")}
              >
                🗑️ ลบ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
