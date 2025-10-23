interface Props {
  filterStatus: string;
  filterMonth: string;
  filterRoom: string;
  setFilterStatus: (v: string) => void;
  setFilterMonth: (v: string) => void;
  setFilterRoom: (v: string) => void;
}

export default function BillFilterBar({
  filterStatus,
  filterMonth,
  filterRoom,
  setFilterStatus,
  setFilterMonth,
  setFilterRoom,
}: Props) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
      {/* ปุ่มสถานะ */}
      <div className="d-flex gap-2 flex-wrap">
        <button
          className={`btn fw-semibold ${
            filterStatus === "all"
              ? "btn-secondary text-white"
              : "btn-outline-secondary"
          }`}
          onClick={() => setFilterStatus("all")}
        >
          ทั้งหมด
        </button>
        <button
          className={`btn fw-semibold ${
            filterStatus === "0"
              ? "btn-warning text-dark"
              : "btn-outline-warning"
          }`}
          onClick={() => setFilterStatus("0")}
        >
          ค้างชำระ
        </button>
        <button
          className={`btn fw-semibold ${
            filterStatus === "1"
              ? "btn-success text-white"
              : "btn-outline-success"
          }`}
          onClick={() => setFilterStatus("1")}
        >
          ชำระแล้ว
        </button>
      </div>

      {/* ช่องกรองเดือนและค้นหาห้อง */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <input
          type="month"
          className="form-control form-control-sm"
          style={{ width: "160px" }}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
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
  );
}
