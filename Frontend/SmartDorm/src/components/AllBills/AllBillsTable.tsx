// src/components/AllBills/AllBillsTable.tsx
import type { Bill } from "../../types/All";
import AllBillsRow from "./AllBillsRow";

interface Props {
  bills: Bill[];
  role?: number | null;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string, room: string) => void;
  onViewSlip: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (billId: string, room: string) => void; // ⭐ เพิ่ม
}

export default function AllBillsTable({
  bills,
  role,
  onEdit,
  onDelete,
  onViewSlip,
  onManage,
  onOverdue,
}: Props) {
  const status = bills[0]?.billStatus;
  return (
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-sm table-striped align-middle text-center"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ห้อง</th>
            <th>LINE</th>
            <th>ผู้เช่า</th>
            <th>เบอร์โทร</th>
            <th>เดือน</th>
            <th>ยอดรวม</th>
            <th>วันครบกำหนด</th>
            <th>สถานะ</th>
            {(status === 0 || status === 1 || status === 2) && (
              <th>เกินกำหนด</th>
            )}

            {(status === 1 || status === 2) &&
              (bills[0]?.payment?.slipUrl || bills[0]?.slipUrl) && (
                <th>สลิป</th>
              )}
            {status === 2 && role === 0 && <th>จัดการ</th>}
            {role === 0 && (status === 0 || status === 2) && <th>แก้ไข</th>}
            {role === 0 && (status === 0 || status === 1 || status === 2) && (
              <th>ลบ</th>
            )}
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={9} aria-colspan={3} className="text-muted py-4">
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
                onManage={onManage}
                onOverdue={onOverdue} // ⭐
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
