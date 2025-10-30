import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

/* ======================================================
   🧭 Component: Nav.tsx (Full Bootstrap Version)
   ใช้สำหรับแสดงเมนูด้านบน (Topbar) + ด้านข้าง (Sidebar)
   ไม่มี CSS แยก ใช้ class ของ Bootstrap ทั้งหมด
   ====================================================== */

export interface NavProps {
  message: string;
  onLogout: () => void;
  pendingBookings?: number;
  role?: number | null;
}

/* ======================================================
   🧱 Component หลัก
====================================================== */
export default function Nav({
  message,
  onLogout,
  pendingBookings,
  role,
}: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // state ควบคุม dropdown และ collapse menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const isSuperAdmin = role === 0;

  // เปิด dropdown อัตโนมัติตาม path
  useEffect(() => {
    if (
      location.pathname.startsWith("/rooms") ||
      location.pathname.startsWith("/bookings") ||
      location.pathname.startsWith("/checkout")
    ) {
      setDropdownOpen("room");
    } else if (
      location.pathname.startsWith("/bills") ||
      location.pathname.startsWith("/allbills")
    ) {
      setDropdownOpen("bill");
    } else {
      setDropdownOpen(null);
    }
  }, [location.pathname]);

  // toggle dropdown
  const toggleDropdown = (key: string) => {
    setDropdownOpen(dropdownOpen === key ? null : key);
  };

  // ปิดเมนู (ใช้บนมือถือ)
  const closeMenu = () => setMenuOpen(false);

  /* ======================================================
     🧭 ส่วน Top Navbar (Bootstrap Navbar)
  ====================================================== */
  return (
    <>
      {/* ======= TOPBAR ======= */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
        <div className="container-fluid">
          {/* โลโก้ */}
          <a className="navbar-brand fw-bold" href="#">
            SmartDorm
          </a>

          {/* ปุ่ม toggle บนมือถือ */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-controls="navbarNav"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* ข้อความต้อนรับ */}
          <div className="d-none d-lg-flex flex-column align-items-end text-white small">
            {role === 0 ? (
              <>
                <span className="text-white-50">ยินดีต้อนรับ ผู้ดูแลระบบ</span>
                <span className="fw-bold text-warning">{message}</span>
              </>
            ) : role === 1 ? (
              <>
                <span className="text-white-50">ยินดีต้อนรับ พนักงาน</span>
                <span className="fw-bold text-info">{message}</span>
              </>
            ) : (
              <span>⏳ กำลังโหลด...</span>
            )}
          </div>
        </div>
      </nav>

      {/* ======================================================
         📱 ส่วน Collapse (แสดงเมื่อกด ☰ บนมือถือ)
      ====================================================== */}
      <div
        className={`collapse navbar-collapse bg-primary text-white ${
          menuOpen ? "show" : ""
        }`}
        id="navbarNav"
      >
        <ul className="navbar-nav flex-column p-3">
          {/* หน้าแรก */}
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${
                location.pathname === "/dashboard"
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
              onClick={() => {
                navigate("/dashboard");
                closeMenu();
              }}
            >
              🏠 หน้าแรก
            </button>
          </li>

          {/* ======================================================
             🏠 หมวด ห้องพัก
          ====================================================== */}
          <li className="nav-item mb-2">
            <button
              className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("room")}
            >
              <span>🛏️ ห้อง</span>
              <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
            </button>

            {/* Submenu ห้อง */}
            {dropdownOpen === "room" && (
              <ul className="list-unstyled ps-3 mt-2">
                {isSuperAdmin && (
                  <li className="mb-1">
                    <button
                      className={`btn w-100 text-start ${
                        location.pathname.startsWith("/rooms")
                          ? "btn-light text-primary fw-bold"
                          : "btn-outline-light"
                      }`}
                      onClick={() => {
                        navigate("/rooms");
                        closeMenu();
                      }}
                    >
                      🏘️ จัดการห้องพัก
                    </button>
                  </li>
                )}
                <li className="mb-1">
                  <button
                    className={`btn w-100 text-start position-relative ${
                      location.pathname.startsWith("/bookings")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      navigate("/bookings");
                      closeMenu();
                    }}
                  >
                    📑 การจอง
                    {(pendingBookings ?? 0) > 0 && (
                      <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                        {pendingBookings}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    className={`btn w-100 text-start ${
                      location.pathname.startsWith("/checkout")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      navigate("/checkout");
                      closeMenu();
                    }}
                  >
                    🔄 หน้าคืน
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* ======================================================
             💰 หมวด บิล
          ====================================================== */}
          <li className="nav-item mb-2">
            <button
              className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("bill")}
            >
              <span>💰 บิล</span>
              <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
            </button>

            {dropdownOpen === "bill" && (
              <ul className="list-unstyled ps-3 mt-2">
                <li className="mb-1">
                  <button
                    className={`btn w-100 text-start ${
                      location.pathname.startsWith("/bills")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      navigate("/bills");
                      closeMenu();
                    }}
                  >
                    💵 สร้างบิล
                  </button>
                </li>
                <li>
                  <button
                    className={`btn w-100 text-start ${
                      location.pathname.startsWith("/allbills")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      navigate("/allbills");
                      closeMenu();
                    }}
                  >
                    📋 บิลทั้งหมด
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* ======================================================
             👤 จัดการสมาชิก (เฉพาะ Super Admin)
          ====================================================== */}
          {isSuperAdmin && (
            <li className="nav-item mb-2">
              <button
                className={`btn w-100 text-start ${
                  location.pathname.startsWith("/admin/manage")
                    ? "btn-light text-primary fw-bold"
                    : "btn-outline-light"
                }`}
                onClick={() => {
                  navigate("/admin/manage");
                  closeMenu();
                }}
              >
                👤 จัดการสมาชิก
              </button>
            </li>
          )}

          {/* ======================================================
             👥 ข้อมูลลูกค้า
          ====================================================== */}
          <li className="nav-item mb-3">
            <button
              className={`btn w-100 text-start ${
                location.pathname.startsWith("/users")
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
              onClick={() => {
                navigate("/users");
                closeMenu();
              }}
            >
              👥 ข้อมูลลูกค้า
            </button>
          </li>

          {/* ======================================================
             🚪 ออกจากระบบ
          ====================================================== */}
          <li className="nav-item border-top pt-3">
            <button
              className="btn btn-danger w-100 fw-bold"
              onClick={() => {
                onLogout();
                closeMenu();
              }}
            >
              🚪 ออกจากระบบ
            </button>
          </li>
        </ul>
      </div>

      {/* ======================================================
         🖥️ Sidebar สำหรับจอใหญ่ (≥1400px)
      ====================================================== */}
      <div className="d-none d-xxl-flex flex-column bg-primary text-white position-fixed top-0 start-0 h-100 shadow">
        <div className="p-3 flex-grow-1 mt-5">
          <div className="fw-bold fs-5 text-center mb-3 border-bottom border-light pb-2">
            🏫 SmartDorm
          </div>

          <div className="d-flex flex-column gap-2">
            <button
              className={`btn text-start ${
                location.pathname === "/dashboard"
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
              onClick={() => navigate("/dashboard")}
            >
              🏠 หน้าแรก
            </button>

            {/* ห้อง */}
            <div>
              <button
                className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
                onClick={() => toggleDropdown("room")}
              >
                <span>🛏️ ห้อง</span>
                <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
              </button>

              {dropdownOpen === "room" && (
                <div className="ps-3 mt-2 d-flex flex-column gap-2">
                  {isSuperAdmin && (
                    <button
                      className={`btn text-start ${
                        location.pathname.startsWith("/rooms")
                          ? "btn-light text-primary fw-bold"
                          : "btn-outline-light"
                      }`}
                      onClick={() => navigate("/rooms")}
                    >
                      🏘️ จัดการห้องพัก
                    </button>
                  )}
                  <button
                    className={`btn text-start position-relative ${
                      location.pathname.startsWith("/bookings")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => navigate("/bookings")}
                  >
                    📑 การจอง
                    {(pendingBookings ?? 0) > 0 && (
                      <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                        {pendingBookings}
                      </span>
                    )}
                  </button>
                  <button
                    className={`btn text-start ${
                      location.pathname.startsWith("/checkout")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => navigate("/checkout")}
                  >
                    🔄 หน้าคืน
                  </button>
                </div>
              )}
            </div>

            {/* บิล */}
            <div>
              <button
                className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
                onClick={() => toggleDropdown("bill")}
              >
                <span>💰 บิล</span>
                <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
              </button>

              {dropdownOpen === "bill" && (
                <div className="ps-3 mt-2 d-flex flex-column gap-2">
                  <button
                    className={`btn text-start ${
                      location.pathname.startsWith("/bills")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => navigate("/bills")}
                  >
                    💵 สร้างบิล
                  </button>
                  <button
                    className={`btn text-start ${
                      location.pathname.startsWith("/allbills")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => navigate("/allbills")}
                  >
                    📋 บิลทั้งหมด
                  </button>
                </div>
              )}
            </div>

            {isSuperAdmin && (
              <button
                className={`btn text-start ${
                  location.pathname.startsWith("/admin/manage")
                    ? "btn-light text-primary fw-bold"
                    : "btn-outline-light"
                }`}
                onClick={() => navigate("/admin/manage")}
              >
                👤 จัดการสมาชิก
              </button>
            )}

            <button
              className={`btn text-start ${
                location.pathname.startsWith("/users")
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
              onClick={() => navigate("/users")}
            >
              👥 ข้อมูลลูกค้า
            </button>
          </div>
        </div>

        {/* ปุ่มออกจากระบบ */}
        <div className="p-3 border-top border-light text-center">
          <button
            className="btn btn-danger w-100 fw-bold"
            onClick={onLogout}
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>
    </>
  );
}