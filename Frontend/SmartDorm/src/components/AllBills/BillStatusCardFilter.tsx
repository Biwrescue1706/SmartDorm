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
  return (
    <div className="d-flex gap-3 flex-wrap justify-content-center mb-3">
      {/* 🔴 ค้างชำระ */}
      <div
        className="px-4 py-2 rounded-4 border shadow-sm fw-bold"
        style={{
          cursor: "pointer",
          background: filterStatus === "0" ? "#ffc107" : "white",
          borderColor: "#ffc107",
          color: filterStatus === "0" ? "black" : "#333",
          transition: "0.2s",
        }}
        onClick={() => setFilterStatus("0")}
      >
        ค้างชำระ ({unpaidCount})
      </div>

      {/* 🟡 รอตรวจสอบ */}
      <div
        className="px-4 py-2 rounded-4 border shadow-sm fw-bold"
        style={{
          cursor: "pointer",
          background: filterStatus === "2" ? "#f1c40f" : "white",
          borderColor: "#f1c40f",
          color: filterStatus === "2" ? "black" : "#f39c12",
          transition: "0.2s",
        }}
        onClick={() => setFilterStatus("2")}
      >
        รอตรวจสอบ ({pendingCount})
      </div>

      {/* 🟢 ชำระแล้ว */}
      <div
        className="px-4 py-2 rounded-4 border shadow-sm fw-bold"
        style={{
          cursor: "pointer",
          background: filterStatus === "1" ? "#28a745" : "white",
          borderColor: "#28a745",
          color: filterStatus === "1" ? "white" : "#28a745",
          transition: "0.2s",
        }}
        onClick={() => setFilterStatus("1")}
      >
        ชำระแล้ว ({paidCount})
      </div>
    </div>
  );
}
