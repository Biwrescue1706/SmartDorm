// src/components/AllBills/BillFilterBar.tsx

interface Props {
  filterStatus: string;
  filterMonth: string;
  filterRoom: string;
  setFilterStatus: (v: string) => void;
  setFilterMonth: (v: string) => void;
  setFilterRoom: (v: string) => void;
  countPending: number;
  countPaid: number;
}

export default function BillFilterBar({
  filterStatus,
  filterMonth,
  filterRoom,
  setFilterStatus,
  setFilterMonth,
  setFilterRoom,
  countPending,
  countPaid,
}: Props) {
  return (
    <div className="mb-3">
      {/* การ์ดฟิลเตอร์ */}
      <div
        className="p-3 rounded-4 shadow-sm mb-3"
        style={{ background: "#ffffff", borderLeft: "6px solid #2980b9" }}
      >
        <h5 className="fw-bold mb-3">ตัวกรองบิล</h5>

        <div className="d-flex flex-wrap gap-3 align-items-center">

          {/* ปุ่มค้างชำระ */}
          <button
            className={`btn fw-bold px-3 py-2 rounded-3 ${
              filterStatus === "0"
                ? "btn-warning text-dark"
                : "btn-outline-warning"
            }`}
            onClick={() => setFilterStatus("0")}
          >
            ค้างชำระ ({countPending})
          </button>

          {/* ปุ่มชำระแล้ว */}
          <button
            className={`btn fw-bold px-3 py-2 rounded-3 ${
              filterStatus === "1"
                ? "btn-success text-white"
                : "btn-outline-success"
            }`}
            onClick={() => setFilterStatus("1")}
          >
            ชำระแล้ว ({countPaid})
          </button>

          {/* ช่องกรองเดือน */}
          <input
            type="month"
            className="form-control form-control-sm"
            style={{ width: "160px" }}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />

          {/* ช่องกรองห้อง */}
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="ค้นหาห้อง..."
            style={{ width: "180px" }}
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
