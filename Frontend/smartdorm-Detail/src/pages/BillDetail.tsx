// src/pages/BillDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";

interface Room {
  number: string;
  size?: string;
}

interface Booking {
  fullName?: string;
  cphone?: string;
}

interface Customer {
  userName: string;
}

interface Bill {
  billId: string;
  month: string;
  rent: number;
  service: number;
  wBefore: number;
  wAfter: number;
  wUnits: number;
  waterCost: number;
  eBefore: number;
  eAfter: number;
  eUnits: number;
  electricCost: number;
  fine: number;
  total: number;
  dueDate: string;
  createdAt: string;
  status: number;
  room: Room;
  booking?: Booking;
  customer?: Customer;
}

/* 🗓️ แปลงวันที่ไทย */
const formatThaiDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function BillDetail() {
  const { billId } = useParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`${API_BASE}/bill/${billId}`);
        setBill(res.data);
      } catch (err) {
        console.error("❌ Error fetching bill:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-muted">
        กำลังโหลดข้อมูลบิล...
      </div>
    );

  if (!bill)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-danger fw-bold">
        ❌ ไม่พบบิลนี้
      </div>
    );

  // ✅ สถานะบิล
  const statusText =
    bill.status === 1
      ? "✅ ชำระแล้ว"
      : bill.status === 0
      ? "⌛ รอชำระ"
      : "❌ เกินกำหนด";

  const statusColor =
    bill.status === 1 ? "success" : bill.status === 0 ? "warning" : "danger";

  // ✅ ดึงชื่อ–เบอร์โทรจาก booking หรือ fallback เป็น LINE name
  const fullName = bill.booking?.fullName || bill.customer?.userName || "-";

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: 600,
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <img
          src="https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png"
          alt="SmartDorm Logo"
          className="mb-0"
          style={{ width: "80px", height: "80px" }}
        />
        <h4 className="mt-2 fw-bold text-success">🏫 SmartDorm 🎉</h4>
        <h5 className="mt-2 fw-bold text-secondary">บิลค่าเช่าห้อง</h5>
      </div>

      {/* Bill Info */}
      <div className="border rounded p-3 bg-light mb-3">
        <p className="mb-1"><strong>สวัสดี  {bill.customer?.userName} </strong> </p>
        <p className="mb-1">
          <strong>ห้อง : </strong> {bill.room?.number || "-"}
        </p>
        <p className="mb-1">
          <strong>ชื่อ - นามสกุล : </strong> {fullName}
        </p>
        <p className="mb-1">
          <strong>เดือน : </strong>{" "}
          {new Date(bill.month).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
          })}
        </p>
        <p className="mb-1">
          <strong>ครบกำหนดชำระ : </strong>{" "}
          <span className="text-danger">{formatThaiDate(bill.dueDate)}</span>
        </p>
        <p className="mb-1">
          <strong>สถานะ : </strong>{" "}
          <span className={`badge bg-${statusColor}`}>{statusText}</span>
        </p>
      </div>

      {/* Cost Breakdown */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-secondary">
            <tr>
              <th className="text-center">รายการ</th>
              <th className="text-center">เลขหลัง</th>
              <th className="text-center">เลขก่อน</th>
              <th className="text-center">หน่วยใช้</th>
              <th className="text-center">เป็นเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="text-center">ค่าไฟฟ้า</th>
              <td className="text-center">{bill.eAfter ?? "-"}</td>
              <td className="text-center">{bill.eBefore ?? "-"}</td>
              <td className="text-center">{bill.eUnits ?? "-"}</td>
              <td className="text-center">
                {bill.electricCost.toLocaleString()}
              </td>
            </tr>
            <tr>
              <th className="text-center">ค่าน้ำ</th>
              <td className="text-center">{bill.wAfter ?? "-"}</td>
              <td className="text-center">{bill.wBefore ?? "-"}</td>
              <td className="text-center">{bill.wUnits ?? "-"}</td>
              <td className="text-center">{bill.waterCost.toLocaleString()}</td>
            </tr>
            <tr>
              <th className="text-center">ค่าส่วนกลาง</th>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">{bill.service.toLocaleString()}</td>
            </tr>
            <tr>
              <th className="text-center">ค่าเช่าห้อง</th>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">{bill.rent.toLocaleString()}</td>
            </tr>
            <tr>
              <th className="text-center">ค่าปรับ</th>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">{bill.fine.toLocaleString()}</td>
            </tr>
            <tr className="table-success fw-bold">
              <th colSpan={4} className="text-end ">
                รวม
              </th>
              <td className="text-center">{bill.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
{/* ปุ่มชำระเงินจะแสดงเฉพาะเมื่อสถานะบิล = 0 (รอชำระ) */}
{bill.status === 0 && (
  <div className="text-center mt-4">
    <p className="mb-2 text-muted">
      คุณสามารถกดปุ่มด้านล่างเพื่อไปยังหน้าชำระเงินผ่าน LIFF ได้ทันที
    </p>
    <a
      href={`https://liff.line.me/2008099518-RGPO9wep?billId=${bill.billId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-success px-4 py-2 fw-bold shadow-sm"
      style={{
        borderRadius: "10px",
        fontSize: "1.1rem",
      }}
    >
      ไปหน้าชำระเงินผ่าน LINE
    </a>
  </div>
)}

      </div>
    </div>
  );
}
