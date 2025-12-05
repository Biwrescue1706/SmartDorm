import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";
import Swal from "sweetalert2";

interface LocationState {
  username: string;
  name: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const { resetPassword } = useForgotPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!state?.username) {
    navigate("/forgot-username");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      Swal.fire("รหัสผ่านสั้นเกินไป", "ต้องมีอย่างน้อย 6 ตัวอักษร", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("ผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน", "error");
      return;
    }

    try {
      await resetPassword({ username: state.username, newPassword });
      Swal.fire("สำเร็จ", "ตั้งรหัสผ่านใหม่เรียบร้อย", "success");
      navigate("/");
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
      <nav className="navbar navbar-dark px-3 py-2" style={{ backgroundColor: "rgba(0,0,0,0.18)" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* BACK */}
          <button
            className="btn btn-outline-warning fw-semibold"
            onClick={() => navigate("/forgot-username")}
          >
            ⬅
          </button>

          {/* BRAND CENTER */}
          <div className="d-flex flex-column align-items-center mx-auto">
            <div className="d-flex align-items-center gap-2">
              <img
                src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
                alt="logo"
                width="48"
                height="48"
                className="img-fluid"
              />
              <span className="fw-bold h4 text-warning mb-0">SmartDorm</span>
            </div>
            <small className="text-light opacity-75">
              ระบบจัดการหอพักสำหรับผู้ดูแล
            </small>
          </div>

          {/* Dummy right */}
          <div className="invisible">
            <button className="btn btn-outline-warning">X</button>
          </div>
        </div>
      </nav>

      {/* FORM CARD – ใช้คลาสเดียวกับ Login.tsx */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg border-0 text-center p-4 col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4 col-xxl-3"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
        >
          <h2 className="fw-bold text-warning mb-2">🔐 ตั้งรหัสผ่านใหม่</h2>
          <p className="text-white-50 mb-4">
            ตั้งรหัสผ่านใหม่สำหรับผู้ใช้:{" "}
            <strong className="text-warning">{state.name}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            {/* NEW PASSWORD */}
            <div className="mb-3 position-relative text-start">
              <label className="form-label text-warning fw-semibold">
                รหัสผ่านใหม่
              </label>
              <input
                type={showNew ? "text" : "password"}
                className="form-control text-center"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "none",
                  color: "white",
                }}
              />
              <span
                className="position-absolute"
                style={{ right: "12px", top: "55%", cursor: "pointer" }}
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? "🙈" : "👁️"}
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mb-3 position-relative text-start">
              <label className="form-label text-warning fw-semibold">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type={showConfirm ? "text" : "password"}
                className="form-control text-center"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "none",
                  color: "white",
                }}
              />
              <span
                className="position-absolute"
                style={{ right: "12px", top: "55%", cursor: "pointer" }}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 fw-bold text-dark"
            >
              บันทึกรหัสผ่านใหม่
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}