// src/components/Checkout/CheckoutFilter.tsx
import type { Checkout } from "../../types/Checkout";

interface Props {
  active:
    | "pending"    // รออนุมัติ
    | "approved"   // รอการเช็คเอาท์
    | "completed"  // คืนแล้ว
    | "rejected";  // ปฏิเสธ
  onChange: (s: Props["active"]) => void;
  checkouts: Checkout[];
}

export default function CheckoutFilter({
  active,
  onChange,
  checkouts,
}: Props) {
  const counts = {
    pending: checkouts.filter((c) => c.ReturnApprovalStatus  === 0).length,
    approved: checkouts.filter(
      (c) => c.ReturnApprovalStatus  === 1 && c.checkoutStatus === 0
    ).length,
    completed: checkouts.filter(
      (c) => c.ReturnApprovalStatus  === 1 && c.checkoutStatus === 1
    ).length,
    rejected: checkouts.filter((c) => c.ReturnApprovalStatus  === 2).length,
  };

  const cards = [
    {
      key: "pending",
      label: "รออนุมัติ",
      count: counts.pending,
      bg: "#FFF3CD",
      color: "#856404",
    },
    {
      key: "approved",
      label: "รอการเช็คเอาท์",
      count: counts.approved,
      bg: "#E7F1FF",
      color: "#0D6EFD",
    },
    {
      key: "completed",
      label: "คืนแล้ว",
      count: counts.completed,
      bg: "#E8F6F3",
      color: "#0F5132",
    },
    {
      key: "rejected",
      label: "ปฏิเสธ",
      count: counts.rejected,
      bg: "#F8D7DA",
      color: "#842029",
    },
  ] as const;

  return (
    <div className="row g-3 mb-4">
      {cards.map((c) => {
        const isActive = active === c.key;

        return (
          <div key={c.key} className="col-6 col-md-3">
            <div
              className="card h-100 shadow-sm cursor-pointer"
              onClick={() => onChange(c.key)}
              style={{
                background: c.bg,
                border: isActive
                  ? `2px solid ${c.color}`
                  : "1px solid #e0e0e0",
                transform: isActive ? "scale(1.03)" : "scale(1)",
                transition: "all .15s ease-in-out",
                cursor: "pointer",
              }}
            >
              <div className="card-body text-center">
                <div
                  className="fw-bold mb-1"
                  style={{ color: c.color }}
                >
                  {c.label}
                </div>

                <div
                  className="display-6 fw-bold"
                  style={{ color: c.color }}
                >
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