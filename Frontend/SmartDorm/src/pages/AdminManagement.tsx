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
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Logo SmartDorm
  const smartDormIcon =
    "https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png";

  // SweetAlert Toast
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    background: "#ffffff",
    color: "#333",
    iconColor: "#6a11cb",
  });

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
     🔥 ADD ADMIN POPUP — Bootstrap Style ✔ ไม่มี Error
  =========================================================== */
  const openAddDialog = async () => {
    const result = await Swal.fire({
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
      width: "95%",
      padding: "1rem",
      background: "#fff",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      didRender: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        if (confirmBtn) {
          confirmBtn.classList.add(
            "btn",
            "btn-primary",
            "w-100",
            "py-2",
            "fw-bold"
          );
        }
        if (cancelBtn) {
          cancelBtn.classList.add(
            "btn",
            "btn-secondary",
            "w-100",
            "py-2",
            "fw-bold"
          );
        }
      },
      preConfirm: () => {
        return {
          username: (
            document.getElementById("add-username") as HTMLInputElement
          )?.value,
          name: (document.getElementById("add-name") as HTMLInputElement)
            ?.value,
          password: (
            document.getElementById("add-password") as HTMLInputElement
          )?.value,
          role: parseInt(
            (document.getElementById("add-role") as HTMLSelectElement)?.value
          ),
        };
      },
    });

    const formValues = result?.value;
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
    const result = await Swal.fire({
      title: `แก้ไขข้อมูล (${admin.username})`,
      html: `
        <div class="container" style="max-width: 100%; padding: 0;">
          <div class="mb-3 text-start">
            <label class="form-label fw-bold">ชื่อจริง</label>
            <input id="edit-name" class="form-control" value="${admin.name}">
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-bold">รหัสผ่านใหม่ (ไม่บังคับ)</label>
            <input id="edit-pass" type="password" class="form-control" placeholder="รหัสผ่านใหม่">
          </div>

          <div class="mb-2 text-start">
            <label class="form-label fw-bold">สิทธิ์</label>
            <select id="edit-role" class="form-select">
              <option value="0" ${
                admin.role === 0 ? "selected" : ""
              }>แอดมินหลัก</option>
              <option value="1" ${
                admin.role === 1 ? "selected" : ""
              }>พนักงาน</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      didRender: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        if (confirmBtn)
          confirmBtn.classList.add("btn", "btn-primary", "w-100", "fw-bold");
        if (cancelBtn)
          cancelBtn.classList.add("btn", "btn-secondary", "w-100", "fw-bold");
      },
      preConfirm: () => {
        return {
          name: (document.getElementById("edit-name") as HTMLInputElement)
            ?.value,
          password: (document.getElementById("edit-pass") as HTMLInputElement)
            ?.value,
          role: parseInt(
            (document.getElementById("edit-role") as HTMLSelectElement)?.value
          ),
        };
      },
    });

    const formValues = result?.value;
    if (!formValues) return;

    if (formValues.password && formValues.password.length < 6) {
      Toast.fire({ icon: "warning", title: "รหัสผ่านต้องมากกว่า 6 ตัว" });
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

      await fetchAdmins();

      Toast.fire({
        iconHtml: `<img src="${smartDormIcon}" style="width:28px;height:28px;border-radius:50%">`,
        title: `แก้ไขข้อมูลสำเร็จ`,
      });
    } catch (err: any) {
      Toast.fire({ icon: "error", title: err.message });
    }
  };

  /* ===========================================================
     🔥 DELETE ADMIN
  =========================================================== */
  const handleDelete = async (adminId: string) => {
    if (adminId === oldestAdminId) {
      Toast.fire({
        icon: "warning",
        title: "ห้ามลบแอดมินคนแรก",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบผู้ดูแลระบบคนนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      await fetchAdmins();

      Toast.fire({
        iconHtml: `<img src="${smartDormIcon}" style="width:28px;height:28px;border-radius:50%">`,
        title: `ลบผู้ดูแลระบบเรียบร้อย`,
      });
    } catch (err: any) {
      Toast.fire({ icon: "error", title: err.message });
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content px-2 py-3 mt-6 mt-lg-7">
        <div className="container">
          <h2 className="text-center mt-3 mb-4 fw-bold">จัดการผู้ดูแลระบบ</h2>

          {/* ปุ่มเพิ่มสมาชิก */}
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
          ) : windowWidth < 600 ? (
            /* ================= MOBILE: 1 การ์ด ================= */
            <div className="row g-3">
              {currentAdmins.map((a) => (
                <div key={a.adminId} className="col-12">
                  <div className="card shadow-sm p-3">
                    <h5 className="fw-bold">{a.username}</h5>
                    <p>
                      <b>ชื่อ :</b> {a.name}
                    </p>
                    <p>
                      <b>สิทธิ์ :</b> {a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}
                    </p>

                    <div className="d-flex justify-content-between mt-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openEditDialog(a)}
                      >
                        ✏️
                      </button>

                      {a.adminId !== oldestAdminId && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a.adminId)}
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : windowWidth < 1400 ? (
            /* ================= TABLET: 3 การ์ด ================= */
            <div className="row g-3">
              {currentAdmins.map((a) => (
                <div key={a.adminId} className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm p-3">
                    <h5 className="fw-bold">{a.username}</h5>
                    <p>
                      <b>ชื่อ :</b> {a.name}
                    </p>
                    <p>
                      <b>สิทธิ์ :</b> {a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}
                    </p>

                    <div className="d-flex justify-content-between mt-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openEditDialog(a)}
                      >
                        ✏️
                      </button>

                      {a.adminId !== oldestAdminId && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a.adminId)}
                        >
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
            <div className="responsive-table" style={{ overflowX: "auto" }}>
              <table
                className="table table-sm table-striped align-middle text-center"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>ชื่อผู้ใช้</th>
                    <th>ชื่อ</th>
                    <th>สิทธิ์</th>
                    <th>แก้ไข</th>
                    <th>ลบ</th>
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
                          ✏️
                        </button>
                      </td>
                      <td>
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
            </div>
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
