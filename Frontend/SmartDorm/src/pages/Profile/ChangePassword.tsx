// src/pages/ChangePassword.tsx
import { useState } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useChangePassword } from "../../hooks/ChangePassword/useChangePassword";
import Swal from "sweetalert2";
import { API_BASE } from "../../config";
import { usePendingCheckouts } from "../../hooks/ManageRooms/usePendingCheckouts";
import { usePendingBookings } from "../../hooks/ManageRooms/usePendingBookings";

export default function ChangePassword() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { changePassword, loading } = useChangePassword();

  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  /* SUBMIT */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword)
      return Swal.fire("กรุณากรอกข้อมูลให้ครบ");

    if (newPassword.length < 6)
      return Swal.fire("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัว");

    if (newPassword === oldPassword)
      return Swal.fire("รหัสผ่านใหม่ต้องไม่ซ้ำของเดิม");

    if (newPassword !== confirmPassword)
      return Swal.fire("รหัสผ่านใหม่ไม่ตรงกัน");

    const ok = await changePassword({ oldPassword, newPassword });
    if (ok) {
      Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        text: "ระบบจะออกจากระบบเพื่อความปลอดภัย",
        timer: 1500,
        showConfirmButton: false,
      });

      // เคลียร์ form
      setOld("");
      setNew("");
      setConfirm("");

      // 🚪 ออกจากระบบ backend ทันที
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // กลับไปหน้า Login
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  };
  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();
  
  return (
    <>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      {/* Responsive container */}
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
        {/* RESPONSIVE CARD */}
        <div className="card border-black shadow w-100 change-card">
          <div className="card-body">
            <h4 className="fw-bold text-center text-black mb-4">
              🔐 เปลี่ยนรหัสผ่าน
            </h4>

            <form onSubmit={submit}>
              {PasswordInput(
                "รหัสผ่านเดิม",
                oldPassword,
                setOld,
                show.old,
                () => setShow({ ...show, old: !show.old })
              )}
              {PasswordInput(
                "รหัสผ่านใหม่",
                newPassword,
                setNew,
                show.new,
                () => setShow({ ...show, new: !show.new })
              )}
              {PasswordInput(
                "ยืนยันรหัสผ่านใหม่",
                confirmPassword,
                setConfirm,
                show.confirm,
                () => setShow({ ...show, confirm: !show.confirm })
              )}

              <button
                type="submit"
                className="btn btn-warning fw-bold w-100 py-2 mt-2"
                disabled={loading}
              >
                💾 บันทึกรหัสผ่านใหม่
              </button>
            </form>
          </div>
        </div>

        {/* Only Bootstrap Classes */}
        <style>{`
          /* Mobile <600px */
          @media (max-width: 599px) {
            .change-card { max-width: 100%; border-width: 2px; border-radius: 14px; }
          }

          /* Tablet 600–1399px */
          @media (min-width: 600px) and (max-width: 1399px) {
            .change-card { max-width: 70%; border-width: 3px; border-radius: 18px; }
          }

          /* Desktop ≥1400px */
          @media (min-width: 1400px) {
            .change-card { max-width: 40%; border-width: 4px; border-radius: 22px; }
          }
        `}</style>
      </div>
    </>
  );
}

/* =============================================
   PASSWORD INPUT COMPONENT (Bootstrap Only)
============================================= */
function PasswordInput(
  label: string,
  value: string,
  setValue: (v: string) => void,
  show: boolean,
  toggle: () => void
) {
  return (
    <div className="mb-3 position-relative">
      <label className="form-label fw-semibold text-black">{label}</label>

      <input
        type={show ? "text" : "password"}
        className="form-control text-center border-2 border-warning"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* Eye icon centered using Bootstrap ONLY */}
      <span
        onClick={toggle}
        className="position-absolute top-50 translate-middle-y mt-3 end-0 pe-3"
        style={{ cursor: "pointer", fontSize: "1.3rem" }}
      >
        {show ? "🙈" : "👁️"}
      </span>
    </div>
  );
}
