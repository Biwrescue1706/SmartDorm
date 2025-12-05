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
  message,
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

  const shortName = (name?: string) => {
    if (!name) return "-";
    if (name.length <= 10) return name;
    const parts = name.split(" ");
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : `${name.slice(0, 7)}...`;
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".profile-menu")) setProfileOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <>
      {/* 🔝 TOP BAR */}
      <div
        className="position-fixed top-0 start-0 w-100 d-flex align-items-center shadow px-3"
        style={{
          height: "70px",
          backgroundColor: "#4A0080",
          color: "#F7D53D",
          zIndex: 2000,
        }}
      >
        {/* ☰ MENU BUTTON */}
        <button
          className="btn btn-warning btn-sm d-xxl-none me-3 fw-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* BRAND */}
        <div className="text-center flex-grow-1">
          <h6 className="mb-0 fw-bold text-white">ระบบจัดการหอพัก</h6>
          <h5 className="mb-0 fw-bold text-warning">( SmartDorm )</h5>
        </div>

        {/* PROFILE */}
        <div className="profile-menu position-relative" style={{ cursor: "pointer" }}>
          <div onClick={() => setProfileOpen(!profileOpen)}>
            <span className="fw-bold text-warning">{shortName(adminName)}</span>
            <span className="ms-2 text-white">{role === 0 ? "แอดมิน" : "พนักงาน"}</span>
          </div>

          {profileOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow p-3 rounded"
              style={{ minWidth: "220px" }}
            >
              <div className="border-bottom pb-2 mb-2 small">
                <strong className="text-primary">👤 {adminName}</strong><br />
                <span className="text-muted">{adminUsername}</span>
              </div>

              <button className="btn btn-light w-100 text-start mb-2" onClick={() => navigate("/profile")}>
                ⚙️ โปรไฟล์
              </button>

              <button className="btn btn-light w-100 text-start mb-2" onClick={() => navigate("/change-password")}>
                🔑 เปลี่ยนรหัสผ่าน
              </button>

              <button className="btn btn-light w-100 text-start text-danger fw-bold" onClick={onLogout}>
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔔 MESSAGE BAR */}
      {message && (
        <div
          className="position-fixed start-50 translate-middle-x text-center px-3 py-1 rounded shadow"
          style={{
            top: "70px",
            backgroundColor: "#F7D53D",
            color: "#4A0080",
            fontWeight: 600,
            zIndex: 3000,
            minWidth: "260px",
          }}
        >
          {message}
        </div>
      )}

      {/* 🟣 SIDEBAR DESKTOP (≥1400px) */}
      <div
        className="d-none d-xxl-flex flex-column position-fixed top-0 start-0 text-white shadow"
        style={{
          width: "220px",
          height: "100vh",
          paddingTop: "90px",
          backgroundColor: "#4A0080",
        }}
      >
        <div className="px-2 d-flex flex-column gap-2">
          <button
            className={`btn text-start ${isActive("/dashboard") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
            onClick={() => navigate("/dashboard")}
          >
            🏠 หน้าแรก
          </button>

          {/* ห้อง */}
          <button
            className="btn btn-outline-warning text-start d-flex justify-content-between"
            onClick={() => setDropdown(dropdown === "room" ? null : "room")}
          >
            🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
          </button>

          {dropdown === "room" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${isActive("/rooms") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
                onClick={() => navigate("/rooms")}
              >
                🏘️ จัดการห้องพัก
              </button>

              <button
                className={`btn text-start position-relative ${isActive("/bookings") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
                onClick={() => navigate("/bookings")}
              >
                📑 การจอง
                {pendingBookings > 0 && (
                  <span className="badge bg-danger position-absolute top-0 end-0">{pendingBookings}</span>
                )}
              </button>

              <button
                className={`btn text-start ${isActive("/checkout") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
                onClick={() => navigate("/checkout")}
              >
                🔄 หน้าคืน
              </button>
            </div>
          )}

          {/* บิล */}
          <button
            className="btn btn-outline-warning text-start d-flex justify-content-between"
            onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}
          >
            💰 บิล {dropdown === "bill" ? "▴" : "▾"}
          </button>

          {dropdown === "bill" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${isActive("/bills") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
                onClick={() => navigate("/bills")}
              >
                💵 สร้างบิล
              </button>

              <button
                className={`btn text-start ${isActive("/allbills") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
                onClick={() => navigate("/allbills")}
              >
                📋 บิลทั้งหมด
              </button>
            </div>
          )}

          {role === 0 && (
            <button
              className={`btn text-start ${isActive("/admin/manage") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
              onClick={() => navigate("/admin/manage")}
            >
              👥 จัดการสมาชิก
            </button>
          )}

          <button
            className={`btn text-start ${isActive("/users") ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
            onClick={() => navigate("/users")}
          >
            👤 ข้อมูลลูกค้า
          </button>
        </div>
      </div>

      {/* 📱 MOBILE SIDEBAR */}
      {menuOpen && (
        <>
          <div
            className="position-fixed text-white p-3 shadow"
            style={{
              width: "230px",
              height: "100vh",
              top: 0,
              left: 0,
              paddingTop: "90px",
              backgroundColor: "#4A0080",
              zIndex: 3000,
            }}
          >
            <button
              className="btn btn-warning btn-sm mb-2 fw-bold"
              onClick={() => setMenuOpen(false)}
            >
              ✖ ปิดเมนู
            </button>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>
                🏠 หน้าแรก
              </button>

              <button
                className="btn btn-outline-warning text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "room" ? null : "room")}
              >
                🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
              </button>

              {dropdown === "room" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/rooms"); setMenuOpen(false); }}>🏘️ จัดการห้องพัก</button>
                  <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/bookings"); setMenuOpen(false); }}>📑 การจอง</button>
                  <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/checkout"); setMenuOpen(false); }}>🔄 หน้าคืน</button>
                </div>
              )}

              <button
                className="btn btn-outline-warning text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}
              >
                💰 บิล {dropdown === "bill" ? "▴" : "▾"}
              </button>

              {dropdown === "bill" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/bills"); setMenuOpen(false); }}>💵 สร้างบิล</button>
                  <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/allbills"); setMenuOpen(false); }}>📋 บิลทั้งหมด</button>
                </div>
              )}

              <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/users"); setMenuOpen(false); }}>👤 ข้อมูลลูกค้า</button>

              {role === 0 && (
                <button className="btn btn-outline-warning text-start" onClick={() => { navigate("/admin/manage"); setMenuOpen(false); }}>👥 จัดการสมาชิก</button>
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