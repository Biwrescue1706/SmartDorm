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

  const smartDormIcon =
    "https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png";

  /* ===================== SCB THEME TOAST ===================== */
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    background: "#ffffff",
    color: "#4A0080",
    iconColor: "#D4AF37",
  });

  /* ===================== RESIZE DETECTOR ===================== */
  useEffect(() => {
    const resize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ===================== BLOCK OLDEST ADMIN DELETE ===================== */
  const oldestAdminId =
    admins.length > 0
      ? [...admins].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0].adminId
      : null;

  /* ===================== FILTER ===================== */
  const filteredAdmins =
    filterRole === "admin"
      ? admins.filter((a) => a.role === 0)
      : filterRole === "staff"
      ? admins.filter((a) => a.role === 1)
      : admins;

  const totalItems = filteredAdmins.length;
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ===========================================================
     🔥 ADD ADMIN POPUP (SCB THEME)
  =========================================================== */
  const openAddDialog = async () => {
    const result = await Swal.fire({
      width: "95%",
      title: `<h3 class="fw-bold" style="color:#4A0080">เพิ่มผู้ดูแลระบบ</h3>`,
      html: `
      <div class="text-start">
        <label class="form-label">ชื่อผู้ใช้</label>
        <input id="add-username" class="form-control mb-2">

        <label class="form-label">ชื่อจริง</label>
        <input id="add-name" class="form-control mb-2">

        <label class="form-label">รหัสผ่าน (≥ 6 ตัว)</label>
        <input id="add-password" type="password" class="form-control mb-2">

        <label class="form-label">สิทธิ์</label>
        <select id="add-role" class="form-select">
          <option value="0">แอดมินหลัก</option>
          <option value="1" selected>พนักงาน</option>
        </select>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: "💾 บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#4A0080",
      cancelButtonColor: "#6c757d",
    });

    const data = result.value;
    if (!data) return;

    data.username = document.getElementById("add-username").value;
    data.name = document.getElementById("add-name").value;
    data.password = document.getElementById("add-password").value;
    data.role = +document.getElementById("add-role").value;

    if (data.password.length < 6) {
      Toast.fire({ icon: "warning", title: "รหัสผ่านต้อง ≥ 6 ตัว" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("เกิดข้อผิดพลาด");

      await fetchAdmins();
      Toast.fire({
        iconHtml: `<img src="${smartDormIcon}" style="width:28px;border-radius:50%">`,
        title: `เพิ่มผู้ดูแลแล้ว`,
      });
    } catch (err) {
      Toast.fire({ icon: "error", title: "บันทึกไม่สำเร็จ" });
    }
  };

  /* ===========================================================
     🔥 EDIT DIALOG (SCB STYLE)
  =========================================================== */
  const openEditDialog = async (admin: Admin) => {
    const result = await Swal.fire({
      title: `<b style="color:#4A0080">แก้ไข (${admin.username})</b>`,
      html: `
      <label class="form-label">ชื่อจริง</label>
      <input id="edit-name" value="${admin.name}" class="form-control mb-2">

      <label class="form-label">รหัสผ่านใหม่ (ไม่บังคับ)</label>
      <input id="edit-pass" type="password" class="form-control mb-2">

      <label class="form-label">สิทธิ์</label>
      <select id="edit-role" class="form-select">
        <option value="0" ${admin.role === 0 && "selected"}>แอดมินหลัก</option>
        <option value="1" ${admin.role === 1 && "selected"}>พนักงาน</option>
      </select>
      `,
      showCancelButton: true,
      confirmButtonText: "💾 บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#4A0080",
    });

    if (!result.isConfirmed) return;

    const payload = {
      name: document.getElementById("edit-name").value,
      password: document.getElementById("edit-pass").value,
      role: +document.getElementById("edit-role").value,
    };

    if (payload.password && payload.password.length < 6) {
      Toast.fire({ icon: "warning", title: "รหัสผ่าน ≥ 6 ตัว" });
      return;
    }

    try {
      await fetch(`${API_BASE}/admin/${admin.adminId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await fetchAdmins();
      Toast.fire({ icon: "success", title: "บันทึกสำเร็จ" });
    } catch {
      Toast.fire({ icon: "error", title: "แก้ไขไม่สำเร็จ" });
    }
  };

  /* ===========================================================
     🔥 DELETE ADMIN
  =========================================================== */
  const handleDelete = async (adminId: string) => {
    if (adminId === oldestAdminId)
      return Toast.fire({ icon: "warning", title: "ห้ามลบแอดมินคนแรก" });

    const conf = await Swal.fire({
      icon: "warning",
      title: "ลบผู้ดูแล?",
      text: "ไม่สามารถย้อนกลับได้",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#4A0080",
      showCancelButton: true,
    });

    if (!conf.isConfirmed) return;

    await fetch(`${API_BASE}/admin/${adminId}`, {
      method: "DELETE",
      credentials: "include",
    });

    await fetchAdmins();
    Toast.fire({ icon: "success", title: "ลบแล้ว" });
  };

  /* ===================== UI ===================== */
  return (
    <div style={{ background: "#f6f1fc", minHeight: "100vh" }}>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="container py-4 mt-5">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#4A0080" }}>
          ⚙️ จัดการผู้ดูแลระบบ
        </h2>

        {/* ADD BUTTON */}
        <div className="text-center mb-4">
          <button
            className="btn fw-bold text-white px-5 py-2"
            style={{
              background: "linear-gradient(135deg,#4A0080,#D4AF37)",
              borderRadius: "12px",
            }}
            onClick={openAddDialog}
          >
            ➕ เพิ่มสมาชิก
          </button>
        </div>

        {/* FILTER */}
        <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
          <FilterCard
            active={filterRole === "all"}
            label={`ทั้งหมด (${admins.length})`}
            onClick={() => setFilterRole("all")}
          />
          <FilterCard
            active={filterRole === "admin"}
            label={`แอดมินหลัก (${admins.filter((a) => a.role === 0).length})`}
            onClick={() => setFilterRole("admin")}
          />
          <FilterCard
            active={filterRole === "staff"}
            label={`พนักงาน (${admins.filter((a) => a.role === 1).length})`}
            onClick={() => setFilterRole("staff")}
          />
        </div>

        {/* RESPONSIVE DISPLAY */}
        {loading ? (
          <p className="text-center">⏳ โหลดข้อมูล...</p>
        ) : windowWidth < 600 ? (
          <MobileView
            admins={currentAdmins}
            oldestAdminId={oldestAdminId}
            openEditDialog={openEditDialog}
            handleDelete={handleDelete}
          />
        ) : windowWidth < 1400 ? (
          <TabletView
            admins={currentAdmins}
            oldestAdminId={oldestAdminId}
            openEditDialog={openEditDialog}
            handleDelete={handleDelete}
          />
        ) : (
          <DesktopView
            admins={currentAdmins}
            oldestAdminId={oldestAdminId}
            openEditDialog={openEditDialog}
            handleDelete={handleDelete}
          />
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
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function FilterCard({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 fw-bold shadow-sm`}
      style={{
        cursor: "pointer",
        borderRadius: "12px",
        background: active ? "#4A0080" : "#fff",
        color: active ? "#fff" : "#4A0080",
        border: `2px solid #4A0080`,
      }}
    >
      {label}
    </div>
  );
}

function MobileView({ admins, oldestAdminId, openEditDialog, handleDelete }) {
  return (
    <div className="row g-3">
      {admins.map((a) => (
        <div key={a.adminId} className="col-12">
          <div className="card shadow-sm p-3 border-0" style={{ borderLeft: "5px solid #4A0080" }}>
            <h5 className="fw-bold">{a.username}</h5>
            <p><b>ชื่อ:</b> {a.name}</p>
            <p><b>สิทธิ์:</b> {a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</p>

            <div className="d-flex justify-content-between">
              <button className="btn btn-sm text-white" style={{ background:"#4A0080" }} onClick={() => openEditDialog(a)}>✏️</button>
              {a.adminId !== oldestAdminId && (
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.adminId)}>ลบ</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabletView(props) {
  return (
    <div className="row g-3">
      {props.admins.map((a) => (
        <div key={a.adminId} className="col-sm-6 col-lg-4">
          <MobileView {...props} admins={[a]} />
        </div>
      ))}
    </div>
  );
}

function DesktopView({ admins, oldestAdminId, openEditDialog, handleDelete }) {
  return (
    <table className="table table-bordered text-center align-middle">
      <thead style={{ background: "#4A0080", color: "#fff" }}>
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
        {admins.map((a, i) => (
          <tr key={a.adminId}>
            <td>{i + 1}</td>
            <td>{a.username}</td>
            <td>{a.name}</td>
            <td>{a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</td>
            <td>
              <button className="btn text-white" style={{ background:"#4A0080" }} onClick={() => openEditDialog(a)}>
                ✏️
              </button>
            </td>
            <td>
              {a.adminId !== oldestAdminId && (
                <button className="btn btn-danger" onClick={() => handleDelete(a.adminId)}>ลบ</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}