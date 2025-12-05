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
      className="login-page d-flex justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2D006B, #4E2A8E, #200046)",
      }}
    >
      {/* LOGIN CARD */}
      <div className="login-card p-4 shadow text-white bg-opacity-10 border border-light-subtle rounded">
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-center mb-3 gap-3">
          <img
            src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
            alt="SmartDorm Logo"
            className="login-logo"
            style={{ objectFit: "contain" }}
          />
          <h2 className="fw-bold m-0 login-title">SmartDorm</h2>
        </div>

        {/* SUBTITLE */}
        <p className="login-sub text-center mb-4">
          ระบบจัดการหอพักสำหรับผู้ดูแล
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-2">
          <label className="fw-semibold text-warning">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="form-control text-center mb-3"
            placeholder="กรอกชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="fw-semibold text-warning">รหัสผ่าน</label>
          <div className="position-relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control text-center"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="position-absolute"
              style={{
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#FFD100",
                fontSize: "18px",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className={`btn w-100 fw-bold ${
              isValid ? "btn-warning text-dark" : "btn-secondary"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* FORGOT */}
        <div className="text-center mt-3">
          <Link to="/forgot-username" className="fw-semibold text-warning text-decoration-none">
            ลืมรหัสผ่าน ?
          </Link>
        </div>
      </div>

      {/* RESPONSIVE CSS BOOTSTRAP-STYLE */}
      <style>{`
        /* DESKTOP > 1400 */
        @media (min-width: 1400px) {
          .login-card {
            width: 520px;
            margin-top: 40px;
          }
          .login-logo { width: 72px; height: 72px; }
          .login-title { font-size: 32px; }
          .login-sub { font-size: 18px; }
        }

        /* TABLET 600 - 1399 */
        @media (min-width: 600px) and (max-width: 1399px) {
          .login-card {
            width: 420px;
            margin-top: 40px;
          }
          .login-logo { width: 58px; height: 58px; }
          .login-title { font-size: 27px; }
          .login-sub { font-size: 15px; }
        }

        /* MOBILE < 600 */
        @media (max-width: 599px) {
          .login-page {
            align-items: flex-start !important;
            padding-top: 15px;
          }
          .login-card {
            width: 92% !important;
            margin: 0 auto;
          }
          .login-logo { width: 48px; height: 48px; }
          .login-title { font-size: 22px; }
          .login-sub { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}