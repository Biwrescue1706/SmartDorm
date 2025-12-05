// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ username, password });
    if (ok) navigate("/dashboard");
  };

  const isValid = username.trim() !== "" && password.trim() !== "";

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #2D006B, #4E2A8E, #200046)",
        backgroundSize: "200% 200%",
        animation: "moveBG 8s ease infinite",
      }}
    >
      {/* >>> LOGIN CARD <<< */}
      <div
        className="card shadow-lg border-0 text-center p-4 col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4 col-xxl-3"
        style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
          <img
            src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
            alt="logo"
            width="60"
            height="60"
            className="img-fluid"
          />
          <h2 className="fw-bold text-white m-0">SmartDorm</h2>
        </div>

        <h3 className="text-white mb-4">ระบบจัดการหอพักสำหรับผู้ดูแล</h3>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label text-warning fw-semibold">ชื่อผู้ใช้</label>
            <input
              type="text"
              className="form-control text-center"
              placeholder="กรอกชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-warning fw-semibold">รหัสผ่าน</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control text-center"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold text-dark"
            disabled={!isValid || loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* FORGOT */}
        <div className="mt-3">
          <Link to="/forgot-username" className="text-warning fw-semibold text-decoration-none">
            ลืมรหัสผ่าน ?
          </Link>
        </div>
      </div>

      {/* 🔥 Animation keyframes */}
      <style>{`
        @keyframes moveBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}