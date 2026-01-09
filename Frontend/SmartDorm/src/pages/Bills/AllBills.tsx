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

    if (filterMonth) {
      result = result.filter(
        (b) =>
          new Date(b.month).toISOString().slice(0, 7) === filterMonth
      );
    }

    if (filterRoom) {
      result = result.filter((b) =>
        b.room?.number?.toString().includes(filterRoom)
      );
    }

    setFiltered(result);
    setPage(1);
  }, [bills, filterStatus, filterMonth, filterRoom]);

  const start = (page - 1) * rows;
  const currentBills = filtered.slice(start, start + rows);

  const handleViewSlip = (bill: Bill) => {
    const url = bill.payment?.slipUrl || bill.slipUrl;
    if (!url)
      return Swal.fire("ไม่มีสลิป", "ยังไม่มีหลักฐานการชำระ", "info");

    Swal.fire({
      title: `สลิปห้อง ${bill.room?.number ?? "-"}`,
      html: `<img src="${url}" style="width:100%;max-width:350px;" />`,
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  const handleRefresh = async () => {
    setFilterStatus("0");
    setFilterMonth("");
    setFilterRoom("");
    setPage(1);
    await fetchBills();
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
            onDelete={deleteBillById}
            onViewSlip={handleViewSlip}
            onManage={setManageBill}
            onOverdue={overdueBillById}
          />
        ) : (
          <div className="d-grid gap-3">
            {currentBills.map((bill) => (
              <AllBillsCard
                key={bill.billId}
                bill={bill}
                role={role}
                onEdit={setEditingBill}
                onDelete={deleteBillById}
                onViewSlip={handleViewSlip}
                onManage={setManageBill}
                onOverdue={overdueBillById}
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