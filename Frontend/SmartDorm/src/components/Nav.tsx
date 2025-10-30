import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export interface NavProps {
  message: string;
  onLogout: () => void;
  pendingBookings?: number;
  role?: number | null;
}

export default function Nav({
  message,
  onLogout,
  pendingBookings,
  role,
}: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const isSuperAdmin = role === 0;

  // ✅ เปิด dropdown ตาม path ปัจจุบัน
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

  const toggleDropdown = (key: string) => {
    setDropdownOpen(dropdownOpen === key ? null : key);
  };

  return (
    <>
      {/* ===== 🌐 Topbar (Bootstrap Navbar) ===== */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
        <div className="container-fluid">
          {/* ☰ Toggle Button */}
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

          {/* 🏠 Brand */}
          <a className="navbar-brand fw-semibold" href="#">
            ระบบจัดการหอพัก (<span className="fw-bold">SmartDorm</span>)
          </a>

          {/* 🙋‍♂️ ข้อความขวา */}
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

      {/* ===== 📱 Collapse Menu (Bootstrap collapse) ===== */}
      <div
        className={`collapse navbar-collapse bg-primary text-white ${
          menuOpen ? "show" : ""
        }`}
        id="navbarNav"
      >
        <ul className="navbar-nav flex-column p-3">
          <li className="nav-item">
            <button
              className={`btn w-100 text-start ${
                location.pathname === "/dashboard"
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
              onClick={() => {
                navigate("/dashboard");
                setMenuOpen(false);
              }}
            >
              🏠 หน้าแรก
            </button>
          </li>

          {/* ห้อง */}
          <li className="nav-item mt-2">
            <button
              className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("room")}
            >
              <span>🛏️ ห้อง</span>
              <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
            </button>
            {dropdownOpen === "room" && (
              <ul className="list-unstyled ps-3 mt-2">
                {isSuperAdmin && (
                  <li>
                    <button
                      className={`btn w-100 text-start mb-1 ${
                        location.pathname.startsWith("/rooms")
                          ? "btn-light text-primary fw-bold"
                          : "btn-outline-light"
                      }`}
                      onClick={() => {
                        navigate("/rooms");
                        setMenuOpen(false);
                      }}
                    >
                      🏘️ จัดการห้องพัก
                    </button>
                  </li>
                )}
                <li>
                  <button
                    className={`btn w-100 text-start position-relative mb-1 ${
                      location.pathname.startsWith("/bookings")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      navigate("/bookings");
                      setMenuOpen(false);
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
                      setMenuOpen(false);
                    }}
                  >
                    🔄 หน้าคืน
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* บิล */}
          <li className="nav-item mt-2">
            <button
              className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("bill")}
            >
              <span>💰 บิล</span>
              <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
            </button>
            {dropdownOpen === "bill" && (
              <ul className="list-unstyled ps-3 mt-2">
                <li>
                  <button
                    className={`btn w-100 text-start mb-1 ${
                      location.pathname.startsWith("/bills")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      navigate("/bills");
                      setMenuOpen(false);
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
                      setMenuOpen(false);
                    }}
                  >
                    📋 บิลทั้งหมด
                  </button>
                </li>
              </ul>
            )}
          </li>

          {isSuperAdmin && (
            <li className="nav-item mt-2">
              <button
                className={`btn w-100 text-start ${
                  location.pathname.startsWith("/admin/manage")
                    ? "btn-light text-primary fw-bold"
                    : "btn-outline-light"
                }`}
                onClick={() => {
                  navigate("/admin/manage");
                  setMenuOpen(false);
                }}
              >
                👤 จัดการสมาชิก
              </button>
            </li>
          )}

          <li className="nav-item mt-2">
            <button
              className={`btn w-100 text-start ${
                location.pathname.startsWith("/users")
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
              onClick={() => {
                navigate("/users");
                setMenuOpen(false);
              }}
            >
              👤 ข้อมูลลูกค้า
            </button>
          </li>

          <li className="nav-item mt-3 border-top pt-3">
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="btn btn-danger w-100 fw-bold"
            >
              🚪 ออกจากระบบ
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}