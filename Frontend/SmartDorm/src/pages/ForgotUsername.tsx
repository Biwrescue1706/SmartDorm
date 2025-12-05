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
        background: "linear-gradient(135deg, #2D006B, #4E2A8E, #200046)",
        backgroundSize: "200% 200%",
        animation: "bgMove 8s infinite",
      }}
    >
      {/* NAVBAR */}
      <nav className="navbar navbar-dark px-3" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="d-flex align-items-center gap-2">
          <img
            src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
            alt="logo"
            width="42"
            height="42"
            className="img-fluid"
          />
          <span className="navbar-brand mb-0 h4 fw-bold text-warning">
            SmartDorm
          </span>
        </div>

        <button
          className="btn btn-outline-warning fw-semibold"
          onClick={() => navigate("/")}
        >
          ⬅ เข้าสู่ระบบ
        </button>
      </nav>

      {/* CONTENT */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div
          className="card shadow-lg border-0 text-center p-4 col-11 col-sm-8 col-md-6 col-lg-4"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}
        >
          <h3 className="text-white fw-bold mb-3">🔑 ลืมรหัสผ่าน</h3>
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
              />
            </div>

            <button type="submit" className="btn btn-warning w-100 fw-bold text-dark">
              ตรวจสอบชื่อผู้ใช้
            </button>
          </form>
        </div>
      </div>

      {/* BG ANIMATION */}
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}