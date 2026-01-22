import type { Admin } from "../../types/admin";

interface Props {
  admins: Admin[];
  oldestAdminId: string | null;
  handleDelete: (id: string) => void;
  openEditDialog: (a: Admin) => void;
  role: number | null;
}

export default function TabletView({
  admins,
  oldestAdminId,
  handleDelete,
  openEditDialog,
  role,
}: Props) {
  return (
    <div className="row g-3">
      {admins.map((a) => (
        <div key={a.adminId} className="col-12 col-sm-6 col-lg-4">
          <div className="card p-3 shadow-sm" style={{ borderRadius: "14px" }}>
            <h5 className="fw-bold">{a.username}</h5>
            <p>
              <b>ชื่อ :</b> {a.name}
            </p>
            <p>
              <b>สิทธิ์ :</b> {a.role === 0 ? "แอดมิน" : "พนักงาน"}
            </p>

            {role === 0 && (
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditDialog(a)}
                >
                  ✏️
                </button>

                {a.adminId !== oldestAdminId && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(a.adminId)}
                  >
                    ลบ
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
