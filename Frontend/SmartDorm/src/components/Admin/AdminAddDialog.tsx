// src/components/Admin/AdminAddDialog.tsx
import { useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

export default function AdminAddDialog({ open, onClose, refresh }: Props) {
  if (!open) return null;

  const showPopup = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มผู้ดูแลระบบใหม่",
      html: `
        <input id="add-username" class="swal2-input" placeholder="ชื่อผู้ใช้">
        <input id="add-name" class="swal2-input" placeholder="ชื่อจริง">
        <input id="add-password" class="swal2-input" type="password" placeholder="รหัสผ่าน (ขั้นต่ำ 6 ตัว)">
        <select id="add-role" class="swal2-input">
          <option value="0">แอดมินหลัก</option>
          <option value="1" selected>พนักงาน</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        return {
          username: (document.getElementById("add-username") as HTMLInputElement).value,
          name: (document.getElementById("add-name") as HTMLInputElement).value,
          password: (document.getElementById("add-password") as HTMLInputElement).value,
          role: parseInt((document.getElementById("add-role") as HTMLSelectElement).value, 10),
        };
      },
    });

    if (!formValues) {
      onClose();
      return;
    }

    if (formValues.password.length < 6) {
      Swal.fire("ผิดพลาด", "รหัสผ่านต้องมีอย่างน้อย 6 ตัว", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("เพิ่มผู้ดูแลไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "เพิ่มผู้ดูแลระบบเรียบร้อย", "success");
      refresh();
      onClose();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  useEffect(() => {
    showPopup();
  }, []);

  return null;
}
