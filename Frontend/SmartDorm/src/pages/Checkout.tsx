// src/pages/Checkout.tsx
import { useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCheckouts } from "../hooks/useCheckouts";
import CheckoutTable from "../components/Checkout/CheckoutTable";
import CheckoutFilter from "../components/Checkout/CheckoutFilter";
import type { Booking } from "../types/Checkout";

export default function Checkout() {
  const { message, handleLogout, role } = useAuth();
  const {
    checkouts,
    loading,
    approveCheckout,
    rejectCheckout,
    deleteCheckout,
  } = useCheckouts();

  const [pendingBookings] = useState(0);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [, setEditingBooking] = useState<Booking | null>(null);

  const filteredCheckouts = checkouts.filter((b) => {
    if (filter === "pending") return b.returnStatus === 0;
    if (filter === "approved") return b.returnStatus === 1;
    if (filter === "rejected") return b.returnStatus === 2;
    return true;
  });

  return (
    <div className="d-flex min-vh-100 bg-white">
      <Nav
        message={message}
        onLogout={handleLogout}
        pendingBookings={pendingBookings}
        role={role}
      />
      <main className="main-content flex-grow-1 px-1 py-5 mt-3 mt-lg-5">
        <div className="mx-auto container-max">
          <h2
            className="mb-3 mt-2 py-2 text-center fw-bold text-white rounded shadow-sm"
            style={{
              background: "linear-gradient(100deg, #007bff, #00d4ff)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              fontSize: "1.4rem",
            }}
          >
            จัดการการคืนห้อง
          </h2>

          <CheckoutFilter active={filter} onChange={setFilter} />

          {loading ? (
            <p className="text-center text-muted mt-3">กำลังโหลดข้อมูล...</p>
          ) : (
            <CheckoutTable
              checkouts={filteredCheckouts}
              onApprove={approveCheckout}
              onReject={rejectCheckout}
              onEdit={(b) => setEditingBooking(b)}
              onDelete={deleteCheckout}
            />
          )}
        </div>
      </main>
    </div>
  );
}
