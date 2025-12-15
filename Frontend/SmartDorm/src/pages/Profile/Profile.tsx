import { useState, type ReactNode } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useChangePassword } from "../../hooks/useChangePassword";
import Swal from "sweetalert2";
import type { Admin } from "../../types/Auth";
import { API_BASE } from "../../config";

const SCB_PURPLE = "#4A0080";
const SCB_GOLD = "#D4AF37";
const BG_SOFT = "#F6F1FC";

/* ================================================================
   MAIN PROFILE PAGE
================================================================ */

export default function Profile() {
  const { handleLogout, role, adminName, adminUsername } =
    useAuth();
  const { admin, loading, updateProfile } = useProfile();
  const { changePassword, loading: passLoading } = useChangePassword();

  const handleSaveName = async (name: string) => {
    try {
      await updateProfile({ name }); // บันทึกชื่อใหม่

      Swal.fire({
        icon: "success",
        title: "บันทึกชื่อใหม่สำเร็จ",
        text: "ระบบจะออกจากระบบเพื่ออัปเดตข้อมูล",
        timer: 1500,
        showConfirmButton: false,
      });

      // ออกจากระบบทันที เพื่อ refresh token + ชื่อใหม่
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // กลับไปหน้า Login
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  const handleSavePassword = async (oldPass: string, newPass: string) => {
    try {
      const ok = await changePassword({
        oldPassword: oldPass,
        newPassword: newPass,
      });

      if (ok) {
        Swal.fire({
          icon: "success",
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          text: "ระบบจะออกจากระบบเพื่อความปลอดภัย",
          timer: 1500,
          showConfirmButton: false,
        });

        // เรียก logout backend
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        // เคลียร์ state แล้วเด้งหน้า login
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้", "error");
    }
  };

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
        style={{ minHeight: "100vh", paddingTop: "100px", background: BG_SOFT }}
      >
        {loading ? (
          <p className="text-muted">⏳ กำลังโหลดข้อมูล...</p>
        ) : admin ? (
          <ProfileCard
            admin={admin}
            onSaveName={handleSaveName}
            onSavePass={handleSavePassword}
            passLoading={passLoading}
          />
        ) : (
          <p className="text-danger">ไม่พบข้อมูลผู้ใช้</p>
        )}
      </div>
    </>
  );
}

/* ================================================================
   PROFILE CARD
================================================================ */

function ProfileCard({
  admin,
  onSaveName,
  onSavePass,
  passLoading,
}: {
  admin: Admin;
  onSaveName: (name: string) => void;
  onSavePass: (oldPass: string, newPass: string) => void;
  passLoading: boolean;
}) {
  const [showName, setShowName] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <div className="card profile-card shadow-lg p-4 w-100">
        <h4 className="fw-bold text-center mb-4" style={{ color: SCB_PURPLE }}>
          ⚙️ โปรไฟล์ของฉัน
        </h4>

        <FormItem label="ชื่อผู้ใช้">
          <input
            type="text"
            disabled
            className="form-control scb-input"
            value={admin.username}
          />
        </FormItem>

        <FormItem label="ชื่อจริง">
          <input
            type="text"
            disabled
            className="form-control scb-input"
            value={admin.name}
          />
        </FormItem>

        <FormItem label="สิทธิ์">
          <input
            type="text"
            disabled
            className="form-control scb-input"
            value={admin.role === 0 ? "แอดมินหลัก" : "พนักงาน"}
          />
        </FormItem>

        <div className="d-flex gap-2 mt-3">
          <button
            className="btn fw-bold w-50 scb-btn-purple"
            onClick={() => setShowName(true)}
          >
            ✏️ แก้ไขชื่อ
          </button>
          <button
            className="btn fw-bold w-50 scb-btn-gold"
            onClick={() => setShowPass(true)}
          >
            🔐 เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>

      {showName && (
        <DialogEditName
          onSave={onSaveName}
          onClose={() => setShowName(false)}
        />
      )}
      {showPass && (
        <DialogEditPassword
          loading={passLoading}
          onSave={onSavePass}
          onClose={() => setShowPass(false)}
        />
      )}

      <style>{`
        .profile-card { border-radius:22px; border:2px solid ${SCB_PURPLE}; background:#fff; }
        .scb-input { background:#fff; border:1.8px solid ${SCB_PURPLE}33; border-radius:10px; }

        @media(max-width:599px){ .profile-card{max-width:100%; margin:0 10px;} }
        @media(min-width:600px) and (max-width:1399px){ .profile-card{max-width:70%;} }
        @media(min-width:1400px){ .profile-card{max-width:42%;} }

        .scb-btn-purple{background:${SCB_PURPLE};color:#fff;border:none;}
        .scb-btn-purple:hover{background:#360057;}
        .scb-btn-gold{background:${SCB_GOLD};color:#000;border:none;}
        .scb-btn-gold:hover{background:#b38b1e;}
      `}</style>
    </>
  );
}

/* ================================================================
   EDIT NAME DIALOG
================================================================ */

function DialogEditName({
  onSave,
  onClose,
}: {
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const n = name.trim();

    if (!n) return setError("กรุณากรอกชื่อใหม่");
    if (n.length < 8) return setError("ชื่อต้องมีอย่างน้อย 8 ตัวอักษร");
    onSave(n);
    onClose();
  };

  return modal(
    "✏️ เปลี่ยนชื่อผู้ใช้งาน",
    <>
      {error && <p className="text-danger fw-semibold mb-2">{error}</p>}
      <label className="fw-semibold mb-1" style={{ color: SCB_PURPLE }}>
        ชื่อใหม่
      </label>
      <input
        className="form-control scb-input mb-3"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        autoFocus
        placeholder="กรอกชื่อใหม่ (อย่างน้อย 8 ตัว)"
      />
      <ButtonsRow onClose={onClose} onSave={submit} />
    </>,
    onClose
  );
}

/* ================================================================
   EDIT PASSWORD DIALOG
================================================================ */

function DialogEditPassword({
  onSave,
  onClose,
  loading,
}: {
  onSave: (o: string, n: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [show, setShow] = useState(false);
  const [oldPass, setOld] = useState("");
  const [newPass, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!oldPass || !newPass || !confirm)
      return setError("กรุณากรอกข้อมูลให้ครบ");
    if (newPass.length < 6) return setError("รหัสผ่านใหม่อย่างน้อย 6 ตัว");
    if (newPass === oldPass)
      return setError("รหัสผ่านใหม่ต้องแตกต่างจากของเดิม");
    if (newPass !== confirm) return setError("รหัสผ่านใหม่ไม่ตรงกัน");

    onSave(oldPass, newPass);
    onClose();
  };

  return modal(
    "🔐 เปลี่ยนรหัสผ่าน",
    <>
      {error && <p className="text-danger fw-semibold mb-2">{error}</p>}
      {passwordInput("รหัสผ่านเดิม", oldPass, setOld, show, setShow)}
      {passwordInput("รหัสผ่านใหม่", newPass, setNew, show, setShow)}
      {passwordInput("ยืนยันรหัสผ่าน", confirm, setConfirm, show, setShow)}
      <ButtonsRow loading={loading} onClose={onClose} onSave={submit} />
    </>,
    onClose
  );
}

/* ================================================================
   PASSWORD INPUT
================================================================ */

function passwordInput(
  label: string,
  value: string,
  setValue: (v: string) => void,
  show: boolean,
  toggle: (v: boolean) => void
) {
  return (
    <div className="mb-3 position-relative">
      <label className="fw-semibold mb-1" style={{ color: SCB_PURPLE }}>
        {label}
      </label>
      <input
        className="form-control scb-input pe-5"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span
        style={{
          position: "absolute",
          top: "40px",
          right: "15px",
          cursor: "pointer",
          color: SCB_PURPLE,
        }}
        onClick={() => toggle(!show)}
      >
        {show ? "🙈" : "👁️"}
      </span>
    </div>
  );
}

/* ================================================================
   BUTTON ROW
================================================================ */

function ButtonsRow({
  onClose,
  onSave,
  loading,
}: {
  onClose: () => void;
  onSave: () => void;
  loading?: boolean;
}) {
  return (
    <div className="d-flex gap-2 mt-3">
      <button
        className="btn w-50"
        style={{ background: "#6c757d", color: "#fff" }}
        onClick={onClose}
      >
        ❌ ยกเลิก
      </button>
      <button
        className="btn fw-bold w-50 scb-btn-purple"
        disabled={loading}
        onClick={onSave}
      >
        {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
      </button>
    </div>
  );
}

/* ================================================================
   MODAL BASE
================================================================ */

function modal(title: string, content: ReactNode, onClose?: () => void) {
  return (
    <>
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,.45)", zIndex: 3000 }}
        onClick={onClose}
      />

      {/* Center Dialog */}
      <div
        className="position-fixed top-50 start-50"
        style={{
          transform: "translate(-50%, -50%)",
          zIndex: 4000,
          width: "90%",
          maxWidth: "430px",
          background: "#fff",
          borderRadius: "18px",
          padding: "24px",
          borderTop: `6px solid ${SCB_PURPLE}`,
          animation: "zoomIn .25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="fw-bold text-center mb-3" style={{ color: SCB_PURPLE }}>
          {title}
        </h5>
        {content}
      </div>

      <style>{`
        @keyframes zoomIn {
          0% { opacity: 0; transform: translate(-50%,-40%) scale(.85); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
      `}</style>
    </>
  );
}

/* ================================================================
   FORM ITEM
================================================================ */

function FormItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label className="fw-bold mb-1" style={{ color: SCB_PURPLE }}>
        {label}
      </label>
      {children}
    </div>
  );
}
