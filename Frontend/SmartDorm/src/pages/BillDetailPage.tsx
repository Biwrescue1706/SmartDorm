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

  rent: number;
  service: number;
  fine?: number;
  overdueDays?: number;

  wBefore: number;
  wAfter: number;
  wUnits: number;
  waterCost: number;

  eBefore: number;
  eAfter: number;
  eUnits: number;
  electricCost: number;

  paidAt?: string | null;
  cname : string;
  csurname : string;
  fullName?: string;

  room?: {
    number: string;
  };
}

const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
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
          <div className="d-flex justify-content-center align-items-center mb-3 gap-3">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← กลับ
            </button>

            <h3 className="fw-bold m-0" style={{ color: SCB_PURPLE }}>
              รายละเอียดบิล
            </h3>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              {bill.billStatus === 1 ? (
  <>
    <h3 className="text-center fw-bold" style={{ color: SCB_PURPLE }}>
      ใบเสร็จรับเงิน
    </h3>
    <h3 className="text-center fw-bold" style={{ color: SCB_PURPLE }}>
      SmartDorm
    </h3>
  </>
) : (
  <>
    <h3 className="fw-bold text-center" style={{ color: SCB_PURPLE }}>
      ใบแจ้งหนี้
    </h3>
    <h3 className="text-center fw-bold" style={{ color: SCB_PURPLE }}>
      SmartDorm
    </h3>
  </>
)}

              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <b>ชื่อ - นามสกุล :</b> {bill.fullName || "-"}
                </div>

                <div className="col-md-4">
                  <b>รอบบิล:</b> {formatThaiDate(bill.month)}
                </div>

                {bill.billStatus === 0 && (
                  <div className="col-md-4">
                    <b>ครบกำหนด:</b> {formatThaiDate(bill.dueDate)}
                  </div>
                )}

                <div className="col-md-4">
                  <b>สถานะ:</b> {statusText(bill.billStatus)}
                </div>

<div className="col-md-4">
                  <b>ห้อง {bill.room?.number ?? "-"}</b> </div>

              </div>

              <hr />

              <div className="table-responsive">
                <table className="table table-sm table-bordered text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>รายการ</th>
<th>เลขมาตราครั้งหลัง</th>
                      <th>เลขมาตราครั้งก่อน</th>
                      <th>จำนวนที่ใช้</th>
                      <th className="text-center">เป็นเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ค่าไฟฟ้า</td>
<td>{bill.eAfter}</td>
                      <td>{bill.eBefore}</td>
<td>{bill.eUnits}</td>
                      
                      
                      <td className="text-center">
                        {bill.electricCost.toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td>ค่าน้ำประปา</td>
 <td>{bill.wAfter}</td>
                      <td>{bill.wBefore}</td>
                     
                      <td>{bill.wUnits}</td>
                      <td className="text-center">
                        {bill.waterCost.toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td>ค่าส่วนกลาง</td>
                      <td colSpan={3}>-</td>
                      <td className="text-center">
                        {bill.service.toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td>ค่าเช่าห้อง</td>
                      <td colSpan={3}>-</td>
                      <td className="text-center">
                        {bill.rent.toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td>ค่าปรับ</td>
                      {bill.overdueDays && bill.overdueDays !== 0 ? (
                        <td colSpan={3}>ปรับ {bill.overdueDays} วัน</td>
                      ) : (
                        <td colSpan={3}>-</td>
                      )}
                      <td className="text-center">
                        {(bill.fine ?? 0).toLocaleString()}
                      </td>
                    </tr>

                    <tr className="fw-bold table-secondary">
                      <td colSpan={4} className="text-end">
                        รวมทั้งหมด
                      </td>
                      <td className="text-center">
                        {bill.total.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
{bill.billStatus === 1 && bill.paidAt && (
  <>
    <hr />

    <div className="row text-center mt-4">
      <div className="col-md-6 mb-4">
        <div className="fw-bold mb-2">ผู้รับเงิน</div>
        <div>ภูวณัฐ พาหะละ</div>
        <div className="mt-3">( นาย ภูวณัฐ พาหะละ )</div>
        <div className="mt-2">
          {formatThaiDate(bill.paidAt)}
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <div className="fw-bold mb-2">ผู้จ่ายเงิน</div>
        <div>{bill.cname || "-"} {bill.csurname}</div>
        <div className="mt-3">
          ( {bill.fullName || "-"} )
        </div>
        <div className="mt-2">
          {formatThaiDate(bill.paidAt)}
        </div>
      </div>
    </div>
  </>
)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}