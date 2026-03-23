// src/components/AllBills/BillStatusCardFilter.tsx

interface Props {
  filterStatus: string; // "0" | "1" | "2"
  setFilterStatus: (v: string) => void;
  unpaidCount: number;
  paidCount: number;
  pendingCount: number;
}

export default function BillStatusCardFilter({
  filterStatus,
  setFilterStatus,
  unpaidCount,
  paidCount,
  pendingCount,
}: Props) {
  const items = [
    { key: "0", label: "ค้างชำระ", count: unpaidCount, color: "#0739ff" },
    { key: "2", label: "รอตรวจสอบ", count: pendingCount, color: "#f1c40f" },
    { key: "1", label: "ชำระแล้ว", count: paidCount, color: "#0c6120" },
  ];

  return (
    <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
      {items.map((i) => {
        const isActive = filterStatus === i.key;

        return (
          <button
            key={i.key}
            className="btn fw-bold"
            style={{
              background: i.color,
              color: "white",
              opacity: isActive ? 1 : 0.6,
              borderRadius: 12,
              height: 38,
              minWidth: 120,
              transition: "0.2s",
              transform: isActive ? "scale(1.05)" : "scale(1)",
              boxShadow: isActive
                ? "0 4px 10px rgba(0,0,0,0.25)"
                : "none",
            }}
            onClick={() => setFilterStatus(i.key)}
          >
            {i.label} ({i.count})
          </button>
        );
      })}
    </div>
  );
}