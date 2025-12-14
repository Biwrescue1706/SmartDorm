import CheckoutRow from "./CheckoutRow";
import type { Checkout } from "../../types/Checkout";

/* =======================
   Helper: format Thai date (พ.ศ.)
   ตัวอย่าง: 15 ธ.ค. 2568
======================= */
const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

interface Props {
  checkouts: Checkout[];
  loading: boolean;
  role: number | null;

  onView: (checkout: Checkout) => void;
  onCheckout: (checkout: Checkout) => void;
  onEdit: (checkout: Checkout) => void;
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
  if (loading)
    return <p className="text-center text-muted">กำลังโหลด...</p>;

  if (checkouts.length === 0)
    return <p className="text-center text-muted">ไม่มีข้อมูล</p>;

  return (
    <div className="table-responsive">
      <table className="table table-sm table-striped text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ห้อง</th>
            <th>LINE</th>
            <th>ชื่อ</th>
            <th>เบอร์</th>
            <th>วันที่ขอคืน</th>
            <th>วันที่เช็คเอาท์จริง</th>
            <th>สถานะ</th>
            {role === 0 && <th>แก้ไข</th>}
            {role === 0 && <th>ลบ</th>}
          </tr>
        </thead>

        <tbody>
          {checkouts.map((c, i) => (
            <CheckoutRow
              key={c.checkoutId}
              checkout={{
                ...c,
                requestedCheckoutFormatted: formatThaiDate(
                  c.requestedCheckout
                ),
                actualCheckoutFormatted:
                  c.status === 1
                    ? formatThaiDate(c.actualCheckout)
                    : null,
              }}
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