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
  pendingBookings,
  role,
  adminName,
  adminUsername,
}: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const shortName = (n?: string) =>
    !n
      ? "-"
      : n.length <= 10
      ? n
      : n.split(" ").length > 1
      ? `${n.split(" ")[0]} ${n.split(" ")[1][0]}.`
      : `${n.slice(0, 7)}...`;

  // ปิดเมนูเมื่อคลิกข้างนอก (เฉพาะ profile)
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".profile-menu")) setProfileOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const isActive = (p: string) => location.pathname.startsWith(p);

  return (
    <>
      {/* 🔝 TOPBAR */}
      <div
        className="position-fixed top-0 start-0 w-100 bg-primary text-white px-3 d-flex align-items-center shadow"
        style={{ height: "70px", zIndex: 1000 }}
      >
        {/* ☰ MENU BUTTON (<1400px) */}
        <button
          className="btn btn-light btn-sm d-xxl-none me-3"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* 🏢 BRAND CENTER */}
        <div className="text-center flex-grow-1">
          <h6 className="mb-0 fw-bold">ระบบจัดการหอพัก</h6>
          <h5 className="mb-0 fw-bold text-warning">( SmartDorm )</h5>
        </div>

        {/* 👤 PROFILE */}
        <div className="position-relative profile-menu" style={{ cursor: "pointer" }}>
          <div onClick={() => setProfileOpen(!profileOpen)}>
            <span className="text-warning fw-bold">{shortName(adminName)}</span>
            <span className="ms-2 text-white">
              {role === 0 ? "แอดมิน" : "พนักงาน"}
            </span>
          </div>

          {/* ▼ PROFILE DROPDOWN */}
          {profileOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow p-3 rounded"
              style={{ minWidth: "220px", zIndex: 2000 }}
            >
              <div className="border-bottom pb-2 mb-2 small">
                <strong className="text-primary">👤 {adminName}</strong>
                <br />
                <span className="text-muted">{adminUsername}</span>
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

              <button className="btn btn-light w-100 text-start" onClick={onLogout}>
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================= SIDEBAR >=1400px ======================= */}
      <div
        className="d-none d-xxl-flex flex-column position-fixed top-0 start-0 bg-primary text-white shadow pt-5"
        style={{ width: "200px", height: "100vh", paddingTop: "90px" }}
      >
        <div className="d-flex flex-column gap-2 px-2">
          <button
            className={`btn text-start ${
              isActive("/dashboard") ? "btn-light text-primary fw-bold" : "btn-outline-light"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            🏠 หน้าแรก
          </button>

          <button
            className="btn btn-outline-light text-start d-flex justify-content-between align-items-center"
            onClick={() => setDropdown(dropdown === "room" ? null : "room")}
          >
            🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
          </button>

          {dropdown === "room" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${
                  isActive("/rooms") ? "btn-light text-primary fw-bold" : "btn-outline-light"
                }`}
                onClick={() => navigate("/rooms")}
              >
                🏘️ จัดการห้องพัก
              </button>

              <button
                className={`btn text-start position-relative ${
                  isActive("/bookings") ? "btn-light text-primary fw-bold" : "btn-outline-light"
                }`}
                onClick={() => navigate("/bookings")}
              >
                📑 การจอง
                {pendingBookings && pendingBookings > 0 && (
                  <span className="badge bg-danger position-absolute top-0 end-0">
                    {pendingBookings}
                  </span>
                )}
              </button>

              <button
                className={`btn text-start ${
                  isActive("/checkout") ? "btn-light text-primary fw-bold" : "btn-outline-light"
                }`}
                onClick={() => navigate("/checkout")}
              >
                🔄 หน้าคืน
              </button>
            </div>
          )}

          <button
            className="btn btn-outline-light text-start d-flex justify-content-between align-items-center"
            onClick={() => setDropdown(dropdown === "bill" ? null : "bill")}
          >
            💰 บิล {dropdown === "bill" ? "▴" : "▾"}
          </button>

          {dropdown === "bill" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <button
                className={`btn text-start ${
                  isActive("/bills") ? "btn-light text-primary fw-bold" : "btn-outline-light"
                }`}
                onClick={() => navigate("/bills")}
              >
                💵 สร้างบิล
              </button>

              <button
                className={`btn text-start ${
                  isActive("/allbills") ? "btn-light text-primary fw-bold" : "btn-outline-light"
                }`}
                onClick={() => navigate("/allbills")}
              >
                📋 บิลทั้งหมด
              </button>
            </div>
          )}

          {role === 0 && (
            <button
              className={`btn text-start ${
                isActive("/admin/manage") ? "btn-light text-primary fw-bold" : "btn-outline-light"
              }`}
              onClick={() => navigate("/admin/manage")}
            >
              👥 จัดการสมาชิก
            </button>
          )}

          <button
            className={`btn text-start ${
              isActive("/users") ? "btn-light text-primary fw-bold" : "btn-outline-light"
            }`}
            onClick={() => navigate("/users")}
          >
            👤 ข้อมูลลูกค้า
          </button>

          <button
            className={`btn text-start ${
              isActive("/links") ? "btn-light text-primary fw-bold" : "btn-outline-light"
            }`}
            onClick={() => navigate("/links")}
          >
            🔗 รวมลิงก์
          </button>
        </div>
      </div>

      {/* 📱 MOBILE SIDEBAR MENU */}
      {menuOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 bg-primary text-white shadow p-3"
            style={{ width: "220px", height: "100vh", paddingTop: "90px", zIndex: 1500 }}
          >
            <button
              className="btn btn-light btn-sm mb-3"
              onClick={() => setMenuOpen(false)}
            >
              ✖
            </button>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-outline-light text-start"
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
              >
                🏠 หน้าแรก
              </button>

              <button
                className="btn btn-outline-light text-start d-flex justify-content-between"
                onClick={() => setDropdown(dropdown === "room" ? null : "room")}
              >
                🛏️ ห้อง {dropdown === "room" ? "▴" : "▾"}
              </button>

              {dropdown === "room" && (
                <div className="ps-3 d-flex flex-column gap-2">
                  <button
                    className="btn btn-outline-light text-start"
                    onClick={() => {
                      navigate("/rooms");
                      setMenuOpen(false);
                    }}
                  >
                    🏘️ จัดการห้องพัก
                  </button>

                  <button
                    className="btn btn-outline-light text-start"
                    onClick={() => {
                      navigate("/bookings");
                      setMenuOpen(false);
                    }}
                  >
                    📑 การจอง
                  </button>

                  <button
                    className="btn btn-outline-light text-start"
                    onClick={() => {
                      navigate("/checkout");
                      setMenuOpen(false);
                    }}
                  >
                    🔄 หน้าคืน
                  </button>
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
                  <button
                    className="btn btn-outline-light text-start"
                    onClick={() => {
                      navigate("/bills");
                      setMenuOpen(false);
                    }}
                  >
                    💵 สร้างบิล
                  </button>

                  <button
                    className="btn btn-outline-light text-start"
                    onClick={() => {
                      navigate("/allbills");
                      setMenuOpen(false);
                    }}
                  >
                    📋 บิลทั้งหมด
                  </button>
                </div>
              )}

              <button
                className="btn btn-outline-light text-start"
                onClick={() => {
                  navigate("/users");
                  setMenuOpen(false);
                }}
              >
                👤 ข้อมูลลูกค้า
              </button>

              {role === 0 && (
                <button
                  className="btn btn-outline-light text-start"
                  onClick={() => {
                    navigate("/admin/manage");
                    setMenuOpen(false);
                  }}
                >
                  👥 จัดการสมาชิก
                </button>
              )}

              <button
                className="btn btn-outline-light text-start"
                onClick={() => {
                  navigate("/links");
                  setMenuOpen(false);
                }}
              >
                🔗 รวมลิงก์
              </button>
            </div>
          </div>

          {/* 🔳 OVERLAY */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1200 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}