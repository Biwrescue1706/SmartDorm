// src/pages/Profile.tsx
import { useState, useEffect, type ReactNode } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useChangePassword } from "../hooks/useChangePassword";
import Swal from "sweetalert2";
import type { Admin } from "../types/Auth";

/* ===== สีธีม SCB ===== */
const SCB_PURPLE = "#4A0080";
const SCB_GOLD = "#D4AF37";
const BG_SOFT = "#F6F1FC";

/* ================================================================
   MAIN PROFILE PAGE
================================================================ */

export default function Profile() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { admin, loading, updateProfile } = useProfile();
  const { changePassword, loading: passLoading } = useChangePassword();

  /* ===== SAVE NAME ===== */
  const handleSaveName = async (name: string) => {
    try {
      await updateProfile({ name });
      Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  /* ===== SAVE PASSWORD ===== */
  const handleSavePassword = async (oldPass: string, newPass: string) => {
    try {
      const ok = await changePassword({ oldPassword: oldPass, newPassword: newPass });
      if (ok) {
        Swal.fire({ icon: "success", title: "เปลี่ยนรหัสผ่านสำเร็จ", timer: 1500, showConfirmButton: false });
      }
    } catch {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้", "error");
    }
  };

  return (
    <>
      <Nav onLogout={handleLogout} role={role} adminName={adminName} adminUsername={adminUsername} />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", paddingTop: "100px", background: BG_SOFT }}
      >
        {loading ? (
          <p className="text-muted">⏳ กำลังโหลดข้อมูล...</p>
        ) : admin ? (
          <ProfileCard admin={admin} onSaveName={handleSaveName} onSavePass={handleSavePassword} passLoading={passLoading} />
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
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showPassDialog, setShowPassDialog] = useState(false);

  return (
    <>
      <div className="card profile-card shadow-lg p-4 w-100">
        <h4 className="fw-bold text-center mb-4" style={{ color: SCB_PURPLE }}>
          ⚙️ โปรไฟล์ของฉัน
        </h4>

        <FormItem label="ชื่อผู้ใช้">
          <input type="text" disabled className="form-control scb-input" value={admin.username} />
        </FormItem>

        <FormItem label="ชื่อจริง">
          <input type="text" disabled className="form-control scb-input" value={admin.name} />
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
          <button className="btn fw-bold w-50 scb-btn-purple" onClick={() => setShowNameDialog(true)}>
            ✏️ แก้ไขชื่อ
          </button>
          <button className="btn fw-bold w-50 scb-btn-gold" onClick={() => setShowPassDialog(true)}>
            🔐 เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>

      {showNameDialog && <DialogEditName oldName={admin.name} onSave={onSaveName} onClose={() => setShowNameDialog(false)} />}
      {showPassDialog && <DialogEditPassword loading={passLoading} onSave={onSavePass} onClose={() => setShowPassDialog(false)} />}

      {/* CARD RESPONSIVE */}
      <style>
        {`
          .profile-card {
            border-radius: 22px;
            border: 2px solid ${SCB_PURPLE};
            background: #fff;
            transition: .25s;
          }

          .scb-input {
            background: #fff;
            border: 1.8px solid ${SCB_PURPLE}33;
            border-radius: 10px;
          }

          @media (max-width: 599px) { .profile-card { max-width: 100%; margin: 0 10px; } }
          @media (min-width: 600px) and (max-width: 1399px) { .profile-card { max-width: 70%; } }
          @media (min-width: 1400px) { .profile-card { max-width: 42%; } }

          .scb-btn-purple { background:${SCB_PURPLE}; color:#fff; border:none; }
          .scb-btn-purple:hover { background:#360057; }

          .scb-btn-gold { background:${SCB_GOLD}; color:#000; border:none; }
          .scb-btn-gold:hover { background:#b38b1e; }
        `}
      </style>
    </>
  );
}

/* ================================================================
   DIALOG — EDIT NAME
================================================================ */

function DialogEditName({ oldName, onSave, onClose }: { oldName: string; onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(oldName);

  return modal(
    "✏️ เปลี่ยนชื่อผู้ใช้งาน",
    <>
      <label className="fw-semibold mb-1" style={{ color: SCB_PURPLE }}>ชื่อใหม่</label>
      <input className="form-control scb-input mb-3" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

      <ButtonsRow onClose={onClose} onSave={() => name.trim() && onSave(name)} />
    </>,
    onClose
  );
}

/* ================================================================
   DIALOG — CHANGE PASSWORD (SHOW / HIDE PASSWORD)
================================================================ */

function DialogEditPassword({
  onSave,
  onClose,
  loading,
}: {
  onSave: (oldPass: string, newPass: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [show, setShow] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = () => {
    if (!oldPass || !newPass || !confirm) return Swal.fire("กรุณากรอกข้อมูลให้ครบ");
    if (newPass.length < 6) return Swal.fire("รหัสผ่านใหม่อย่างน้อย 6 ตัว");
    if (newPass === oldPass) return Swal.fire("รหัสผ่านใหม่ต้องไม่ซ้ำของเดิม");
    if (newPass !== confirm) return Swal.fire("รหัสผ่านใหม่ไม่ตรงกัน");
    onSave(oldPass, newPass);
    onClose();
  };

  return modal(
    "🔐 เปลี่ยนรหัสผ่าน",
    <>
      {passwordInput("รหัสผ่านเดิม", oldPass, setOldPass, show, setShow)}
      {passwordInput("รหัสผ่านใหม่", newPass, setNewPass, show, setShow)}
      {passwordInput("ยืนยันรหัสผ่าน", confirm, setConfirm, show, setShow)}

      <ButtonsRow loading={loading} onClose={onClose} onSave={submit} />
    </>,
    onClose
  );
}

/* ===== INPUT WITH EYE BUTTON ===== */

function passwordInput(label: string, value: string, setValue: (v: string) => void, show: boolean, toggle: (v: boolean) => void) {
  return (
    <div className="mb-3 position-relative">
      <label className="fw-semibold mb-1" style={{ color: SCB_PURPLE }}>{label}</label>
      <input
        className="form-control scb-input pe-5"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span
        className="position-absolute"
        style={{ top: "40px", right: "15px", cursor: "pointer", color: SCB_PURPLE }}
        onClick={() => toggle(!show)}
      >
        {show ? "🙈" : "👁️"}
      </span>
    </div>
  );
}

/* ================================================================
   BUTTON ROW (CANCEL / SAVE)
================================================================ */

function ButtonsRow({ onClose, onSave, loading }: { onClose: () => void; onSave: () => void; loading?: boolean }) {
  return (
    <div className="d-flex gap-2 mt-3">
      <button className="btn w-50" style={{ background: "#6c757d", color: "#fff" }} onClick={onClose}>
        ❌ ยกเลิก
      </button>
      <button className="btn fw-bold w-50 scb-btn-purple" disabled={loading} onClick={onSave}>
        {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
      </button>
    </div>
  );
}

/* ================================================================
   MODAL ANIMATION
================================================================ */

function modal(title: string, content: ReactNode, onClose?: () => void) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h5 className="fw-bold text-center mb-3" style={{ color: SCB_PURPLE }}>{title}</h5>
        {content}
        <div className="modal-handle" />
      </div>

      <style>
        {`
        .modal-overlay {
          position: fixed; top:0; left:0; width: 100%; height: 100%;
          background: rgba(0,0,0,.45); animation: fade .35s ease forwards; z-index:3000;
        }
        @keyframes fade { from {opacity:0;} to {opacity:1;} }

        .modal-card {
          position: fixed; top:50%; left:50%;
          transform: translate(-50%, -50%) scale(.92);
          width: 90%; max-width: 430px;
          background: #fff; border-radius: 18px; padding: 24px;
          border-top: 6px solid ${SCB_PURPLE}; z-index: 4001;
          animation: spring .45s cubic-bezier(.18,.89,.32,1.28) forwards;
        }
        @keyframes spring {
          0% { opacity:0; transform:translate(-50%,-40%) scale(.85); }
          55% { transform:translate(-50%,-52%) scale(1.02); }
          100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }

        .modal-handle {
          width: 55px; height: 5px;
          background: #aaa; margin: 10px auto 0; opacity: .45; border-radius: 4px;
        }
        `}
      </style>
    </>
  );
}

/* ================================================================
   FORM ITEM
================================================================ */

function FormItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label className="fw-bold mb-1" style={{ color: SCB_PURPLE }}>{label}</label>
      {children}
    </div>
  );
}
