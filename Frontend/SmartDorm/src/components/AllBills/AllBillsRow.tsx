import { useNavigate } from "react-router-dom";
import type { Bill } from "../../types/All";

interface Props {
  index: number;
  bill: Bill;
  role?: number | null;

  showOverdue: boolean;
  showSlip: boolean;
  showManage: boolean;
  showEdit: boolean;
  showDelete: boolean;

  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room: string) => void;
  onViewSlip: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (billId: string, room: string) => void;
}

/* ---------------- THAI TIME ---------------- */
const thaiNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
};

export default function AllBillsRow({
  index,
  bill,
  role,

  showOverdue,
  showSlip,
  showManage,
  showEdit,
  showDelete,

  onEdit,
  onDelete,
  onViewSlip,
  onManage,
  onOverdue,
}: Props) {
  const navigate = useNavigate();

  const status = bill.billStatus;
  const overdueDays = bill.overdueDays ?? 0;

  /* ---------- เช็คเกินกำหนด ---------- */
  const today = thaiNow();
  const dueDate = new Date(bill.dueDate);
  const isPastDue = today > dueDate;

  /* ✅ ใช้ตัวแปรกลาง */
  const isAdminOrStaff = role === 0 || role === 1;

  return (
    <tr>
      <td>{index + 1}</td>

      <td>{bill.room?.number ?? "-"}</td>

      <td>{bill.customer?.userName ?? "-"}</td>

      <td>{bill.fullName ?? "-"}</td>

      <td>{bill.cphone ?? "-"}</td>

      <td>
        {new Date(bill.month).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </td>

      <td>{bill.total?.toLocaleString() ?? "0"}</td>

      <td>
        {new Date(bill.dueDate).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </td>

      {/* รายละเอียด */}
      <td>
        <button
          type="button"
          className="btn btn-success btn-sm text-white"
          onClick={() => navigate(`/bills/${bill.billId}`)}
        >
          ดูรายละเอียด
        </button>
      </td>

      {/* สถานะ */}
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

      {/* เกินกำหนด */}
      {showOverdue && (
        <td>
          {status === 0 ? (
            <div className="d-flex flex-column align-items-center gap-1">
              <span className="fw-semibold">
                {overdueDays > 0 ? `${overdueDays} วัน` : "ยังไม่เกินกำหนด"}
              </span>

              {isAdminOrStaff && isPastDue && (
                <button
                  className="btn btn-warning btn-sm text-white"
                  onClick={() =>
                    onOverdue(bill.billId, bill.room?.number ?? "-")
                  }
                >
                  แจ้งเตือน
                </button>
              )}
            </div>
          ) : overdueDays > 0 ? (
            <div className="d-flex flex-column align-items-center gap-1">
              <span className="fw-semibold">
                {overdueDays > 0 ? `${overdueDays} วัน` : "ยังไม่เกินกำหนด"}
              </span>

              {isAdminOrStaff && isPastDue && (
                <button
                  className="btn btn-warning btn-sm text-white"
                  onClick={() =>
                    onOverdue(bill.billId, bill.room?.number ?? "-")
                  }
                >
                  แจ้งเตือน
                </button>
              )}
            </div>
          ) : (
            "-"
          )}
        </td>
      )}

      {/* สลิป */}
      {showSlip && (
        <td>
          {(status === 1 || status === 2) &&
            (bill.payment?.slipUrl || bill.slipUrl) && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onViewSlip(bill)}
              >
                ดูสลิป
              </button>
            )}
        </td>
      )}

      {/* จัดการ */}
      {showManage && (
        <td>
          {isAdminOrStaff && status === 2 && (
            <button
              className="btn btn-info btn-sm text-white"
              onClick={() => onManage(bill)}
            >
              จัดการ
            </button>
          )}
        </td>
      )}

      {/* แก้ไข */}
      {showEdit && (
        <td>
          {isAdminOrStaff && (status === 0 || status === 2) && (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => onEdit(bill)}
            >
              ✏️
            </button>
          )}
        </td>
      )}

      {/* ลบ (admin เท่านั้น) */}
      {showDelete && (
        <td>
          {role === 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(bill.billId, bill.room?.number ?? "-")}
            >
              🗑️
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
