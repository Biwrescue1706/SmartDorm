import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm px-2 py-2"
      style={{
        background: "linear-gradient(90deg, #0d9488 0%, #0284c7 100%)", // สีเขียวอมฟ้า
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* ปุ่มกลับ */}
        <button
          className="btn btn-light btn-sm fw-bold rounded-pill px-3 py-1"
          onClick={() => navigate(-1)}
        >
          ← กลับ
        </button>

        {/* ชื่อระบบตรงกลาง */}
        <span
          className="fw-bold text-white"
          style={{ fontSize: "1.2rem", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          🏫 SmartDorm 🎉
        </span>

        {/* ด้านขวาเว้นว่างเพื่อบาลานซ์ layout */}
        <div style={{ width: "70px" }} />
      </div>
    </nav>
  );
}
