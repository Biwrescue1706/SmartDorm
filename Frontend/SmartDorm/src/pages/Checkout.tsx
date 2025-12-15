import { useEffect, useMemo, useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCheckouts } from "../hooks/useCheckouts";

import CheckoutTable from "../components/Checkout/CheckoutTable";
import CheckoutFilter from "../components/Checkout/CheckoutFilter";
import CheckoutApproveDialog from "../components/Checkout/CheckoutApproveDialog";
import CheckoutEditDialog from "../components/Checkout/CheckoutEditDialog";
import Pagination from "../components/Pagination";

import Swal from "sweetalert2";
import type { Checkout } from "../types/Checkout";

export default function Checkout() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const {
    checkouts,
    loading,
    fetchCheckouts,
    approveCheckout,
    rejectCheckout,
    checkoutConfirm,
    deleteCheckout,
    updateCheckoutDate,
  } = useCheckouts();

  /* =======================
     Filter
  ======================= */
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "completed" | "rejected"
  >("all");

  /* =======================
     Pagination
  ======================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* =======================
     Dialog state
  ======================= */
  const [viewing, setViewing] = useState<Checkout | null>(null);
  const [editing, setEditing] = useState<Checkout | null>(null);

  /* =======================
     Initial load
  ======================= */
  useEffect(() => {
    fetchCheckouts();
  }, []);

  /* =======================
     Filtered data
  ======================= */
  const filteredCheckouts = useMemo(() => {
    const result = checkouts.filter((c) => {
      if (filter === "pending") return c.status === 0;
      if (filter === "approved")
        return c.status === 1 && c.checkoutStatus === 0;
      if (filter === "completed")
        return c.status === 1 && c.checkoutStatus === 1;
      if (filter === "rejected") return c.status === 2;
      return true;
    });

    // เปลี่ยน filter → กลับหน้าแรก
    setCurrentPage(1);
    return result;
  }, [checkouts, filter]);

  /* =======================
     Pagination slice
  ======================= */
  const paginatedCheckouts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredCheckouts.slice(start, end);
  }, [filteredCheckouts, currentPage, rowsPerPage]);

  /* =======================
     Confirm checkout (2 steps)
  ======================= */
  const confirmCheckout = async (checkout: Checkout) => {
    const first = await Swal.fire({
      title: "ยืนยันการเช็คเอาท์",
      text: `คุณต้องการเช็คเอาท์ ห้อง ${checkout.room?.number} ใช่หรือไม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!first.isConfirmed) return;

    const second = await Swal.fire({
      title: "ยืนยันอีกครั้ง",
      text: "การเช็คเอาท์ไม่สามารถย้อนกลับได้",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "เช็คเอาท์",
      cancelButtonText: "ยกเลิก",
    });

    if (!second.isConfirmed) return;

    await checkoutConfirm(checkout.checkoutId);
    fetchCheckouts();
  };

  return (
    <div className="d-flex min-vh-100 bg-white">
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7">
        <div className="container-max mx-auto">

          {/* ===== Header + Refresh ===== */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold mb-0">จัดการการคืนห้อง</h2>

            <button
              className="btn btn-outline-secondary btn-sm fw-semibold"
              onClick={fetchCheckouts}
              disabled={loading}
              title="รีเฟรชข้อมูล (เหมือนกด F5)"
            >
              {loading ? "กำลังโหลด..." : "🔄 รีเฟรชข้อมูล"}
            </button>
          </div>

          {/* ===== Filter (Cards) ===== */}
          <CheckoutFilter
            active={filter}
            onChange={setFilter}
            checkouts={checkouts}
          />

          {/* ===== Table ===== */}
          <CheckoutTable
            checkouts={paginatedCheckouts}
            loading={loading}
            role={role}
            onView={setViewing}
            onCheckout={confirmCheckout}
            onEdit={setEditing}
            onDelete={deleteCheckout}
          />

          {/* ===== Pagination ===== */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCheckouts.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>

      {/* ===== Approve / Reject Dialog ===== */}
      {viewing && (
        <CheckoutApproveDialog
          checkout={viewing}
          onApprove={async () => {
            await approveCheckout(viewing.checkoutId);
            setViewing(null);
            fetchCheckouts();
          }}
          onReject={async () => {
            await rejectCheckout(viewing.checkoutId);
            setViewing(null);
            fetchCheckouts();
          }}
          onClose={() => setViewing(null)}
        />
      )}

      {/* ===== Edit Date Dialog ===== */}
      {editing && (
        <CheckoutEditDialog
          checkout={editing}
          onSave={async (id, values) => {
            await updateCheckoutDate(id, values);
            setEditing(null);
            fetchCheckouts();
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}