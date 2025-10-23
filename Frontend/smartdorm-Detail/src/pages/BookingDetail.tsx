import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { QRCodeCanvas } from "qrcode.react";

interface Room {
  number: string;
  size: string;
  rent: number;
  deposit: number;
  bookingFee: number;
}

interface Customer {
  fullName: string;
  cphone: string;
}

interface Booking {
  bookingId: string;
  room: Room;
  customer: Customer;
  slipUrl?: string;
  checkin: string;
  checkout?: string;
  approveStatus: number;
  createdAt: string;
  checkinStatus: number;
}

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`${API_BASE}/booking/${bookingId}`);
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error("❌ Fetch booking failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const renderStatus = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">รออนุมัติ</span>;
      case 1:
        return <span className="badge bg-success">อนุมัติแล้ว</span>;
      case 2:
        return <span className="badge bg-danger">ถูกปฏิเสธ</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  };

  const checkinStatus = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">ยังไม่เช็คอิน</span>;
      case 1:
        return <span className="badge bg-success">เช็คอินแล้ว</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">กำลังโหลดข้อมูลการจอง...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container text-center py-5">
        <h5 className="text-danger">ไม่พบข้อมูลการจอง</h5>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          กลับ
        </button>
      </div>
    );
  }

  // ✅ URL สำหรับ QR Code (ลิงก์ไปยังหน้ารายการจอง)
  const bookingUrl = `https://smartdorm-admin.biwbong.shop/bookings`;

  return (
    <div className="container my-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div
          className="card-header text-white text-center fw-bold fs-5"
          style={{ background: "linear-gradient(90deg, #007bff, #00d4ff)" }}
        >
          รายละเอียดการจองห้องพัก
        </div>

        <div className="card-body p-4">
          {/* 🧍‍♂️ ข้อมูลผู้จอง */}
          <div className="mb-3">
            <h5 className="fw-bold text-primary">ข้อมูลผู้จอง</h5>
            <table className="table table-sm table-bordered">
              <tbody>
                <tr>
                  <th>หมายเลขห้อง</th>
                  <td>{booking.room.number}</td>
                </tr>
                <tr>
                  <th>ชื่อ-สกุล</th>
                  <td>{booking.customer.fullName}</td>
                </tr>
                <tr>
                  <th>เบอร์โทร</th>
                  <td>{booking.customer.cphone}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 🏠 รายละเอียดการจอง */}
          <div className="mb-3">
            <h5 className="fw-bold text-primary">รายละเอียดการจอง</h5>
            <table className="table table-sm table-bordered">
              <tbody>
                <tr>
                  <th>วันที่เข้าพัก</th>
                  <td>{new Date(booking.checkin).toLocaleDateString("th-TH")}</td>
                </tr>
                <tr>
                  <th>วันที่จอง</th>
                  <td>{new Date(booking.createdAt).toLocaleDateString("th-TH")}</td>
                </tr>
                <tr>
                  <th>สถานะการจอง</th>
                  <td>{renderStatus(booking.approveStatus)}</td>
                </tr>
                <tr>
                  <th>สถานะการเช็คอิน</th>
                  <td>{checkinStatus(booking.checkinStatus)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 🎟️ QR Code แสดงเฉพาะถ้ายังไม่เช็คอิน */}
          {booking.checkinStatus === 0 && (
            <div className="text-center mt-4">
              <h5 className="fw-bold text-primary">🎟️ สแกนเพื่อดูข้อมูลการจอง</h5>
              <QRCodeCanvas
                value={bookingUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                includeMargin={true}
                className="shadow-sm mt-2"
              />
              <p className="mt-2 small text-muted">{bookingUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
