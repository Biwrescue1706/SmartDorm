import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useBills } from "../hooks/useBills";
import AllBillsTable from "../components/AllBills/AllBillsTable";
import BillFilterBar from "../components/AllBills/BillFilterBar";
import AllBillsEditDialog from "../components/AllBills/AllBillsEditDialog";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import type { Bill } from "../types/Bill";

export default function AllBills() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();
  const { bills, loading, updateBill, deleteBill } = useBills();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filtered, setFiltered] = useState<Bill[]>([]);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  // ✅ ฟิลเตอร์ข้อมูล
  useEffect(() => {
    let result = bills;
    if (filterStatus !== "all")
      result = result.filter((b) => b.status === Number(filterStatus));
    if (filterMonth)
      result = result.filter(
        (b) => new Date(b.month).toISOString().slice(0, 7) === filterMonth
      );
    if (filterRoom)
      result = result.filter((b) => b.room.number.includes(filterRoom));
    setFiltered(result);
    setPage(1);
  }, [bills, filterStatus, filterMonth, filterRoom]);

  const start = (page - 1) * rows;
  const currentBills = filtered.slice(start, start + rows);

  // ✅ แสดงสลิป
  const handleViewSlip = (bill: Bill) => {
    const url = bill.payment.slipUrl ||"-"
    if (!url)
      return Swal.fire("ไม่มีสลิป", "ยังไม่มีหลักฐานการชำระ", "info");

    Swal.fire({
      title: "สลิปการชำระเงิน",
      imageUrl: url,
      imageAlt: "Slip",
      imageWidth: 400,
      background: "#f9fafb",
      showCloseButton: true,
      confirmButtonText: "ปิด",
      footer: `<a href="${url}" target="_blank" class="btn btn-sm btn-primary mt-2">ดาวน์โหลด</a>`,
    });
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#fcfcfc", minHeight: "100vh" }}
    >
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-2 mx-my-3 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="text-center mb-3 fw-bold">📋 รายการบิลทั้งหมด</h2>

          {/* 🎚 ฟิลเตอร์ */}
          <BillFilterBar
            filterStatus={filterStatus}
            filterMonth={filterMonth}
            filterRoom={filterRoom}
            setFilterStatus={setFilterStatus}
            setFilterMonth={setFilterMonth}
            setFilterRoom={setFilterRoom}
          />

          {/* 📄 ตาราง */}
          {loading ? (
            <p className="text-center text-muted">⏳ กำลังโหลด...</p>
          ) : (
            <>
              <AllBillsTable
                bills={currentBills}
                onEdit={(bill) => setEditingBill(bill)}
                onDelete={deleteBill}
                onViewSlip={(bill) => handleViewSlip(bill)} // ✅ ส่งทั้ง bill
              />

              {filtered.length > 0 && (
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
              )}
            </>
          )}
        </div>
      </main>

      {/* ✏️ Dialog แก้ไขบิล */}
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