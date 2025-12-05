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

  const isFormValid = username.trim() && password.trim();

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #2D006B 0%, #4E2A8E 40%, #200046 100%)",
        animation: "bgMove 10s linear infinite",
        backgroundSize: "200% 200%",
      }}
    >
      <style>
        {`
        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 12px rgba(255,209,0,0.35); }
          50% { box-shadow: 0 0 22px rgba(255,209,0,0.85); }
          100% { box-shadow: 0 0 12px rgba(255,209,0,0.35); }
        }
        `}
      </style>

      <div
        className="p-5 text-center"
        style={{
          width: "440px",
          borderRadius: "22px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 10px 45px rgba(0,0,0,0.6)",
          animation: "float 3.5s ease-in-out infinite",
        }}
      >
        <img
          src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
          alt="SmartDorm Logo"
          style={{
            width: "95px",
            height: "95px",
            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
            marginBottom: "10px",
          }}
        />

        <h2
          className="fw-bold"
          style={{
            fontSize: "30px",
            color: "#FFFFFF",
            letterSpacing: "0.6px",
            textShadow: "0 3px 18px rgba(0,0,0,0.55)",
          }}
        >
          SmartDorm
        </h2>

        <p
          className="fw-semibold"
          style={{
            marginTop: "-6px",
            fontSize: "15px",
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.4px",
          }}
        >
          ระบบจัดการหอพักสำหรับผู้ดูแล
        </p>

        <h3
          className="fw-bold mt-2 mb-4"
          style={{
            color: "#FFD100",
            fontSize: "18px",
            lineHeight: "1.6",
            textShadow: "0 2px 8px rgba(255,209,0,0.45)",
          }}
        >
          เข้าสู่ระบบเพื่อ
          <br />
          จัดการหอพัก
          <br /> SmartDorm Admin
        </h3>

        <form onSubmit={handleSubmit} className="text-start">
          <label className="fw-semibold d-block mb-1" style={{ color: "#FFD100" }}>
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
              transition: "0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FFD100")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />

          <label className="fw-semibold d-block mb-1" style={{ color: "#FFD100" }}>
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
                transition: "0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FFD100")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
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
            className="w-100 py-2 fw-semibold"
            style={{
              borderRadius: "14px",
              background: isFormValid
                ? "linear-gradient(135deg, #FFD100, #B98A00, #FFD100)"
                : "gray",
              backgroundSize: "260% 260%",
              animation: isFormValid && "glow 2.8s infinite",
              border: "none",
              color: "#2D006B",
              fontWeight: "bold",
              boxShadow: isFormValid
                ? "0 4px 15px rgba(255,209,0,0.6)"
                : "none",
              cursor: isFormValid ? "pointer" : "not-allowed",
              transition: "0.25s",
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
          className="fw-semibold text-decoration-none"
          style={{
            color: "#FFD100",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ลืมรหัสผ่าน ?
        </Link>
      </div>
    </div>
  );
}