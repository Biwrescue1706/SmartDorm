import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";

export default function ForgotUsername() {
  const [username, setUsername] = useState("");
  const { checkUsername } = useForgotPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await checkUsername(username);
      navigate("/reset-password", { state: { username, name: data.name } });
    } catch {}
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column p-0"
      style={{
        background:
          "linear-gradient(135deg, #2D006B 0%, #4B2E83 45%, #200046 100%)",
      }}
    >
      {/* NAVBAR */}
      <nav
        className="navbar navbar-dark px-3 py-2"
        style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* ปุ่มย้อนกลับซ้าย */}
          <button
            className="btn btn-outline-warning fw-semibold"
            onClick={() => navigate("/")}
          >
            &larr;
          </button>

          {/* BRAND กลาง */}
          <div className="d-flex flex-column align-items-center mx-auto">
            <div className="d-flex align-items-center gap-2">
              <img
                src="/assets/SmartDorm.webp"
                alt="logo"
                width="48"
                height="48"
              />
              <span className="fw-bold h4 text-warning mb-0">SmartDorm</span>
            </div>
            <small className="text-light opacity-75">
              ระบบจัดการหอพักสำหรับผู้ดูแล
            </small>
          </div>

          {/* Dummy พื้นที่ขวาเพื่อบาลานซ์ */}
          <div className="invisible">
            <button className="btn btn-outline-warning">X</button>
          </div>
        </div>
      </nav>

      {/* FORM CARD */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg border-0 text-center p-4"
          style={{
            maxWidth: "460px",
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
            <img
              src="/assets/SmartDorm.webp"
              alt="logo"
              width="48"
              height="48"
              className="img-fluid"
            />
            <h3 className="fw-bold text-warning mb-0">SmartDorm</h3>
          </div>
          <h2 className="fw-bold text-warning mb-2">🔑 ลืมรหัสผ่าน</h2>
          <p className="text-white-50 mb-4">
            กรุณากรอกชื่อผู้ใช้เพื่อตรวจสอบข้อมูล
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label text-warning fw-semibold">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                className="form-control text-center"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "none",
                  color: "white",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 fw-bold text-dark"
            >
              ตรวจสอบชื่อผู้ใช้
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
