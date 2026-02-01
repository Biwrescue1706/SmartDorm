// src/pages/BookingHistory.tsx
import { useMemo, useState } from "react";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import { useAuth } from "../hooks/useAuth";
import { useBookingHistory } from "../hooks/useBookingHistory";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";

//   SCB THEME
const SCB_PURPLE = "#4A0080";
const BG_SOFT = "#F8F5FC";

//   Utils
const formatThaiDate = (d?: string | null) => {
  if (!d) return "- ยังเช่าอยู่ -";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "- รออนุมัติ -"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
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
  if (v === 0) return "ยังเช่าอยู่";
  if (v === 1) return "เช็คเอาท์แล้ว";
  return "-";
};

const months = [
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

const Divider = () => (
  <hr
    className="mt-3 mb-3 pt-0"
    style={{
      border: "none",
      borderTop: "2px solid #000000",
      opacity: 1,
    }}
  />
);

//   Page
export default function BookingHistory() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { data, loading, search, setSearch, refetch } = useBookingHistory();

  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  /* ---------- filters ---------- */
  const [status, setStatus] = useState<"all" | "booked" | "returned">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [month, setMonth] = useState<number | "all">("all");

  /* ---------- pagination ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
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

        if (month !== "all" && b.bookingDate) {
          if (new Date(b.bookingDate).getMonth() + 1 !== month) return false;
        }

        const q = search.toLowerCase();

        const roomNo = String(b.room?.number ?? "").toLowerCase();
        const name = String(b.fullName ?? "").toLowerCase();
        const line = String(b.customer?.userName ?? "").toLowerCase();
        const phone = String(b.cphone ?? "");

        return (
          roomNo.includes(q) ||
          name.includes(q) ||
          line.includes(q) ||
          phone.includes(q)
        );
      })
      .sort(
        (a, b) => Number(a.room?.number || 0) - Number(b.room?.number || 0),
      );
  }, [data, search, status, year, month]);

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
        style={{ paddingLeft: "20px", paddingRight: "20px" }}
      >
        <div
          className="mx-auto"
          style={{
            background: BG_SOFT,
            borderRadius: 20,
            maxWidth: "1400px",
            padding: "20px",
          }}
        >
          <h2
            className="fw-bold text-center mb-4"
            style={{ color: SCB_PURPLE }}
          >
            📑 ประวัติการจองทั้งหมด
          </h2>

          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-3">
            {/* Status (dropdown เมื่อ < 1400) */}
            {!isTable
              ? (() => {
                  const items = [
                    { key: "all", label: "ทั้งหมด", color: "#f1c40f" },
                    { key: "booked", label: "เช่าอยู่", color: "#0d6efd" },
                    { key: "returned", label: "คืนแล้ว", color: "#198754" },
                  ];

                  const activeItem =
                    items.find((i) => i.key === status) ?? items[0];

                  return (
                    <div className="dropdown">
                      <button
                        className="btn dropdown-toggle fw-bold px-3"
                        data-bs-toggle="dropdown"
                        style={{
                          background: activeItem.color,
                          color: "#fff",
                          borderColor: activeItem.color,
                          height: 38,
                        }}
                      >
                        {activeItem.label}
                      </button>

                      <div className="dropdown-menu">
                        {items.map((i) => (
                          <button
                            key={i.key}
                            className="dropdown-item fw-bold"
                            style={{
                              background:
                                status === i.key ? i.color : "transparent",
                              color: status === i.key ? "#fff" : i.color,
                            }}
                            onClick={() => {
                              setStatus(i.key as any);
                              setCurrentPage(1);
                            }}
                          >
                            {i.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()
              : null}

            {/* Search */}
            <input
              className="form-control shadow-sm"
              style={{ width: 220 }}
              placeholder="ค้นหา ห้อง / ชื่อ / LINE / เบอร์"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Year */}
            <select
              className="form-select shadow-sm"
              style={{ width: 120 }}
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

            {/* Month */}
            <select
              className="form-select shadow-sm"
              style={{ width: 150 }}
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value === "all" ? "all" : Number(e.target.value),
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

            {/* Reset */}
            <button
              className="btn btn-outline-secondary fw-semibold"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setYear("all");
                setMonth("all");
                setCurrentPage(1);
                refetch();
              }}
            >
              🔄 รีเซ็ตข้อมูล
            </button>
          </div>

          {/* TABLE */}
          {isTable ? (
            <div className="responsive-table" style={{ overflowX: "auto" }}>
              <table
                className="table table-sm table-striped align-middle text-center"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
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
                    <th>สถานะอนุมัติการคืน</th>
                    <th>วันที่อนุมัติการคืน</th>
                    <th>สถานะคืนกุญแจ</th>
                    <th>วันที่คืนกุญแจ</th>
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

                      {b.checkout === null ? (
                        <>
                          <td
                            colSpan={5}
                            className="text-primary fw-semibold text-center"
                          >
                            กำลังเช่าอยู่
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{formatThaiDate(b.checkout)}</td>
                          <td>{approvalText(b.ReturnApprovalStatus)}</td>
                          <td>{formatThaiDate(b.RefundApprovalDate)}</td>
                          <td>{checkoutText(b.checkoutStatus)}</td>
                          <td>{formatThaiDate(b.checkoutAt)}</td>
                        </>
                      )}
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
                  className={`col-12 ${isMobile ? "" : "col-md-5"} px-1`}
                  style={{
                    border: "2px solid #000",
                    borderRadius: "12px",
                  }}
                >
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <h5
                        className="fw-bold mb-2 text-center justify-content-center"
                        style={{ color: SCB_PURPLE }}
                      >
                        ห้อง {b.room?.number}
                      </h5>
                      <Divider />
                      <h5 className="fw-bold mb-2 text-center justify-content-center">
                        รายละเอียดผู้เช่า
                      </h5>

                      <div className="fw-bold h6">ชื่อ : {b.fullName}</div>
                      <div className="fw-bold h6">
                        LINE : {b.customer?.userName || "-"}
                      </div>
                      <div className="fw-bold h6">
                        เบอร์ : {b.cphone || "-"}
                      </div>
                      <div className="fw-bold h6">
                        จอง : {formatThaiDate(b.bookingDate)}
                      </div>
                      <div className="fw-bold h6">
                        แจ้งเข้าพัก : {formatThaiDate(b.checkin)}
                      </div>
                      <div className="fw-bold h6 mb-3">
                        เข้าพักจริง : {formatThaiDate(b.checkinAt)}
                      </div>

                      {b.checkout === null ? (
                        <>
                          <Divider />
                          <div className="text-primary fw-semibold mt-3 mb-3 text-center justify-content-center">
                            กำลังเช่าอยู่
                          </div>
                        </>
                      ) : (
                        <>
                          <Divider />
                          <h5 className="fw-bold text-center justify-content-center">
                            รายละเอียดการคืนห้อง
                          </h5>
                          <br />
                          <div className="fw-bold h6">
                            ขอคืน : {formatThaiDate(b.checkout)}
                          </div>
                          <div className="fw-bold h6">
                            สถานะการอนุมัติคืน :{" "}
                            {approvalText(b.ReturnApprovalStatus)}
                          </div>
                          <div className="fw-bold h6">
                            วันอนุมัติการคืน :{" "}
                            {formatThaiDate(b.RefundApprovalDate)}
                          </div>
                          <div className="fw-bold h6">
                            สถานะคืนกุญแจ : {checkoutText(b.checkoutStatus)}
                          </div>
                          <div className="fw-bold h6">
                            วันคืนกุญแจ : {formatThaiDate(b.checkoutAt)}
                          </div>
                        </>
                      )}
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
    </div>
  );
}
