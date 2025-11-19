// src/components/Admin/AdminTable.tsx
import Swal from "sweetalert2";
import { type Admin } from "../../types/admin";
import { API_BASE } from "../../config";

interface Props {
  admins: Admin[];
  currentPage: number;
  rowsPerPage: number;
  onEdit: (admin: Admin) => void;
  refresh: () => void;
  oldestAdminId: string | null;   // ⭐ เพิ่มตรงนี้
}

export default function AdminTable({
  admins,
  currentPage,
  rowsPerPage,
  onEdit,
  refresh,
  oldestAdminId,
}: Props) {
  const indexOfFirst = (currentPage - 1) * rowsPerPage;

  const handleDelete = async (admin: Admin) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `คุณแน่ใจหรือไม่ที่จะลบ <b>${admin.username}</b>?`,
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
      Swal.fire("ลบไม่สำเร็จ", "เซิร์ฟเวอร์ปฏิเสธคำสั่ง", "error");
      return;
    }

    Swal.fire("สำเร็จ!", `ลบผู้ใช้ "${admin.username}" แล้ว`, "success");
    refresh();
  };

  return (
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table className="table table-sm table-striped align-middle text-center">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ชื่อผู้ใช้</th>
            <th>ชื่อจริง</th>
            <th>สิทธิ์</th>
            <th>แก้ไข</th>
            <th>ลบ</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((admin, i) => (
            <tr key={admin.adminId}>
              <td>{indexOfFirst + i + 1}</td>
              <td>{admin.username}</td>
              <td>{admin.name}</td>
              <td>{admin.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</td>

              <td>
                <button
                  className="btn btn-sm btn-warning text-white"
                  onClick={() => onEdit(admin)}
                >
                  ✏️
                </button>
              </td>

              <td>
                {admin.adminId === oldestAdminId ? (
                  <span className="text-muted">—</span>
                ) : (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(admin)}
                  >
                    🗑️
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
