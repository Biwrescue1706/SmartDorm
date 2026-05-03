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
  onOverdue: (billId: string, room: string) => void;
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
  // ตรวจว่ามีคอลัมน์ไหนต้องแสดงบ้าง
  const showOverdue = bills.some((b) => b.billStatus === 0 || b.overdueDays);
  const showSlip = bills.some((b) => b.payment?.slipUrl || b.slipUrl);
  const showManage = bills.some((b) => b.billStatus === 2);
  const showEdit = bills.some((b) => b.billStatus === 0 || b.billStatus === 2);
  const showDelete = role === 0;

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
            <th>รายละเอียด</th>
            <th>สถานะ</th>

            {showOverdue && <th>เกินกำหนด</th>}
            {showSlip && <th>สลิป</th>}
            {showManage && (role === 0 || role === 1) && <th>จัดการ</th>}
            {showEdit && (role === 0 || role === 1) && <th>แก้ไข</th>}
            {showDelete && <th>ลบ</th>}
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-muted py-4">
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
                showOverdue={showOverdue}
                showSlip={showSlip}
                showManage={showManage}
                showEdit={showEdit}
                showDelete={showDelete}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewSlip={onViewSlip}
                onManage={onManage}
                onOverdue={onOverdue}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
