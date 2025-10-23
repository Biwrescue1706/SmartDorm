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
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table
        className="table table-sm table-striped align-middle text-center"
        style={{ width: "100%" }}
      >
        <thead className="table-dark">
          <tr>
            <th scope="col" style={{ width: "5%" }}>
              #
            </th>
            <th scope="col" style={{ width: "8%" }}>
              ห้อง
            </th>
            <th scope="col" style={{ width: "15%" }}>
              ผู้เช่า
            </th>
            <th scope="col" style={{ width: "10%" }}>
              เบอร์โทร
            </th>
            <th scope="col" style={{ width: "10%" }}>
              เดือน
            </th>
            <th scope="col" style={{ width: "10%" }}>
              ยอดรวม
            </th>
            <th scope="col" style={{ width: "10%" }}>
              สถานะ
            </th>
            <th scope="col" style={{ width: "12%" }}>
              ครบกำหนด
            </th>
            <th scope="col" style={{ width: "10%" }}>
              สลิป
            </th>
            <th scope="col" style={{ width: "10%" }}>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted py-3">
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
