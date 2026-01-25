import { useEffect, useMemo, useState } from "react"; import axios from "axios"; import Nav from "../components/Nav"; import { useAuth } from "../hooks/useAuth"; import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings"; import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";

//   SCB THEME const SCB_PURPLE = "#4A0080"; const BG_SOFT = "#F8F5FC";

interface Room { roomId: string; number: string; }

interface Bill { billId: string; roomId: string; month: string; total: number; dueDate: string; billStatus: number; // 0,1,2,3 }

const API = import.meta.env.VITE_API_BASE;

const formatThaiDate = (d?: string | null) => { if (!d) return "-"; const date = new Date(d); return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", }); };

const months = [ { v: 1, label: "มกราคม" }, { v: 2, label: "กุมภาพันธ์" }, { v: 3, label: "มีนาคม" }, { v: 4, label: "เมษายน" }, { v: 5, label: "พฤษภาคม" }, { v: 6, label: "มิถุนายน" }, { v: 7, label: "กรกฎาคม" }, { v: 8, label: "สิงหาคม" }, { v: 9, label: "กันยายน" }, { v: 10, label: "ตุลาคม" }, { v: 11, label: "พฤศจิกายน" }, { v: 12, label: "ธันวาคม" }, ];

export default function BillOverviewPage() { const { handleLogout, role, adminName, adminUsername } = useAuth(); const pendingBookings = usePendingBookings(); const pendingCheckouts = usePendingCheckouts();

const [rooms, setRooms] = useState<Room[]>([]); const [bills, setBills] = useState<Bill[]>([]);

const now = new Date(); const [year, setYear] = useState<number | "all">(now.getFullYear()); const [month, setMonth] = useState<number | "all">(now.getMonth() + 1);

useEffect(() => { axios.get(${API}/room/getall).then((r) => setRooms(r.data)); axios.get(${API}/bill/getall).then((r) => setBills(r.data)); }, []);

const years = useMemo(() => { const ys = bills.map((b) => new Date(b.month).getFullYear()); return Array.from(new Set(ys)).sort((a, b) => b - a); }, [bills]);

const filteredBills = useMemo(() => { return bills.filter((b) => { const d = new Date(b.month); if (year !== "all" && d.getFullYear() !== year) return false; if (month !== "all" && d.getMonth() + 1 !== month) return false; return true; }); }, [bills, year, month]);

const billMap = useMemo(() => { const m = new Map<string, Bill>(); filteredBills.forEach((b) => m.set(b.roomId, b)); return m; }, [filteredBills]);

return ( <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#F7F4FD", fontFamily: "Sarabun, sans-serif" }} > <Nav
onLogout={handleLogout}
role={role}
adminName={adminName}
adminUsername={adminUsername}
pendingBookings={pendingBookings}
pendingCheckouts={pendingCheckouts}
/>

<main className="main-content mt-5 pt-4 px-2">
    <div
      className="container-fluid px-xl-5 py-4"
      style={{ background: BG_SOFT, borderRadius: 20 }}
    >
      <h2
        className="fw-bold text-center mb-4"
        style={{ color: SCB_PURPLE }}
      >
        🧾 ภาพรวมบิลรายเดือน
      </h2>

      {/* Filters */}
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-4">
        <select
          className="form-select shadow-sm"
          style={{ width: 150 }}
          value={month}
          onChange={(e) =>
            setMonth(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
        >
          <option value="all">ทุกเดือน</option>
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
          onChange={(e) =>
            setYear(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
        >
          <option value="all">ทุกปี</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y + 543}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {rooms.map((r) => {
          const bill = billMap.get(r.roomId);

          let bg = "bg-secondary"; // เทา
          let text = "text-white";
          if (bill) {
            if (bill.billStatus === 1) bg = "bg-success"; // เขียว
            else bg = "bg-warning"; // เหลือง
            text = "text-dark";
          }

          return (
            <div key={r.roomId} className="col-6 col-md-4 col-lg-2">
              <div className={`card h-100 text-center ${bg} ${text}`}
                   style={{ minHeight: 120 }}>
                <div className="card-body d-flex flex-column justify-content-between p-2">
                  <div className="fw-bold">ห้อง {r.number}</div>

                  {bill ? (
                    <div className="small">
                      <div>รวม {bill.total.toLocaleString()} บาท</div>
                      <div>ครบกำหนด {formatThaiDate(bill.dueDate)}</div>
                    </div>
                  ) : (
                    <div className="small opacity-75">ยังไม่มีบิล</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </main>
</div>

); }