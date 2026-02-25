// src/components/Admin/MobileView.tsx
import { roleStyle } from "../../pages/AdminManagement";
import type { Admin } from "../../types/admin";

interface Props {
  admins: Admin[];
  oldestAdminId: string | null;
  handleDelete: (id: string) => void;
  openEditDialog: (a: Admin) => void;
  role: number | null;
}

export default function MobileView({
  admins,
  oldestAdminId,
  handleDelete,
  openEditDialog,
  role,
}: Props) {
  return (
    <div className="row g-3">
      {admins.map((a) => (
        <div key={a.adminId} className="col-6">
          <div className="card p-3 shadow-sm" style={roleStyle(a.role)}>
            <h5 className="fw-bold text-center">{a.username}</h5>
            <p className="fw-bold h6 text-center">
              <b>ชื่อ :</b> {a.name}
            </p>
            <p className="fw-bold h6 text-center">
              <b>สิทธิ์ :</b> {a.role === 0 ? "แอดมิน" : "พนักงาน"}
            </p>

            {role === 0 && (
              <div className="d-flex justify-content-center ">
                <button
                  className="btn btn-sm btn-primary mx-2"
                  onClick={() => openEditDialog(a)}
                >
                  ✏️
                </button>

                {a.adminId !== oldestAdminId && (
                  <button
                    className="btn btn-sm btn-danger mx-2"
                    onClick={() => handleDelete(a.adminId)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
