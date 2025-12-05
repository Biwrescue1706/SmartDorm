import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export interface NavProps {
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

  const shortName = (name?: string) => {
    if (!name) return "-";
    if (name.length <= 10) return name;
    const p = name.split(" ");
    return p.length > 1 ? `${p[0]} ${p[1][0]}.` : `${name.slice(0, 7)}...`;
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
      {/* TOP BAR */}
      <div
        className="position-fixed top-0 start-0 w-100 text-white d-flex align-items-center px-3 shadow"
        style={{ height: "70px", zIndex: 2000, background: "#4E2A7F" }}
      >
        {/* MOBILE MENU BUTTON */}
        <button
          className="btn btn-light btn-sm d-xxl-none me-3 fw-bold"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: "#4E2A7F" }}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* BRAND */}
        <div className="text-center flex-grow-1">
          <h6 className="mb-0 fw-bold">ระบบจัดการหอพัก</h6>
          <h5 className="mb-0 fw-bold" style={{ color: "#F7C325" }}>
            SmartDorm
          </h5>
        </div>

        {/* PROFILE */}
        <div className="position-relative profile-menu" style={{ cursor: "pointer" }}>
          <div onClick={() => setProfileOpen(!profileOpen)}>
            <span className="fw-bold" style={{ color: "#F7C325" }}>
              {shortName(adminName)}
            </span>
            <span className="ms-2 text-white">
              {role === 0 ? "ผู้ดูแลระบบ" : "พนักงาน"}
            </span>
          </div>

          {/* DROPDOWN */}
          {profileOpen && (
            <div className="position-absolute end-0 mt-2 bg-white shadow p-3 rounded"
              style={{ minWidth: "220px", color: "#4E2A7F" }}>
              <div className="border-bottom pb-2 mb-2 small">
                <strong style={{ color: "#4E2A7F" }}>👤 {adminName}</strong>
                <br />
                <span className="text-muted">{adminUsername}</span>
              </div>

              <button className="btn btn-light w-100 text-start mb-2"
                onClick={() => navigate("/profile")}>⚙️ โปรไฟล์</button>

              <button className="btn btn-light w-100 text-start mb-2"
                onClick={() => navigate("/change-password")}>🔑 เปลี่ยนรหัสผ่าน</button>

              <button className="btn btn-light w-100 text-start fw-bold text-danger"
                onClick={onLogout}>🚪 ออกจากระบบ</button>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div
        className="d-none d-xxl-flex flex-column position-fixed top-0 start-0 text-white shadow"
        style={{ width: "200px", height: "100vh", paddingTop: "90px", background: "#4E2A7F" }}
      >
        <div className="d-flex flex-column gap-2 px-2">
          <button
            className={`btn text-start ${isActive("/dashboard") ? "btn-light fw-bold" : "btn-outline-light"}`}
            style={isActive("/dashboard") ? { color: "#4E2A7F" } : {}}
            onClick={() => navigate("/dashboard")}
          >
            🏠 หน้าแรก
          </button>

          {/* ROOM DROPDOWN */}
          <button className="btn btn-outline-light text-start d-flex justify-content-between"
            onClick={() => setDropdown(dropdown === "room" ? null : "room")}>
            🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
          </button>

          {dropdown === "room" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${isActive("/rooms") ? "btn-light fw-bold" : "btn-outline-light"}`}
                style={isActive("/rooms") ? { color: "#4E2A7F" } : {}}
                onClick={() => navigate("/rooms")}
              >
                🏘️ จัดการห้องพัก
              </button>

              <button
                className={`btn text-start position-relative ${isActive("/bookings") ? "btn-light fw-bold" : "btn-outline-light"}`}
                style={isActive("/bookings") ? { color: "#4E2A7F" } : {}}
                onClick={() => navigate("/bookings")}
              >
                📑 การจอง
                {pendingBookings > 0 && (
                  <span className="badge"
                    style={{ background: "#F7C325", color: "#4E2A7F", position: "absolute", top: 0, right: 0 }}>
                    {pendingBookings}
                  </span>
                )}
              </button>

              <button
                className={`btn text-start ${isActive("/checkout") ? "btn-light fw-bold" : "btn-outline-light"}`}
                style={isActive("/checkout") ? { color: "#4E2A7F" } : {}}
                onClick={() => navigate("/checkout")}
              >
                🔄 หน้าคืน
              </button>
            </div>
          )}

          {/* BILL */}
          <button
            className="btn btn-outline-light text-start d-flex justify-content-between"
            onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}>
            💰 บิล {dropdown === "bill" ? "▴" : "▾"}
          </button>

          {dropdown === "bill" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${isActive("/bills") ? "btn-light fw-bold" : "btn-outline-light"}`}
                style={isActive("/bills") ? { color: "#4E2A7F" } : {}}
                onClick={() => navigate("/bills")}
              >
                💵 สร้างบิล
              </button>

              <button
                className={`btn text-start ${isActive("/allbills") ? "btn-light fw-bold" : "btn-outline-light"}`}
                style={isActive("/allbills") ? { color: "#4E2A7F" } : {}}
                onClick={() => navigate("/allbills")}
              >
                📋 บิลทั้งหมด
              </button>
            </div>
          )}

          {/* ADMIN ONLY */}
          {role === 0 && (
            <button
              className={`btn text-start ${isActive("/admin/manage") ? "btn-light fw-bold" : "btn-outline-light"}`}
              style={isActive("/admin/manage") ? { color: "#4E2A7F" } : {}}
              onClick={() => navigate("/admin/manage")}
            >
              👥 จัดการสมาชิก
            </button>
          )}

          <button
            className={`btn text-start ${isActive("/users") ? "btn-light fw-bold" : "btn-outline-light"}`}
            style={isActive("/users") ? { color: "#4E2A7F" } : {}}
            onClick={() => navigate("/users")}
          >
            👤 ข้อมูลลูกค้า
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <>
          <div
            className="position-fixed text-white p-3 shadow"
            style={{ width: "230px", height: "100vh", top: 0, left: 0, paddingTop: "90px", zIndex: 3000, background: "#4E2A7F" }}
          >
            <button className="btn btn-light btn-sm mb-3 fw-bold"
              style={{ color: "#4E2A7F" }} onClick={() => setMenuOpen(false)}>
              ✖ ปิดเมนู
            </button>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-outline-light text-start"
                onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>
                🏠 หน้าแรก
              </button>

              <button className="btn btn-outline-light text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "room" ? null : "room")}>
                🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
              </button>

              {dropdown === "room" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button className="btn btn-outline-light text-start"
                    onClick={() => { navigate("/rooms"); setMenuOpen(false); }}>
                    🏘️ จัดการห้องพัก
                  </button>

                  <button className="btn btn-outline-light text-start"
                    onClick={() => { navigate("/bookings"); setMenuOpen(false); }}>
                    📑 การจอง
                  </button>

                  <button className="btn btn-outline-light text-start"
                    onClick={() => { navigate("/checkout"); setMenuOpen(false); }}>
                    🔄 หน้าคืน
                  </button>
                </div>
              )}

              <button className="btn btn-outline-light text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}>
                💰 บิล {dropdown === "bill" ? "▴" : "▾"}
              </button>

              {dropdown === "bill" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button className="btn btn-outline-light text-start"
                    onClick={() => { navigate("/bills"); setMenuOpen(false); }}>
                    💵 สร้างบิล
                  </button>

                  <button className="btn btn-outline-light text-start"
                    onClick={() => { navigate("/allbills"); setMenuOpen(false); }}>
                    📋 บิลทั้งหมด
                  </button>
                </div>
              )}

              <button className="btn btn-outline-light text-start"
                onClick={() => { navigate("/users"); setMenuOpen(false); }}>
                👤 ข้อมูลลูกค้า
              </button>

              {role === 0 && (
                <button className="btn btn-outline-light text-start"
                  onClick={() => { navigate("/admin/manage"); setMenuOpen(false); }}>
                  👥 จัดการสมาชิก
                </button>
              )}
            </div>
          </div>

          {/* OVERLAY */}
          <div className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
            style={{ top: 0, left: 0, zIndex: 2500 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}