import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";
import { useBookings } from "../hooks/useBookings";
import { useCheckouts } from "../hooks/useCheckouts";
import { useBills } from "../hooks/useBills";
import DashboardSummary from "../components/Dashboard/DashboardSummary";
import DashboardRevenue from "../components/Dashboard/DashboardRevenue";

export default function Dashboard() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();
  const { rooms, fetchRooms } = useRooms();
  const { bookings, fetchBookings } = useBookings();
  const { checkouts, fetchCheckouts } = useCheckouts();
  const { bills, fetchBills } = useBills();

  const [pendingBookings, setPendingBookings] = useState(0);
  const [pendingCheckouts, setPendingCheckouts] = useState(0);

  useEffect(() => {
    Promise.all([
      fetchRooms(),
      fetchBookings(),
      fetchCheckouts(),
      fetchBills(),
    ]);
  }, []);

  useEffect(() => {
    setPendingBookings(bookings.filter((b) => b.approveStatus === 0).length);
    setPendingCheckouts(checkouts.filter((c) => c.returnStatus === 0).length);
  }, [bookings, checkouts]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 0).length;
  const bookedRooms = rooms.filter((r) => r.status === 1).length;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundColor: "#F7F4FD", // SCB Lavender BG
        fontFamily: "Sarabun, sans-serif",
      }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
      />

      <main className="flex-grow-1 px-2 py-3 mt-6 mt-lg-7">
        <div className="container" style={{ maxWidth: "1400px" }}>
          <h2
            className="fw-bold text-center mb-4"
            style={{
              color: "#4A0080", // SCB Purple
              textShadow: "0px 1px 3px rgba(74,0,128,0.2)",
              letterSpacing: "0.5px",
            }}
          >
            📊 สรุปข้อมูลหอพัก SmartDorm
          </h2>

          {/* รายงานสรุป */}
          <DashboardSummary
            totalRooms={totalRooms}
            availableRooms={availableRooms}
            bookedRooms={bookedRooms}
            pendingBookings={pendingBookings}
            pendingCheckouts={pendingCheckouts}
          />

          {/* รายงานรายรับ */}
          <DashboardRevenue bills={bills} bookings={bookings} />

          {/* ลิขสิทธิ์ */}
          <div className="text-center mt-5 mb-3">
            <small style={{ color: "#4A0080", opacity: 0.7 }}>
              © 2025 SmartDorm Management System · SCB Theme Edition
            </small>
          </div>
        </div>
      </main>
    </div>
  );
}