import type { Checkout } from "../../types/Checkout";

interface Props {
  active:
    | "all"
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
    // status = 0
    pending: checkouts.filter((c) => c.status === 0).length,

    // status = 1 && checkoutStatus = 0
    approved: checkouts.filter(
      (c) => c.status === 1 && c.checkoutStatus === 0
    ).length,

    // status = 1 && checkoutStatus = 1
    completed: checkouts.filter(
      (c) => c.status === 1 && c.checkoutStatus === 1
    ).length,

    // status = 2
    rejected: checkouts.filter((c) => c.status === 2).length,
  };

  const items = [
    { key: "pending", label: "รออนุมัติ", color: "warning" },
    { key: "approved", label: "รอการเช็คเอาท์", color: "primary" },
    { key: "completed", label: "คืนแล้ว", color: "info" },
    { key: "rejected", label: "ปฏิเสธ", color: "danger" },
  ] as const;

  return (
    <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
      {items.map((i) => (
        <button
          key={i.key}
          type="button"
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