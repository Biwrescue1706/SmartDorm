// src/components/AllBills/AllBillsTable.tsx
import type { Bill } from "../../types/Bill";
import AllBillsRow from "./AllBillsRow";

interface Props {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onViewSlip: (bill: Bill) => void; // ✅ รับทั้ง bill
}

export default function AllBillsTable({
  bills,
  onEdit,
  onDelete,
  onViewSlip,
}: Props) {
  return (
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-hover align-middle text-center table-bordered mb-0"
        style={{
          tableLayout: "fixed",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          overflow: "hidden",
        }}
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
            <th>ครบกำหนด</th>
            <th>สถานะ</th>
            <th>สลิป</th>
            <th>แก้ไข</th>
            <th>ลบ</th>
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center text-muted py-4">
                ไม่พบบิลที่ตรงกับเงื่อนไข
              </td>
            </tr>
          ) : (
            bills.map((bill, i) => (
              <AllBillsRow
                key={bill.billId}
                index={i}
                bill={bill}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewSlip={onViewSlip} // ✅ ส่งต่อ bill
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}