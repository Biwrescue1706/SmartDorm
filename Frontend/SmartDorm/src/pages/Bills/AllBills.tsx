// src/pages/Bills/AllBills.tsx
import { useState, useEffect } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useBills } from "../../hooks/Bill/useBills";
import AllBillsCard from "../../components/AllBills/AllBillsCard";
import AllBillsTable from "../../components/AllBills/AllBillsTable";
import Pagination from "../../components/Pagination";
import AllBillsEditDialog from "../../components/AllBills/AllBillsEditDialog";
import BillManageDialog from "../../components/AllBills/BillManageDialog";
import Swal from "sweetalert2";
import type { Bill } from "../../types/Bill";

export default function AllBills() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const {
    bills,
    loading,
    fetchBills,
    updateBill,
    deleteBillById,
    approveBillById,
    rejectBillById,
    overdueBillById,
  } = useBills();

  const [filterStatus] = useState("0");
  const [filtered, setFiltered] = useState<Bill[]>([]);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [manageBill, setManageBill] = useState<Bill | null>(null);

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
    if (filterStatus !== "") {
      result = result.filter((b) => b.billStatus === Number(filterStatus));
    }
    setFiltered(result);
    setPage(1);
  }, [bills, filterStatus]);

  const start = (page - 1) * rows;
  const currentBills = filtered.slice(start, start + rows);

  const handleViewSlip = (bill: Bill) => {
    const url = bill.payment?.slipUrl || bill.slipUrl;
    if (!url) {
      Swal.fire("ไม่มีสลิป", "ยังไม่มีหลักฐานการชำระ", "info");
      return;
    }

    Swal.fire({
      title: `สลิปห้อง ${bill.room?.number ?? "-"}`,
      html: `<img src="${url}" style="width:100%;max-width:350px;" />`,
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  const handleDeleteBill = (billId: string, room?: string) => {
    deleteBillById(billId, room ?? "-");
  };

  const handleOverdueBill = (bill: Bill) => {
    overdueBillById(bill.billId, bill.room?.number ?? "-");
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="flex-grow-1 px-2 py-3">
        {loading ? (
          <p className="text-center">กำลังโหลด...</p>
        ) : width >= 1400 ? (
          <AllBillsTable
            bills={currentBills}
            role={role}
            onEdit={setEditingBill}
            onDelete={handleDeleteBill}
            onViewSlip={handleViewSlip}
            onManage={setManageBill}
          />
        ) : (
          <div className="d-grid gap-3">
            {currentBills.map((bill) => (
              <AllBillsCard
                key={bill.billId}
                bill={bill}
                role={role}
                onEdit={setEditingBill}
                onDelete={handleDeleteBill}
                onViewSlip={handleViewSlip}
                onManage={setManageBill}
                onOverdue={handleOverdueBill}
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
          onApprove={approveBillById}
          onReject={rejectBillById}
          onOverdue={overdueBillById}
          onClose={() => setManageBill(null)}
        />
      )}
    </div>
  );
}