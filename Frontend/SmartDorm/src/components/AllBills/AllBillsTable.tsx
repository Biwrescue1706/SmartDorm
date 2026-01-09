// src/components/AllBills/AllBillsTable.tsx
import type { Bill } from "../../types/Bill";
import AllBillsRow from "./AllBillsRow";

interface Props {
  bills: Bill[];
  role?: number | null;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  onViewSlip: (bill: Bill) => void;
  onManage: (bill: Bill) => void; // ⭐ เพิ่ม
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
    <table className="table table-hover text-center align-middle table-bordered">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>ห้อง</th>
          <th>LINE</th>
          <th>ผู้เช่า</th>
          <th>เบอร์โทร</th>
          <th>เดือน</th>
          <th>ยอดรวม</th>
          <th>สถานะ</th>
          <th>สลิป</th>
          <th>จัดการ</th>
          <th>ลบ</th>
        </tr>
      </thead>

      <tbody>
        {bills.length === 0 ? (
          <tr>
            <td colSpan={11} className="text-muted py-4">
              ไม่พบบิล
            </td>
          </tr>
        ) : (
          bills.map((bill, i) => (
            <AllBillsRow
              key={bill.billId}
              index={i}
              bill={bill}
              role={role}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewSlip={onViewSlip}
              onManage={onManage} // ⭐
            />
          ))
        )}
      </tbody>
    </table>
  );
}
