//src/pages/Booking.tsx
import { useState, useEffect } from "react";
import BookingFilter from "../components/Booking/BookingFilter";
import BookingTable from "../components/Booking/BookingTable";
import { useBookings } from "../hooks/useBookings";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";

export default function Booking() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

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

  // ⭐ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ⭐ กรองข้อมูลตามเงื่อนไขใหม่
  useEffect(() => {
    if (active === "pending") {
      // → รออนุมัติ
      setFiltered(bookings.filter((b) => b.approveStatus === 0));
    } else if (active === "approved") {
      // → อนุมัติแล้ว และต้องมี actualCheckin แล้ว
      setFiltered(
        bookings.filter((b) => b.approveStatus === 1 && b.actualCheckin != null)
      );
    } else if (active === "rejected") {
      // → ไม่อนุมัติ
      setFiltered(bookings.filter((b) => b.approveStatus === 2));
    } else if (active === "checkinPending") {
      // → รอเข้าพัก = อนุมัติแล้ว & ยังไม่เช็คอิน
      setFiltered(
        bookings.filter((b) => b.approveStatus === 1 && b.actualCheckin == null)
      );
    }

    // เปลี่ยน filter หรือข้อมูล เปลี่ยนหน้าให้กลับไปหน้า 1
    setCurrentPage(1);
  }, [bookings, active]);

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
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="py-1 text-center text-while mt-3 mb-3">จัดการการจอง</h2>

          {/* ปุ่มรีเฟรช */}
          <div className="text-center mb-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={fetchBookings}
              disabled={loading}
            >
              {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
            </button>
          </div>

          {/* ฟิลเตอร์ */}
          <div className="py-1 text-center text-while mb-3">
            <BookingFilter
              active={active}
              onChange={handleFilter}
              bookings={bookings}
            />
          </div>

          {/* ตาราง / การ์ด */}
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
              role={role}
              // แสดงคอลัมน์ "เข้าพักจริง" เฉพาะ 2 แท็บนี้
              showActualColumn={
                active === "approved" || active === "checkinPending"
              }
              // Pagination
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
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
