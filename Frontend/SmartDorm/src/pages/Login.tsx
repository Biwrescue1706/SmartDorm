// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as Separator from "@radix-ui/react-separator";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) navigate("/dashboard");
  };

  const isFormValid = Boolean(username.trim() && password.trim());

  return (
    <div
      className="d-flex justify-content-center login-wrap"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #2D006B 0%, #4E2A8E 45%, #200046 100%)",
      }}
    >
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 12px rgba(255,209,0,.35); }
          50% { box-shadow: 0 0 22px rgba(255,209,0,.85); }
          100% { box-shadow: 0 0 12px rgba(255,209,0,.35); }
        }

        /* Desktop > 1400 */
        @media (min-width: 1400px) {
          .login-card { width: 520px; padding: 55px !important; border-radius: 26px; }
          .login-logo { width: 70px; height: 70px; }
          .login-title { font-size: 32px; }
          .login-sub { font-size: 17px; }
        }

        /* Tablet 600 - 1399 */
        @media (min-width: 600px) and (max-width: 1399px) {
          .login-card { width: 440px; }
          .login-logo { width: 55px; height: 55px; }
          .login-title { font-size: 27px; }
        }

        /* Mobile < 600 */
        @media (max-width: 599px) {
          .login-wrap { align-items: flex-start !important; padding-top: 32px; }
          .login-card { width: 92% !important; padding: 28px !important; border-radius: 18px; }
          .login-logo { width: 45px; height: 45px; }
          .login-title { font-size: 22px; }
          .login-sub { font-size: 13px; }
        }
      `}</style>

      {/* LOGIN CARD */}
      <div
        className="p-5 text-center login-card"
        style={{
          width: "460px",
          borderRadius: "22px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 10px 45px rgba(0,0,0,0.6)",
          animation: "float 3.5s ease-in-out infinite",
        }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-center align-items-center gap-3 mb-1">
          <img
            src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
            className="login-logo"
            alt="SmartDorm Logo"
            style={{ width: "60px", height: "60px", objectFit: "contain" }}
          />
          <h2
            className="fw-bold login-title"
            style={{
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "0.6px",
              textShadow: "0 3px 18px rgba(0,0,0,0.55)",
            }}
          >
            SmartDorm
          </h2>
        </div>

        {/* SLOGAN */}
        <h2
          className="fw-semibold login-sub"
          style={{
            marginTop: "0px",
            marginBottom: "22px",
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.4px",
          }}
        >
          ระบบจัดการหอพักสำหรับผู้ดูแล
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="text-start">
          <label className="fw-semibold mb-1" style={{ color: "#FFD100" }}>
            ชื่อผู้ใช้
          </label>
          <input
            type="text"
            className="form-control text-center mb-4"
            placeholder="กรอกชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              borderRadius: "12px",
              border: "2px solid transparent",
              background: "rgba(255,255,255,0.15)",
              color: "white",
            }}
          />

          <label className="fw-semibold mb-1" style={{ color: "#FFD100" }}>
            รหัสผ่าน
          </label>
          <div className="position-relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control text-center"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "2px solid transparent",
                background: "rgba(255,255,255,0.15)",
                paddingRight: "45px",
                color: "white",
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#FFD100",
                fontSize: "20px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: "14px",
              background: isFormValid
                ? "linear-gradient(135deg, #FFD100, #B98A00, #FFD100)"
                : "gray",
              border: "none",
              color: "#2D006B",
              fontWeight: "bold",
              animation: isFormValid ? "glow 2.8s infinite" : undefined,
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <Separator.Root
          decorative
          className="my-4"
          style={{ height: "1px", backgroundColor: "rgba(255,209,0,0.45)" }}
        />

        <Link
          to="/forgot-username"
          className="fw-semibold"
          style={{ color: "#FFD100" }}
        >
          ลืมรหัสผ่าน ?
        </Link>
      </div>
    </div>
  );
}