import { useState } from "react";
import type { Admin } from "../../types/Auth";

interface ProfileCardProps {
  admin: Admin;
  onSave: (name: string) => void;
}

export default function ProfileCard({ admin, onSave }: ProfileCardProps) {
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

      <div className="mb-3">
        <label className="form-label fw-bold">ชื่อผู้ใช้</label>
        <input type="text" className="form-control" value={admin.username} disabled />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">ชื่อ-นามสกุล</label>
        <input
          type="text"
          className="form-control"
          value={name}
          disabled={!editing}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">สิทธิ์</label>
        <input
          type="text"
          className="form-control"
          value={admin.role === 0 ? "Super Admin" : "Admin"}
          disabled
        />
      </div>

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
        <button
          className="btn btn-primary w-100"
          onClick={() => setEditing(true)}
        >
          ✏️ แก้ไขข้อมูล
        </button>
      )}
    </div>
  );
}
