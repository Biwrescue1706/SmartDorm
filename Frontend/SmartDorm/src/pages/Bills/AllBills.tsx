// src/pages/AllBills.tsx
import { useState, useEffect } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useBills } from "../../hooks/Bill/useBills";
import AllBillsCard from "../../components/AllBills/AllBillsCard";
import AllBillsTable from "../../components/AllBills/AllBillsTable";
import Pagination from "../../components/Pagination";
import BillStatusCardFilter from "../../components/AllBills/BillStatusCardFilter";
import AllBillsEditDialog from "../../components/AllBills/AllBillsEditDialog";
import BillManageDialog from "../../components/AllBills/BillManageDialog";
import Swal from "sweetalert2";
import type { Bill ,Room } from "../../types/All";
import { usePendingBookings } from "../../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../../hooks/ManageRooms/usePendingCheckouts";

/* ---------------- THAI TIME ---------------- */

const thaiNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
};

export default function AllBills() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const {
    bills,
    loading,
    fetchBills,
    updateBill,
    deleteBill,
    approveBill,
    rejectBill,
    overdueBill,
  } = useBills();

  const [filterStatus, setFilterStatus] = useState("0");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filtered, setFiltered] = useState<Bill[]>([]);

  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [manageBill, setManageBill] = useState<Bill | null>(null);

  const unpaidCount = bills.filter((b) => b.billStatus === 0).length;
  const paidCount = bills.filter((b) => b.billStatus === 1).length;
  const pendingCount = bills.filter((b) => b.billStatus === 2).length;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(15);

  const [width, setWidth] = useState(window.innerWidth);
  const [thaiTime, setThaiTime] = useState(thaiNow());

  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setThaiTime(thaiNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- FILTER ---------------- */

  useEffect(() => {
    let result = bills;

    if (filterStatus !== "")
      result = result.filter((b) => b.billStatus === Number(filterStatus));

    if (filterMonth)
      result = result.filter(
        (b) => new Date(b.month).toISOString().slice(0, 7) === filterMonth,
      );

    if (filterRoom)
      result = result.filter((b) =>
        b.room?.number?.toString().includes(filterRoom),
      );

    setFiltered(result);
    setPage(1);
  }, [bills, filterStatus, filterMonth, filterRoom]);

  const start = (page - 1) * rows;
  const currentBills = filtered.slice(start, start + rows);

  /* ---------------- SLIP VIEW ---------------- */

  const handleViewSlip = (bill: Bill) => {
    const url = bill.payment?.slipUrl || bill.slipUrl;

    if (!url) return Swal.fire("ไม่มีสลิป", "ยังไม่มีหลักฐานการชำระ", "info");

    Swal.fire({
      title: `สลิปห้อง ${bill.room?.number ?? "-"}`,
      html: `
        <img src="${url}" style="
          width:100%;
          max-width:350px;
          max-height:70vh;
          object-fit:contain;
          border-radius:12px;
          display:block;
          margin:0 auto;
        "/>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      background: "#fff",
    });
  };

  /* ---------------- RESET ---------------- */

  const handleRefresh = async () => {
    setFilterStatus("0");
    setFilterMonth("");
    setFilterRoom("");
    setPage(1);

    await fetchBills();
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
        className="main-content flex-grow-1 px-2 py-3"
        style={{
          marginTop: "60px",
          marginLeft: width >= 1400 ? "180px" : "0",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          className="mx-auto"
          style={{ borderRadius: 20, maxWidth: "1400px" }}
        >
          <h2
            className="fw-bold text-center py-2 mb-2"
            style={{
              color: "#4A0080",
              borderBottom: "3px solid #CE93D8",
              width: "fit-content",
              margin: "0 auto",
            }}
          >
            รายการบิลทั้งหมด
          </h2>

          {/* DATE TIME */}
          <div className="text-center mb-3">
            <div className="fw-bold text-dark h3">วันที่ปัจจุบัน</div>
            <div className="text-primary fw-semibold h4">
              {thaiTime.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              เวลา {thaiTime.toLocaleTimeString("th-TH")} น.
            </div>
          </div>

          {/* FILTER */}
          <div
            className="mb-3 p-3 rounded-3 shadow-sm"
            style={{ background: "#fff" }}
          >
            {/* 🔥 แก้ตรงนี้: เอา d-xxl-none ออก */}
            <div>
              <h2 className="fw-bold text-center mb-3">สถานะบิล</h2>

              <div className="d-flex flex-wrap justify-content-center align-items-end gap-2">
                <BillStatusCardFilter
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  unpaidCount={unpaidCount}
                  paidCount={paidCount}
                  pendingCount={pendingCount}
                />

                <input
                  type="month"
                  className="form-control shadow-sm"
                  style={{ width: 150, borderRadius: 8, height: 38 }}
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />

                <input
                  type="text"
                  className="form-control shadow-sm"
                  style={{ width: 160, borderRadius: 8, height: 38 }}
                  placeholder="ค้นหาห้อง..."
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                />

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="btn fw-semibold shadow-sm px-3"
                  style={{
                    height: 38,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg,#4A148C,#7B1FA2,#CE93D8)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {loading ? "⏳ กำลังโหลด..." : "🔄 รีเซ็ตข้อมูล"}
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <p className="text-center text-muted">⏳ กำลังโหลดข้อมูล...</p>
          ) : width >= 1400 ? (
            <AllBillsTable
              bills={currentBills}
              role={role}
              onEdit={setEditingBill}
              onDelete={deleteBill}
              onViewSlip={handleViewSlip}
              onManage={setManageBill}
              onOverdue={overdueBill}
            />
          ) : (
            <div
              className="d-grid"
              style={{
                gridTemplateColumns:
                  width < 600 ? "repeat(2,1fr)" : "repeat(6,1fr)",
                gap: "14px",
              }}
            >
              {currentBills.map((bill) => (
                <AllBillsCard
                  key={bill.billId}
                  bill={bill}
                  role={role}
                  onEdit={setEditingBill}
                  onDelete={deleteBill}
                  onViewSlip={handleViewSlip}
                  onManage={setManageBill}
                  onOverdue={overdueBill}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            rowsPerPage={rows}
            onPageChange={setPage}
            onRowsPerPageChange={(r) => {
              setRows(r);
              setPage(1);
            }}
          />
        </div>
      </main>

      {editingBill && (
        <AllBillsEditDialog
          bill={editingBill}
          onSave={updateBill}
          onClose={() => setEditingBill(null)}
        />
      )}

      {manageBill && (
        <BillManageDialog
          bill={manageBill}
          onApprove={approveBill}
          onReject={rejectBill}
          onClose={() => setManageBill(null)}
        />
      )}
    </div>
  );
}
