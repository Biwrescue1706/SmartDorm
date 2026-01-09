// src/components/AllBills/AllBillsTable.tsx
import type { Bill } from "../../types/Bill";
import AllBillsRow from "./AllBillsRow";

interface Props {
  bills: Bill[];
  role?: number | null;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room?: string) => void;
  onViewSlip: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
}

export default function AllBillsTable({
  bills,
  role,
  onEdit,
  onDelete,
  onViewSlip,
  onManage,
}: Props) {
  return (
    <table className="table table-bordered text-center align-middle">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>ห้อง</th>
          <th>ผู้เช่า</th>
          <th>ยอด</th>
          <th>สถานะ</th>
          <th>สลิป</th>
          <th>จัดการ</th>
          <th>ลบ</th>
        </tr>
      </thead>

      <tbody>
        {bills.map((bill, i) => (
          <AllBillsRow
            key={bill.billId}
            index={i}
            bill={bill}
            role={role}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewSlip={onViewSlip}
            onManage={onManage}
          />
        ))}
      </tbody>
    </table>
  );
}