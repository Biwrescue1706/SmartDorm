//  src/components/Dashboard/DashboradFilter.tsx
interface DashboardFilterProps {
  active: "all" | "available" | "booked";
  onChange: (status: "all" | "available" | "booked") => void;
}

export default function DashboardFilter({ active, onChange }: DashboardFilterProps) {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
      <FilterButton
        label="ทั้งหมด"
        color="secondary"
        active={active === "all"}
        onClick={() => onChange("all")}
      />
      <FilterButton
        label="ห้องว่าง"
        color="success"
        active={active === "available"}
        onClick={() => onChange("available")}
      />
      <FilterButton
        label="ห้องเต็ม"
        color="danger"
        active={active === "booked"}
        onClick={() => onChange("booked")}
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
      style={{ minWidth: "90px", whiteSpace: "nowrap" }}
    >
      {label}
    </button>
  );
}
