// src/components/Checkout/CheckoutTable.tsx
import CheckoutRow from "./CheckoutRow";
import type { Checkout } from "../../types/Checkout";

interface Props {
  checkouts: Checkout[];
  loading: boolean;
  role: number | null;
  onView: (c: Checkout) => void;
  onCheckout: (c: Checkout) => void;
  onEdit: (c: Checkout) => void;
  onDelete: (id: string) => void;
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
  if (loading) return <p className="text-center">กำลังโหลด...</p>;
  if (!checkouts.length) return <p className="text-center">ไม่มีข้อมูล</p>;

  // ❗ ถ้ามีรายการใด checkoutStatus === 1 → ห้ามแสดงคอลัมน์แก้ไข
  const canShowEditColumn =
    role === 0 && !checkouts.some((c) => c.checkoutStatus === 1);

  return (
    <div className="table-responsive">
      <table className="table table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ห้อง</th>
            <th>LINE</th>
            <th>ชื่อ</th>
            <th>เบอร์</th>
            <th>วันที่ขอคืน</th>
            <th>เช็คเอาท์จริง</th>
            <th>สถานะ</th>

            {canShowEditColumn && <th>แก้ไข</th>}
            {role === 0 && <th>ลบ</th>}
          </tr>
        </thead>

        <tbody>
          {checkouts.map((c, i) => (
            <CheckoutRow
              key={c.checkoutId}
              checkout={c}
              index={i + 1}
              role={role}
              canEdit={canShowEditColumn}
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
