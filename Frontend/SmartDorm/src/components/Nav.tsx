import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
export interface NavProps {
  message: string;
  onLogout: () => void;
  pendingBookings?: number;
  role?: number | null;
}
export default function Nav({ message, onLogout, pendingBookings, role }: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [, setIsWideScreen] = useState(window.innerWidth >= 1400);
  const isSuperAdmin = role === 0;
  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 1400);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (location.pathname.startsWith("/rooms") || location.pathname.startsWith("/bookings") || location.pathname.startsWith("/checkout")) {
      setDropdownOpen("room");
    } else if (location.pathname.startsWith("/bills") || location.pathname.startsWith("/allbills")) {
      setDropdownOpen("bill");
    } else {
      setDropdownOpen(null);
    }
  }, [location.pathname]);
  const toggleDropdown = (key: string) => setDropdownOpen(dropdownOpen === key ? null : key);
  return (
    <>
      {/* ===== Topbar ===== */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm px-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <button className="btn btn-light btn-sm d-xxl-none me-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✖" : "☰"}
          </button>
          <div className="d-flex align-items-center">
            <h4 className="fw-bold text-white mb-0 me-2">SmartDorm</h4>
            <small className="text-white-50 d-none d-sm-inline">ระบบจัดการหอพัก</small>
          </div>
          <div className="text-end text-white small lh-sm">
            {role === 0 ? (
              <>
                <div>ยินดีต้อนรับ ผู้ดูแลระบบ</div>
                <div className="fw-bold text-warning">{message}</div>
              </>
            ) : role === 1 ? (
              <>
                <div>ยินดีต้อนรับ พนักงาน</div>
                <div className="fw-bold text-info">{message}</div>
              </>
            ) : (
              <div>⏳ กำลังโหลด...</div>
            )}
          </div>
        </div>
      </nav>
      {/* ===== Sidebar Desktop ===== */}
      <div className="d-none d-xxl-flex flex-column justify-content-between position-fixed top-0 start-0 bg-primary text-white shadow h-100" style={{ width: "180px", paddingTop: "55px", overflowY: "auto" }}>
        <div className="flex-grow-1 p-3 d-flex flex-column gap-2">
          <button onClick={() => navigate("/dashboard")} className={`btn text-start ${location.pathname === "/dashboard" ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>🏠 หน้าแรก</button>
          <div>
            <button type="button" onClick={() => toggleDropdown("room")} className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center">
              <span>🛏️ ห้อง</span>
              <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
            </button>
            {dropdownOpen === "room" && (
              <div className="ps-3 mt-2 d-flex flex-column gap-2">
                {isSuperAdmin && (
                  <button onClick={() => navigate("/rooms")} className={`btn text-start ${location.pathname.startsWith("/rooms") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
                    🏘️ จัดการห้องพัก
                  </button>
                )}
                <button onClick={() => navigate("/bookings")} className={`btn text-start position-relative ${location.pathname.startsWith("/bookings") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
                  📑 การจอง
                  {(pendingBookings ?? 0) > 0 && (
                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                      {pendingBookings}
                    </span>
                  )}
                </button>
                <button onClick={() => navigate("/checkout")} className={`btn text-start ${location.pathname.startsWith("/checkout") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
                  🔄 หน้าคืน
                </button>
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={() => toggleDropdown("bill")} className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center">
              <span>💰 บิล</span>
              <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
            </button>
            {dropdownOpen === "bill" && (
              <div className="ps-3 mt-2 d-flex flex-column gap-2">
                <button onClick={() => navigate("/bills")} className={`btn text-start ${location.pathname.startsWith("/bills") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
                  💵 สร้างบิล
                </button>
                <button onClick={() => navigate("/allbills")} className={`btn text-start ${location.pathname.startsWith("/allbills") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
                  📋 บิลทั้งหมด
                </button>
              </div>
            )}
          </div>
          {isSuperAdmin && (
            <button onClick={() => navigate("/admin/manage")} className={`btn text-start ${location.pathname.startsWith("/admin/manage") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
              👤 จัดการสมาชิก
            </button>
          )}
          <button onClick={() => navigate("/users")} className={`btn text-start ${location.pathname.startsWith("/users") ? "btn-light text-primary fw-bold" : "btn-outline-light"}`}>
            👥 ข้อมูลลูกค้า
          </button>
        </div>
        <div className="border-top border-light p-2 mt-auto">
          <button onClick={onLogout} className="btn w-100 text-white fw-bold btn-danger">🚪 ออกจากระบบ</button>
        </div>
      </div>
      {/* ===== Mobile Slide Menu ===== */}
      {menuOpen && (
        <>
          <div className="position-fixed top-0 start-0 h-100 bg-primary text-white shadow-lg p-3 d-flex flex-column justify-content-between" style={{ width: "230px", zIndex: 1500, paddingTop: "55px" }}>
            <div>
              <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2 mb-3">
                <div>
                  <h5 className="fw-bold mb-0">SmartDorm</h5>
                  <div className="small">ระบบจัดการหอพัก</div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="btn btn-light btn-sm">✖</button>
              </div>
              <div className="d-flex flex-column gap-2">
                <button onClick={() => {navigate("/dashboard");setMenuOpen(false);}} className={`btn ${location.pathname === "/dashboard" ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                  🏠 หน้าแรก
                </button>
                <div>
                  <button type="button" onClick={() => toggleDropdown("room")} className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center">
                    <span>🛏️ ห้อง</span>
                    <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
                  </button>
                  {dropdownOpen === "room" && (
                    <div className="ps-3 mt-2 d-flex flex-column gap-2">
                      {isSuperAdmin && (
                        <button onClick={() => {navigate("/rooms");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/rooms") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                          🏘️ จัดการห้องพัก
                        </button>
                      )}
                      <button onClick={() => {navigate("/bookings");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/bookings") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                        📑 การจอง
                      </button>
                      <button onClick={() => {navigate("/checkout");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/checkout") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                        🔄 หน้าคืน
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => toggleDropdown("bill")} className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center">
                    <span>💰 บิล</span>
                    <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
                  </button>
                  {dropdownOpen === "bill" && (
                    <div className="ps-3 mt-2 d-flex flex-column gap-2">
                      <button onClick={() => {navigate("/bills");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/bills") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                        💵 สร้างบิล
                      </button>
                      <button onClick={() => {navigate("/allbills");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/allbills") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                        📋 บิลทั้งหมด
                      </button>
                    </div>
                  )}
                </div>
                {isSuperAdmin && (
                  <button onClick={() => {navigate("/admin/manage");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/admin/manage") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                    👤 จัดการสมาชิก
                  </button>
                )}
                <button onClick={() => {navigate("/users");setMenuOpen(false);}} className={`btn ${location.pathname.startsWith("/users") ? "btn-light text-primary fw-bold" : "btn-outline-light"} text-start`}>
                  👥 ข้อมูลลูกค้า
                </button>
              </div>
            </div>
            <button onClick={() => {onLogout();setMenuOpen(false);}} className="btn w-100 text-white fw-bold mt-3 btn-danger">
              🚪 ออกจากระบบ
            </button>
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1000 }} onClick={() => setMenuOpen(false)} />
        </>
      )}
    </>
  );
}