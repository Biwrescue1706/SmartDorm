import CheckoutRow from "./CheckoutRow";
import type { Checkout } from "../../types/Checkout";

interface Props {
  checkouts: Checkout[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CheckoutTable({
  checkouts,
  loading,
  onApprove,
  onReject,
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
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {checkouts.map((c, i) => (
            <CheckoutRow
              key={c.checkoutId}
              checkout={c}
              index={i + 1}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
