// src/components/AllBills/BillStatusCardFilter.tsx

interface Props {
  filterStatus: string; // "0" | "1"
  setFilterStatus: (v: string) => void;
  unpaidCount: number;
  paidCount: number;
}

export default function BillStatusCardFilter({
  filterStatus,
  setFilterStatus,
  unpaidCount,
  paidCount,
}: Props) {
  return (
    <div className="d-flex gap-3 mb-3 flex-wrap justify-content-center">

      {/* 🔶 ค้างชำระ */}
      <div
        className="px-4 py-2 rounded-4 fw-bold shadow-sm border"
        style={{
          cursor: "pointer",
          background: filterStatus === "0" ? "#ffc107" : "white",
          color: filterStatus === "0" ? "black" : "#333",
          borderColor: "#ffc107",
          transition: "0.2s",
        }}
        onClick={() => setFilterStatus("0")}
      >
        ค้างชำระ ({unpaidCount})
      </div>

      {/* 🟢 ชำระแล้ว */}
      <div
        className="px-4 py-2 rounded-4 fw-bold shadow-sm border"
        style={{
          cursor: "pointer",
          background: filterStatus === "1" ? "#28a745" : "white",
          color: filterStatus === "1" ? "white" : "#28a745",
          borderColor: "#28a745",
          transition: "0.2s",
        }}
        onClick={() => setFilterStatus("1")}
      >
        ชำระแล้ว ({paidCount})
      </div>

    </div>
  );
}
