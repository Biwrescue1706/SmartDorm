import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";

interface Room {
  number: string;
  size?: string;
}

interface Customer {
  fullName: string;
  cphone: string;
}

interface Bill {
  billId: string;
  month: string;
  total: number;
  rent: number;
  service: number;
  waterCost: number;
  electricCost: number;
  fine: number;
  dueDate: string;
  status: number;
  room: Room;
  customer: Customer;
  createdAt: string;
}

/* 🗓️ ฟังก์ชันแปลงวันที่ไทย */
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

  const statusText =
    bill.status === 1
      ? "✅ ชำระแล้ว"
      : bill.status === 0
      ? "⌛ รอชำระ"
      : "❌ เกินกำหนด";

  const statusColor =
    bill.status === 1 ? "success" : bill.status === 0 ? "warning" : "danger";

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
          className="mb-2"
          style={{ width: "120px" }}
        />
        <h4 className="fw-bold text-success">🏫 SmartDorm 🎉</h4>
        <h5 className="mt-2 fw-bold text-secondary">บิลค่าเช่าห้อง</h5>
      </div>

      {/* Bill Info */}
      <div className="border rounded p-3 bg-light mb-3">
        <p className="mb-1">
          <strong>รหัสบิล:</strong> {bill.billId}
        </p>
        <p className="mb-1">
          <strong>ห้อง:</strong> {bill.room?.number || "-"}
        </p>
        <p className="mb-1">
          <strong>ชื่อผู้เช่า:</strong> {bill.customer?.fullName}
        </p>
        <p className="mb-1">
          <strong>เบอร์โทร:</strong> {bill.customer?.cphone}
        </p>
        <p className="mb-1">
          <strong>เดือน:</strong>{" "}
          {new Date(bill.month).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
          })}
        </p>
        <p className="mb-1">
          <strong>วันที่ออกบิล:</strong> {formatThaiDate(bill.createdAt)}
        </p>
        <p className="mb-1">
          <strong>ครบกำหนดชำระ:</strong>{" "}
          <span className="text-danger">{formatThaiDate(bill.dueDate)}</span>
        </p>
        <span className={`badge bg-${statusColor}`}>{statusText}</span>
      </div>

      {/* Cost Breakdown */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <tbody>
            <tr>
              <th>ค่าเช่าห้อง</th>
              <td>{bill.rent.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <th>ค่าส่วนกลาง</th>
              <td>{bill.service.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <th>ค่าน้ำ</th>
              <td>{bill.waterCost.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <th>ค่าไฟ</th>
              <td>{bill.electricCost.toLocaleString()} บาท</td>
            </tr>
            {bill.fine > 0 && (
              <tr>
                <th className="text-danger">ค่าปรับ</th>
                <td className="text-danger">{bill.fine.toLocaleString()} บาท</td>
              </tr>
            )}
            <tr className="table-success fw-bold">
              <th>ยอดรวมทั้งหมด</th>
              <td>{bill.total.toLocaleString()} บาท</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <a
          href="https://smartdorm-paymentbill.biwbong.shop"
          className="btn btn-success w-100"
        >
          💳 ชำระบิลนี้
        </a>
        <p className="text-muted mt-3 small">
          ขอบคุณที่ใช้บริการ 🏫 SmartDorm 🎉
        </p>
      </div>
    </div>
  );
}
