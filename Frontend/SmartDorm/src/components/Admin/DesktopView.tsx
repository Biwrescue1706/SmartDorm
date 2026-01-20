import type { Admin } from "../../types/admin";
import { THEME } from "./AdminTheme";

interface Props {
  currentAdmins: Admin[];
  oldestAdminId: string | null;
  handleDelete: (id: string) => void;
  openEditDialog: (a: Admin) => void;
  currentPage: number;
  rowsPerPage: number;
  role: number | null;
}

export default function DesktopView({
  currentAdmins,
  oldestAdminId,
  handleDelete,
  openEditDialog,
  currentPage,
  rowsPerPage,
  role,
}: Props) {
  return (
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-striped align-middle text-center shadow-sm"
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <thead
          className="text-white"
          style={{ background: THEME.purple, fontSize: "1rem" }}
        >
          <tr>
            <th>#</th>
            <th>ชื่อผู้ใช้</th>
            <th>ชื่อ</th>
            <th>สิทธิ์</th>
            {role === 0 && <th>แก้ไข</th>}
            {role === 0 && <th>ลบ</th>}
          </tr>
        </thead>

        <tbody style={{ fontSize: ".95rem" }}>
          {currentAdmins.map((a, i) => (
            <tr key={a.adminId} className="table-hover">
              <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
              <td>{a.username}</td>
              <td>{a.name}</td>
              <td>{a.role === 0 ? "แอดมินหลัก" : "พนักงาน"}</td>

              {role === 0 && (
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditDialog(a)}
                  >
                    ✏️
                  </button>
                </td>
              )}
              {role === 0 && a.adminId !== oldestAdminId && (
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(a.adminId)}
                  >
                    ลบ
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
