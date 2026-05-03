// src/pages/ManageRooms/Checkout.tsx
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
import { usePendingCheckouts } from "../../hooks/ManageRooms/usePendingCheckouts";
import { usePendingBookings } from "../../hooks/ManageRooms/usePendingBookings";

const SCB_PURPLE = "#9500ff";

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
  const [rowsPerPage, setRowsPerPage] = useState(15);
  /* ================= DIALOG ================= */
  const [viewing, setViewing] = useState<Checkout | null>(null);
  const [editing, setEditing] = useState<Checkout | null>(null);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  /* ================= FILTER DATA ================= */
  const filteredCheckouts = useMemo(() => {
    const result = checkouts.filter((c) => {
      if (filter === "pending") return c.ReturnApprovalStatus === 0;
      if (filter === "approved")
        return c.ReturnApprovalStatus === 1 && c.checkoutStatus === 0;
      if (filter === "completed")
        return c.ReturnApprovalStatus === 1 && c.checkoutStatus === 1;
      if (filter === "rejected") return c.ReturnApprovalStatus === 2;
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

  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  return (
    <div
      className="d-flex min-vh-100 mx-2 mt-0 mb-4"
      style={{ fontFamily: "Sarabun, sans-serif" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main
        className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7"
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          {/* HEADER */}
          <div className="mb-2">
            <h2
              className="fw-bold text-center mt-3"
              style={{ color: SCB_PURPLE }}
            >
              จัดการการคืนห้อง
            </h2>
          </div>

          {/* FILTER CARDS */}
          <div
            className="py-3 mb-3 d-flex justify-content-center"
            style={{
              background: "#F3E5F5",
              borderRadius: "12px",
              border: "1px solid #E1BEE7",
            }}
          >
            {/* < 1400px = กระชับตาม dropdown */}
            <div
              className="d-block d-xxl-none mx-2 my-2 text-black"
              style={{ width: "fit-content" }}
            >
              <h5 className="mb-2 text-center text-black">
                กรองสถานะการเช็คเอาท์
              </h5>

              <div className="d-flex align-items-center justify-content-center gap-2">
                <CheckoutFilter
                  active={filter}
                  onChange={setFilter}
                  checkouts={checkouts}
                />

                <button
                  className="btn btn-info btn-sm"
                  onClick={() => window.location.reload()}
                  style={{ height: 38 }}
                >
                  {loading ? "กำลังโหลด..." : "🔄 รีเฟรชข้อมูล"}
                </button>
              </div>

              <div className="mt-2 text-center text-black">
                จำนวนผลลัพธ์: {filteredCheckouts.length} รายการ
              </div>
            </div>

            {/* >= 1400px = เต็มความกว้างแบบเดิม */}
            <div className="d-none d-xxl-block w-100">
              <h4 className="text-center mb-3 text-black">
                กรองสถานะการเช็คเอาท์
              </h4>
              <CheckoutFilter
                active={filter}
                onChange={setFilter}
                checkouts={checkouts}
              />
              <button
                className="btn btn-info btn-sm mt-3 justify-content-center align-items-center d-flex mx-auto"
                onClick={() => window.location.reload()}
                style={{ height: 38 }}
              >
                {loading ? "กำลังโหลด..." : "🔄 รีเฟรชข้อมูล"}
              </button>
              <div className="mt-2 text-center h4 text-black ">
                จำนวนผลลัพธ์: {filteredCheckouts.length} รายการ
              </div>
            </div>
          </div>

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
          onApprove={async () => {
            await approveCheckout(viewing.checkoutId);

            await Swal.fire({
              icon: "success",
              title: "อนุมัติสำเร็จ",
              text: `ห้อง ${viewing.room?.number ?? "-"}`,
              timer: 1500,
              showConfirmButton: false,
            });

            setViewing(null); // 🔥 ปิด modal
            fetchCheckouts(); // 🔄 รีโหลดข้อมูล
          }}
          onReject={async () => {
            await rejectCheckout(viewing.checkoutId);

            await Swal.fire({
              icon: "success",
              title: "ปฏิเสธสำเร็จ",
              text: `ห้อง ${viewing.room?.number ?? "-"}`,
              timer: 1500,
              showConfirmButton: false,
            });

            setViewing(null); // 🔥 ปิด modal
            fetchCheckouts(); // 🔄 รีโหลดข้อมูล
          }}
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
