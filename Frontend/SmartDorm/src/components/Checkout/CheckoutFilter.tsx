// src/components/Checkout/CheckoutFilter.tsx
import type { Checkout } from "../../types/Checkout";

interface Props {
  active:
    | "pending" // รออนุมัติ
    | "approved" // รอการเช็คเอาท์
    | "completed" // คืนแล้ว
    | "rejected"; // ปฏิเสธ
  onChange: (s: Props["active"]) => void;
  checkouts: Checkout[];
}

export default function CheckoutFilter({ active, onChange, checkouts }: Props) {
  const counts = {
    pending: checkouts.filter((c) => c.ReturnApprovalStatus === 0).length,
    approved: checkouts.filter(
      (c) => c.ReturnApprovalStatus === 1 && c.checkoutStatus === 0
    ).length,
    completed: checkouts.filter(
      (c) => c.ReturnApprovalStatus === 1 && c.checkoutStatus === 1
    ).length,
    rejected: checkouts.filter((c) => c.ReturnApprovalStatus === 2).length,
  };

  const cards = [
    {
      key: "pending",
      label: "รออนุมัติ",
      count: counts.pending,
      bg: "#FFF3CD",
      color: "#ff02b7",
    },
    {
      key: "approved",
      label: "รอการเช็คเอาท์",
      count: counts.approved,
      bg: "#E7F1FF",
      color: "#fda90d",
    },
    {
      key: "completed",
      label: "คืนแล้ว",
      count: counts.completed,
      bg: "#E8F6F3",
      color: "#0F5132",
    }
  ] as const;

  return (
    <div className="d-flex flex-wrap justify-content-center gap-2">
      {cards.map((c) => {
        const isActive = active === c.key;

        return (
          <div key={c.key} className="col-6 col-md-3 col-xl-2">
            <div
              className="card h-100 shadow-sm text-center"
              onClick={() => onChange(c.key)}
              style={{
                background: c.bg,
                border: isActive
                  ? `2px solid ${c.color}`
                  : "1px solid #e0e0e0",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transition: "all .15s ease-in-out",
                cursor: "pointer",
              }}
            >
              <div className="card-body py-3">
                <div className="fw-bold mb-1" style={{ color: c.color }}>
                  {c.label}
                </div>
                <div className="h4 fw-bold" style={{ color: c.color }}>
                  {c.count}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}