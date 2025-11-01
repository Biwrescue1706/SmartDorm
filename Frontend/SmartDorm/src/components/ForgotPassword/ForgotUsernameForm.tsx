import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../../hooks/useForgotPassword";

export default function ForgotUsernameForm() {
  const [username, setUsername] = useState("");
  const { checkUsername } = useForgotPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await checkUsername(username);
      navigate("/reset-password", { state: { username, name: data.name } });
    } catch {
      /* handled by Swal in hook */
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-bold">ชื่อผู้ใช้ (Username)</label>
        <input
          type="text"
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
      </div>

      <button type="submit" className="btn btn-primary w-100">
        ตรวจสอบชื่อผู้ใช้
      </button>

      <button
        type="button"
        className="btn btn-secondary w-100 mt-2"
        onClick={() => navigate("/")}
      >
        เข้าสู่ระบบ
      </button>
    </form>
  );
}
