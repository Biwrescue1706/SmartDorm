// src/components/AllBills/AllBillsRow.tsx
import type { Bill } from "../../types/Bill";

interface Props {
  index: number;
  bill: Bill;
  role?: number | null;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room: string) => void;
  onViewSlip: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (billId: string, room: string) => void; // ⭐
}

export default function AllBillsRow({
  index,
  bill,
  role,
  onEdit,
  onDelete,
  onViewSlip,
  onManage,
  onOverdue,
}: Props) {
  const status = bill.billStatus;
  const overdueDays = bill.overdueDays ?? 0;

  const today = new Date();
  const dueDate = new Date(bill.dueDate);
  const isPastDue = today > dueDate;

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{bill.room?.number}</td>
      <td>{bill.customer?.userName}</td>
      <td>{bill.fullName}</td>
      <td>{bill.cphone}</td>

      <td>
        {new Date(bill.month).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
        })}
      </td>

      <td>{bill.total.toLocaleString()}</td>
      <td>
        {new Date(bill.dueDate).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </td>

      <td>
        {status === 0 &&
          (isPastDue ? (
            <span className="badge bg-dark">เกินกำหนด</span>
          ) : (
            <span className="badge bg-danger">ค้างชำระ</span>
          ))}
        {status === 1 && <span className="badge bg-success">ชำระแล้ว</span>}
        {status === 2 && (
          <span className="badge bg-warning text-dark">รอตรวจสอบ</span>
        )}
      </td>

      {/* ⭐ เกินกำหนด */}
      <td>
        {status === 0 ? (
          <div className="d-flex flex-column align-items-center gap-1">
            <span className="fw-semibold">
              {overdueDays > 0 ? `${overdueDays} วัน` : "ยังไม่เกินกำหนด"}
            </span>
            {role === 0 && isPastDue && (
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => onOverdue(bill.billId, bill.room?.number ?? "-")}
              >
                แจ้งเตือน
              </button>
            )}
          </div>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* สลิป */}
      <td>
        {status === 1 && (bill.payment?.slipUrl || bill.slipUrl) ? (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onViewSlip(bill)}
          >
            ดูสลิป
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* จัดการ / แก้ไข */}
      <td>
        {(status === 2 || status === 0) && role === 0 ? (
          <button
            className="btn btn-info btn-sm text-white"
            onClick={() => onManage(bill)}
          >
            จัดการ
          </button>
        ) : status === 0 ? (
          <button
            className="btn btn-warning btn-sm"
            onClick={() => onEdit(bill)}
          >
            ✏️
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* ลบ */}
      <td>
        {role === 0 && (status === 0 || status === 1) ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(bill.billId, bill.room?.number ?? "-")}
          >
            🗑️
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>
    </tr>
  );
}
