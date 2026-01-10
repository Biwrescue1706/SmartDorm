import { useEffect, useMemo, useState } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useCheckouts } from "../../hooks/ManageRooms/useCheckouts";

import CheckoutTable from "../../components/Checkout/CheckoutTable";
import CheckoutCards from "../../components/Checkout/CheckoutCards";
import CheckoutFilter from "../../components/Checkout/CheckoutFilter";
import CheckoutApproveDialog from "../../components/Checkout/CheckoutApproveDialog";
import CheckoutEditDialog from "../../components/Checkout/CheckoutEditDialog";
import Pagination from "../../components/Pagination";

import Swal from "sweetalert2";
import type { Checkout } from "../../types/Checkout";

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

  /* ================= FILTER ================= */
  const [filter, setFilter] = useState<
    "pending" | "approved" | "completed" | "rejected"
  >("pending");

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ================= DIALOG ================= */
  const [viewing, setViewing] = useState<Checkout | null>(null);
  const [editing, setEditing] = useState<Checkout | null>(null);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  /* ================= FILTER DATA ================= */
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

    setCurrentPage(1);
    return result;
  }, [checkouts, filter]);

  const paginatedCheckouts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCheckouts.slice(start, start + rowsPerPage);
  }, [filteredCheckouts, currentPage, rowsPerPage]);

  /* ================= CONFIRM CHECKOUT ================= */
  const confirmCheckout = async (checkout: Checkout) => {
    const first = await Swal.fire({
      title: "ยืนยันการเช็คเอาท์",
      text: `ห้อง ${checkout.room?.number}`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!first.isConfirmed) return;

    const second = await Swal.fire({
      title: "ยืนยันอีกครั้ง",
      text: "ไม่สามารถย้อนกลับได้",
      icon: "question",
      showCancelButton: true,
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

      <main className="main-content flex-grow-1 px-2 py-3 mt-5 mt-lg-7">
        <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          {/* HEADER */}
          <div className="mb-2">
            <h2 className="fw-bold text-center mt-3">จัดการการคืนห้อง</h2>
            <button
              className="btn btn-outline-secondary btn-sm mt-2"
              onClick={() => window.location.reload()}
            >
              {loading ? "กำลังโหลด..." : "🔄 รีเฟรชข้อมูล"}
            </button>
          </div>

          {/* FILTER CARDS */}
          <CheckoutFilter
            active={filter}
            onChange={setFilter}
            checkouts={checkouts}
          />

          {/* < 1400px = CARD */}
          <div className="d-block d-xxl-none">
            <CheckoutCards
              checkouts={paginatedCheckouts}
              role={role}
              onView={setViewing}
              onCheckout={confirmCheckout}
              onEdit={setEditing}
              onDelete={deleteCheckout}
            />
          </div>

          {/* >= 1400px = TABLE */}
          <div className="d-none d-xxl-block">
            <CheckoutTable
              checkouts={paginatedCheckouts}
              loading={loading}
              role={role}
              onView={setViewing}
              onCheckout={confirmCheckout}
              onEdit={setEditing}
              onDelete={deleteCheckout}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredCheckouts.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(r) => {
              setRowsPerPage(r);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>

      {viewing && (
        <CheckoutApproveDialog
          checkout={viewing}
          onApprove={() => approveCheckout(viewing.checkoutId)}
          onReject={() => rejectCheckout(viewing.checkoutId)}
          onClose={() => setViewing(null)}
        />
      )}

      {editing && (
        <CheckoutEditDialog
          checkout={editing}
          onSave={updateCheckoutDate}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
