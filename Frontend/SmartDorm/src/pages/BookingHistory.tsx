import { useMemo, useState } from "react";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import { useAuth } from "../hooks/useAuth";
import { useBookingHistory } from "../hooks/useBookingHistory";

/* =======================
   SCB THEME
======================= */
const SCB_PURPLE = "#4A0080";
const BG_SOFT = "#F8F5FC";

/* =======================
   Utils
======================= */
const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const toBEYear = (y: number) => y + 543;

/* =======================
   Page
======================= */
export default function BookingHistory() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { data, loading, search, setSearch, refetch } = useBookingHistory();

  /* ---------- filters ---------- */
  const [status, setStatus] = useState<"all" | "booked" | "returned">("all");
  const [year, setYear] = useState<number | "all">("all");

  /* ---------- pagination ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ---------- responsive ---------- */
  const width = window.innerWidth;
  const isTable = width >= 1400;
  const isMobile = width < 600;

  /* ---------- year list ---------- */
  const years = useMemo(() => {
    const ys = data
      .map((b) => (b.createdAt ? new Date(b.createdAt).getFullYear() : null))
      .filter((y): y is number => y !== null);
    return Array.from(new Set(ys)).sort((a, b) => b - a);
  }, [data]);

  /* ---------- filter + sort ---------- */
  const filtered = useMemo(() => {
    return data
      .filter((b) => {
        if (status === "booked" && b.actualCheckout) return false;
        if (status === "returned" && !b.actualCheckout) return false;

        if (year !== "all" && b.createdAt) {
          if (new Date(b.createdAt).getFullYear() !== year) return false;
        }

        const q = search.toLowerCase();
        return (
          b.room?.number?.toLowerCase().includes(q) ||
          b.fullName?.toLowerCase().includes(q) ||
          b.customer?.userName?.toLowerCase().includes(q) ||
          b.cphone?.includes(q)
        );
      })
      .sort(
        (a, b) => Number(a.room?.number || 0) - Number(b.room?.number || 0)
      );
  }, [data, search, status, year]);

  /* ---------- pagination ---------- */
  const totalItems = filtered.length;
  const start = (currentPage - 1) * rowsPerPage;
  const paged = filtered.slice(start, start + rowsPerPage);

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border" style={{ color: SCB_PURPLE }} />
      </div>
    );

  return (
    <>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
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
            📑 ประวัติการจองทั้งหมด
          </h2>

          {/* Search + Refresh */}
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="input-group shadow-sm">
                <input
                  className="form-control"
                  placeholder="ค้นหา ห้อง / ชื่อ / LINE / เบอร์"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary fw-semibold"
                  onClick={() => {
  setSearch("");
  setStatus("all");
  setYear("all");
  setCurrentPage(1);
  refetch();
}}
                >
                  รีเฟรช
                </button>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="row g-3 justify-content-center mb-3">
            {[
              { key: "all", label: "ทั้งหมด", color: "warning" },
              { key: "booked", label: "เช่าอยู่", color: "primary" },
              { key: "returned", label: "คืนแล้ว", color: "success" },
            ].map((s: any) => (
              <div key={s.key} className="col-12 col-sm-4 col-lg-3">
                <div
                  className={`card text-center h-100 shadow-sm ${
                    status === s.key ? `border-${s.color}` : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setStatus(s.key);
                    setCurrentPage(1);
                  }}
                >
                  <div className="card-body py-3">
                    <h5 className={`fw-bold text-${s.color}`}>{s.label}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Year Filter */}
          <div className="d-flex justify-content-center mb-4">
            <select
              className="form-select w-auto shadow-sm"
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
                  {toBEYear(y)}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE >=1400 */}
          {isTable ? (
            <div className="table-responsive shadow rounded">
              <table className="table table-hover align-middle text-center mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>ห้อง</th>
                    <th>LINE</th>
                    <th>ชื่อ</th>
                    <th>เบอร์</th>
                    <th>วันที่จอง</th>
                    <th>วันทีแจ้งเข้าพัก</th>
                    <th>เข้าพักจริง</th>
                    <th>วันที่ขอคืน</th>
                    <th>เช็คเอาท์จริง</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((b, i) => (
                    <tr key={b.bookingId}>
                      <td>{start + i + 1}</td>
                      <td>{b.room?.number}</td>
                      <td>{b.customer?.userName || "-"}</td>
                      <td>{b.fullName || "-"}</td>
                      <td>{b.cphone || "-"}</td>
                      <td>{formatThaiDate(b.createdAt)}</td>
                      <td>{formatThaiDate(b.checkin)}</td>
                      <td>{formatThaiDate(b.actualCheckin)}</td>
                      <td>{formatThaiDate(b.requestedCheckout)}</td>
                      <td>{formatThaiDate(b.actualCheckout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD <1400 */
            <div className="row g-3">
              {paged.map((b) => (
                <div
                  key={b.bookingId}
                  className={`col-12 ${isMobile ? "" : "col-md-4"}`}
                >
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <h5
                        className="fw-bold mb-2"
                        style={{ color: SCB_PURPLE }}
                      >
                        ห้อง {b.room?.number}
                      </h5>
                      <div className="small">
                        <b>ชื่อ : </b> {b.fullName}
                      </div>
                      <div className="small">
                        <b>LINE : </b> {b.customer?.userName || "-"}
                      </div>
                      <div className="small">
                        <b>เบอร์โทร : </b> {b.cphone || "-"}
                      </div>
<div className="small">
                        <b>จอง : </b> {formatThaiDate(b.createdAt)}
                      </div>
                      <div className="small">
                        <b>วันทีแจ้งเข้าพัก : </b> {formatThaiDate(b.checkin)}
                      </div>
                      <div className="small">
                        <b>เข้าพักจริง : </b> {formatThaiDate(b.actualCheckin)}
                      </div>
                      <div className="small">
                        <b>วันที่ขอคืน : </b>{" "}
                        {formatThaiDate(b.requestedCheckout)}
                      </div>
                      <div className="small">
                        <b>เช็คเอาท์จริง : </b>{" "}
                        {formatThaiDate(b.actualCheckout)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(r) => {
              setRowsPerPage(r);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>
    </>
  );
}
