import { useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useChangePassword } from "../hooks/useChangePassword";

export default function ChangePassword() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { changePassword, loading } = useChangePassword();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ==================== SUBMIT ==================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (newPassword.length < 6) {
      alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword === oldPassword) {
      alert("รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    const success = await changePassword({ oldPassword, newPassword });
    if (success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  /* ==================== INPUT FIELD ==================== */
  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    show: boolean,
    toggle: () => void,
    placeholder: string
  ) => (
    <div className="mb-3 position-relative">
      <label className="form-label fw-bold" style={{ color: "#4A0080" }}>
        {label}
      </label>

      <input
        type={show ? "text" : "password"}
        className="form-control pe-5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        style={{
          borderColor: "#4A0080",
          borderWidth: 2,
        }}
      />

      <span
        onClick={toggle}
        style={{
          position: "absolute",
          right: "15px",
          top: "58%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: show ? "#4A0080" : "#A0A0A0",
          fontSize: "1.2rem",
          userSelect: "none",
        }}
      >
        {show ? "🙈" : "👁️"}
      </span>
    </div>
  );

  /* ==================== UI ==================== */
  return (
    <>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          paddingTop: "85px",
          background: "#f6f1fc", // SCB โทนอ่อน
        }}
      >
        <div
          className="card shadow-lg border-0 p-4 w-100"
          style={{
            maxWidth: "500px",
            borderRadius: "20px",
            background: "#fff",
            border: "3px solid #4A0080",
          }}
        >
          <h4 className="fw-bold text-center mb-4" style={{ color: "#4A0080" }}>
            🔐 เปลี่ยนรหัสผ่าน
          </h4>

          <form onSubmit={handleSubmit}>
            {renderPasswordInput(
              "รหัสผ่านเดิม",
              oldPassword,
              setOldPassword,
              showOld,
              () => setShowOld(!showOld),
              "กรอกรหัสผ่านเดิม"
            )}

            {renderPasswordInput(
              "รหัสผ่านใหม่",
              newPassword,
              setNewPassword,
              showNew,
              () => setShowNew(!showNew),
              "กรอกรหัสผ่านใหม่"
            )}

            {renderPasswordInput(
              "ยืนยันรหัสผ่านใหม่",
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              () => setShowConfirm(!showConfirm),
              "ยืนยันรหัสผ่านใหม่"
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 fw-bold py-2 mt-2"
              style={{
                borderRadius: "12px",
                border: "none",
                background: loading
                  ? "gray"
                  : "linear-gradient(135deg, #4A0080, #D4AF37)",
                color: "#fff",
              }}
            >
              {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึกการเปลี่ยนแปลง"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
