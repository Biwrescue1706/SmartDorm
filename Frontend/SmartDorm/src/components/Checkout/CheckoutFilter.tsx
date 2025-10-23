//src/components/Checkout/CheckoutFilter.tsx
interface CheckoutFilterProps {
  active: "all" | "pending" | "approved" | "rejected";
  onChange: (status: "all" | "pending" | "approved" | "rejected") => void;
}

export default function CheckoutFilter({
  active,
  onChange,
}: CheckoutFilterProps) {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
      <FilterButton
        label="ทั้งหมด"
        color="secondary"
        active={active === "all"}
        onClick={() => onChange("all")}
      />
      <FilterButton
        label="รออนุมัติ"
        color="warning"
        active={active === "pending"}
        onClick={() => onChange("pending")}
      />
      <FilterButton
        label="อนุมัติแล้ว"
        color="success"
        active={active === "approved"}
        onClick={() => onChange("approved")}
      />
      <FilterButton
        label="ถูกปฏิเสธ"
        color="danger"
        active={active === "rejected"}
        onClick={() => onChange("rejected")}
      />
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  color: "primary" | "secondary" | "success" | "warning" | "danger";
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, color, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-sm ${
        active ? `btn-${color}` : `btn-outline-${color}`
      } fw-semibold`}
      style={{ minWidth: "80px", whiteSpace: "nowrap" }}
    >
      {label}
    </button>
  );
}
