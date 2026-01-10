// src/components/Checkout/CheckoutCards.tsx
import type { Checkout } from "../../types/Checkout";

const thaiDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

interface Props {
  checkouts: Checkout[];
  role: number | null;
  onView: (c: Checkout) => void;
  onCheckout: (c: Checkout) => void;
  onEdit: (c: Checkout) => void;
  onDelete: (id: string) => void;
}

export default function CheckoutCards({
  checkouts,
  role,
  onView,
  onCheckout,
  onEdit,
  onDelete,
}: Props) {
  // ❗ ถ้ามี checkoutStatus === 1 → ห้ามแก้ไขทุกการ์ด
  const canShowEdit =
    role === 0 && !checkouts.some((c) => c.checkoutStatus === 1);

  return (
    <div className="row g-3">
      {checkouts.map((c) => (
        <div key={c.checkoutId} className="col-12 col-md-4">
          <div className="card p-3 shadow-sm h-100">
            <div className="fw-bold mb-1">ห้อง {c.room?.number}</div>
            <div className="mb-1">ชื่อ: {c.booking?.fullName}</div>
            <div className="mb-1">LINE: {c.customer?.userName}</div>
            <div className="mb-1">วันที่ขอคืน: {thaiDate(c.checkout)}</div>
            <div className="mb-2">
              วันที่เช็คเอาท์จริง: {thaiDate(c.checkoutAt)}
            </div>

            {/* ===== STATUS / ACTION ===== */}
            <div className="mb-2">
              {c.ReturnApprovalStatus  === 0 && (
                <button
                  className="btn btn-warning btn-sm w-50"
                  onClick={() => onView(c)}
                >
                  รออนุมัติ
                </button>
              )}

              {c.ReturnApprovalStatus  === 1 && c.checkoutStatus === 0 && (
                <button
                  className="btn btn-primary btn-sm w-50"
                  onClick={() => onCheckout(c)}
                >
                  รอเช็คเอาท์
                </button>
              )}

              {c.checkoutStatus === 1 && (
                <span className="badge bg-info w-50 py-2">คืนแล้ว</span>
              )}

              {c.ReturnApprovalStatus  === 2 && (
                <span className="badge bg-danger w-50 py-2">ปฏิเสธ</span>
              )}
            </div>

            {/* ===== ADMIN ACTION ===== */}
            {role === 0 && (
              <div className="d-flex gap-2">
                {canShowEdit && (
                  <button
                    className="btn btnprimary btn-sm w-50"
                    onClick={() => onEdit(c)}
                  >
                    ✏️
                  </button>
                )}

                <button
                  className="btn btn-danger btn-sm w-50"
                  onClick={() => onDelete(c.checkoutId)}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
