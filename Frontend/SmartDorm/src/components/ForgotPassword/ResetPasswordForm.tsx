import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import Swal from "sweetalert2";

interface LocationState {
  username: string;
  name: string;
}

export default function ResetPasswordForm() {
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
      /* handled in hook */
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="alert alert-info text-center">
        <strong>ชื่อผู้ใช้:</strong> {state.name}
      </div>

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
          style={{
            position: "absolute",
            right: "10px",
            top: "65%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setShowNew(!showNew)}
        >
          {showNew ? "🙈" : "👁️"}
        </span>
      </div>

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
          style={{
            position: "absolute",
            right: "10px",
            top: "65%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setShowConfirm(!showConfirm)}
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
  );
}
