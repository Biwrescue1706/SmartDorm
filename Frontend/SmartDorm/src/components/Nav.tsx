import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  const isSuperAdmin = role === 0;

  //  toggle สำหรับเปิด/ปิด dropdown ย่อย
  const toggleDropdown = (key: string) => {
    setDropdownOpen(dropdownOpen === key ? null : key);
  };

  return (
    <>
      {/* ===== Topbar (ทุกขนาดหน้าจอ) ===== */}
      <div
        className="position-fixed top-0 start-0 w-100 bg-primary text-white d-flex align-items-center justify-content-between px-3 shadow z-3"
        style={{ height: "55px" }}
      >
        {/* ☰ ปุ่มเมนู (เฉพาะจอ <1400px) */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn btn-light btn-sm d-xxl-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/*  โลโก้ + ชื่อระบบ (เฉพาะจอ ≥1400px) */}
        <div className="d-none d-xxl-flex flex-column ms-2">
          <h4 className="fw-bold text-white mb-0">SmartDorm</h4>
          <small className="text-white" style={{ lineHeight: 1 }}>
            ระบบจัดการหอพัก
          </small>
        </div>

        {/*  ข้อความวิ่ง */}
        <div
          className="flex-grow-1 d-flex justify-content-end text-end overflow-hidden"
          style={{ marginRight: "10px" }}
        >
          <div className="marquee-container w-100 text-end">
            <div className="marquee-text fw-semibold">
              {role === 0
                ? `ยินดีต้อนรับ ผู้ดูแลระบบ ${message} เข้าสู่ระบบจัดการหอพัก (SmartDorm)`
                : role === 1
                ? `ยินดีต้อนรับ พนักงาน ${message} เข้าสู่ระบบจัดการหอพัก (SmartDorm)`
                : `⏳ กำลังโหลด...`}
            </div>
          </div>
        </div>
      </div>

      {/* =====  Sidebar (เฉพาะจอ ≥1400px) ===== */}
      <div
        className="d-none d-xxl-flex flex-column justify-content-between position-fixed top-0 start-0 bg-primary text-white shadow h-100"
        style={{ width: "180px", paddingTop: "55px" }}
      >
        <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline-light text-start"
          >
            🏠 หน้าแรก
          </button>

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
                {isSuperAdmin && (
                  <button
                    onClick={() => navigate("/rooms")}
                    className="btn btn-outline-light text-start"
                  >
                    🏘️ จัดการห้องพัก
                  </button>
                )}

                <button
                  onClick={() => navigate("/bookings")}
                  className="btn btn-outline-light text-start"
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
                  className="btn btn-outline-light text-start"
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
                  className="btn btn-outline-light text-start"
                >
                  💵 สร้างบิล
                </button>
                <button
                  onClick={() => navigate("/allbills")}
                  className="btn btn-outline-light text-start"
                >
                  📋 บิลทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* สมาชิก */}
          {isSuperAdmin && (
            <div>
              <button
                type="button"
                onClick={() => toggleDropdown("member")}
                className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
              >
                <span>👥 สมาชิก</span>
                <span>{dropdownOpen === "member" ? "▴" : "▾"}</span>
              </button>
              {dropdownOpen === "member" && (
                <div className="ps-3 mt-2 d-flex flex-column gap-2">
                  <button
                    onClick={() => navigate("/admin/manage")}
                    className="btn btn-outline-light text-start"
                  >
                    👤 จัดการสมาชิก
                  </button>
                </div>
              )}
            </div>
          )}

          {/* <button
            onClick={() => navigate("/line")}
            className="btn btn-outline-light text-start"
          >
            🤖 ตั้งค่าแจ้งเตือนผ่านไลน์
          </button> */}
        </div>

        {/* 🚪 ปุ่มออกจากระบบ */}
        <div className="border-top border-light p-2 mt-auto">
          <button
            onClick={onLogout}
            className="btn w-100 text-white fw-bold"
            style={{
              background: "linear-gradient(135deg, #ff512f, #dd2476)",
              border: "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #dd2476, #ff512f)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #ff512f, #dd2476)")
            }
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>

      {/* ===== 📱 Slide-in Menu (เฉพาะ <1400px) ===== */}
      {menuOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 h-100 bg-primary text-white shadow-lg p-3 d-flex flex-column justify-content-between"
            style={{ width: "220px", zIndex: 1500, paddingTop: "60px" }}
          >
            <div>
              {/* 🏢 โลโก้ใน Slide Menu */}
              <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2 mb-3">
                <div>
                  <h5 className="fw-bold mb-0">SmartDorm</h5>
                  <div className="small">ระบบจัดการหอพัก</div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-light btn-sm"
                >
                  ✖
                </button>
              </div>

              {/* เมนูหลัก */}
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
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            navigate("/rooms");
                            setMenuOpen(false);
                          }}
                          className="btn btn-outline-light text-start"
                        >
                          🏘️ จัดการห้องพัก
                        </button>
                      )}
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

                {/* สมาชิก */}
                {isSuperAdmin && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleDropdown("member")}
                      className="btn btn-outline-light w-100 text-start d-flex justify-content-between align-items-center"
                    >
                      <span>👥 สมาชิก</span>
                      <span>{dropdownOpen === "member" ? "▴" : "▾"}</span>
                    </button>

                    {dropdownOpen === "member" && (
                      <div className="ps-3 mt-2 d-flex flex-column gap-2">
                        <button
                          onClick={() => {
                            navigate("/admin/manage");
                            setMenuOpen(false);
                          }}
                          className="btn btn-outline-light text-start"
                        >
                          👤 จัดการสมาชิก
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* <button
                  onClick={() => navigate("/line")}
                  className="btn btn-outline-light text-start"
                >
                  🤖 ตั้งค่าแจ้งเตือนผ่านไลน์
                </button> */}
              </div>
            </div>

            {/* 🚪 ออกจากระบบ */}
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="btn w-100 text-white fw-bold mt-3"
              style={{
                background: "linear-gradient(135deg, #ff512f, #dd2476)",
                border: "none",
              }}
            >
              🚪 ออกจากระบบ
            </button>
          </div>

          {/* Overlay */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1000 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}
