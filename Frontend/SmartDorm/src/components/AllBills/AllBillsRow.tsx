import type { Bill } from "../../types/Bill";

interface Props {
  index: number;
  bill: Bill;
  role?: number | null;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room?: string) => void; // ✅ เพิ่ม room?
  onViewSlip: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
}

export default function AllBillsRow({
  index,
  bill,
  role,
  onEdit,
  onDelete,
  onViewSlip,
  onManage
}: Props) {
  const status = bill.billStatus; // ✅ เปลี่ยนตรงนี้

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
        {status === 0 && <span className="badge bg-danger">ค้างชำระ</span>}
        {status === 1 && <span className="badge bg-success">ชำระแล้ว</span>}
        {status === 2 && (
          <span className="badge bg-warning text-dark">รอตรวจสอบ</span>
        )}
      </td>

      {/* สลิป */}
      <td>
        {status === 1 && (bill.payment?.slipUrl || bill.slipUrl) ? (
          <button className="btn btn-outline-primary btn-sm" onClick={() => onViewSlip(bill)}>
            ดูสลิป
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* จัดการ / แก้ไข */}
      <td>
        {bill.billStatus === 2 ? (
          <button
            className="btn btn-info btn-sm text-white"
            onClick={() => onManage(bill)}
          >
            จัดการ
          </button>
        ) : bill.billStatus === 0  ? (
          <button className="btn btn-warning btn-sm" onClick={() => onEdit(bill)}>
            ✏️
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* ลบเฉพาะ ADMIN */}
      <td>
        {role === 0 && (bill.billStatus === 0 || bill.billStatus === 1) ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(bill.billId, bill.room.number)}
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