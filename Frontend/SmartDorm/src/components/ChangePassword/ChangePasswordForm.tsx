import { useState } from "react";
import { useChangePassword } from "../../hooks/useChangePassword";

export default function ChangePasswordForm() {
  const { changePassword, loading } = useChangePassword();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ state แยกแต่ละช่อง
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("กรุณากรอกข้อมูลให้ครบ");
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

  // ✅ helper ฟังก์ชัน render ช่องรหัส
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
  );
}
