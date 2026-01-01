// src/pages/ManageRooms/Booking.tsx
import { useState, useEffect } from "react";
import BookingFilter from "../../components/Booking/BookingFilter";
import BookingTable from "../../components/Booking/BookingTable";
import { useBookings } from "../../hooks/useBookings";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";

export default function Booking() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const {
    bookings,
    loading,
    fetchBookings,
    approveBooking,
    rejectBooking,
    deleteBooking,
    checkinBooking,
  } = useBookings();

  const [filtered, setFiltered] = useState<typeof bookings>([]);
  const [active, setActive] = useState<
    "pending" | "approved" | "rejected" | "checkinPending"
  >("pending");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ---------------- FILTER LOGIC ---------------- */
  useEffect(() => {
  setFiltered(
    active === "pending"
      ? bookings.filter((b) => b.approveStatus === 0)
      : active === "approved"
      ? bookings.filter((b) => b.approveStatus === 1 && b.checkinAt)
      : active === "rejected"
      ? bookings.filter((b) => b.approveStatus === 2)
      : bookings.filter(
          (b) => b.approveStatus === 1 && !b.checkinAt
        )
  );
  setCurrentPage(1);
}, [active, bookings]);

  const handleFilter = (
    status: "pending" | "approved" | "rejected" | "checkinPending"
  ) => setActive(status);

  return (
    <div className="d-flex bg-white min-vh-100">
      {/* -------- NAV -------- */}
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      {/* -------- CONTENT -------- */}
      <main className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7">
        <div className="mx-auto" style={{ maxWidth: "1300px" }}>
          <h2
            className="fw-bold text-center py-2 mt-1"
            style={{
              color: "#4A0080",
              borderBottom: "3px solid #B39DDB",
              width: "fit-content",
              margin: "0 auto 18px",
            }}
          >
            จัดการการจอง
          </h2>

          {/* -------- REFRESH BUTTON -------- */}
          <div className="text-center mb-3">
            <button
              className="btn fw-semibold shadow-sm px-4 py-2"
              style={{
                background:
                  "linear-gradient(135deg, #4A148C, #7B1FA2, #CE93D8)",
                color: "#fff",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={fetchBookings}
              disabled={loading}
            >
              {loading ? "⏳ กำลังโหลด..." : "🔄 รีเฟรชข้อมูล"}
            </button>
          </div>

          {/* -------- FILTER BAR -------- */}
          <div
            className="py-2 mb-3"
            style={{
              background: "#F3E5F5",
              borderRadius: "12px",
              border: "1px solid #E1BEE7",
            }}
          >
            <BookingFilter
              active={active}
              onChange={handleFilter}
              bookings={bookings}
            />
          </div>

          {/* -------- TABLE / CARD VIEW -------- */}
          {loading ? (
            <p className="text-center text-muted mt-3">⏳ กำลังโหลดข้อมูล...</p>
          ) : (
            <BookingTable
              bookings={filtered}
              onApprove={approveBooking}
              onReject={rejectBooking}
              onDelete={deleteBooking}
              onEditSuccess={fetchBookings}
              onCheckin={checkinBooking}
              role={role}
              showActualColumn={
                active === "approved" || active === "checkinPending"
              }
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}