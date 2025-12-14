import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCheckouts } from "../hooks/useCheckouts";
import CheckoutTable from "../components/Checkout/CheckoutTable";
import CheckoutFilter from "../components/Checkout/CheckoutFilter";
import CheckoutApproveDialog from "../components/Checkout/CheckoutApproveDialog";
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
  } = useCheckouts();

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "completed" | "rejected"
  >("all");

  const [viewing, setViewing] = useState<Checkout | null>(null);

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

  const confirmCheckout = async (checkout: Checkout) => {
    const first = await Swal.fire({
      title: "ยืนยันการเช็คเอาท์",
      text: `คุณต้องการเช็คเอาท์ ห้อง ${checkout.room?.number} ใช่หรือไม่`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!first.isConfirmed) return;

    const second = await Swal.fire({
      title: "ยืนยันอีกครั้ง",
      text: "การเช็คเอาท์ไม่สามารถย้อนกลับได้",
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

      <main className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7">
        <div className="container-max mx-auto">
          <h2 className="text-center fw-bold mb-3">จัดการการคืนห้อง</h2>

          <CheckoutFilter
            active={filter}
            onChange={setFilter}
            checkouts={checkouts}
          />

          <CheckoutTable
            checkouts={filteredCheckouts}
            loading={loading}
            role={role}
            onView={setViewing}
            onCheckout={confirmCheckout}
            onDelete={deleteCheckout}
          />
        </div>
      </main>

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
    </div>
  );
}