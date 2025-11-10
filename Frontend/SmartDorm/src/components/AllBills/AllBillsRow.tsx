import type { Bill } from "../../types/Bill";

interface Props {
  index: number;
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room: string) => void;
  onViewSlip: (bill: Bill) => void; // ✅
}

export default function AllBillsRow({
  index,
  bill,
  onEdit,
  onDelete,
  onViewSlip,
}: Props) {
  // ✅ แสดง badge สถานะ
  const renderStatus = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">ค้างชำระ</span>;
      case 1:
        return <span className="badge bg-success">ชำระแล้ว</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบ</span>;
    }
  };

  const rowBg =
    bill.status === 1
      ? "table-success-subtle"
      : bill.status === 0
      ? "table-warning-subtle"
      : "";

  return (
    <tr className={rowBg}>
      <td>{index + 1}</td>
      <td>{bill?.room?.number ?? "-"}</td>
      <td>{bill.customer?.userName || "-"}</td>
      <td>{bill.booking?.fullName || "-"}</td>
      <td>{bill.booking?.cphone || "-"}</td>
      <td>
        {bill.month
          ? new Date(bill.month).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
            })
          : "-"}
      </td>
      <td>{bill.total?.toLocaleString() || 0}</td>
      <td>
        {bill.dueDate
          ? new Date(bill.dueDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-"}
      </td>
      <td>{renderStatus(bill.status)}</td>

      {/* ✅ ปุ่มดูสลิป */}
      <td>
        {bill.status === 1 ? (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onViewSlip(bill)} // ✅ ส่ง bill
          >
            ดูสลิป
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* ✏️ แก้ไข */}
      <td>
        <button
          className="btn btn-sm fw-semibold text-white px-2 py-1"
          style={{
            background: "linear-gradient(100deg, #26ff05, #f9d849)",
            border: "none",
            opacity: bill.status === 1 ? 0.4 : 1,
          }}
          onClick={() => onEdit(bill)}
        >
          ✏️
        </button>
      </td>

      {/* 🗑️ ลบ */}
      <td>
        <button
          className="btn btn-sm fw-semibold text-white px-2 py-1"
          style={{
            background: "linear-gradient(100deg, #ff0505, #f645c4)",
            border: "none",
            opacity: bill.status === 1 ? 0.4 : 1,
          }}
          onClick={() => onDelete(bill.billId, bill.room?.number || "-")}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}