// src/pages/AdminManagement.tsx
import { useState, useEffect } from "react";
import { useAdmins } from "../hooks/useAdmins";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
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

  // หา admin ที่เก่าสุด (ห้ามลบ)
  const oldestAdminId =
    admins.length > 0
      ? [...admins].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0].adminId
      : null;

  // ฟิลเตอร์
  const filteredAdmins =
    filterRole === "admin"
      ? admins.filter((a) => a.role === 0)
      : filterRole === "staff"
      ? admins.filter((a) => a.role === 1)
      : admins;

  // pagination
  const totalItems = filteredAdmins.length;
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ===========================================================
     🔥 ADD DIALOG (รวมในไฟล์)
  =========================================================== */
  const openAddDialog = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มผู้ดูแลระบบใหม่",
      html: `
        <input id="add-username" class="swal2-input" placeholder="ชื่อผู้ใช้">
        <input id="add-name" class="swal2-input" placeholder="ชื่อจริง">
        <input id="add-password" class="swal2-input" type="password" placeholder="รหัสผ่าน (ขั้นต่ำ 6 ตัว)">
        <select id="add-role" class="swal2-input">
          <option value="0">แอดมินหลัก</option>
          <option value="1" selected>พนักงาน</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        return {
          username: (document.getElementById("add-username") as HTMLInputElement).value,
          name: (document.getElementById("add-name") as HTMLInputElement).value,
          password: (document.getElementById("add-password") as HTMLInputElement).value,
          role: parseInt((document.getElementById("add-role") as HTMLSelectElement).value),
        };
      },
    });

    if (!formValues) return;

    if (formValues.password.length < 6) {
      Swal.fire("ผิดพลาด", "รหัสผ่านต้องมีอย่างน้อย 6 ตัว", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("เพิ่มผู้ดูแลไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "เพิ่มผู้ดูแลระบบเรียบร้อย", "success");
      fetchAdmins();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  /* ===========================================================
     🔥 EDIT DIALOG (รวมในไฟล์)
  =========================================================== */
  const openEditDialog = async (admin: Admin) => {
    const { value: formValues } = await Swal.fire({
      title: `แก้ไขข้อมูล (${admin.username})`,
      html: `
        <input id="edit-name" class="swal2-input" placeholder="ชื่อ" value="${admin.name}">
        <input id="edit-pass" class="swal2-input" type="password" placeholder="รหัสผ่านใหม่ (ไม่บังคับ)">
        <select id="edit-role" class="swal2-input">
          <option value="0" ${admin.role === 0 ? "selected" : ""}>แอดมินหลัก</option>
          <option value="1" ${admin.role === 1 ? "selected" : ""}>พนักงาน</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
    });

    if (!formValues) return;

    if (formValues.password && formValues.password.length < 6) {
      Swal.fire("ผิดพลาด", "รหัสผ่านต้องมากกว่า 6 ตัว", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/${admin.adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "แก้ไขข้อมูลเรียบร้อย", "success");
      fetchAdmins();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  /* ===========================================================
     🔥 DELETE (รวมในไฟล์ + แก้ให้ใช้ API_BASE)
  =========================================================== */
  const handleDelete = async (adminId: string) => {
    if (adminId === oldestAdminId) {
      Swal.fire("ห้ามลบ!", "คุณไม่สามารถลบแอดมินคนแรกได้", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบผู้ดูแลระบบคนนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "ลบผู้ดูแลระบบเรียบร้อย", "success");
      fetchAdmins();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content px-2 py-3 mt-6 mt-lg-7">
        <div className="container">
          <h2 className="text-center mt-3 mb-4 fw-bold">จัดการผู้ดูแลระบบ</h2>

          <div className="text-center mb-4">
            <button
              className="btn text-white fw-bold px-5 py-2"
              style={{ background: "linear-gradient(135deg,#6a11cb,#2575fc)" }}
              onClick={openAddDialog}
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

          {/* ตาราง / การ์ด */}
          {loading ? (
            <p className="text-center">กำลังโหลดข้อมูล...</p>
          ) : windowWidth < 900 ? (
            <div className="row g-3">
              {currentAdmins.map((a) => (
                <div key={a.adminId} className="col-12">
                  <div className="card shadow-sm p-3">
                    <h5 className="fw-bold">{a.username}</h5>
                    <p><strong>ชื่อ:</strong> {a.name}</p>
                    <p><strong>สิทธิ์:</strong> {a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</p>

                    <div className="d-flex justify-content-between mt-2">
                      <button className="btn btn-primary btn-sm" onClick={() => openEditDialog(a)}>
                        แก้ไข
                      </button>

                      {a.adminId !== oldestAdminId && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.adminId)}>
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="table table-striped table-bordered text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>ชื่อผู้ใช้</th>
                  <th>ชื่อ</th>
                  <th>สิทธิ์</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentAdmins.map((a, index) => (
                  <tr key={a.adminId}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>{a.username}</td>
                    <td>{a.name}</td>
                    <td>{a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => openEditDialog(a)}
                      >
                        แก้ไข
                      </button>

                      {a.adminId !== oldestAdminId && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a.adminId)}
                        >
                          ลบ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

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
        </div>
      </main>
    </div>
  );
}