import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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
  pendingBookings,
  role,
  adminName,
  adminUsername,
}: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [, setIsWideScreen] = useState(window.innerWidth >= 1400);

  // 🔠 ย่อชื่อ
  const shortenName = (name: string, maxLength = 10) => {
    if (!name) return "-";
    if (name.length <= maxLength) return name;
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0]} ${parts[1][0]}.`;
    return name.slice(0, maxLength - 3) + "...";
  };

  // ตรวจจับขนาดจอ
  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 1400);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ปิด dropdown โปรไฟล์เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-menu-container")) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
    } else if (
      location.pathname.startsWith("/admin/manage") ||
      location.pathname.startsWith("/profile") ||
      location.pathname.startsWith("/change-password")
    ) {
      setDropdownOpen("profile");
    } else {
      setDropdownOpen(null);
    }
  }, [location.pathname]);

  const toggleDropdown = (key: string) => {
    setDropdownOpen(dropdownOpen === key ? null : key);
  };

  return (
    <>
      {/* ===== 🌐 Topbar ===== */}
      <div
        className="position-fixed top-0 start-0 w-100 bg-primary text-white d-flex align-items-center px-3 shadow z-3"
        style={{ height: "70px" }}
      >
        {/* ☰ ปุ่มเมนูมือถือ */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn btn-light btn-sm d-xxl-none me-2"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* 🏠 โลโก้ SmartDorm */}
        <div className="d-none d-xxl-flex flex-column ms-2">
          <h5 className="text-white" style={{ lineHeight: 1 }}>
            ระบบจัดการหอพัก
          </h5>
          <h5 className="fw-bold text-white mb-1">
            (<span className="fw-bold text-warning"> SmartDorm </span>)
          </h5>
        </div>

        {/* ===== 🧭 ส่วนกลาง + ขวา ===== */}
        <div className="flex-grow-1 d-flex justify-content-between align-items-center text-center w-50">
          {/* 🌐 กลางจอ */}
          <div className="flex-grow-1 text-center fw-semibold fw-bold fs-6">
            <h6 className="fw-bold text-white mb-1">ระบบจัดการหอพัก</h6>
            <h5 className="fw-bold text-white" style={{ lineHeight: 1 }}>
              (<span className="fw-bold text-warning"> SmartDorm </span>)
            </h5>
          </div>

          {/* 🙋‍♂️ เมนูโปรไฟล์ */}
          <div className="profile-menu-container position-relative text-end me-2">
            <div
              className="d-inline-block text-start cursor-pointer"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{ cursor: "pointer" }}
            >
              <h6 className="fw-bold text-warning mb-0">
                {shortenName(adminName || "-")}
              </h6>
              <h6 className="fw-bold text-white mb-0">
                {role === 0 ? "แอดมิน" : role === 1 ? "พนักงาน" : "⏳"}
              </h6>
            </div>

            {/* 🔽 Dropdown โปรไฟล์ */}
            {profileMenuOpen && (
              <div
                className="position-absolute end-0 mt-2 bg-white shadow rounded p-3"
                style={{ minWidth: "220px", zIndex: 1000 }}
              >
                {/* ส่วนหัวของ dropdown */}
                <div className="border-bottom pb-2 mb-2">
                  <div className="fw-bold text-primary small">
                    👤 {adminName || "ไม่พบชื่อจริง"}
                    <br />
                    <span className="text-muted">{adminUsername || "-"}</span>
                  </div>
                </div>

                {/* ปุ่มใน dropdown */}
                <button
                  onClick={() => navigate("/profile")}
                  className="btn btn-light text-start w-100 mb-1 d-flex align-items-center gap-2"
                >
                  <span role="img" aria-label="settings">
                    ⚙️
                  </span>
                  <span className="text-dark fw-semibold">โปรไฟล์ของฉัน</span>
                </button>

                <button
                  onClick={() => navigate("/change-password")}
                  className="btn btn-light text-start w-100 mb-1 d-flex align-items-center gap-2"
                >
                  <span role="img" aria-label="key">
                    🔑
                  </span>
                  <span className="text-dark fw-semibold">เปลี่ยนรหัสผ่าน</span>
                </button>

                <button
                  onClick={onLogout}
                  className="btn btn-light text-start w-100 d-flex align-items-center gap-2"
                >
                  <span role="img" aria-label="logout" className="text-danger">
                    🚪
                  </span>
                  <span className="text-danger fw-semibold">ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 🧭 Sidebar (≥1400px) ===== */}
      <div
        className="d-none d-xxl-flex flex-column justify-content-between position-fixed top-0 start-0 bg-primary text-white shadow h-100"
        style={{ width: "180px", paddingTop: "75px", overflowY: "auto" }}
      >
        <div className="flex-grow-1 p-3 d-flex flex-column gap-2">
          {/* หน้าแรก */}
          <button
            onClick={() => navigate("/dashboard")}
            className={`btn text-start ${
              location.pathname === "/dashboard"
                ? "btn-light text-primary fw-bold"
                : "btn-outline-light"
            }`}
          >
            🏠 หน้าแรก
          </button>

          {/* ห้อง */}
          <div>
            <button
              type="button"
              onClick={() => toggleDropdown("room")}
              className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
            >
              <span>🛏️ ห้อง</span>
              <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
            </button>
            {dropdownOpen === "room" && (
              <div className="ps-3 mt-2 d-flex flex-column gap-2">
                <button
                  onClick={() => navigate("/rooms")}
                  className={`btn text-start ${
                    location.pathname.startsWith("/rooms")
                      ? "btn-light text-primary fw-bold"
                      : "btn-outline-light"
                  }`}
                >
                  🏘️ จัดการห้องพัก
                </button>
                <button
                  onClick={() => navigate("/bookings")}
                  className={`btn text-start position-relative ${
                    location.pathname.startsWith("/bookings")
                      ? "btn-light text-primary fw-bold"
                      : "btn-outline-light"
                  }`}
                >
                  📑 การจอง
                  {(pendingBookings ?? 0) > 0 && (
                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                      {pendingBookings}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate("/checkout")}
                  className={`btn text-start ${
                    location.pathname.startsWith("/checkout")
                      ? "btn-light text-primary fw-bold"
                      : "btn-outline-light"
                  }`}
                >
                  🔄 หน้าคืน
                </button>
              </div>
            )}
          </div>

          {/* บิล */}
          <div>
            <button
              type="button"
              onClick={() => toggleDropdown("bill")}
              className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
            >
              <span>💰 บิล</span>
              <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
            </button>
            {dropdownOpen === "bill" && (
              <div className="ps-3 mt-2 d-flex flex-column gap-2">
                <button
                  onClick={() => navigate("/bills")}
                  className={`btn text-start ${
                    location.pathname.startsWith("/bills")
                      ? "btn-light text-primary fw-bold"
                      : "btn-outline-light"
                  }`}
                >
                  💵 สร้างบิล
                </button>
                <button
                  onClick={() => navigate("/allbills")}
                  className={`btn text-start ${
                    location.pathname.startsWith("/allbills")
                      ? "btn-light text-primary fw-bold"
                      : "btn-outline-light"
                  }`}
                >
                  📋 บิลทั้งหมด
                </button>
              </div>
            )}
          </div>

          {role === 0 && (
            <button
              onClick={() => navigate("/admin/manage")}
              className={`btn text-start ${
                location.pathname.startsWith("/admin/manage")
                  ? "btn-light text-primary fw-bold"
                  : "btn-outline-light"
              }`}
            >
              👥 จัดการสมาชิก
            </button>
          )}

          {/* ลูกค้า */}
          <button
            onClick={() => navigate("/users")}
            className={`btn text-start ${
              location.pathname.startsWith("/users")
                ? "btn-light text-primary fw-bold"
                : "btn-outline-light"
            }`}
          >
            👤 ข้อมูลลูกค้า
          </button>

          {/* รวมลิงก์ LIFF */}
          <button
            onClick={() => navigate("/links")}
            className={`btn text-start ${
              location.pathname.startsWith("/links")
                ? "btn-light text-primary fw-bold"
                : "btn-outline-light"
            }`}
          >
            🔗 รวมลิงก์
          </button>
        </div>
      </div>

      {/* ===== 📱 Slide Menu (<1400px) ===== */}
      {menuOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 h-100 bg-primary text-white shadow-lg p-3 d-flex flex-column justify-content-between"
            style={{ width: "220px", zIndex: 800, paddingTop: "50px" }}
          >
            <div>
              <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-1 text-white">ระบบจัดการหอพัก</h6>
                  <h6 className="fw-bold mb-0 text-white">
                    (<span className="fw-bold text-warning"> SmartDorm </span>)
                  </h6>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-light btn-sm"
                >
                  ✖
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMenuOpen(false);
                  }}
                  className="btn btn-outline-light text-start"
                >
                  🏠 หน้าแรก
                </button>

                {/* ห้อง Dropdown (มือถือ) */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("room")}
                    className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
                  >
                    <span>🛏️ ห้อง</span>
                    <span>{dropdownOpen === "room" ? "▴" : "▾"}</span>
                  </button>
                  {dropdownOpen === "room" && (
                    <div className="ps-3 mt-2 d-flex flex-column gap-2">
                      <button
                        onClick={() => {
                          navigate("/rooms");
                          setMenuOpen(false);
                        }}
                        className="btn btn-outline-light text-start"
                      >
                        🏘️ จัดการห้องพัก
                      </button>
                      <button
                        onClick={() => {
                          navigate("/bookings");
                          setMenuOpen(false);
                        }}
                        className="btn btn-outline-light text-start"
                      >
                        📑 การจอง
                      </button>
                      <button
                        onClick={() => {
                          navigate("/checkout");
                          setMenuOpen(false);
                        }}
                        className="btn btn-outline-light text-start"
                      >
                        🔄 หน้าคืน
                      </button>
                    </div>
                  )}
                </div>

                {/* บิล Dropdown (มือถือ) */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("bill")}
                    className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
                  >
                    <span>💰 บิล</span>
                    <span>{dropdownOpen === "bill" ? "▴" : "▾"}</span>
                  </button>
                  {dropdownOpen === "bill" && (
                    <div className="ps-3 mt-2 d-flex flex-column gap-2">
                      <button
                        onClick={() => {
                          navigate("/bills");
                          setMenuOpen(false);
                        }}
                        className="btn btn-outline-light text-start"
                      >
                        💵 สร้างบิล
                      </button>
                      <button
                        onClick={() => {
                          navigate("/allbills");
                          setMenuOpen(false);
                        }}
                        className="btn btn-outline-light text-start"
                      >
                        📋 บิลทั้งหมด
                      </button>
                    </div>
                  )}
                </div>

                {/* ลูกค้า */}
                <button
                  onClick={() => {
                    navigate("/users");
                    setMenuOpen(false);
                  }}
                  className="btn btn-outline-light text-start"
                >
                  👤 ข้อมูลลูกค้า
                </button>

                {role === 0 && (
                  <button
                    onClick={() => navigate("/admin/manage")}
                    className={`btn text-start ${
                      location.pathname.startsWith("/admin/manage")
                        ? "btn-light text-primary fw-bold"
                        : "btn-outline-light"
                    }`}
                  >
                    👥 จัดการสมาชิก
                  </button>
                )}

                {/* รวมลิงก์ */}
                <button
                  onClick={() => {
                    navigate("/links");
                    setMenuOpen(false);
                  }}
                  className={`btn text-start ${
                    location.pathname.startsWith("/links")
                      ? "btn-light text-primary fw-bold"
                      : "btn-outline-light"
                  }`}
                >
                  🔗 รวมลิงก์
                </button>
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 200 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}
