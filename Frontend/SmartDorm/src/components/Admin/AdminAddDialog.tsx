// src/components/Admin/AdminAddDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

export default function AdminAddDialog({ open, onClose, refresh }: Props) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleValue, setRoleValue] = useState("1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          name,
          password,
          role: parseInt(roleValue, 10),
        }),
      });
      if (!res.ok) throw new Error("เพิ่มไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เพิ่มผู้ดูแลระบบใหม่เรียบร้อยแล้ว", "success");
      onClose();
      refresh();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
        <Dialog.Content
          className="position-fixed top-50 start-50 translate-middle card p-4 rounded-4 shadow-lg"
          style={{ width: "400px" }}
        >
          <Dialog.Title className="fw-bold text-center mb-2">
            เพิ่มผู้ดูแลระบบใหม่
          </Dialog.Title>

          <Dialog.Description className="text-muted text-center mb-3">
            โปรดกรอกข้อมูลให้ครบถ้วนก่อนกดบันทึก
          </Dialog.Description>
          <form onSubmit={handleSubmit}>
            <input
              className="form-control form-control-sm mb-2"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="form-control form-control-sm mb-2"
              placeholder="ชื่อจริง"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control form-control-sm mb-2"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              className="form-select form-select-sm mb-3"
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
            >
              <option value="0">แอดมินหลัก</option>
              <option value="1">พนักงาน</option>
            </select>
            <div className="d-flex justify-content-between">
              <Dialog.Close asChild>
                <button className="btn btn-sm btn-secondary px-3">
                  ยกเลิก
                </button>
              </Dialog.Close>
              <button type="submit" className="btn btn-sm btn-success px-3">
                บันทึก
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
