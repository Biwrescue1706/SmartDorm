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
  const { handleLogout, role, adminName, adminUsername } = useAuth();
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
        backgroundColor: "#F7F4FD",
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

      {/* MAIN CONTENT */}
      <main className="main-content flex-grow-1 px-4 py-4 mt-6 mt-lg-6">
        <div className="mx-auto container-max">
          {/* ⭐ หัวข้อใหญ่ */}
          <h2
            className="fw-bold text-center mb-4 mt-3"
            style={{
              color: "#4A0080",
              textShadow: "0px 1px 3px rgba(74,0,128,0.2)",
            }}
          >
            📊 สรุปข้อมูลหอพัก SmartDorm
          </h2>

          {/* 🔥 ส่วนสรุป Dashboard */}
          <DashboardSummary
            totalRooms={totalRooms}
            availableRooms={availableRooms}
            bookedRooms={bookedRooms}
            pendingBookings={pendingBookings}
            pendingCheckouts={pendingCheckouts}
          />

          {/* 💜 รายรับ Dashboard */}
          <DashboardRevenue bills={bills} bookings={bookings} />
        </div>
      </main>
    </div>
  );
}
