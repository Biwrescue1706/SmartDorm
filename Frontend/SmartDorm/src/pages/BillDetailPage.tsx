// src/pages/Bills/BillDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import axios from "axios";
import { API_BASE } from "../config";

// SCB THEME
const SCB_PURPLE = "#4A0080";
const BG_SOFT = "#F8F5FC";

interface BillDetail {
  billId: string;
  roomId: string;
  month: string;
  total: number;
  dueDate: string;
  billStatus: number;
  room?: {
    number: string;
  };
  items?: {
    name: string;
    amount: number;
  }[];
}

const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const statusText = (s: number) => {
  if (s === 0) return "ยังไม่ชำระ";
  if (s === 1) return "ชำระแล้ว";
  if (s === 2) return "กำลังตรวจสอบ";
  return "-";
};

export default function BillDetailPage() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/bill/${billId}`, {
          withCredentials: true,
        });
        if (!mounted) return;
        setBill(res.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (billId) load();
    return () => {
      mounted = false;
    };
  }, [billId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" style={{ color: SCB_PURPLE }} />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center mt-5">
        <h5>ไม่พบข้อมูลบิล</h5>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#F7F4FD", fontFamily: "Sarabun, sans-serif" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main className="main-content mt-5 pt-4 px-2">
        <div
          className="container-fluid px-xl-5 py-4"
          style={{ background: BG_SOFT, borderRadius: 20 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold" style={{ color: SCB_PURPLE }}>
              รายละเอียดบิล
            </h3>
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              ← กลับ
            </button>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                ห้อง {bill.room?.number ?? "-"}
              </h5>

              <div className="row g-2 small">
                <div className="col-md-4">
                  <b>รอบบิล:</b> {formatThaiDate(bill.month)}
                </div>
                <div className="col-md-4">
                  <b>ครบกำหนด:</b> {formatThaiDate(bill.dueDate)}
                </div>
                <div className="col-md-4">
                  <b>สถานะ:</b> {statusText(bill.billStatus)}
                </div>
              </div>

              <hr />

              {bill.items && bill.items.length > 0 ? (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>รายการ</th>
                      <th className="text-end">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((it, i) => (
                      <tr key={i}>
                        <td>{it.name}</td>
                        <td className="text-end">
                          {it.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td>รวมทั้งหมด</td>
                      <td className="text-end">
                        {bill.total.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="text-muted small">ไม่มีรายการย่อย</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}