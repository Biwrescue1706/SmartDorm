import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export interface NavProps {
  onLogout: () => void;
  pendingBookings?: number;
  role?: number | null;
  adminName?: string;
  adminUsername?: string;
}

/* =======================
   THEME (SCB)
======================= */
const SCB_PURPLE = "#4A0080";
const SCB_YELLOW = "#F7D53D";

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
  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  const shortName = (name?: string) => {
    if (!name) return "-";
    if (name.length <= 12) return name;
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0]} ${parts[1][0]}.`
      : `${name.slice(0, 8)}…`;
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".profile-menu")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <div
        className="position-fixed top-0 start-0 w-100 d-flex align-items-center shadow px-3"
        style={{
          height: 64,
          backgroundColor: SCB_PURPLE,
          color: SCB_YELLOW,
          zIndex: 2000,
        }}
      >
        {/* MOBILE MENU BTN */}
        <button
          className="btn btn-warning btn-sm d-xxl-none me-3 fw-bold"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        {/* BRAND */}
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <img
            src="/assets/SmartDorm.webp"
            width={36}
            height={36}
            alt="SmartDorm"
            style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.4))" }}
          />
          <div>
            <div className="fw-bold text-warning">SmartDorm</div>
            <div className="small text-white opacity-75">
              ระบบจัดการหอพัก
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="profile-menu position-relative">
          <div
            className="text-end"
            style={{ cursor: "pointer" }}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="fw-bold text-warning">
              👤 {shortName(adminName)}
            </div>
            <div className="text-white small">
              {role === 0 ? "แอดมิน" : "พนักงาน"}
            </div>
          </div>

          {profileOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow rounded p-3"
              style={{ minWidth: 220, zIndex: 3000 }}
            >
              <div className="border-bottom pb-2 mb-2">
                <div className="fw-bold text-primary">
                  {adminName}
                </div>
                <div className="small text-muted">
                  {adminUsername}
                </div>
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
                onClick={onLogout}
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className="d-none d-xxl-flex flex-column position-fixed top-0 start-0 shadow"
        style={{
          width: 190,
          height: "100vh",
          paddingTop: 90,
          backgroundColor: SCB_PURPLE,
          zIndex: 1500,
        }}
      >
        <div className="px-2 d-flex flex-column gap-2 text-white">
          <NavBtn label="🏠 หน้าแรก" active={isActive("/dashboard")} onClick={() => navigate("/dashboard")} />
          <NavBtn label="🏘️ ห้องพัก" active={isActive("/rooms")} onClick={() => navigate("/rooms")} />

          {/* BOOKING */}
          <DropdownBtn
            label="🛏️ การจอง"
            open={desktopDropdown === "room"}
            onClick={() =>
              setDesktopDropdown(desktopDropdown === "room" ? null : "room")
            }
          />
          {desktopDropdown === "room" && (
            <div className="ps-3 d-flex flex-column gap-2 position-relative">
              <NavBtn
                label={`📑 การจอง`}
                active={isActive("/bookings")}
                badge={pendingBookings}
                onClick={() => navigate("/bookings")}
              />
              <NavBtn
                label="🔄 คืนห้อง"
                active={isActive("/checkout")}
                onClick={() => navigate("/checkout")}
              />
            </div>
          )}

          <NavBtn
            label="📜 ประวัติการจอง"
            active={isActive("/booking-history")}
            onClick={() => navigate("/booking-history")}
          />

          {/* BILL */}
          <DropdownBtn
            label="💰 บิล"
            open={desktopDropdown === "bill"}
            onClick={() =>
              setDesktopDropdown(desktopDropdown === "bill" ? null : "bill")
            }
          />
          {desktopDropdown === "bill" && (
            <div className="ps-3 d-flex flex-column gap-2">
              <NavBtn label="💵 สร้างบิล" active={isActive("/bills")} onClick={() => navigate("/bills")} />
              <NavBtn label="📋 บิลทั้งหมด" active={isActive("/allbills")} onClick={() => navigate("/allbills")} />
            </div>
          )}

          {role === 0 && (
            <NavBtn
              label="👥 สมาชิก"
              active={isActive("/admin/manage")}
              onClick={() => navigate("/admin/manage")}
            />
          )}

          <NavBtn
            label="👤 ลูกค้า"
            active={isActive("/users")}
            onClick={() => navigate("/users")}
          />
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      {menuOpen && (
        <>
          <div
            className="position-fixed p-3 text-white shadow"
            style={{
              width: 240,
              height: "100vh",
              backgroundColor: SCB_PURPLE,
              top: 0,
              left: 0,
              paddingTop: 90,
              zIndex: 1600,
            }}
          >
            <button
              className="btn btn-warning btn-sm mb-3 fw-bold"
              onClick={() => setMenuOpen(false)}
            >
              ✖
            </button>

            <NavBtn label="🏠 หน้าแรก" onClick={() => go("/dashboard")} />
            <NavBtn label="🏘️ ห้องพัก" onClick={() => go("/rooms")} />

            <DropdownBtn
              label="🛏️ การจอง"
              open={mobileDropdown === "room"}
              onClick={() =>
                setMobileDropdown(mobileDropdown === "room" ? null : "room")
              }
            />
            {mobileDropdown === "room" && (
              <div className="ps-3 d-flex flex-column gap-2">
                <NavBtn label="📑 การจอง" onClick={() => go("/bookings")} />
                <NavBtn label="🔄 คืนห้อง" onClick={() => go("/checkout")} />
              </div>
            )}

            <NavBtn label="📜 ประวัติการจอง" onClick={() => go("/booking-history")} />

            <DropdownBtn
              label="💰 บิล"
              open={mobileDropdown === "bill"}
              onClick={() =>
                setMobileDropdown(mobileDropdown === "bill" ? null : "bill")
              }
            />
            {mobileDropdown === "bill" && (
              <div className="ps-3 d-flex flex-column gap-2">
                <NavBtn label="💵 สร้างบิล" onClick={() => go("/bills")} />
                <NavBtn label="📋 บิลทั้งหมด" onClick={() => go("/allbills")} />
              </div>
            )}

            {role === 0 && <NavBtn label="👥 สมาชิก" onClick={() => go("/admin/manage")} />}
            <NavBtn label="👤 ลูกค้า" onClick={() => go("/users")} />
          </div>

          <div
            className="position-fixed w-100 h-100"
            style={{ background: "rgba(0,0,0,.35)", zIndex: 1500 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );

  function go(path: string) {
    navigate(path);
    setMenuOpen(false);
  }
}

/* =======================
   COMPONENTS
======================= */
function NavBtn({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      className={`btn text-start position-relative ${
        active ? "btn-warning text-dark fw-bold" : "btn-outline-warning"
      }`}
      onClick={onClick}
    >
      {label}
      {badge && badge > 0 && (
        <span className="badge bg-danger position-absolute top-0 end-0">
          {badge}
        </span>
      )}
    </button>
  );
}

function DropdownBtn({
  label,
  open,
  onClick,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="btn btn-outline-warning text-start d-flex justify-content-between"
      onClick={onClick}
    >
      {label} {open ? "▴" : "▾"}
    </button>
  );
}