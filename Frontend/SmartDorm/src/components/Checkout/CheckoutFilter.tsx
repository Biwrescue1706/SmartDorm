import type { Checkout } from "../../types/Checkout";

interface Props {
  active: "all" | "pending" | "approved" | "completed" | "rejected";
  onChange: (s: Props["active"]) => void;
  checkouts: Checkout[];
}

export default function CheckoutFilter({ active, onChange, checkouts }: Props) {
  const counts = {
    pending: checkouts.filter((c) => c.status === 0).length,
    approved: checkouts.filter((c) => c.status === 1).length,
    completed: checkouts.filter((c) => c.status === 2).length,
    rejected: checkouts.filter((c) => c.status === 3).length,
  };

  const items = [
    { key: "pending", label: "รออนุมัติ", color: "warning" },
    { key: "approved", label: "อนุมัติแล้ว", color: "success" },
    { key: "completed", label: "คืนแล้ว", color: "info" },
    { key: "rejected", label: "ปฏิเสธ", color: "danger" },
  ] as const;

  return (
    <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
      {items.map((i) => (
        <button
          key={i.key}
          className={`btn btn-${i.color} ${
            active === i.key ? "" : "btn-outline"
          }`}
          onClick={() => onChange(i.key)}
        >
          {i.label} ({counts[i.key]})
        </button>
      ))}
    </div>
  );
}
