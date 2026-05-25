import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { api } from "../utils/api";

interface ResetRequest {
  requestId: number;
  username: string;
  phone?: string;
  createdAt: string;
}

export default function ResetRequests() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const [requests, setRequests] = useState<ResetRequest[]>([]);

  const [loading, setLoading] = useState(true);

  /* ---------------- โหลดคำร้อง ---------------- */
  const loadRequests = async () => {
    try {
      setLoading(true);

      const res = await api.get("/auth/admin/reset-requests");

      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  /* ---------------- รีเซ็ตรหัส ---------------- */
  const handleResetPassword = async (requestId: number) => {
    const confirm = await Swal.fire({
      icon: "warning",

      title: "รีเซ็ตรหัสผ่าน ?",

      html: `
        <p>
          รหัสใหม่จะเป็น
        </p>

        <h3 class="fw-bold text-danger">
          123456
        </h3>
      `,

      showCancelButton: true,

      confirmButtonText: "รีเซ็ต",

      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.post("/auth/admin/reset-requests", {
        requestId,
      });

      Swal.fire({
        icon: "success",

        title: "รีเซ็ตสำเร็จ",

        html: `
          <p>
            รหัสใหม่คือ
          </p>

          <h3 class="fw-bold text-success">
            ${res.data.tempPassword}
          </h3>
        `,
      });

      loadRequests();
    } catch (err: any) {
      Swal.fire({
        icon: "error",

        title: "ผิดพลาด",

        text: err.response?.data?.error || "เกิดข้อผิดพลาด",
      });
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div
      className="d-flex min-vh-100"
      style={{
        fontFamily: "Sarabun, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      {/* CONTENT */}
      <main
        className="flex-grow-1 px-3 py-4"
        style={{
          marginTop: "70px",
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: "1200px",
          }}
        >
          {/* TITLE */}
          <h2
            className="fw-bold text-center mb-4"
            style={{
              color: "#4A0080",
              borderBottom: "3px solid #CE93D8",
              width: "fit-content",
              margin: "0 auto",
            }}
          >
            คำร้องรีเซ็ตรหัสผ่าน
          </h2>

          {/* TABLE */}
          <div className="table-responsive shadow-sm rounded-4 overflow-hidden">
            <table className="table table-striped align-middle text-center mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>เบอร์โทร</th>
                  <th>วันที่ส่งคำร้อง</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-muted">
                      ไม่มีคำร้อง
                    </td>
                  </tr>
                ) : (
                  requests.map((req, index) => (
                    <tr key={req.requestId}>
                      <td>{index + 1}</td>

                      <td>{req.username}</td>

                      <td>{req.phone || "-"}</td>

                      <td>{new Date(req.createdAt).toLocaleString("th-TH")}</td>

                      <td>
                        <button
                          className="btn btn-warning fw-bold"
                          onClick={() => handleResetPassword(req.requestId)}
                        >
                          รีเซ็ตรหัส
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
