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
      {/* CARD */}
      <div
        className="card shadow-lg border-0 text-center p-4 col-11 col-sm-9 col-md-6 col-lg-4 col-xl-3"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)",
          borderRadius: "18px",
          boxShadow: "0 8px 24px rgba(0,0,0,.45)",
          animation: "fadeIn .7s",
        }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
          <img
            src="/assets/SmartDorm.webp"
            alt="logo"
            width="60"
            height="60"
            style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.45))" }}
          />
          <h2
            className="fw-bold text-warning m-0"
            style={{ textShadow: "0px 2px 6px rgba(0,0,0,.45)" }}
          >
            SmartDorm
          </h2>
        </div>

        <h5 className="text-light opacity-75 mb-4">
          ระบบจัดการหอพักสำหรับผู้ดูแล
        </h5>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <div className="mb-3 text-start">
            <label className="form-label text-warning fw-semibold">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              className="form-control text-center"
              placeholder="กรอกชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                color: "white",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3 text-start">
            <label className="form-label text-warning fw-semibold">
              รหัสผ่าน
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control text-center"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "white",
                }}
              />
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderRadius: "0 6px 6px 0" }}
              >
                {showPassword ? "🔒" : "👁"}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold text-dark mt-2"
            disabled={!isValid || loading}
            style={{
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(255,255,255,.45)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* FORGOT LINK */}
        <div className="mt-3">
          <Link
            to="/forgot-username"
            className="text-warning fw-semibold text-decoration-none"
          >
            ลืมรหัสผ่าน ?
          </Link>
        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes moveBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
