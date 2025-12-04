// src/pages/BillDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingNav from "../components/BookingNav";
import { API_BASE } from "../config";

/* ===================== TYPES ===================== */
interface Room { 
number: string; 
}
interface Booking { 
fullName?: string; 
}
interface Customer { 
userName: string; 
}

interface Bill {
  billId: string;
  month: string;
  rent: number; 
service: number; 
fine: number;
  wBefore: number; 
wAfter: number; 
wUnits: number; 
waterCost: number;
  eBefore: number; 
eAfter: number; 
eUnits: number; 
electricCost: number;
  total: number; 
dueDate: string; 
status: number;
  room: Room; 
booking?: Booking; 
customer?: Customer;
}

/* ===================== FORMAT DATE ===================== */
const formatThai = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

export default function BillDetail() {
  const { billId } = useParams();
  const [bill, setBill] = useState<Bill | null>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/bill/${billId}`).then(res => setBill(res.data));
  }, [billId]);

  if (!bill) return <div className="p-5 text-center text-danger">ไม่พบบิลนี้</div>;

  const fullName = bill.booking?.fullName || bill.customer?.userName || "-";
  const statusColor = bill.status === 1 ? "success" : bill.status === 0 ? "warning" : "danger";
  const statusText = bill.status === 1 ? "ชำระแล้ว" : bill.status === 0 ? "รอชำระ" : "เกินกำหนด";

  return (
    <>
      <BookingNav />

      <div
        style={{
          paddingTop: "90px",
          background: "#F2F8FA",
          minHeight: "100vh",
          fontFamily: "Prompt, sans-serif",
        }}
      >
        <div
          className="container shadow rounded-4 p-4"
          style={{
            maxWidth: "640px",
            background: "white",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-4">
            <div
              className="rounded-4 py-3 text-white fw-bold shadow-sm"
              style={{
                background: "linear-gradient(135deg,#00C4FF,#0083FF)",
                fontSize: "1.25rem",
              }}
            >
              รายละเอียดบิลค่าเช่าห้อง
            </div>

            <h5 className="fw-bold text-secondary mt-3">🏫 SmartDorm</h5>
          </div>

          {/* BILL INFO */}
          <div className="bg-light p-3 rounded border mb-3">
            <p className="mb-1"><strong>ผู้เช่า :</strong> {fullName}</p>
            <p className="mb-1"><strong>ห้อง :</strong> {bill.room.number}</p>
            <p className="mb-1">
              <strong>ประจำเดือน :</strong>{" "}
              {new Date(bill.month).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>

            {bill.status === 0 && (
              <p className="mb-1 text-danger fw-semibold">
                <strong>ครบกำหนดชำระ :</strong> {formatThai(bill.dueDate)}
              </p>
            )}

            <p className="mb-1">
              <strong>สถานะ :</strong>{" "}
              <span className={`badge bg-${statusColor}`}>{statusText}</span>
            </p>
          </div>

          {/* COST TABLE */}
          <h6 className="fw-bold text-primary text-center">รายละเอียดค่าใช้จ่าย</h6>

          <table className="table table-sm table-hover text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>รายการ</th>
                <th>หน่วยเดือนหลัง</th>
                <th>หน่วยเดือนก่อน</th>
                <th>หน่วยที่ใช่</th>
                <th>จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              <tr>
<td>ค่าไฟฟ้า</td>
<td>{bill.eAfter}</td>
<td>{bill.eBefore}</td>
<td>{bill.eUnits}</td>
<td>{bill.electricCost.toLocaleString()}</td>
</tr>
              <tr>
<td>ค่าน้ำ</td>
<td>{bill.wAfter}</td>
<td>{bill.wBefore}</td>
<td>{bill.wUnits}</td>
<td>{bill.waterCost.toLocaleString()}</td>
</tr>
              <tr>
<td>ค่าเช่า</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>{bill.rent.toLocaleString()}</td>
</tr>
              <tr>
<td>ค่าส่วนกลาง</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>{bill.service.toLocaleString()}</td>
</tr>
              <tr>
<td>ค่าปรับ</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>{bill.fine.toLocaleString()}</td>
</tr>

<tr>
                <td colSpan={4} className="text-end">รวมทั้งหมด</td>
                <td  className="text-primary fs-5">{bill.total.toLocaleString()}</td>
              </tr>

            </tbody>
          </table>

          {/* PAYMENT BUTTON */}
          {bill.status === 0 && (
            <button
              className="btn fw-bold w-100 py-3 mt-3"
              style={{
                fontSize: "1.1rem",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#27C96D,#0AA04F)",
                color: "white",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
              onClick={() =>
                window.open(
                  `https://liff.line.me/2008099518-RGPO9wep?billId=${bill.billId}`,
                  "_blank"
                )
              }
            >
              ชำระเงินผ่าน LINE
            </button>
          )}
        </div>
      </div>
    </>
  );
}