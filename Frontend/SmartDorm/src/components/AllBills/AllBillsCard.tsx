import type { Bill } from "../../types/Bill";
import { getOverdueDays } from "../../utils/overdue";

interface Props {
  bill: Bill;
  role?: number | null;
  onViewSlip: (bill: Bill) => void;
  onDelete: (billId: string, room: string) => void;
  onEdit: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (bill: Bill) => void;
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
  const hasSlip = !!(bill.payment?.slipUrl || bill.slipUrl);
  const overdueDays = getOverdueDays(bill.dueDate);

  return (
    <div className="p-3 shadow-sm rounded-4 border bg-white">
      <h5 className="fw-bold">ห้อง {bill.room?.number}</h5>

      <p>ผู้เช่า: {bill.fullName || "-"}</p>
      <p>เบอร์: {bill.cphone || "-"}</p>
      <p>ยอดรวม: {bill.total.toLocaleString()} บาท</p>

      {hasSlip && (
        <button
          className="btn btn-outline-primary btn-sm w-100"
          onClick={() => onViewSlip(bill)}
        >
          ดูสลิป
        </button>
      )}

      {bill.billStatus === 2 && (
        <button
          className="btn btn-info btn-sm w-100 mt-2 text-white"
          onClick={() => onManage(bill)}
        >
          จัดการ
        </button>
      )}

      <button
        className="btn btn-warning btn-sm w-100 mt-2"
        onClick={() => onEdit(bill)}
      >
        ✏️ แก้ไข
      </button>

      {role === 0 && bill.billStatus === 0 && overdueDays > 0 && (
        <button
          className="btn btn-outline-danger btn-sm w-100 mt-2"
          onClick={() => onOverdue(bill)}
        >
          ⏰ แจ้งเตือนค้างชำระ
        </button>
      )}
    </div>
  );
}