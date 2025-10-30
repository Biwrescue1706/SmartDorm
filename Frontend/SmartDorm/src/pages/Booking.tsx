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
    "pending" | "approved" | "rejected" | "checkinPending"
  >("pending");

  // กรองข้อมูลเมื่อ bookings หรือ active เปลี่ยน
  useEffect(() => {
    if (active === "pending")
      setFiltered(bookings.filter((b) => b.approveStatus === 0));
    else if (active === "approved")
      setFiltered(bookings.filter((b) => b.approveStatus === 1));
    else if (active === "rejected")
      setFiltered(bookings.filter((b) => b.approveStatus === 2));
    else if (active === "checkinPending")
      setFiltered(
        bookings.filter((b) => b.approveStatus === 1 && !b.actualCheckin)
      );
  }, [bookings, active]);

  // เปลี่ยนสถานะการกรอง
  const handleFilter = (
    status: "pending" | "approved" | "rejected" | "checkinPending"
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

      <main className="main-content flex-grow-1 px-1 py-5 mt-3 mt-lg-4">
        <div className="mx-auto container-max">
          <h2 className="mb-1 py-1 text-center text-while mb-3">
            จัดการการจอง
          </h2>
          <div className="mb-1 py-1 text-center text-while mb-3">
            <BookingFilter
              active={active}
              onChange={handleFilter}
              bookings={bookings} // ✅ ส่งข้อมูลทั้งหมดมาเพื่อคำนวณจำนวน
            />
          </div>

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
