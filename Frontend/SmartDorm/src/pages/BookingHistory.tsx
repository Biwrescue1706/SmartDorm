// src/pages/BookingHistory.tsx
import { useMemo, useState } from "react";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import { useAuth } from "../hooks/useAuth";
import { useBookingHistory } from "../hooks/useBookingHistory";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";

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

const approvalText = (v?: number | null) => {
  if (v === 0) return "รออนุมัติ";
  if (v === 1) return "อนุมัติแล้ว";
  if (v === 2) return "ปฏิเสธ";
  return "-";
};

const checkoutText = (v?: number | null) => {
  if (v === 0) return "ยังไม่เช็คเอาท์";
  if (v === 1) return "เช็คเอาท์แล้ว";
  return "-";
};

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
      .map((b) =>
        b.bookingDate ? new Date(b.bookingDate).getFullYear() : null,
      )
      .filter((y): y is number => y !== null);

    return Array.from(new Set(ys)).sort((a, b) => b - a);
  }, [data]);

  /* ---------- filter + sort ---------- */
  const filtered = useMemo(() => {
    return data
      .filter((b) => {
        const isReturned = b.checkoutAt != null;

        if (status === "booked" && isReturned) return false;
        if (status === "returned" && !isReturned) return false;

        if (year !== "all" && b.bookingDate) {
          if (new Date(b.bookingDate).getFullYear() !== year) return false;
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
        (a, b) => Number(a.room?.number || 0) - Number(b.room?.number || 0),
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

  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  return (
    <>
      <Nav
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
            📑 ประวัติการจองทั้งหมด
          </h2>

          {/* Search */}
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

          {/* Status */}
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

          {/* Year */}
          <div className="d-flex justify-content-center mb-4">
            <select
              className="form-select w-auto shadow-sm"
              value={year}
              onChange={(e) =>
                setYear(
                  e.target.value === "all" ? "all" : Number(e.target.value),
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

          {/* TABLE */}
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
                    <th>แจ้งเข้าพัก</th>
                    <th>เข้าพักจริง</th>
                    <th>วันที่ขอคืน</th>
                    <th>สถานะคืน</th>
                    <th>คืนอนุมัติ</th>
                    <th>สถานะเช็คเอาท์</th>
                    <th>คืนจริง</th>
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
                      <td>{formatThaiDate(b.bookingDate)}</td>
                      <td>{formatThaiDate(b.checkin)}</td>
                      <td>{formatThaiDate(b.checkinAt)}</td>
                      <td>{formatThaiDate(b.checkout)}</td>
                      <td>{approvalText(b.ReturnApprovalStatus)}</td>
                      <td>{formatThaiDate(b.RefundApprovalDate)}</td>
                      <td>{checkoutText(b.checkoutStatus)}</td>
                      <td>{formatThaiDate(b.checkoutAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD */
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
                        <b>ชื่อ :</b> {b.fullName}
                      </div>
                      <div className="small">
                        <b>LINE :</b> {b.customer?.userName || "-"}
                      </div>
                      <div className="small">
                        <b>เบอร์ :</b> {b.cphone || "-"}
                      </div>
                      <div className="small">
                        <b>จอง :</b> {formatThaiDate(b.bookingDate)}
                      </div>
                      <div className="small">
                        <b>แจ้งเข้าพัก :</b> {formatThaiDate(b.checkin)}
                      </div>
                      <div className="small">
                        <b>เข้าพักจริง :</b> {formatThaiDate(b.checkinAt)}
                      </div>
                      <div className="small">
                        <b>ขอคืน :</b> {formatThaiDate(b.checkout)}
                      </div>
                      <div className="small">
                        <b>สถานะการคืน :</b>{" "}
                        {approvalText(b.ReturnApprovalStatus)}
                      </div>
                      <div className="small">
                        <b>คืนอนุมัติ :</b>{" "}
                        {formatThaiDate(b.RefundApprovalDate)}
                      </div>
                      <div className="small">
                        <b>สถานะเช็คเอาท์ :</b>{" "}
                        {checkoutText(b.checkoutStatus)}
                      </div>
                      <div className="small">
                        <b>คืนจริง :</b> {formatThaiDate(b.checkoutAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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