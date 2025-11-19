import { useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useChangePassword } from "../hooks/useChangePassword";

export default function ChangePassword() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();
  const { changePassword, loading } = useChangePassword();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // ⭐ รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัว
    if (newPassword.length < 6) {
      alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    // ⭐ รหัสผ่านใหม่ต้องไม่ตรงกับรหัสผ่านเดิม
    if (newPassword === oldPassword) {
      alert("รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม");
      return;
    }

    // ⭐ ยืนยันรหัสผ่านต้องตรงกัน
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

  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    show: boolean,
    toggle: () => void,
    placeholder: string
  ) => (
    <div className="mb-3 position-relative">
      <label className="form-label fw-semibold">{label}</label>
      <input
        type={show ? "text" : "password"}
        className="form-control pe-5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      <span
        onClick={toggle}
        style={{
          position: "absolute",
          right: "15px",
          top: "68%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          userSelect: "none",
          color: show ? "#0d6efd" : "#999",
          transition: "color 0.3s",
        }}
      >
        {show ? "🙈" : "👁️"}
      </span>
    </div>
  );

  return (
    <>
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", paddingTop: "75px" }}
      >
        <div
          className="card shadow-sm border-0 p-4 w-100"
          style={{
            maxWidth: "500px",
            borderRadius: "16px",
            background: "linear-gradient(180deg, #ffffff, #f8f9fa)",
          }}
        >
          <h4 className="fw-bold text-center mb-4 text-primary">
            🔑 เปลี่ยนรหัสผ่าน
          </h4>

          {/* FORM อยู่ในไฟล์นี้เลย */}
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
              className="btn w-100 fw-semibold text-white py-2"
              style={{
                background: loading
                  ? "gray"
                  : "linear-gradient(135deg, #007bff, #00b4d8)",
                border: "none",
                borderRadius: "10px",
              }}
              disabled={loading}
            >
              {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
