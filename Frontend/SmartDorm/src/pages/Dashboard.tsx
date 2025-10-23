// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";
import Nav from "../components/Nav";
import DashboardTable from "../components/Dashboard/DashboardTable";

export default function Dashboard() {
  const { rooms, loading, fetchRooms } = useRooms(); //  ดึง fetchRooms มาใช้
  const [pendingBookings] = useState(0);
  const { message, handleLogout, role } = useAuth();

  //  โหลดข้อมูลห้องเมื่อเข้า Dashboard ครั้งแรก
  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="d-flex min-vh-100 bg-white">
      {/* Sidebar */}
      <Nav
        message={message}
        onLogout={handleLogout}
        pendingBookings={pendingBookings}
        role={role}
      />

      {/* Main Content */}
      <main className="main-content flex-grow-1 px-1 py-5 mt-3 mt-lg-5">
        <div className="mx-auto container-max">
          <h2 className="mb-1 py-1 text-center text-while">
            📋 รายการห้องพักทั้งหมด
          </h2>

          {loading ? (
            <p className="text-center text-muted mt-4">กำลังโหลด...</p>
          ) : (
            <DashboardTable rooms={rooms} />
          )}
        </div>
      </main>
    </div>
  );
}
