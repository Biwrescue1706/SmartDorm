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
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        {loading ? (
          <p className="text-center text-muted">⏳ กำลังโหลดข้อมูล...</p>
        ) : admin ? (
          <ProfileCardInline
            admin={admin}
            onSave={(name) => updateProfile({ name })}
          />
        ) : (
          <p className="text-danger">ไม่พบข้อมูลผู้ใช้</p>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------
   🔽 ProfileCard รวมไว้ในไฟล์เดียว (Inline Component)
------------------------------------------------- */

interface ProfileCardProps {
  admin: Admin;
  onSave: (name: string) => void;
}

function ProfileCardInline({ admin, onSave }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(admin.name);

  const handleSave = () => {
    if (!name.trim()) {
      alert("กรุณากรอกชื่อให้ถูกต้อง");
      return;
    }
    onSave(name);
    setEditing(false);
  };

  return (
    <div className="card shadow-sm p-5 w-100" style={{ maxWidth: "520px" }}>
      <h4 className="fw-bold text-center mb-4">⚙️ โปรไฟล์ของฉัน</h4>

      {/* 🔒 Username */}
      <div className="mb-3">
        <label className="form-label fw-bold">ชื่อผู้ใช้</label>
        <input type="text" className="form-control" value={admin.username} disabled />
      </div>

      {/* 📝 Name (Edit) */}
      <div className="mb-3">
        <label className="form-label fw-bold">ชื่อ</label>
        <input
          type="text"
          className="form-control"
          value={name}
          disabled={!editing}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* 🔐 Role */}
      <div className="mb-3">
        <label className="form-label fw-bold">สิทธิ์</label>
        <input
          type="text"
          className="form-control"
          value={admin.role === 0 ? "แอดมิน" : "พนักงาน"}
          disabled
        />
      </div>

      {/* 🔘 Buttons */}
      {editing ? (
        <div className="d-flex justify-content-between">
          <button
            className="btn btn-secondary w-100 me-2"
            onClick={() => setEditing(false)}
          >
            ยกเลิก
          </button>
          <button className="btn btn-success w-100" onClick={handleSave}>
            💾 บันทึก
          </button>
        </div>
      ) : (
        <button className="btn btn-primary w-100" onClick={() => setEditing(true)}>
          ✏️ แก้ไขข้อมูล
        </button>
      )}
    </div>
  );
}
