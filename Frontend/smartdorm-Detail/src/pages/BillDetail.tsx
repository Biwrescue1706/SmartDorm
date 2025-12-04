// src/pages/BillDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingNav from "../components/BookingNav";
import { API_BASE } from "../config";

/* ===================== TYPES ===================== */
interface Room { number: string }
interface Booking { fullName?: string }
interface Customer { userName: string }
interface Bill {
  billId: string;
  month: string;
  rent: number; service: number; fine: number;
  wBefore: number; wAfter: number; wUnits: number; waterCost: number;
  eBefore: number; eAfter: number; eUnits: number; electricCost: number;
  total: number; dueDate: string; status: number;
  room: Room; booking?: Booking; customer?: Customer;
}

/* ===================== FORMAT DATE ===================== */
const formatThai = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric"
  });

export default function BillDetail() {
  const { billId } = useParams();
  const [bill, setBill] = useState<Bill | null>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/bill/${billId}`).then((res) => setBill(res.data));
  }, [billId]);

  if (!bill)
    return (
      <>
        <BookingNav />
        <div className="vh-100 d-flex justify-content-center align-items-center text-danger fw-bold">
          ❌ ไม่พบบิลนี้
        </div>
      </>
    );

  const fullName = bill.booking?.fullName || bill.customer?.userName || "-";
  const statusText =
    bill.status === 1 ? "ชำระแล้ว" : bill.status === 0 ? "รอชำระ" : "เกินกำหนด";
  const statusColor =
    bill.status === 1 ? "success" : bill.status === 0 ? "warning" : "danger";

  return (
    <>
      <BookingNav />

      <div
        style={{
          background: "#F2F8FA",
          minHeight: "100vh",
          fontFamily: "Prompt, sans-serif",
        }}
      >
        <div
          className="container shadow-lg rounded-4 p-4 mt-5" // ⭐ ใช้ mt-5 แทน paddingTop
          style={{
            maxWidth: "650px",
            background: "white",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* HEADER */}
          <div
            className="text-white text-center fw-bold py-3 rounded-4 shadow-sm"
            style={{
              background: "linear-gradient(135deg,#00C4FF,#0083FF)",
              fontSize: "1.3rem",
            }}
          >
            รายละเอียดบิลค่าเช่าห้อง
          </div>

          <h5 className="fw-bold text-secondary text-center mt-3">
            🏫 SmartDorm
          </h5>

          {/* BILL INFO */}
          <div className="bg-light p-3 rounded border mb-3 mt-2">
            <p className="mb-1"><strong>ผู้เช่า :</strong> {fullName}</p>
            <p className="mb-1"><strong>ห้อง :</strong> {bill.room.number}</p>
            <p className="mb-1">
              <strong>ประจำเดือน :</strong>{" "}
              {new Date(bill.month).toLocaleDateString("th-TH", {
                year: "numeric", month: "long"
              })}
            </p>

            {bill.status === 0 && (
              <p className="text-danger fw-semibold mb-1">
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
          <table className="table table-sm table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>รายการ</th>
                <th>เดือนหลัง</th>
                <th>เดือนก่อน</th>
                <th>ใช้</th>
                <th>จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>ค่าไฟฟ้า</td><td>{bill.eAfter}</td><td>{bill.eBefore}</td><td>{bill.eUnits}</td><td>{bill.electricCost.toLocaleString()}</td></tr>
              <tr><td>ค่าน้ำ</td><td>{bill.wAfter}</td><td>{bill.wBefore}</td><td>{bill.wUnits}</td><td>{bill.waterCost.toLocaleString()}</td></tr>
              <tr><td>ค่าเช่า</td><td>-</td><td>-</td><td>-</td><td>{bill.rent.toLocaleString()}</td></tr>
              <tr><td>ค่าส่วนกลาง</td><td>-</td><td>-</td><td>-</td><td>{bill.service.toLocaleString()}</td></tr>
              <tr><td>ค่าปรับ</td><td>-</td><td>-</td><td>-</td><td>{bill.fine.toLocaleString()}</td></tr>
            </tbody>
            <tfoot className="table-success fw-bold">
              <tr>
                <td colSpan={4} className="text-end">รวมทั้งหมด</td>
                <td className="text-primary fs-5">{bill.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {/* PAY BUTTON */}
          {bill.status === 0 && (
            <button
              className="btn fw-bold w-100 py-3 mt-3"
              style={{
                borderRadius: "14px",
                background: "linear-gradient(135deg,#27C96D,#0AA04F)",
                color: "white",
                fontSize: "1.15rem",
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