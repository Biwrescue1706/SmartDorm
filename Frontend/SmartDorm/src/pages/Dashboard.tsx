// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";
import { useBookings } from "../hooks/useBookings";
import { useCheckouts } from "../hooks/useCheckouts";
import { useBills } from "../hooks/useBills";
import DashboardSummary from "../components/Dashboard/DashboardSummary";
import DashboardRevenue from "../components/Dashboard/DashboardRevenue";
import type { Booking, Checkout } from "../types/Booking";

export default function Dashboard() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const { rooms, fetchRooms } = useRooms();
  const { bookings: rawBookings, fetchBookings } = useBookings();
  const { checkouts, fetchCheckouts } = useCheckouts();
  const { bills, fetchBills } = useBills();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [pendingCheckouts, setPendingCheckouts] = useState(0);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    fetchRooms();
    fetchBookings();
    fetchCheckouts();
    fetchBills();
  }, []);

  /* =========================
     MAP BOOKINGS ให้ตรง type
  ========================= */
  useEffect(() => {
    if (Array.isArray(rawBookings)) {
      const mapped: Booking[] = rawBookings.map((b) => ({
        bookingId: b.bookingId,
        roomId: b.room?.roomId || "",
        customerId: b.customer?.customerId || "",
        fullName: b.fullName,
        ctitle: b.ctitle,
        cname: b.cname,
        csurname: b.csurname,
        cphone: b.cphone,
        cmumId: b.cmumId,
        bookingDate: b.bookingDate,
        approveStatus: b.approveStatus,
        checkinAt: b.checkinAt ?? undefined,
        // สำหรับ checkout ใช้ array checkout[], คำนวณ checkoutAt ล่าสุด
        checkout: b.checkout ?? [],
        createdAt: b.createdAt ?? new Date().toISOString(),
        updatedAt: b.updatedAt ?? new Date().toISOString(),
        slipUrl: b.slipUrl,
        checkinStatus: b.checkinStatus,
        checkin: b.checkin,
        room: b.room,
        customer: b.customer,
      }));
      setBookings(mapped);
    }
  }, [rawBookings]);

  /* =========================
     CALCULATE PENDING
  ========================= */
  useEffect(() => {
    setPendingBookings(
      bookings.filter((b) => b.approveStatus === 0).length
    );

    setPendingCheckouts(
      Array.isArray(checkouts)
        ? checkouts.filter((c: Checkout) => c.checkoutStatus === 0).length
        : 0
    );
  }, [bookings, checkouts]);

  /* =========================
     ROOM STATS
  ========================= */
  const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
  const availableRooms = Array.isArray(rooms)
    ? rooms.filter((r) => r.status === 0).length
    : 0;
  const bookedRooms = Array.isArray(rooms)
    ? rooms.filter((r) => r.status === 1).length
    : 0;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundColor: "#F7F4FD",
        fontFamily: "Sarabun, sans-serif",
      }}
    >
      {/* NAVBAR */}
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
          <h2
            className="fw-bold text-center mb-4 mt-3"
            style={{
              color: "#4A0080",
              textShadow: "0px 1px 3px rgba(74,0,128,0.2)",
            }}
          >
            📊 สรุปข้อมูลหอพัก SmartDorm
          </h2>

          {/* SUMMARY */}
          <DashboardSummary
            totalRooms={totalRooms}
            availableRooms={availableRooms}
            bookedRooms={bookedRooms}
            pendingBookings={pendingBookings}
            pendingCheckouts={pendingCheckouts}
          />

          {/* REVENUE */}
          <DashboardRevenue bills={bills} bookings={bookings} />
        </div>
      </main>
    </div>
  );
}