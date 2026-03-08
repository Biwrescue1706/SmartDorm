// src/pages/AdminManagement.tsx
import { useState, useEffect } from "react";
import { useAdmins } from "../hooks/Admin/useAdmins";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type { Admin } from "../types/admin";
import { THEME } from "../components/Admin/AdminTheme";
import MobileView from "../components/Admin/MobileView";
import TabletView from "../components/Admin/TabletView";
import DesktopView from "../components/Admin/DesktopView";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";

export const roleStyle = (role: number) => ({
  border: "2px solid #000",
  borderRadius: "12px",
  background: role === 0 ? "#d6a658" : "#198754",
  color: "#ffffff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
});

export default function AdminManagement() {
  const { admins, loading, fetchAdmins } = useAdmins();
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  const Toast = Swal.mixin({
    showConfirmButton: false,
    timer: 2500,
    background: "#ffffff",
    color: THEME.purpleDark,
    iconColor: THEME.gold,
    timerProgressBar: true,
  });

  useEffect(() => {
    const resize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const oldestAdminId =
    admins.length > 0
      ? [...admins].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )[0].adminId
      : null;

  const filteredAdmins =
    filterRole === "admin"
      ? admins.filter((a) => a.role === 0)
      : filterRole === "staff"
        ? admins.filter((a) => a.role === 1)
        : admins;

  const totalItems = filteredAdmins.length;
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const openAddDialog = async () => {
    const result = await Swal.fire({
      html: `
      <div style="color:${THEME.purpleDark}">
        <h2 class="fw-bold" style="color:${THEME.purple}">เพิ่มผู้ดูแลระบบใหม่</h2>
        <hr style="border:1px solid ${THEME.gold};opacity:.6">

        <div class="mb-2 text-start">
          <label class="fw-bold">ชื่อผู้ใช้</label>
          <input id="add-username" class="form-control" placeholder="ชื่อผู้ใช้">
        </div>

        <div class="mb-2 text-start">
          <label class="fw-bold">ชื่อจริง</label>
          <input id="add-name" class="form-control" placeholder="ชื่อจริง">
        </div>

        <div class="mb-2 text-start">
          <label class="fw-bold">รหัสผ่าน (ขั้นต่ำ 6 ตัว)</label>
          <input id="add-password" class="form-control" type="password" placeholder="รหัสผ่าน">
        </div>

        <div class="mb-2 text-start">
          <label class="fw-bold">สิทธิ์</label>
          <select id="add-role" class="form-select">
            <option value="0">แอดมิน</option>
            <option value="1" selected>พนักงาน</option>
          </select>
        </div>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      background: "#fff",
      width: "480px",
      confirmButtonColor: THEME.purple,
      cancelButtonColor: "#777",
      preConfirm: () => ({
        username: (document.getElementById("add-username") as HTMLInputElement)
          ?.value,
        name: (document.getElementById("add-name") as HTMLInputElement)?.value,
        password: (document.getElementById("add-password") as HTMLInputElement)
          ?.value,
        role: parseInt(
          (document.getElementById("add-role") as HTMLSelectElement)?.value,
        ),
      }),
    });

    const v = result.value;
    if (!v) return;

    if (v.password.length < 6)
      return Toast.fire({ icon: "warning", title: "รหัสผ่านต้อง 6 ตัวขึ้นไป" });

    try {
      const res = await fetch(`${API_BASE}/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(v),
      });

      if (!res.ok) throw new Error("เพิ่มผู้ดูแลไม่สำเร็จ");

      await fetchAdmins();
      Toast.fire({
        icon: "success",
        title: `<b>${v.name}</b> ถูกเพิ่มแล้ว`,
      });
    } catch (e: any) {
      Toast.fire({ icon: "error", title: e.message });
    }
  };

  const openEditDialog = async (admin: Admin) => {
    const result = await Swal.fire({
      html: `
      <h2 class="fw-bold" style="color:${THEME.purple}">แก้ไขข้อมูล</h2>
      <hr style="border:1px solid ${THEME.gold};opacity:.6">

      <div class="text-start">
        <label class="fw-bold">ชื่อจริง</label>
        <input id="edit-name" class="form-control" value="${admin.name}">
      </div>

      <div class="mt-2 text-start">
        <label class="fw-bold">รหัสผ่านใหม่</label>
        <input id="edit-pass" class="form-control" placeholder="(ไม่บังคับ)" type="password">
      </div>

      <div class="mt-2 text-start">
        <label class="fw-bold">สิทธิ์</label>
        <select id="edit-role" class="form-select">
          <option value="0" ${
            admin.role === 0 ? "selected" : ""
          }>แอดมิน</option>
          <option value="1" ${
            admin.role === 1 ? "selected" : ""
          }>พนักงาน</option>
        </select>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      background: "#fff",
      width: "480px",
      confirmButtonColor: THEME.purple,
      cancelButtonColor: "#777",
      preConfirm: () => ({
        name: (document.getElementById("edit-name") as HTMLInputElement)?.value,
        password: (document.getElementById("edit-pass") as HTMLInputElement)
          ?.value,
        role: parseInt(
          (document.getElementById("edit-role") as HTMLSelectElement)?.value,
        ),
      }),
    });

    const v = result.value;
    if (!v) return;

    if (v.password && v.password.length < 6)
      return Toast.fire({
        icon: "warning",
        title: "รหัสผ่านต้องมากกว่า 6 ตัว",
      });

    try {
      const res = await fetch(`${API_BASE}/admin/${admin.adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(v),
      });

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      await fetchAdmins();
      Toast.fire({
        icon: "success",
        title: `อัปเดตข้อมูลสำเร็จ`,
      });
    } catch (e: any) {
      Toast.fire({ icon: "error", title: e.message });
    }
  };

  const handleDelete = async (adminId: string) => {
    if (adminId === oldestAdminId)
      return Toast.fire({
        icon: "warning",
        title: "❌ ห้ามลบแอดมินคนแรก",
      });

    const ok = await Swal.fire({
      title: "ต้องการลบ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: THEME.purple,
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      await fetchAdmins();

      Toast.fire({ icon: "success", title: "ลบแล้ว" });
    } catch (e: any) {
      Toast.fire({ icon: "error", title: e.message });
    }
  };

  return (
    <div
      className="d-flex min-vh-100 mx-2 mt-0 mb-4"
      style={{ fontFamily: "Sarabun, sans-serif" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main
        className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7"
        style={{
          paddingLeft: "20px",
          marginLeft: "190px",
          paddingRight: "20px",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          <h2
            className="text-center fw-bold mb-4"
            style={{ color: THEME.purple }}
          >
            🛡️ จัดการผู้ดูแลระบบ SmartDorm
          </h2>

          {role == 0 && (
            <div className="text-center mb-4">
              <button
                className="btn text-white fw-bold px-5 py-2"
                style={{
                  background: `linear-gradient(135deg, ${THEME.purple}, ${THEME.purpleLight})`,
                  borderRadius: "12px",
                }}
                onClick={openAddDialog}
              >
                ➕ เพิ่มสมาชิก
              </button>
            </div>
          )}

          {/* FILTER */}
          {windowWidth < 1400 ? (
            <>
              <h4 className="text-center fw-bold mb-2 text-black">
                สถานะแอดมิน
              </h4>
              {/* < 1400 = Dropdown */}
              <div className="d-flex justify-content-center mb-4">
                {(() => {
                  const items = [
                    {
                      key: "all",
                      label: `ทั้งหมด (${admins.length})`,
                      color: THEME.purple,
                    },
                    {
                      key: "admin",
                      label: `แอดมิน (${admins.filter((a) => a.role === 0).length})`,
                      color: "#d6a658",
                    },
                    {
                      key: "staff",
                      label: `พนักงาน (${admins.filter((a) => a.role === 1).length})`,
                      color: "#198754",
                    },
                  ];

                  const activeItem =
                    items.find((i) => i.key === filterRole) ?? items[0];

                  return (
                    <div className="dropdown">
                      <button
                        className="btn dropdown-toggle fw-bold px-4"
                        data-bs-toggle="dropdown"
                        style={{
                          background: activeItem.color,
                          color: "#fff",
                          borderColor: activeItem.color,
                          height: 38,
                        }}
                      >
                        {activeItem.label}
                      </button>

                      <div className="dropdown-menu">
                        {items.map((i) => (
                          <button
                            key={i.key}
                            className="dropdown-item fw-bold"
                            style={{
                              background:
                                filterRole === i.key ? i.color : "transparent",
                              color: filterRole === i.key ? "#fff" : i.color,
                            }}
                            onClick={() => setFilterRole(i.key)}
                          >
                            {i.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            // ≥ 1400 = Cards (ของเดิม)
            <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
              {[
                { key: "all", label: `ทั้งหมด (${admins.length})` },
                {
                  key: "admin",
                  label: `แอดมิน (${admins.filter((a) => a.role === 0).length})`,
                },
                {
                  key: "staff",
                  label: `พนักงาน (${admins.filter((a) => a.role === 1).length})`,
                },
              ].map((f) => (
                <div
                  key={f.key}
                  className="px-4 py-2 fw-bold shadow-sm"
                  style={{
                    cursor: "pointer",
                    borderRadius: "10px",
                    background:
                      filterRole === f.key ? THEME.purple : THEME.cardBg,
                    color: filterRole === f.key ? "#fff" : THEME.text,
                    border:
                      filterRole === f.key
                        ? "2px solid #fff"
                        : "1px solid #ddd",
                    transition: ".3s",
                  }}
                  onClick={() => setFilterRole(f.key)}
                >
                  {f.label}
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>
          ) : windowWidth < 600 ? (
            <MobileView
              admins={currentAdmins}
              oldestAdminId={oldestAdminId}
              handleDelete={handleDelete}
              openEditDialog={openEditDialog}
              role={role}
            />
          ) : windowWidth < 1400 ? (
            <TabletView
              admins={currentAdmins}
              oldestAdminId={oldestAdminId}
              handleDelete={handleDelete}
              openEditDialog={openEditDialog}
              role={role}
            />
          ) : (
            <DesktopView
              currentAdmins={currentAdmins}
              oldestAdminId={oldestAdminId}
              handleDelete={handleDelete}
              openEditDialog={openEditDialog}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              role={role}
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(v) => {
              setRowsPerPage(v);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>
    </div>
  );
}
