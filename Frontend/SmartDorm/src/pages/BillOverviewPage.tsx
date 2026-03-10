// src/pages/Bills/BillOverviewPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { useOverview } from "../hooks/useOverview";
import type { OverviewRoom } from "../types/Overview";

// SCB THEME
const SCB_PURPLE = "#4A0080";
const BG_SOFT = "#ffffff";

const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const months = [
  { v: 0, label: "ทุกเดือน" },
  { v: 1, label: "มกราคม" },
  { v: 2, label: "กุมภาพันธ์" },
  { v: 3, label: "มีนาคม" },
  { v: 4, label: "เมษายน" },
  { v: 5, label: "พฤษภาคม" },
  { v: 6, label: "มิถุนายน" },
  { v: 7, label: "กรกฎาคม" },
  { v: 8, label: "สิงหาคม" },
  { v: 9, label: "กันยายน" },
  { v: 10, label: "ตุลาคม" },
  { v: 11, label: "พฤศจิกายน" },
  { v: 12, label: "ธันวาคม" },
];

export default function BillOverviewPage() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const { rooms, totalRooms, loading, error } = useOverview(year, month);

  const navigate = useNavigate();
  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");

  const floors = useMemo(() => {
    const map = new Map<number, OverviewRoom[]>();

    rooms.forEach((r) => {
      const num = Number(r.number);
      const floor = Math.floor(num / 100);
      if (!map.has(floor)) map.set(floor, []);
      map.get(floor)!.push(r);
    });

    // เรียงชั้น 1 → 2 → 3 → ...
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [rooms]);

  const floorNumbers = useMemo(() => {
    return floors.map(([floor]) => floor);
  }, [floors]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" style={{ color: SCB_PURPLE }} />
      </div>
    );
  }

  return (
    <div
      className="d-flex min-vh-100 mx-2 mt-0 mb-4"
      style={{ fontFamily: "Sarabun, sans-serif" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main
        className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7"
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          className="mx-auto"
          style={{ background: BG_SOFT, borderRadius: 20, maxWidth: "1400px" }}
        >
          <h2
            className="fw-bold text-center mb-2"
            style={{ color: SCB_PURPLE }}
          >
            🧾 ภาพรวมบิลรายเดือน
          </h2>

          <div className="text-center small mb-3 text-muted">
            ห้องทั้งหมด {totalRooms} ห้อง
          </div>

          {/* Legend */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-3 small">
            <div className="d-flex align-items-center text-dark gap-1">
              <span className="badge bg-secondary"> </span>
              <span>ห้องว่าง</span>
            </div>

            {/* ✅ เพิ่มอันนี้ */}
            <div className="d-flex align-items-center text-dark gap-1">
              <span className="badge bg-primary"> </span>
              <span>มีการจอง / ยังไม่ออกบิล</span>
            </div>

            <div className="d-flex align-items-center text-dark gap-1">
              <span className="badge bg-warning"> </span>
              <span>มีบิล / ยังไม่ชำระ</span>
            </div>

            <div className="d-flex align-items-center text-dark gap-1">
              <span className="badge bg-info"> </span>
              <span>กำลังตรวจสอบ</span>
            </div>

            <div className="d-flex align-items-center text-dark gap-1">
              <span className="badge bg-success"> </span>
              <span>ชำระแล้ว</span>
            </div>
          </div>

          {/* Filters */}
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-4">
            <select
              className="form-select shadow-sm"
              style={{ width: 150 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              className="form-select shadow-sm"
              style={{ width: 120 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[year, year - 1, year - 2].map((y: number) => (
                <option key={y} value={y}>
                  {y + 543}
                </option>
              ))}
            </select>

            <select
              className="form-select shadow-sm"
              style={{ width: 120 }}
              value={selectedFloor}
              onChange={(e) =>
                setSelectedFloor(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
            >
              <option value="all">ทุกชั้น</option>
              {floorNumbers.map((f) => (
                <option key={f} value={f}>
                  ชั้น {f}
                </option>
              ))}
            </select>

            <button
              className="btn btn-outline-secondary fw-semibold"
              disabled={loading}
              onClick={() => {
                const n = new Date();
                setYear(n.getFullYear());
                setMonth(n.getMonth() + 1);
                // รีเฟรชทั้งหน้า
                window.location.reload();
              }}
            >
              {loading ? "⏳ กำลังโหลด..." : "🔄 รีเฟรชข้อมูล"}
            </button>
          </div>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {/* Floors */}
          {floors
            .filter(([f]) => selectedFloor === "all" || f === selectedFloor)
            .map(([floor, floorRooms]) => (
              <div key={floor} className="mb-4">
                <h3
                  className="fw-bold mb-2 text-center"
                  style={{ color: "#000000" }}
                >
                  ชั้น {floor}
                </h3>

                <div className="row g-3">
                  {floorRooms.map((r: OverviewRoom) => {
                    const bill = r.bill;
                    const hasBooking = r.hasBooking;
                    let bg = "bg-secondary";
                    let text = "text-black";

                    // ✅ มี booking แต่ยังไม่มีบิล
                    if (hasBooking && !bill) {
                      bg = "bg-primary";
                      text = "text-white";
                    } else if (bill) {
                      if (bill.billStatus === 1) bg = "bg-success";
                      else if (bill.billStatus === 2) bg = "bg-info";
                      else bg = "bg-warning";
                      text = "text-white";
                    }

                    return (
                      <div
                        key={r.roomId}
                        className="col-6 col-md-4 col-lg-2"
                        onClick={() => {
                          if (!hasBooking) return; // ✅ ใช้ hasBooking จาก backend
                          if (!bill) {
                            navigate("/bills");
                          } else if ([0, 1, 2].includes(bill.billStatus)) {
                            navigate(`/bills/${bill.billId}`);
                          }
                        }}
                        style={{
                          cursor: hasBooking ? "pointer" : "not-allowed",
                        }}
                      >
                        <div
                          className={`card h-100 text-center ${bg} ${text}`}
                          style={{ minHeight: 120 }}
                        >
                          <div className="card-body d-flex flex-column justify-content-between  p-2">
                            <div className="fw-bold">ห้อง {r.number}</div>

                            {/* ✅ ห้องว่าง */}
                            {!hasBooking && (
                              <div className="small text-black mt-2">
                                ห้องว่าง
                              </div>
                            )}

                            {bill && (
                              <div className="small">
                                <div>รวม {bill.total.toLocaleString()} บาท</div>
                                <div>
                                  ครบกำหนด {formatThaiDate(bill.dueDate)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
