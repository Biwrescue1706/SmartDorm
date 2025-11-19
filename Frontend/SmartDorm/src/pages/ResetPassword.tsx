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

  // ถ้าไม่ได้มาจากหน้า ForgotUsername ให้ redirect ออก
  if (!state?.username) {
    navigate("/forgot-username");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⭐ ตรวจความยาว
    if (newPassword.length < 6) {
      Swal.fire(
        "รหัสผ่านสั้นเกินไป",
        "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        "warning"
      );
      return;
    }

    // ⭐ ตรวจว่าตรงกันไหม
    if (newPassword !== confirmPassword) {
      Swal.fire("ผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน", "error");
      return;
    }

    try {
      await resetPassword({
        username: state.username,
        newPassword,
      });
      navigate("/");
    } catch {
      /* ถูกจัดการใน hook */
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card shadow p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h4 className="fw-bold text-center mb-4">🔐 ตั้งรหัสผ่านใหม่</h4>

        <form onSubmit={handleSubmit}>
          {/* ชื่อผู้ใช้ */}
          <div className="alert alert-info text-center">
            <strong>ชื่อผู้ใช้:</strong> {state.name}
          </div>

          {/* รหัสผ่านใหม่ */}
          <div className="mb-3 position-relative">
            <label className="form-label fw-bold">รหัสผ่านใหม่</label>
            <input
              type={showNew ? "text" : "password"}
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowNew(!showNew)}
              style={{
                position: "absolute",
                right: "10px",
                top: "65%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {showNew ? "🙈" : "👁️"}
            </span>
          </div>

          {/* ยืนยันรหัสผ่านใหม่ */}
          <div className="mb-3 position-relative">
            <label className="form-label fw-bold">ยืนยันรหัสผ่านใหม่</label>
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "10px",
                top: "65%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" className="btn btn-success w-100">
            บันทึกรหัสผ่านใหม่
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => navigate("/")}
          >
            กลับ
          </button>
        </form>
      </div>
    </div>
  );
}
