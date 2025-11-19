// src/pages/AdminManagement.tsx
import { useState, useEffect } from "react";
import { useAdmins } from "../hooks/useAdmins";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";

import AdminAddDialog from "../components/Admin/AdminAddDialog";
import AdminEditDialog from "../components/Admin/AdminEditDialog";
import AdminTableCard from "../components/Admin/AdminTableCard";
import type { Admin } from "../types/admin";

export default function AdminManagement() {
  const { admins, loading, fetchAdmins } = useAdmins();
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const [filterRole, setFilterRole] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Resize listener
  useEffect(() => {
    const resize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // 🔥 หา admin ที่เก่าสุด (ห้ามลบ)
  const oldestAdminId =
    admins.length > 0
      ? [...admins].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0].adminId
      : null;

  // 🔍 ฟิลเตอร์
  const filteredAdmins =
    filterRole === "admin"
      ? admins.filter((a) => a.role === 0)
      : filterRole === "staff"
      ? admins.filter((a) => a.role === 1)
      : admins;

  // 📄 Pagination
  const totalItems = filteredAdmins.length;
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="py-1 text-center text-while mt-3 mb-3">
            จัดการผู้ดูแลระบบ
          </h2>

          <div className="text-center mb-4">
            <button
              className="btn text-white fw-bold px-5 py-2"
              style={{ background: "linear-gradient(135deg,#6a11cb,#2575fc)" }}
              onClick={() => setOpenAdd(true)}
            >
              ➕ เพิ่มสมาชิก
            </button>
          </div>

          {/* ฟิลเตอร์ */}
          <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
            <div
              className={`card px-4 py-2 fw-bold shadow-sm ${
                filterRole === "all" ? "bg-primary text-white" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setFilterRole("all")}
            >
              ทั้งหมด ({admins.length})
            </div>

            <div
              className={`card px-4 py-2 fw-bold shadow-sm ${
                filterRole === "admin" ? "bg-warning" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setFilterRole("admin")}
            >
              แอดมินหลัก ({admins.filter((a) => a.role === 0).length})
            </div>

            <div
              className={`card px-4 py-2 fw-bold shadow-sm ${
                filterRole === "staff" ? "bg-success text-white" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setFilterRole("staff")}
            >
              พนักงาน ({admins.filter((a) => a.role === 1).length})
            </div>
          </div>
        </div>

        {/* Table & Card */}
        {loading ? (
          <p className="text-center">กำลังโหลดข้อมูล...</p>
        ) : (
          <>
            <AdminTableCard
              admins={currentAdmins}
              windowWidth={windowWidth}
              cols={windowWidth < 600 ? 1 : 3}
              onEdit={(admin) => {
                setSelectedAdmin(admin);
                setOpenEdit(true);
              }}
              refresh={fetchAdmins}
              oldestAdminId={oldestAdminId}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
            />

            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </main>

      {/* Dialogs */}
      <AdminAddDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        refresh={fetchAdmins}
      />

      <AdminEditDialog
        open={openEdit}
        admin={selectedAdmin}
        onClose={() => setOpenEdit(false)}
        refresh={fetchAdmins}
      />
    </div>
  );
}
