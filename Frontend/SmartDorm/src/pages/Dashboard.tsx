// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/ManageRooms/useRooms";
import { useBookings } from "../hooks/ManageRooms/useBookings";
import { useBills } from "../hooks/Bill/useBills";
import DashboardSummary from "../components/Dashboard/DashboardSummary";
import DashboardRevenue from "../components/Dashboard/DashboardRevenue";
import type { Booking } from "../types/Booking";

export default function Dashboard() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const { rooms, fetchRooms } = useRooms();
  const { bookings: rawBookings, fetchBookings } = useBookings();
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
    fetchBills();
  }, []);

  /* =========================
     MAP BOOKINGS ให้ตรง type
  ========================= */
  useEffect(() => {
    if (Array.isArray(rawBookings)) {
      const mapped: Booking[] = rawBookings.map((b) => ({
        bookingId: b.bookingId,
        roomId: b.roomId,
        customerId: b.customerId,

        fullName: b.fullName,
        ctitle: b.ctitle,
        cname: b.cname,
        csurname: b.csurname,
        cphone: b.cphone,
        cmumId: b.cmumId,

        checkin: b.checkin,
        checkinAt: b.checkinAt ?? undefined,
        checkinStatus: b.checkinStatus,

        approveStatus: b.approveStatus,
        approvedAt: b.approvedAt ?? undefined,

        bookingDate: b.bookingDate,
        slipUrl: b.slipUrl,

        createdAt: b.createdAt ?? new Date().toISOString(),
        updatedAt: b.updatedAt ?? new Date().toISOString(),

        room: b.room,
        customer: b.customer,
        checkout: b.checkout?.map((c) => ({
          checkoutId: c.checkoutId,
          checkout: c.checkout,
          checkoutAt: c.checkoutAt ?? undefined,
          checkoutStatus: c.checkoutStatus,
        })),
      }));

      setBookings(mapped);
    }
  }, [rawBookings]);

  /* =========================
     CALCULATE PENDING
  ========================= */
  useEffect(() => {
    // pending bookings
    setPendingBookings(
      bookings.filter((b) => b.approveStatus === 0).length
    );

    // pending checkouts
    const pending = bookings.reduce((acc, b) => {
      const c = b.checkout?.filter((c) => c.checkoutStatus === 0).length || 0;
      return acc + c;
    }, 0);
    setPendingCheckouts(pending);
  }, [bookings]);

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
      style={{ backgroundColor: "#F7F4FD", fontFamily: "Sarabun, sans-serif" }}
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