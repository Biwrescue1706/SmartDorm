import Swal from "sweetalert2";
import { type Admin } from "../../types/admin";
import { API_BASE } from "../../config";

interface Props {
  admins: Admin[];
  currentPage: number;
  rowsPerPage: number;
  onEdit: (admin: Admin) => void;
  refresh: () => void;
}

export default function AdminTable({
  admins,
  currentPage,
  rowsPerPage,
  onEdit,
  refresh,
}: Props) {
  const indexOfFirst = (currentPage - 1) * rowsPerPage;

  const handleDelete = async (admin: Admin, index: number) => {
    // ❌ ป้องกันลบแอดมินหลักคนแรกใน database
    if (admin.role === 0 && index === 0) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถลบได้",
        text: "ห้ามลบแอดมินหลักคนแรกของระบบ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `คุณแน่ใจหรือไม่ที่จะลบ <b>${admin.username}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/${admin.adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        Swal.fire("ลบไม่สำเร็จ", "ไม่สามารถลบผู้ดูแลระบบนี้ได้", "error");
        return;
      }

      Swal.fire("ลบสำเร็จ!", `ผู้ใช้ "${admin.username}" ถูกลบแล้ว`, "success");
      refresh();
    } catch {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    }
  };

  return (
    <div
      className="border rounded mt-3"
      style={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <table className="table table-sm table-striped text-center align-middle">
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

              {/* ปุ่มแก้ไข */}
              <td>
                <button
                  className="btn btn-sm btn-warning text-white"
                  onClick={() => onEdit(admin)}
                >
                  ✏️
                </button>
              </td>

              {/* ✅ เงื่อนไขห้ามลบแอดมินหลักคนแรก */}
              <td>
                {admin.role === 0 && i === 0 ? (
                  <span className="text-muted">—</span>
                ) : (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(admin, i)}
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
