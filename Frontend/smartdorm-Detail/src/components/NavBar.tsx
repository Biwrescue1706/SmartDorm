import { useNavigate } from "react-router-dom";

export default function NavBar() {
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

        {/* ปุ่มกลับ */}
        <button
          className="btn btn-light btn-sm fw-bold rounded-pill px-3 py-1"
          onClick={() => navigate(-1)}
          style={{
            transition: "0.25s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ffffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
        >
          ←
        </button>

        {/* โลโก้ + ชื่อระบบ */}
        <div
          className="d-flex flex-column align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <span
            className="fw-bold text-white"
            style={{ fontSize: "1rem", lineHeight: "1" }}
          >
            🏫 SmartDorm
          </span>
          <span
            className="fw-bold text-white"
            style={{ fontSize: "1rem", lineHeight: "1" }}
          >
            ระบบจัดการหอพัก
          </span>
        </div>

        {/* โลโก้หรือช่องว่างฝั่งขวา */}
        <img
          src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
          alt="SmartDorm Logo"
          style={{
            width: "25px",
            height: "25px",
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