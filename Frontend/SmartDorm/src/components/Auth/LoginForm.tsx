import { useState } from "react";
import * as Separator from "@radix-ui/react-separator";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) onSuccess();
  };

  //  ตรวจว่ากรอกครบหรือยัง
  const isFormValid = username.trim() !== "" && password.trim() !== "";

  return (
    <div
      className="card shadow-lg border-0 p-5 text-center"
      style={{
        maxWidth: "500px",
        width: "90%",
        borderRadius: "20px",
        background: "linear-gradient(180deg, #ffffff, #f8f9fa)",
      }}
    >
      <h2 className="fw-bold text-black mb-3">
        เข้าสู่ระบบเพื่อจัดการหอพัก <br />SmartDorm Admin
      </h2>

      <form onSubmit={handleSubmit} className="text-start">
        {/*  ชื่อผู้ใช้ */}
        <div className="mb-4 mt-3">
          <label className="form-label fw-semibold text-dark">ชื่อผู้ใช้</label>
          <input
            id="username"
            type="text"
            className="form-control py-2 text-center border-2"
            style={{
              borderRadius: "10px",
              borderColor: "#bcbcbc",
              transition: "0.3s",
            }}
            placeholder="กรอกชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
            onBlur={(e) => (e.target.style.borderColor = "#bcbcbc")}
          />
        </div>

        {/*  รหัสผ่าน */}
        <div className="mb-4 position-relative">
          <label className="form-label fw-semibold text-dark">รหัสผ่าน</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="form-control py-2 text-center border-2 pe-5"
            style={{
              borderRadius: "10px",
              borderColor: "#bcbcbc",
              transition: "0.3s",
            }}
            placeholder="กรอกรหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
            onBlur={(e) => (e.target.style.borderColor = "#bcbcbc")}
          />

          {/* 👁️ toggle password */}
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "15px",
              top: "70%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: showPassword ? "#0d6efd" : "#999",
              userSelect: "none",
              transition: "color 0.3s",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/*  ปุ่มเข้าสู่ระบบ */}
        <div className="d-flex justify-content-center">
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="btn w-75 fw-semibold d-flex align-items-center justify-content-center py-2 text-white"
            style={{
              borderRadius: "12px",
              backgroundImage: isFormValid
                ? "linear-gradient(135deg, #007bff, #00b4d8, #007bff)"
                : "none",
              backgroundColor: !isFormValid ? "gray" : "transparent",
              backgroundSize: "200% 200%",
              transition: "all 0.4s ease",
              boxShadow: isFormValid
                ? "0 4px 12px rgba(0,123,255,0.3)"
                : "none",
              border: "none",
              cursor: isFormValid ? "pointer" : "not-allowed",
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </div>
      </form>

      {/*  เส้นคั่น */}
      <Separator.Root
        decorative
        className="my-4"
        style={{
          backgroundColor: "#000000",
          height: "1px",
        }}
      />

      {/*  สมัครสมาชิก */}
      <div className="d-flex justify-content-center align-items-center gap-2 flex-column">
        <Link
          to="/forgot-password"
          className="fw-semibold text-decoration-none text-black"
        >
          ลืมรหัสผ่าน
        </Link>
      </div>
    </div>
  );
}
