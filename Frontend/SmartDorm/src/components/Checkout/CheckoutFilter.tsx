//src/components/Checkout/CheckoutFilter.tsx
import type { Booking } from "../../types/Checkout";

interface CheckoutFilterProps {
  active: "all" | "pending" | "approved" | "rejected" | "waitingCheckout";
  onChange: (
    status: "all" | "pending" | "approved" | "rejected" | "waitingCheckout"
  ) => void;
  checkouts: Booking[];
}

export default function CheckoutFilter({
  active,
  onChange,
  checkouts,
}: CheckoutFilterProps) {
  const counts = {
    pending: checkouts.filter((b) => b.returnStatus === 0).length,
    approved: checkouts.filter((b) => b.returnStatus === 1).length,
    rejected: checkouts.filter((b) => b.returnStatus === 2).length,
    waitingCheckout: checkouts.filter(
      (b) => b.checkoutStatus === 1 && !b.actualCheckout
    ).length,
  };

  const cards = [
    { key: "pending", label: "รออนุมัติ", color: "#ffc107" },
    { key: "approved", label: "อนุมัติแล้ว", color: "#28a745" },
    { key: "rejected", label: "ถูกปฏิเสธ", color: "#dc3545" },
    { key: "waitingCheckout", label: "รอเช็คเอาท์", color: "#0dcaf0" },
  ] as const;

  return (
    <div className="d-flex flex-wrap justify-content-center gap-3">
      {cards.map((card) => (
        <div
          key={card.key}
          role="button"
          onClick={() => onChange(card.key)}
          className={`card shadow-sm text-center border-0 p-3 ${
            active === card.key ? "shadow-md border-2 border-primary" : ""
          }`}
          style={{
            cursor: "pointer",
            width: "120px",
            borderRadius: "1rem",
            background:
              active === card.key
                ? `linear-gradient(135deg, ${card.color}, #ffffff)`
                : "#f8f9fa",
            transition: "all 0.25s ease-in-out",
          }}
        >
          <h5
            className="fw-bold mb-2"
            style={{
              color: active === card.key ? "#000" : card.color,
              fontSize: "1rem",
            }}
          >
            {card.label}
          </h5>
          <h3 className="fw-bold" style={{ color: card.color }}>
            {counts[card.key]}
          </h3>
        </div>
      ))}
    </div>
  );
  
}
