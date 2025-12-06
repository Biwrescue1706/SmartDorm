// src/pages/AllBills.tsx
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useBills } from "../hooks/useBills";
import AllBillsCard from "../components/AllBills/AllBillsCard";
import AllBillsTable from "../components/AllBills/AllBillsTable";
import Pagination from "../components/Pagination";
import BillStatusCardFilter from "../components/AllBills/BillStatusCardFilter";
import AllBillsEditDialog from "../components/AllBills/AllBillsEditDialog";
import BillManageDialog from "../components/AllBills/BillManageDialog"; // ⭐ import ใหม่
import Swal from "sweetalert2";
import type { Bill } from "../types/Bill";

export default function AllBills() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { bills, loading, updateBill, deleteBill, approveBill, rejectBill } =
    useBills();

  const [filterStatus, setFilterStatus] = useState("0");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const [filtered, setFiltered] = useState<Bill[]>([]);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [manageBill, setManageBill] = useState<Bill | null>(null); // ⭐ เพิ่ม state

  const unpaidCount = bills.filter((b) => b.status === 0).length;
  const paidCount = bills.filter((b) => b.status === 1).length;
  const pendingCount = bills.filter((b) => b.status === 2).length;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    let result = bills;

    if (filterStatus !== "")
      result = result.filter((b) => b.status === Number(filterStatus));

    if (filterMonth)
      result = result.filter(
        (b) => new Date(b.month).toISOString().slice(0, 7) === filterMonth
      );

    if (filterRoom)
      result = result.filter((b) =>
        b.room.number.toString().includes(filterRoom)
      );

    setFiltered(result);
    setPage(1);
  }, [bills, filterStatus, filterMonth, filterRoom]);

  const start = (page - 1) * rows;
  const currentBills = filtered.slice(start, start + rows);

  const handleViewSlip = (bill: Bill) => {
    const url = bill.payment?.slipUrl || bill.slipUrl;
    if (!url) return Swal.fire("ไม่มีสลิป", "ยังไม่มีหลักฐานการชำระ", "info");

    Swal.fire({
      title: `สลิปห้อง ${bill.room.number}`,
      imageUrl: url,
      imageWidth: 400,
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  const handleManage = (bill: Bill) => setManageBill(bill); // ⭐ ฟังก์ชันเปิด modal

  return (
    <div
      className="d-flex flex-column"
      style={{ background: "#fafafa", minHeight: "100vh" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content px-2 py-2 mt-6 mt-lg-7 flex-grow-1">
        <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          <h2 className="text-center fw-bold mb-3">📋 รายการบิลทั้งหมด</h2>

          <BillStatusCardFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            unpaidCount={unpaidCount}
            paidCount={paidCount}
            pendingCount={pendingCount}
          />

          <div className="d-flex gap-2 flex-wrap mb-3">
            <input
              type="month"
              className="form-control"
              style={{ width: 160 }}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />

            <input
              type="text"
              className="form-control"
              style={{ width: 180 }}
              placeholder="ค้นหาห้อง..."
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>
          ) : width >= 1400 ? (
            <AllBillsTable
              bills={currentBills}
              role={role}
              onEdit={setEditingBill}
              onDelete={deleteBill}
              onViewSlip={handleViewSlip}
              onManage={handleManage} // ⭐ ส่งเข้า Row
            />
          ) : (
            <div
              className="d-grid"
              style={{
                gridTemplateColumns: width < 600 ? "1fr" : "repeat(3, 1fr)",
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
                  onManage={handleManage} // ⭐ ส่งเข้า Card
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
