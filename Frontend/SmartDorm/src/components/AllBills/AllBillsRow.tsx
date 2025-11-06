import type { Bill } from "../../types/Bill";

interface Props {
  index: number;
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room: string) => void;
  onViewSlip: (url?: string | null) => void;
}

export default function AllBillsRow({
  index,
  bill,
  onEdit,
  onDelete,
  onViewSlip,
}: Props) {
  // แสดง badge สถานะ
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

  // สีพื้นหลังตามสถานะ
  const rowBg =
    bill.status === 1
      ? "table-success-subtle"
      : bill.status === 0
      ? "table-warning-subtle"
      : "";

  return (
    <tr className={rowBg}>
      <td>{index + 1}</td>
      <td>{bill.room?.number || "-"}</td>
      {/* ✅ ชื่อ LINE จาก Customer */}
      <td>{bill.customer?.userName || "-"}</td>

      {/* ✅ ชื่อ-สกุลจาก Booking */}
     <td>{bill.booking?.fullName || "-"}</td>
      {/* ✅ เบอร์โทรจาก Booking */}
      <td>{bill.booking?.cphone || "-"}</td>
      <td>
        {bill.month
          ? new Date(bill.month).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
            })
          : "-"}
      </td>
      <td>{bill.total?.toLocaleString() || 0} บาท</td>
      <td>{renderStatus(bill.status)}</td>
      <td>
        {bill.dueDate
          ? new Date(bill.dueDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-"}
      </td>

      {/* ปุ่มดูสลิป */}
      <td>
        {bill.status === 1 ? (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onViewSlip(bill.slipUrl || bill.payment?.slipUrl)}
          >
            ดูสลิป
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* ปุ่มจัดการ */}
      <td style={{ minWidth: "120px" }}>
        <div
          className="d-flex justify-content-center align-items-center gap-2 flex-wrap"
          style={{ width: "100%" }}
        >
          {/* ปุ่มแก้ไข */}
          <button
            className="btn btn-sm fw-semibold text-white px-2 py-1"
            style={{
              background: "linear-gradient(100deg, #26ff05, #f9d849)",
              border: "none",
              transition: "all 0.2s ease",
              opacity: bill.status === 1 ? 0 : 1,
            }}
            onClick={() => onEdit(bill)}
            title="แก้ไขบิล"
          >
            ✏️
          </button>

          {/* ปุ่มลบ */}
          <button
            className="btn btn-sm fw-semibold text-white px-2 py-1"
            style={{
              background: "linear-gradient(100deg, #ff0505, #f645c4)",
              border: "none",
              transition: "all 0.2s ease",
              opacity: bill.status === 1 ? 0 : 1,
            }}
            onClick={() => onDelete(bill.billId, bill.room?.number || "-")}
            title="ลบบิล"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}
