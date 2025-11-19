// src/pages/AllBills.tsx
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useBills } from "../hooks/useBills";
import AllBillsCard from "../components/AllBills/AllBillsCard";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import AllBillsEditDialog from "../components/AllBills/AllBillsEditDialog";
import type { Bill } from "../types/Bill";
import BillStatusCardFilter from "../components/AllBills/BillStatusCardFilter";

export default function AllBills() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();
  const { bills, loading, updateBill, deleteBill } = useBills();

  // ค่าเริ่มต้น = ค้างชำระ
  const [filterStatus, setFilterStatus] = useState("0");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const [filtered, setFiltered] = useState<Bill[]>([]);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // นับจำนวนบิล
  const unpaidCount = bills.filter((b) => b.status === 0).length;
  const paidCount = bills.filter((b) => b.status === 1).length;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ฟิลเตอร์ข้อมูล
  useEffect(() => {
    let result = bills;

    if (filterStatus !== "") {
      result = result.filter((b) => b.status === Number(filterStatus));
    }

    if (filterMonth) {
      result = result.filter(
        (b) => new Date(b.month).toISOString().slice(0, 7) === filterMonth
      );
    }

    if (filterRoom) {
      result = result.filter((b) =>
        b.room.number.toString().includes(filterRoom)
      );
    }

    setFiltered(result);
    setPage(1);
  }, [bills, filterStatus, filterMonth, filterRoom]);

  const start = (page - 1) * rows;
  const currentBills = filtered.slice(start, start + rows);

  // ดูสลิป (ไม่มีโหลด)
  const handleViewSlip = async (bill: Bill) => {
    const url = bill.payment?.slipUrl || bill.slipUrl;

    if (!url) {
      return Swal.fire("ไม่มีสลิป", "ยังไม่มีหลักฐานการชำระ", "info");
    }

    Swal.fire({
      title: `สลิปห้อง ${bill.room.number}`,
      imageUrl: url,
      imageWidth: 400,
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}
    >
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-2 py-2 mt-6 mt-lg-7">
        <div className="mx-auto" style={{ maxWidth: "1300px" }}>
          <h2 className="text-center fw-bold mb-3">📋 รายการบิลทั้งหมด</h2>

          {/* ฟิลเตอร์ (ไม่มีปุ่ม ALL แล้ว) */}
          <BillStatusCardFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            unpaidCount={unpaidCount}
            paidCount={paidCount}
          />

          {/* 🟦 ฟิลเตอร์เดือน + ค้นหาห้อง */}
          <div className="d-flex flex-wrap gap-2 mb-3 mt-2">
            <input
              type="month"
              className="form-control"
              style={{ width: "160px" }}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />

            <input
              type="text"
              className="form-control"
              placeholder="ค้นหาห้อง..."
              style={{ width: "180px" }}
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-center mt-3">⏳ กำลังโหลด...</p>
          ) : (
            <>
              <div
                className="d-grid"
                style={{
                  gridTemplateColumns: width < 600 ? "1fr" : "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {currentBills.map((bill) => (
                  <AllBillsCard
                    key={bill.billId}
                    bill={bill}
                    role={role}
                    onViewSlip={handleViewSlip}
                    onDelete={deleteBill}
                    onEdit={setEditingBill}
                  />
                ))}
              </div>

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
            </>
          )}
        </div>
      </main>

      {/* Dialog แก้ไขบิล */}
      {editingBill && (
        <AllBillsEditDialog
          bill={editingBill}
          onSave={updateBill}
          onClose={() => setEditingBill(null)}
        />
      )}
    </div>
  );
}
