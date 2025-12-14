import CheckoutRow from "./CheckoutRow";
import type { Checkout } from "../../types/Checkout";

interface Props {
  checkouts: Checkout[];
  loading: boolean;
  role: number | null;

  onView: (checkout: Checkout) => void;      // ดูรายละเอียด + อนุมัติ/ปฏิเสธ
  onCheckout: (checkout: Checkout) => void;  // ยืนยันเช็คเอาท์
  onEdit: (checkout: Checkout) => void;      // แก้ไขวันที่
  onDelete: (id: string) => void;             // ลบ
}

export default function CheckoutTable({
  checkouts,
  loading,
  role,
  onView,
  onCheckout,
  onEdit,
  onDelete,
}: Props) {
  if (loading)
    return <p className="text-center text-muted">กำลังโหลด...</p>;

  if (checkouts.length === 0)
    return <p className="text-center text-muted">ไม่มีข้อมูล</p>;

  return (
    <div className="table-responsive">
      <table className="table table-sm table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ห้อง</th>
            <th>ชื่อ</th>
            <th>เบอร์</th>
            <th>วันที่ขอคืน</th>
            <th>สถานะ</th>
            <th>แก้ไข</th>
            <th>ลบ</th>
          </tr>
        </thead>

        <tbody>
          {checkouts.map((c, i) => (
            <CheckoutRow
              key={c.checkoutId}
              checkout={c}
              index={i + 1}
              role={role}
              onView={onView}
              onCheckout={onCheckout}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}