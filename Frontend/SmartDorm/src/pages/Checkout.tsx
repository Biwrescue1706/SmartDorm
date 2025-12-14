import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCheckouts } from "../hooks/useCheckouts";
import CheckoutTable from "../components/Checkout/CheckoutTable";
import CheckoutFilter from "../components/Checkout/CheckoutFilter";

export default function Checkout() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const {
    checkouts,
    loading,
    fetchCheckouts,
    approveCheckout,
    rejectCheckout,
    deleteCheckout,
  } = useCheckouts();

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "completed" | "rejected"
  >("all");

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const filteredCheckouts = checkouts.filter((c) => {
    if (filter === "pending") return c.status === 0;
    if (filter === "approved")
      return c.status === 1 && c.checkoutStatus === 0;
    if (filter === "completed")
      return c.status === 1 && c.checkoutStatus === 1;
    if (filter === "rejected") return c.status === 2;
    return true;
  });

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
          <h2 className="text-center fw-bold mb-3">จัดการการคืนห้อง</h2>

          <div className="text-center mb-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={fetchCheckouts}
              disabled={loading}
            >
              {loading ? "กำลังโหลด..." : "รีเฟรช"}
            </button>
          </div>

          <CheckoutFilter
            active={filter}
            onChange={setFilter}
            checkouts={checkouts}
          />

          <CheckoutTable
            checkouts={filteredCheckouts}
            loading={loading}
            onApprove={approveCheckout}
            onReject={rejectCheckout}
            onDelete={deleteCheckout}
          />
        </div>
      </main>
    </div>
  );
}