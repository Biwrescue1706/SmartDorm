import { useNavigate } from "react-router-dom";

export default function BookingNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm px-3 py-2"
      style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 999,
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">

        {/* ช่องว่างซ้ายแทนปุ่มกลับ เพื่อบาลานซ์ layout */}
        <div style={{ width: "70px" }} />

        {/* โลโก้ + ชื่อระบบ */}
          <span
            className="fw-bold text-white"
            style={{ fontSize: "1.2rem", lineHeight: "1" }}
          >
            🏫 SmartDorm
          </span>
          <small
            className="text-white-50"
            style={{ fontSize: "0.72rem", marginTop: "-3px" }}
          >
            ระบบจัดการหอพัก
          </small>

        {/* โลโก้ฝั่งขวา */}
        <img
          src="https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png"
          alt="SmartDorm Logo"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "white",
            padding: "2px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </nav>
  );
}