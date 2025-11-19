// src/pages/AdminManagement.tsx
import { useState, useEffect } from "react";
import { useAdmins } from "../hooks/useAdmins";
import { useAuth } from "../hooks/useAuth";
import AdminAddDialog from "../components/Admin/AdminAddDialog";
import AdminEditDialog from "../components/Admin/AdminEditDialog";
import AdminTable from "../components/Admin/AdminTable";
import AdminCard from "../components/Admin/AdminCard";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import { type Admin } from "../types/admin";

export default function AdminManagement() {
  const { admins, loading, fetchAdmins } = useAdmins();
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // ฟิลเตอร์บทบาท
  const [filterRole, setFilterRole] =
    useState<"all" | "admin" | "staff">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ตรวจขนาดหน้าจอ
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  // หาแอดมินที่สร้างขึ้นคนแรก (ห้ามลบ)
  const oldestAdminId =
    admins.length > 0
      ? [...admins].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        )[0].adminId
      : null;

  // ฟิลเตอร์แอดมิน
  const filteredAdmins =
    filterRole === "all"
      ? admins
      : filterRole === "admin"
      ? admins.filter((a) => a.role === 0)
      : admins.filter((a) => a.role === 1);

  // Pagination logic
  const totalItems = filteredAdmins.length;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirst, indexOfLast);

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}
    >
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max" style={{ maxWidth: "1200px" }}>
          <h2 className="py-1 text-center fw-bold mb-3 text-dark">
            จัดการผู้ดูแลระบบ
          </h2>

          {/* ปุ่มเพิ่ม Admin */}
          <div className="text-center">
            <button
              className="btn fw-bold text-white px-5 py-2 mb-4"
              style={{
                background: "linear-gradient(135deg,#6a11cb,#2575fc)",
                borderRadius: "10px",
              }}
              onClick={() => setOpenAdd(true)}
            >
              ➕ เพิ่มสมาชิก
            </button>
          </div>

          {/* ฟิลเตอร์ Admin */}
          <div className="d-flex justify-content-center gap-3 flex-wrap mb-4 mt-2">
            <div
              className={`card shadow-sm px-4 py-2 fw-bold border-0 ${
                filterRole === "all" ? "bg-primary text-white" : "bg-white"
              }`}
              style={{ cursor: "pointer", minWidth: "140px" }}
              onClick={() => setFilterRole("all")}
            >
              ทั้งหมด ({admins.length})
            </div>

            <div
              className={`card shadow-sm px-4 py-2 fw-bold border-0 ${
                filterRole === "admin" ? "bg-warning text-dark" : "bg-white"
              }`}
              style={{ cursor: "pointer", minWidth: "160px" }}
              onClick={() => setFilterRole("admin")}
            >
              แอดมินหลัก ({admins.filter((a) => a.role === 0).length})
            </div>

            <div
              className={`card shadow-sm px-4 py-2 fw-bold border-0 ${
                filterRole === "staff" ? "bg-success text-white" : "bg-white"
              }`}
              style={{ cursor: "pointer", minWidth: "160px" }}
              onClick={() => setFilterRole("staff")}
            >
              พนักงาน ({admins.filter((a) => a.role === 1).length})
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>
          ) : (
            <>
              {/* โหมดการแสดงผล (ตาราง / การ์ด) */}
              {windowWidth >= 1400 ? (
                <AdminTable
                  admins={currentAdmins}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                  onEdit={(a) => {
                    setSelectedAdmin(a);
                    setOpenEdit(true);
                  }}
                  refresh={fetchAdmins}
                  oldestAdminId={oldestAdminId}
                />
              ) : (
                <AdminCard
                  admins={currentAdmins}
                  cols={windowWidth < 600 ? 1 : 3}
                  onEdit={(a) => {
                    setSelectedAdmin(a);
                    setOpenEdit(true);
                  }}
                  refresh={fetchAdmins}
                  oldestAdminId={oldestAdminId}
                />
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <AdminAddDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        refresh={fetchAdmins}
      />
      <AdminEditDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        admin={selectedAdmin}
        refresh={fetchAdmins}
      />
    </div>
  );
}
