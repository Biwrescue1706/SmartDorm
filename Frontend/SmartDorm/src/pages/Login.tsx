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
      className="login-container d-flex justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2D006B, #4E2A8E 45%, #200046)",
      }}
    >
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 10px rgba(255,209,0,.35); }
          50% { box-shadow: 0 0 22px rgba(255,209,0,.85); }
          100% { box-shadow: 0 0 10px rgba(255,209,0,.35); }
        }

        /* Desktop > 1400 */
        @media(min-width:1400px){
          .login-card{width:520px;padding:56px;border-radius:26px;}
          .login-title{font-size:32px;}
        }

        /* Tablet 600 - 1399 */
        @media(min-width:600px) and (max-width:1399px){
          .login-card{width:440px;}
          .login-title{font-size:27px;}
        }

        /* Mobile < 600 */
        @media(max-width:599px){
          .login-container{align-items:flex-start !important;padding-top:32px;}
          .login-card{width:92%;padding:28px;border-radius:18px;}
          .login-title{font-size:22px;}
          .login-sub{font-size:13px;}
        }
      `}</style>

      <div
        className="login-card bg-white bg-opacity-10 backdrop-blur text-center shadow-lg p-5"
        style={{
          border: "1px solid rgba(255,255,255,0.25)",
          animation: "float 3.5s ease-in-out infinite",
        }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
          <img
            src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
            style={{ width: 55, height: 55 }}
            alt="SmartDorm Logo"
            className="shadow-sm rounded"
          />
          <h2
            className="fw-bold login-title text-white m-0"
            style={{ textShadow: "0 3px 18px rgba(0,0,0,.55)", letterSpacing: ".5px" }}
          >
            SmartDorm
          </h2>
        </div>

        <p className="login-sub text-white-50 mb-4 fw-semibold">
          ระบบจัดการหอพักสำหรับผู้ดูแล
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="text-start">

          {/* USERNAME */}
          <label className="fw-semibold mb-1 text-warning">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="form-control form-control-lg text-center mb-4"
            placeholder="กรอกชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              background: "rgba(255,255,255,.18)",
              borderRadius: "12px",
              border: "2px solid transparent",
              color: "#fff",
            }}
          />

          {/* PASSWORD */}
          <label className="fw-semibold mb-1 text-warning">รหัสผ่าน</label>
          <div className="position-relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control form-control-lg text-center"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: "rgba(255,255,255,.18)",
                borderRadius: "12px",
                border: "2px solid transparent",
                paddingRight: "46px",
                color: "#fff",
              }}
            />

            {/* SHOW / HIDE ICON */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "21px",
                color: "#FFD100",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="btn btn-lg w-100 fw-semibold"
            style={{
              borderRadius: "14px",
              background: isFormValid
                ? "linear-gradient(135deg, #FFD100, #B98A00, #FFD100)"
                : "gray",
              color: "#2D006B",
              animation: isFormValid && "glow 2.8s infinite",
              border: "none",
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <Separator.Root
          decorative
          className="my-4"
          style={{ height: 1, background: "rgba(255,209,0,.45)" }}
        />

        <Link className="fw-semibold text-warning text-decoration-none">
          ลืมรหัสผ่าน ?
        </Link>
      </div>
    </div>
  );
}