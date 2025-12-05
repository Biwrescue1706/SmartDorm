import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export interface NavProps {
  message: string;
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
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const shorten = (n: string = "", len = 14) =>
    n.length <= len ? n : n.slice(0, len) + "...";

  const toggle = (k: string) =>
    setDropdownOpen(dropdownOpen === k ? null : k);

  return (
    <>
      {/* ======== TOP NAVBAR ======== */}
      <nav
        className="navbar navbar-dark shadow-sm px-3"
        style={{
          background:
            "linear-gradient(90deg, #3B0078, #5628A6, #200046)",
          height: "70px",
        }}
      >
        {/* MOBILE MENU BUTTON */}
        <button
          className="btn btn-warning btn-sm d-xxl-none me-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* BRAND CENTER */}
        <div className="flex-grow-1 text-center">
          <h6 className="text-white mb-0">ระบบจัดการหอพัก</h6>
          <h5 className="fw-bold text-warning mt-0">(SmartDorm)</h5>
        </div>

        {/* PROFILE BUTTON */}
        <div className="position-relative">
          <button
            className="btn btn-outline-warning fw-bold px-3 py-1"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {shorten(adminName)} | {role === 0 ? "แอดมิน" : "พนักงาน"}
          </button>

          {profileOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded shadow p-3"
              style={{ minWidth: "230px", zIndex: 2000 }}
            >
              <div className="border-bottom pb-2 mb-2">
                <span className="fw-bold text-primary small">
                  👤 {adminName}
                </span>
                <br />
                <span className="text-muted small">
                  {adminUsername}
                </span>
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="btn btn-light text-start w-100 mb-2"
              >
                ⚙️ โปรไฟล์ของฉัน
              </button>

              <button
                onClick={() => navigate("/change-password")}
                className="btn btn-light text-start w-100 mb-2"
              >
                🔑 เปลี่ยนรหัสผ่าน
              </button>

              <button
                onClick={onLogout}
                className="btn btn-light text-danger fw-bold text-start w-100"
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ======== SIDEBAR DESKTOP (≥1400px) ======== */}
      <div
        className="d-none d-xxl-flex flex-column position-fixed top-0 start-0 shadow h-100 text-white"
        style={{
          width: "190px",
          background: "#3B0078",
          paddingTop: "90px",
        }}
      >
        {/* หน้าแรก */}
        <button
          className={`btn text-start mx-3 mb-2 ${
            location.pathname === "/dashboard"
              ? "btn-warning text-dark fw-bold"
              : "btn-outline-light"
          }`}
          onClick={() => navigate("/dashboard")}
        >
          🏠 หน้าแรก
        </button>

        {/* ห้อง */}
        <button
          className="btn btn-outline-light mx-3 text-start d-flex justify-content-between"
          onClick={() => toggle("room")}
        >
          🛏️ ห้อง <span>{dropdownOpen === "room" ? "▲" : "▼"}</span>
        </button>

        {dropdownOpen === "room" && (
          <div className="ms-4 d-flex flex-column gap-2 mt-2">
            <button
              onClick={() => navigate("/rooms")}
              className={`btn text-start ${
                location.pathname.startsWith("/rooms")
                  ? "btn-warning text-dark fw-bold"
                  : "btn-outline-light"
              }`}
            >
              🏘️ จัดการห้องพัก
            </button>

            <button
              onClick={() => navigate("/bookings")}
              className="btn btn-outline-light text-start position-relative"
            >
              📑 การจอง
              {pendingBookings > 0 && (
                <span className="badge bg-danger position-absolute end-0 top-0">
                  {pendingBookings}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/checkout")}
              className={`btn text-start ${
                location.pathname.startsWith("/checkout")
                  ? "btn-warning text-dark fw-bold"
                  : "btn-outline-light"
              }`}
            >
              🔄 หน้าคืน
            </button>
          </div>
        )}

        {/* บิล */}
        <button
          className="btn btn-outline-light mx-3 text-start d-flex justify-content-between mt-2"
          onClick={() => toggle("bill")}
        >
          💰 บิล <span>{dropdownOpen === "bill" ? "▲" : "▼"}</span>
        </button>

        {dropdownOpen === "bill" && (
          <div className="ms-4 d-flex flex-column gap-2 mt-2">
            <button
              onClick={() => navigate("/bills")}
              className={`btn text-start ${
                location.pathname.startsWith("/bills")
                  ? "btn-warning text-dark fw-bold"
                  : "btn-outline-light"
              }`}
            >
              💵 สร้างบิล
            </button>

            <button
              onClick={() => navigate("/allbills")}
              className={`btn text-start ${
                location.pathname.startsWith("/allbills")
                  ? "btn-warning text-dark fw-bold"
                  : "btn-outline-light"
              }`}
            >
              📋 บิลทั้งหมด
            </button>
          </div>
        )}

        {/* ผู้ใช้ */}
        <button
          onClick={() => navigate("/users")}
          className={`btn text-start mx-3 mt-2 ${
            location.pathname.startsWith("/users")
              ? "btn-warning text-dark fw-bold"
              : "btn-outline-light"
          }`}
        >
          👤 ข้อมูลลูกค้า
        </button>

        {/* จัดการสมาชิก */}
        {role === 0 && (
          <button
            onClick={() => navigate("/admin/manage")}
            className={`btn text-start mx-3 mt-2 ${
              location.pathname.startsWith("/admin/manage")
                ? "btn-warning text-dark fw-bold"
                : "btn-outline-light"
            }`}
          >
            👥 จัดการสมาชิก
          </button>
        )}
      </div>

      {/* ======== MOBILE SLIDE MENU ======== */}
      {menuOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 h-100 p-3 shadow text-white"
            style={{ width: "240px", background: "#3B0078", zIndex: 1500 }}
          >
            <button
              className="btn btn-light btn-sm mb-3"
              onClick={() => setMenuOpen(false)}
            >
              ✖
            </button>

            <button
              className="btn btn-outline-light w-100 mb-2 text-start"
              onClick={() => {
                navigate("/dashboard");
                setMenuOpen(false);
              }}
            >
              🏠 หน้าแรก
            </button>
          </div>

          {/* OVERLAY */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1400 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}