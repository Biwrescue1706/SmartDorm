// src/components/Admin/AdminTableCard.tsx
import Swal from "sweetalert2";
import type { Admin } from "../../types/admin";

interface Props {
  admins: Admin[];
  windowWidth: number;
  cols: number;
  onEdit: (admin: Admin) => void;
  refresh: () => void;
  oldestAdminId: string | null;
  currentPage: number;
  rowsPerPage: number;
}

export default function AdminTableCard({
  admins,
  windowWidth,
  onEdit,
  refresh,
  oldestAdminId,
  currentPage,
  rowsPerPage,
}: Props) {
  // --------------------------
  // 🔥 ลบผู้ใช้
  // --------------------------
  const handleDelete = async (adminId: string) => {
    if (adminId === oldestAdminId) {
      Swal.fire("ห้ามลบ!", "ไม่สามารถลบผู้ดูแลระบบคนแรกได้", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบผู้ดูแลระบบคนนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/admin/${adminId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      Swal.fire("สำเร็จ!", "ลบผู้ดูแลระบบเรียบร้อยแล้ว", "success");
      refresh();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  // --------------------------
  // 📱 แสดงแบบ Card (Mobile)
  // --------------------------
  if (windowWidth < 900) {
    return (
      <div className="row g-3">
        {admins.map((a) => (
          <div key={a.adminId} className="col-12">
            <div className="card shadow-sm p-3">
              <h5 className="fw-bold">{a.username}</h5>
              <p className="mb-1">
                <strong>ชื่อ:</strong> {a.name}
              </p>
              <p className="mb-1">
                <strong>สิทธิ์:</strong> {a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}
              </p>

              <div className="d-flex justify-content-between mt-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onEdit(a)}
                >
                  แก้ไข
                </button>

                {a.adminId !== oldestAdminId && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(a.adminId)}
                  >
                    ลบ
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --------------------------
  // 💻 แสดงแบบ Table
  // --------------------------
  return (
    <table className="table table-striped table-bordered text-center">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>ชื่อผู้ใช้</th>
          <th>ชื่อ</th>
          <th>สิทธิ์</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((a, index) => (
          <tr key={a.adminId}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td>{a.username}</td>
            <td>{a.name}</td>
            <td>{a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</td>
            <td>
              <button
                className="btn btn-primary btn-sm me-2"
                onClick={() => onEdit(a)}
              >
                แก้ไข
              </button>

              {a.adminId !== oldestAdminId && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(a.adminId)}
                >
                  ลบ
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
