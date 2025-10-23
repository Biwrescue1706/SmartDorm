import { useState, useEffect } from "react";
import BookingFilter from "../components/Booking/BookingFilter";
import BookingTable from "../components/Booking/BookingTable";
import { useBookings } from "../hooks/useBookings";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";

export default function Booking() {
  const [pendingBookings] = useState(0);
  const { message, handleLogout, role } = useAuth();
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
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // กรองข้อมูลเมื่อ bookings หรือ active เปลี่ยน
  useEffect(() => {
    if (active === "all") setFiltered(bookings);
    else if (active === "pending")
      setFiltered(bookings.filter((b) => b.approveStatus === 0));
    else if (active === "approved")
      setFiltered(bookings.filter((b) => b.approveStatus === 1));
    else if (active === "rejected")
      setFiltered(bookings.filter((b) => b.approveStatus === 2));
  }, [bookings, active]);

  // เปลี่ยนสถานะการกรอง
  const handleFilter = (
    status: "all" | "pending" | "approved" | "rejected"
  ) => {
    setActive(status);
  };

  return (
    <div className="d-flex min-vh-50 bg-white">
      <Nav
        message={message}
        onLogout={handleLogout}
        pendingBookings={pendingBookings}
        role={role}
      />

      <main className="main-content flex-grow-1 px-1 py-5 mt-2 mt-lg-3">
        <div className="mx-auto container-max">
          <h2
            className="mb-3 mt-2 py-2 text-center fw-bold text-white rounded shadow-sm"
            style={{
              background: "linear-gradient(100deg, #007bff, #00d4ff)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              fontSize: "1.4rem",
            }}
          >
            จัดการการจอง
          </h2>

          <BookingFilter active={active} onChange={handleFilter} />

          {loading ? (
            <p className="text-center text-muted mt-3">กำลังโหลดข้อมูล...</p>
          ) : (
            <BookingTable
              bookings={filtered}
              onApprove={approveBooking}
              onReject={rejectBooking}
              onDelete={deleteBooking}
              onEditSuccess={() => fetchBookings()}
              onCheckin={checkinBooking}
            />
          )}
        </div>
      </main>
    </div>
  );
}
