import { useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCheckouts } from "../hooks/useCheckouts";
import CheckoutTable from "../components/Checkout/CheckoutTable";
import CheckoutFilter from "../components/Checkout/CheckoutFilter";
import CheckoutEditDialog from "../components/Checkout/CheckoutEditDialog";
import type { Booking } from "../types/Checkout";

export default function Checkout() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const {
    checkouts,
    loading,
    approveCheckout,
    fetchCheckouts,
    rejectCheckout,
    deleteCheckout,
    editCheckout,
    confirmReturn,
  } = useCheckouts();

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "waitingCheckout"
  >("all");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  //  ฟิลเตอร์ข้อมูลตามสถานะการคืน
  const filteredCheckouts = checkouts.filter((b) => {
    if (filter === "pending") return b.returnStatus === 0;
    if (filter === "approved") return b.returnStatus === 1;
    if (filter === "rejected") return b.returnStatus === 2;
    if (filter === "waitingCheckout")
      return b.checkoutStatus === 1 && !b.actualCheckout;
    return true;
  });

  return (
    <div className="d-flex min-vh-100 bg-white">
      {/* 🔹 Navbar */}
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />
      {/* 🔹 Main Content */}
      <main className="main-content flex-grow-1 px-1 py-1 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="mb-3 mt-2 py-2 text-center fw-bold text-black rounded shadow-sm">
            จัดการการคืนห้อง
          </h2>
          <div className="text-center mb-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={fetchCheckouts}
              disabled={loading}
            >
              {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
            </button>
          </div>

          {/* 🔹 ตัวกรองสถานะ */}
          <CheckoutFilter
            active={filter}
            onChange={setFilter}
            checkouts={checkouts}
          />

          {/* 🔹 ตารางแสดงข้อมูล */}
          {loading ? (
            <p className="text-center text-muted mt-3">กำลังโหลดข้อมูล...</p>
          ) : (
            <CheckoutTable
              checkouts={filteredCheckouts}
              onApprove={approveCheckout}
              onReject={rejectCheckout}
              onEdit={(b) => setEditingBooking(b)}
              onDelete={deleteCheckout}
              onConfirmReturn={confirmReturn}
            />
          )}
        </div>
      </main>
      {/* 🔹 Modal แก้ไขข้อมูลการคืน */}
      {editingBooking && (
        <CheckoutEditDialog
          booking={editingBooking}
          onSave={editCheckout}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  );
}
