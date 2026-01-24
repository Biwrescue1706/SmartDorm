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

  const activeItem = items.find((i) => i.key === filterStatus);
  const activeLabel = activeItem?.label ?? "เลือกสถานะ";
  const activeCount = activeItem?.count ?? 0;
  const activeColor = activeItem?.color ?? "#6c757d";

  return (
    <>
      <div className="d-block d-xxl-none">
        {/* ตัว dropdown: ไม่ต้องตามกลาง */}
        <div className="dropdown">
          <button
            type="button"
            className="btn dropdown-toggle px-4 fw-bold"
            data-bs-toggle="dropdown"
            style={{
              background: activeColor,
              color: "white",
              borderColor: activeColor,
              height: 38,
            }}
          >
            {activeLabel} ({activeCount})
          </button>

          <div className="dropdown-menu">
            {items.map((i) => (
              <button
                key={i.key}
                type="button"
                className="dropdown-item fw-bold"
                style={{
                  background: filterStatus === i.key ? i.color : "transparent",
                  color: filterStatus === i.key ? "white" : i.color,
                }}
                onClick={() => setFilterStatus(i.key)}
              >
                {i.label} ({i.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* >= 1400px = Cards */}
      <div className="d-none d-xxl-flex gap-3 flex-wrap justify-content-center mb-3">
        {items.map((i) => (
          <div
            key={i.key}
            className="px-4 py-2 rounded-4 border shadow-sm fw-bold"
            style={{
              cursor: "pointer",
              background: i.color,
              borderColor: i.color,
              color: "white",
              opacity: filterStatus === i.key ? 1 : 0.6,
              transition: "0.2s",
            }}
            onClick={() => setFilterStatus(i.key)}
          >
            {i.label} ({i.count})
          </div>
        ))}
      </div>
    </>
  );
}
