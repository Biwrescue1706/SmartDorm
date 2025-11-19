//src/components/Admin/AdminCard.tsx
import Swal from "sweetalert2";
import { API_BASE } from "../../config";
import { type Admin } from "../../types/admin";

interface Props {
  admins: Admin[];
  cols: number;
  onEdit: (admin: Admin) => void;
  refresh: () => void;
  oldestAdminId: string | null;
}

export default function AdminCard({
  admins,
  cols,
  onEdit,
  refresh,
  oldestAdminId,
}: Props) {
  const handleDelete = async (admin: Admin) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `ต้องการลบ <b>${admin.username}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`${API_BASE}/admin/${admin.adminId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      Swal.fire("ลบไม่สำเร็จ", "", "error");
      return;
    }

    Swal.fire("สำเร็จ!", "ลบผู้ใช้แล้ว", "success");
    refresh();
  };

  return (
    <div className="row g-3">
      {admins.map((admin) => (
        <div key={admin.adminId} className={`col-${12 / cols}`}>
          <div className="card shadow-sm p-3">
            <h5>{admin.username}</h5>
            <p className="mb-1">ชื่อจริง: {admin.name}</p>
            <p className="mb-2">
              สิทธิ์: {admin.role === 0 ? "แอดมินหลัก" : "พนักงาน"}
            </p>

            <div className="d-flex justify-content-between">
              <button
                className="btn btn-warning btn-sm text-white"
                onClick={() => onEdit(admin)}
              >
                ✏️
              </button>

              {admin.adminId !== oldestAdminId && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(admin)}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
