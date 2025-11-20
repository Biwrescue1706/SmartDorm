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

  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Responsive resize
  useEffect(() => {
    const resize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // หาผู้ดูแลที่เก่าสุด → ห้ามลบ
  const oldestAdminId =
    admins.length > 0
      ? [...admins].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0].adminId
      : null;

  // ฟิลเตอร์ role
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
     🔥 ADD ADMIN POPUP
  =========================================================== */
  const openAddDialog = async () => {
  const { value: formValues } = await Swal.fire({
    title: `<h3 class="fw-bold">เพิ่มผู้ดูแลระบบใหม่</h3>`,
    html: `
      <div class="container" style="max-width: 100%; padding: 0;">

        <div class="mb-3 text-start">
          <label class="form-label fw-bold">ชื่อผู้ใช้</label>
          <input id="add-username" class="form-control" placeholder="ชื่อผู้ใช้">
        </div>

        <div class="mb-3 text-start">
          <label class="form-label fw-bold">ชื่อจริง</label>
          <input id="add-name" class="form-control" placeholder="ชื่อจริง">
        </div>

        <div class="mb-3 text-start">
          <label class="form-label fw-bold">รหัสผ่าน (ขั้นต่ำ 6 ตัว)</label>
          <input id="add-password" type="password" class="form-control" placeholder="รหัสผ่าน">
        </div>

        <div class="mb-2 text-start">
          <label class="form-label fw-bold">สิทธิ์</label>
          <select id="add-role" class="form-select">
            <option value="0">แอดมินหลัก</option>
            <option value="1" selected>พนักงาน</option>
          </select>
        </div>

      </div>
    `,
    width: "95%",                 // ❗ สวยมากสำหรับมือถือ
    padding: "1rem",
    background: "#fff",
    showCancelButton: true,
    confirmButtonText: `<button class="btn btn-primary w-100 py-2 fw-bold">บันทึก</button>`,
    cancelButtonText: `<button class="btn btn-secondary w-100 py-2 fw-bold">ยกเลิก</button>`,
    didRender: () => {
      // ให้ปุ่มสวย เหมือน bootstrap
      const confirmBtn = Swal.getConfirmButton();
      confirmBtn.classList.remove("swal2-confirm");
      confirmBtn.style.padding = "0";
      confirmBtn.style.margin = "0";

      const cancelBtn = Swal.getCancelButton();
      cancelBtn.classList.remove("swal2-cancel");
      cancelBtn.style.padding = "0";
      cancelBtn.style.margin = "0";
    },
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
    Toast.fire({ icon: "warning", title: "รหัสผ่านต้องมีอย่างน้อย 6 ตัว" });
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

    await fetchAdmins();

    Toast.fire({
      iconHtml: `<img src="${smartDormIcon}" style="width:28px;height:28px;border-radius:50%">`,
      title: `เพิ่มสมาชิกสำเร็จ<br><b>เพิ่ม ${formValues.name} แล้ว</b>`,
    });
  } catch (err: any) {
    Toast.fire({ icon: "error", title: err.message });
  }
};

  /* ===========================================================
     🔥 EDIT ADMIN POPUP
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
     🔥 DELETE ADMIN
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

          {/* เพิ่มสมาชิก */}
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

          {/* ตาราง + การ์ด */}
          {loading ? (
            <p className="text-center">กำลังโหลดข้อมูล...</p>
          ) : windowWidth < 900 ? (
            /* ================= MOBILE CARD ================= */
            <div className="row g-3">
              {currentAdmins.map((a) => (
                <div key={a.adminId} className="col-12">
                  <div className="card shadow-sm p-3">
                    <h5 className="fw-bold">{a.username}</h5>
                    <p><b>ชื่อ:</b> {a.name}</p>
                    <p><b>สิทธิ์:</b> {a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</p>

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
            /* ================= DESKTOP TABLE ================= */
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

          {/* pagination */}
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