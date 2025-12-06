import { useState } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import type { Admin } from "../types/Auth";

export default function Profile() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { admin, loading, updateProfile } = useProfile();

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
          paddingTop: "100px",
          background: "#f6f1fc",
        }}
      >
        {loading ? (
          <p className="text-center text-muted">⏳ กำลังโหลดข้อมูล...</p>
        ) : admin ? (
          <ProfileCardInline admin={admin} onSave={(name) => updateProfile({ name })} />
        ) : (
          <p className="text-danger">ไม่พบข้อมูลผู้ใช้</p>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------
   Profile Card Component (SCB THEME)
------------------------------------------------- */

interface ProfileCardProps {
  admin: Admin;
  onSave: (name: string) => void;
}

function ProfileCardInline({ admin, onSave }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(admin.name);

  const handleSave = () => {
    if (!name.trim()) return alert("กรุณากรอกชื่อให้ถูกต้อง");
    onSave(name);
    setEditing(false);
  };

  return (
    <div
      className="card shadow-lg p-4 w-100"
      style={{
        maxWidth: "520px",
        borderRadius: 20,
        border: "2px solid #4A0080",
      }}
    >
      <h4 className="fw-bold text-center mb-4" style={{ color: "#4A0080" }}>
        ⚙️ โปรไฟล์ของฉัน
      </h4>

      {/* Username */}
      <FormItem label="ชื่อผู้ใช้">
        <input
          type="text"
          className="form-control"
          value={admin.username}
          disabled
        />
      </FormItem>

      {/* Name */}
      <FormItem label="ชื่อ">
        <input
          type="text"
          className="form-control"
          value={name}
          disabled={!editing}
          onChange={(e) => setName(e.target.value)}
          style={{ borderColor: editing ? "#4A0080" : undefined }}
        />
      </FormItem>

      {/* Role */}
      <FormItem label="สิทธิ์">
        <input
          type="text"
          className="form-control"
          value={admin.role === 0 ? "แอดมินหลัก" : "พนักงาน"}
          disabled
        />
      </FormItem>

      {/* Buttons */}
      {editing ? (
        <div className="d-flex gap-2 mt-3">
          <button
            className="btn w-50"
            style={{ background: "#6c757d", color: "#fff" }}
            onClick={() => setEditing(false)}
          >
            ❌ ยกเลิก
          </button>

          <button
            className="btn w-50"
            style={{
              background: "#4A0080",
              color: "#fff",
              fontWeight: "bold",
            }}
            onClick={handleSave}
          >
            💾 บันทึก
          </button>
        </div>
      ) : (
        <button
          className="btn w-100 mt-3"
          style={{
            background: "#4A0080",
            color: "#fff",
            fontWeight: "bold",
          }}
          onClick={() => setEditing(true)}
        >
          ✏️ แก้ไขข้อมูล
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------
   📌 Inline Form Wrapper (ลดความซ้ำ)
------------------------------------------------- */
function FormItem({ label, children }: { label: string; children: any }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold" style={{ color: "#4A0080" }}>
        {label}
      </label>
      {children}
    </div>
  );
}