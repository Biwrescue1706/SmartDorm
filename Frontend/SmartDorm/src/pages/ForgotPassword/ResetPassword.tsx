// src/pages/ForgotPassword/ResetPassword.tsx
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../../hooks/ForgotPassword/useForgotPassword";
import { API_BASE } from "../../config";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useForgotPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
          credentials: "include",
        });

        const data = await res.json();

        setUsername(data.admin?.username || "");

        const rawPhone = data.admin?.phone || "";

        // ✅ 095-xxx-1365
        const maskedPhone =
          rawPhone.length === 10
            ? `${rawPhone.slice(0, 3)} - xxx - ${rawPhone.slice(6)}`
            : rawPhone;

        setPhone(maskedPhone);
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, []);

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
      await resetPassword({
        newPassword,
      });

      await Swal.fire("สำเร็จ", "ตั้งรหัสผ่านใหม่เรียบร้อย", "success");

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
      <nav
        className="navbar navbar-dark px-3 py-2"
        style={{
          backgroundColor: "rgba(0,0,0,0.18)",
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* BRAND */}
          <div className="d-flex flex-column align-items-center mx-auto">
            <div className="d-flex align-items-center gap-2">
              <img
                src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
                alt="logo"
                width="48"
                height="48"
                className="img-fluid"
                style={{
                  borderRadius: "20px",
                }}
              />

              <span className="fw-bold h4 text-warning mb-0">SmartDorm</span>
            </div>

            <small className="text-light opacity-75">
              ระบบจัดการหอพักสำหรับผู้ดูแล
            </small>
          </div>

          {/* Dummy */}
          <div className="invisible">
            <button className="btn btn-outline-warning">X</button>
          </div>
        </div>
      </nav>

      {/* CARD */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg border-0 text-center p-4 col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4 col-xxl-3"
          style={{
            background: "rgba(255,255,255,0.1)",

            backdropFilter: "blur(10px)",
          }}
        >
          {/* HEADER */}
          <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
            <img
              src="/assets/SmartDorm.webp"
              alt="logo"
              width="48"
              height="48"
              className="img-fluid"
              style={{
                borderRadius: "15px",
              }}
            />

            <h3 className="fw-bold text-warning mb-0">SmartDorm</h3>
          </div>

          <h2 className="fw-bold text-warning mb-2">🔐 ตั้งรหัสผ่านใหม่</h2>

          <h4 className="text-white mb-4">กรุณาตั้งรหัสผ่านใหม่</h4>
          <div className="mb-4">
            <div className="text-light">Username :</div>

            <div className="fw-bold text-warning fs-5">{username}</div>

            <div className="text-light mt-2">เบอร์โทรศัพท์ :</div>

            <div className="fw-bold text-warning fs-5">{phone}</div>
          </div>
          
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
                style={{
                  right: "12px",

                  top: "55%",

                  cursor: "pointer",
                }}
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? "🙈" : "👁️"}
              </span>
            </div>

            {/* CONFIRM */}
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
                style={{
                  right: "12px",

                  top: "55%",

                  cursor: "pointer",
                }}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>

            {/* BUTTONS */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold text-dark"
              >
                บันทึกรหัสผ่านใหม่
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
