// src/components/AllBills/AllBillsTable.tsx
import type { Bill } from "../../types/Bill";
import AllBillsRow from "./AllBillsRow";

interface Props {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onViewSlip: (url?: string | null) => void;
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
            <th style={{ minWidth: "60px" }}>#</th>
            <th style={{ minWidth: "90px" }}>ห้อง</th>
            <th style={{ minWidth: "120px" }}>ผู้เช่า</th>
            <th style={{ minWidth: "110px" }}>เบอร์โทร</th>
            <th style={{ minWidth: "90px" }}>เดือน</th>
            <th style={{ minWidth: "100px" }}>ยอดรวม</th>
            <th style={{ minWidth: "100px" }}>สถานะ</th>
            <th style={{ minWidth: "120px" }}>ครบกำหนด</th>
            <th style={{ minWidth: "80px" }}>สลิป</th>
            <th style={{ minWidth: "120px" }}>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted py-4">
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
                onViewSlip={onViewSlip}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
