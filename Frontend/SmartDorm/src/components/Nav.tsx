import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export interface NavProps {
  message?: string;
  onLogout: () => void;
  pendingBookings?: number;
  role?: number | null;
  adminName?: string;
  adminUsername?: string;
}

export default function Nav({
  onLogout,
  pendingBookings = 0,
  role,
  adminName,
  adminUsername,
}: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const shortName = (name?: string) =>
    !name
      ? "-"
      : name.length <= 12
      ? name
      : `${name.split(" ")[0]} ${name.split(" ")[1][0]}.`;

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const closeProfile = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".profile-menu")) setProfileOpen(false);
    };
    document.addEventListener("click", closeProfile);
    return () => document.removeEventListener("click", closeProfile);
  }, []);

  return (
    <>
      {/* 🟣 TOP BAR */}
      <div
        className="position-fixed top-0 start-0 w-100 bg-primary text-white shadow d-flex align-items-center px-3"
        style={{ height: "72px", zIndex: 2000 }}
      >
        {/* ☰ MENU BUTTON (Mobile only) */}
        <button
          className="btn btn-light btn-sm d-xxl-none me-3 fw-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* 🏢 BRAND CENTER */}
        <div className="flex-grow-1 text-center">
          <div className="fw-semibold" style={{ fontSize: "0.95rem" }}>ระบบจัดการหอพัก</div>
          <div className="fw-bold text-warning" style={{ fontSize: "1.18rem" }}>
            SmartDorm
          </div>
        </div>

        {/* 👤 PROFILE */}
        <div className="profile-menu position-relative" style={{ cursor: "pointer" }}>
          <div
            className="d-flex flex-column text-end"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <span className="text-warning fw-bold">{shortName(adminName)}</span>
            <span className="small text-white opacity-75">
              {role === 0 ? "ผู้ดูแลระบบ" : "พนักงาน"}
            </span>
          </div>

          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div
              className="position-absolute end-0 bg-white shadow rounded p-3 mt-2"
              style={{ minWidth: "230px" }}
            >
              <div className="border-bottom pb-2 mb-2 small">
                <span className="fw-bold text-primary">👤 {adminName}</span>
                <br />
                <span className="text-muted">{adminUsername}</span>
              </div>

              <button
                className="btn btn-light w-100 text-start mb-2"
                onClick={() => navigate("/profile")}
              >
                ⚙️ โปรไฟล์ของฉัน
              </button>

              <button
                className="btn btn-light w-100 text-start mb-2"
                onClick={() => navigate("/change-password")}
              >
                🔑 เปลี่ยนรหัสผ่าน
              </button>

              <button
                className="btn btn-outline-danger w-100 text-start fw-semibold"
                onClick={onLogout}
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🟣 SIDEBAR DESKTOP (≥1400px) */}
      <div
        className="d-none d-xxl-flex flex-column position-fixed bg-primary text-white shadow"
        style={{ width: "210px", top: 0, bottom: 0, paddingTop: "85px" }}
      >
        <div className="px-2 d-flex flex-column gap-2">
          <button
            className={`btn text-start ${isActive("/dashboard") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
            onClick={() => navigate("/dashboard")}
          >
            🏠 หน้าแรก
          </button>

          {/* ห้อง */}
          <button
            className="btn btn-outline-light text-start d-flex justify-content-between"
            onClick={() => setDropdown(dropdown === "room" ? null : "room")}
          >
            🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
          </button>

          {dropdown === "room" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${isActive("/rooms") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
                onClick={() => navigate("/rooms")}
              >
                🏘️ จัดการห้องพัก
              </button>

              <button
                className={`btn text-start position-relative ${isActive("/bookings") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
                onClick={() => navigate("/bookings")}
              >
                📑 การจอง
                {pendingBookings > 0 && (
                  <span className="badge bg-danger position-absolute top-0 end-0">
                    {pendingBookings}
                  </span>
                )}
              </button>

              <button
                className={`btn text-start ${isActive("/checkout") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
                onClick={() => navigate("/checkout")}
              >
                🔄 หน้าคืน
              </button>
            </div>
          )}

          {/* บิล */}
          <button
            className="btn btn-outline-light text-start d-flex justify-content-between"
            onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}
          >
            💰 บิล {dropdown === "bill" ? "▴" : "▾"}
          </button>

          {dropdown === "bill" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${isActive("/bills") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
                onClick={() => navigate("/bills")}
              >
                💵 สร้างบิล
              </button>

              <button
                className={`btn text-start ${isActive("/allbills") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
                onClick={() => navigate("/allbills")}
              >
                📋 บิลทั้งหมด
              </button>
            </div>
          )}

          {role === 0 && (
            <button
              className={`btn text-start ${isActive("/admin/manage") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
              onClick={() => navigate("/admin/manage")}
            >
              👥 จัดการสมาชิก
            </button>
          )}

          <button
            className={`btn text-start ${isActive("/users") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}
            onClick={() => navigate("/users")}
          >
            👤 ข้อมูลลูกค้า
          </button>
        </div>
      </div>

      {/* 📱 MOBILE MENU */}
      {menuOpen && (
        <>
          <div
            className="position-fixed bg-primary text-white shadow p-3"
            style={{ width: "240px", top: 0, bottom: 0, paddingTop: "90px", zIndex: 3000 }}
          >
            <button className="btn btn-light btn-sm mb-3" onClick={() => setMenuOpen(false)}>
              ✖ ปิดเมนู
            </button>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-outline-light text-start" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>🏠 หน้าแรก</button>

              <button
                className="btn btn-outline-light text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "room" ? null : "room")}
              >
                🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
              </button>

              {dropdown === "room" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button className="btn btn-outline-light text-start" onClick={() => { navigate("/rooms"); setMenuOpen(false); }}>🏘️ จัดการห้องพัก</button>
                  <button className="btn btn-outline-light text-start" onClick={() => { navigate("/bookings"); setMenuOpen(false); }}>📑 การจอง</button>
                  <button className="btn btn-outline-light text-start" onClick={() => { navigate("/checkout"); setMenuOpen(false); }}>🔄 หน้าคืน</button>
                </div>
              )}

              <button
                className="btn btn-outline-light text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}
              >
                💰 บิล {dropdown === "bill" ? "▴" : "▾"}
              </button>

              {dropdown === "bill" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button className="btn btn-outline-light text-start" onClick={() => { navigate("/bills"); setMenuOpen(false); }}>💵 สร้างบิล</button>
                  <button className="btn btn-outline-light text-start" onClick={() => { navigate("/allbills"); setMenuOpen(false); }}>📋 บิลทั้งหมด</button>
                </div>
              )}

              <button className="btn btn-outline-light text-start" onClick={() => { navigate("/users"); setMenuOpen(false); }}>👤 ข้อมูลลูกค้า</button>

              {role === 0 && (
                <button className="btn btn-outline-light text-start" onClick={() => { navigate("/admin/manage"); setMenuOpen(false); }}>👥 จัดการสมาชิก</button>
              )}
            </div>
          </div>

          <div
            className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
            style={{ top: 0, left: 0, zIndex: 2500 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}