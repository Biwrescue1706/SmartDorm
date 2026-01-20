// src/components/Nav.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export interface NavProps {
  onLogout: () => void;
  pendingBookings?: number;
  pendingCheckouts?: number;
  role?: number | null;
  adminName?: string;
  adminUsername?: string;
}

export default function Nav({
  onLogout,
  pendingBookings = 0,
  pendingCheckouts = 0,
  role,
  adminName,
  adminUsername,
}: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const shortName = (name?: string) => {
    if (!name) return "-";
    if (name.length <= 10) return name;
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0]} ${parts[1][0]}.`
      : `${name.slice(0, 7)}...`;
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-menu")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <div
        className="position-fixed top-0 start-0 w-100 d-flex align-items-center shadow px-3"
        style={{
          height: "60px",
          backgroundColor: "#4A0080",
          marginTop: 0, // กัน Topbar
          marginLeft: 0, // mobile
          color: "#F7D53D",
          zIndex: 1500,
        }}
      >
        {/* MOBILE MENU */}
        <button
          className="btn btn-warning btn-sm d-xxl-none me-3 fw-bold"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        {/* BRAND */}
        <div className="d-flex justify-content-center align-items-center gap-3 flex-grow-1">
          <img
            src="/assets/SmartDorm.webp"
            alt="SmartDorm"
            width={35}
            height={35}
            style={{ borderRadius: "10px" }}
          />
          <div className="text-center">
            <h6 className="fw-bold text-warning m-0">🏠SmartDorm</h6>
            <h6 className="text-white">ระบบจัดการหอพัก</h6>
          </div>
        </div>

        {/* PROFILE */}
        <div
          className="profile-menu position-relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(!profileOpen);
            }}
          >
            <div className="fw-bold text-warning small">
              👤 {shortName(adminName)}
            </div>
            <small className="text-white">
              {role === 0 ? "🛡️ แอดมิน" : "🧑‍💼 พนักงาน"}
            </small>
          </div>

          {profileOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow p-3 rounded"
              style={{ minWidth: 220, zIndex: 3000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-bottom pb-2 mb-2 small">
                <strong>👤 {adminName}</strong>
                <br />
                <span className="text-muted">@{adminUsername}</span>
              </div>

              <button
                className="btn btn-light w-100 text-start mb-2"
                onClick={() => navigate("/profile")}
              >
                ⚙️ โปรไฟล์
              </button>

              <button
                className="btn btn-light w-100 text-start mb-2"
                onClick={() => navigate("/change-password")}
              >
                🔑 เปลี่ยนรหัสผ่าน
              </button>

              <button
                className="btn btn-light w-100 text-start text-danger fw-bold"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div
        className="d-none d-xxl-flex flex-column position-fixed top-0 start-0 text-white shadow"
        style={{
          width: 180,
          height: "100vh",
          marginTop: 0, // กัน Topbar
          marginLeft: 0, // mobile
          paddingTop: 80,
          backgroundColor: "#4A0080",
          zIndex: 1500,
        }}
      >
        <div className="px-2 d-flex flex-column gap-2">
          <button
            className={`btn text-start ${
              isActive("/dashboard")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            🏠 หน้าแรก
          </button>

          <button
            className={`btn text-start ${
              isActive("/rooms")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/rooms")}
          >
            🏘️ จัดการห้องพัก
          </button>

          <button
            className={`btn text-start ${
              isActive("/bookings")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
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
            className={`btn text-start ${
              isActive("/checkout")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/checkout")}
          >
            🔄 หน้าคืน
            {pendingCheckouts > 0 && (
              <span className="badge bg-danger position-absolute top-0 end-0">
                {pendingCheckouts}
              </span>
            )}
          </button>

          <button
            className={`btn text-start ${
              isActive("/booking-history")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/booking-history")}
          >
            🕘 ประวัติการจอง
          </button>

          <button
            className={`btn text-start ${
              isActive("/bills")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/bills")}
          >
            🧾 สร้างบิล
          </button>

          <button
            className={`btn text-start ${
              isActive("/allbills")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/allbills")}
          >
            📋 บิลทั้งหมด
          </button>

          <button
            className={`btn text-start ${
              isActive("/admin/manage")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/admin/manage")}
          >
            👥 จัดการสมาชิก
          </button>

          <button
            className={`btn text-start ${
              isActive("/users")
                ? "btn-warning text-dark fw-bold"
                : "btn-warning"
            }`}
            onClick={() => navigate("/users")}
          >
            👤 ข้อมูลลูกค้า
          </button>
        </div>
      </div>

      {/* ================= MOBILE SIDEBAR ================= */}
      {menuOpen && (
        <>
          <div
            className="position-fixed text-white p-3 shadow"
            style={{
              width: 200,
              height: "100vh",
              marginTop: 0, // กัน Topbar
              marginLeft: 0, // mobile
              paddingTop: 80,
              backgroundColor: "#4A0080",
              zIndex: 1500,
            }}
          >
            <button
              className="btn btn-warning btn-sm mb-3 fw-bold ms-auto d-flex align-items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src="/assets/SmartDorm.webp"
                alt="SmartDorm"
                width={35}
                height={35}
                style={{ borderRadius: "10px" }}
              />
              ปิดเมนู
            </button>

            {/* เมนูเหมือน Desktop ทุกปุ่ม */}
            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
              >
                🏠 หน้าแรก
              </button>

              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/rooms");
                  setMenuOpen(false);
                }}
              >
                🏘️ จัดการห้องพัก
              </button>

              <button
                className="btn btn-warning text-start d-flex justify-content-between align-items-center"
                onClick={() => {
                  navigate("/bookings");
                  setMenuOpen(false);
                }}
              >
                <span>📑 การจอง</span>
                {pendingBookings > 0 && (
                  <span className="badge bg-danger">{pendingBookings}</span>
                )}
              </button>

              <button
                className="btn btn-warning text-start d-flex justify-content-between align-items-center"
                onClick={() => {
                  navigate("/checkout");
                  setMenuOpen(false);
                }}
              >
                <span>🔄 หน้าคืน</span>
                {pendingCheckouts > 0 && (
                  <span className="badge bg-danger">{pendingCheckouts}</span>
                )}
              </button>

              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/booking-history");
                  setMenuOpen(false);
                }}
              >
                🕘 ประวัติการจอง
              </button>

              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/bills");
                  setMenuOpen(false);
                }}
              >
                🧾 สร้างบิล
              </button>

              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/allbills");
                  setMenuOpen(false);
                }}
              >
                📋 บิลทั้งหมด
              </button>

              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/admin/manage");
                  setMenuOpen(false);
                }}
              >
                👥 จัดการสมาชิก
              </button>
              
              <button
                className="btn btn-warning text-start"
                onClick={() => {
                  navigate("/users");
                  setMenuOpen(false);
                }}
              >
                👤 ข้อมูลลูกค้า
              </button>
            </div>
          </div>

          {/* OVERLAY */}
          <div
            className="position-fixed w-100 h-100"
            style={{
              top: 0,
              left: 0,
              background: "rgba(0,0,0,.35)",
              zIndex: 1000,
            }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}
