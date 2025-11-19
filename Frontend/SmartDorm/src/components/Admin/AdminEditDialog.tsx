// src/components/Admin/AdminEditDialog.tsx
import Swal from "sweetalert2";
import { API_BASE } from "../../config";
import type { Admin } from "../../types/admin";

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
  if (!open || !admin) return null;

  // 🔥 เปิด popup อัตโนมัติเมื่อ open = true
  const showPopup = async () => {
    const { value: formValues } = await Swal.fire({
      title: `แก้ไขข้อมูล (${admin.username})`,
      html: `
        <input id="swal-name" class="swal2-input" placeholder="ชื่อ" value="${admin.name}">
        <input id="swal-pass" class="swal2-input" type="password" placeholder="รหัสผ่านใหม่ (ไม่บังคับ)">
        <select id="swal-role" class="swal2-input">
          <option value="0" ${admin.role === 0 ? "selected" : ""}>แอดมินหลัก</option>
          <option value="1" ${admin.role === 1 ? "selected" : ""}>พนักงาน</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        return {
          name: (document.getElementById("swal-name") as HTMLInputElement)
            .value,
          password: (document.getElementById("swal-pass") as HTMLInputElement)
            .value,
          role: parseInt(
            (document.getElementById("swal-role") as HTMLSelectElement).value,
            10
          ),
        };
      },
    });

    if (!formValues) {
      onClose();
      return;
    }

    if (formValues.password && formValues.password.length < 6) {
      Swal.fire("รหัสผ่านสั้นเกินไป", "ต้องมากกว่า 6 ตัวอักษร", "error");
      return;
    }

    // บันทึกข้อมูล
    try {
      const res = await fetch(`${API_BASE}/admin/${admin.adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
      refresh();
      onClose();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  // เปิด popup ครั้งเดียวตอน open = true
  showPopup();

  return null;
}
