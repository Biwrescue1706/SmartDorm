import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config";
import { type Admin } from "../../types/admin";

interface Props {
  open: boolean;
  onClose: () => void;
  admin: Admin | null;
  refresh: () => void;
}

export default function AdminEditDialog({
  open,
  onClose,
  admin,
  refresh,
}: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleValue, setRoleValue] = useState("1");

  //  เมื่อ admin เปลี่ยน ให้รีเซ็ตค่าฟอร์มใหม่
  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setPassword("");
      setRoleValue(String(admin.role));
    }
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    try {
      const res = await fetch(`${API_BASE}/admin/${admin.adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          password,
          role: parseInt(roleValue, 10),
        }),
      });

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
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
            แก้ไขข้อมูลผู้ดูแล
          </Dialog.Title>

          <Dialog.Description className="text-muted text-center mb-3">
            โปรดตรวจสอบและแก้ไขข้อมูลผู้ดูแลระบบให้ถูกต้องก่อนบันทึก
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <input
              className="form-control form-control-sm mb-2"
              placeholder="ชื่อจริง"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              className="form-control form-control-sm mb-2"
              placeholder="รหัสผ่านใหม่ (ไม่บังคับ)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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