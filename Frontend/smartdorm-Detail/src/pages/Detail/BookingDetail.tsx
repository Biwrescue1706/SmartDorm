// src/pages/BookingDetail.tsx
import { useParams } from "react-router-dom";
import BookingNav from "../../components/BookingNav";
import { useBookingDetail } from "../../hooks/Booking/useBookingDetail";

/* utils */
const formatThaiDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { booking, loading } = useBookingDetail(bookingId);

  if (loading) {
    return (
      <>
        <BookingNav />
        <div className="container text-center py-5 mt-5">
          <div className="spinner-border text-primary" />
          <p className="mt-3">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <BookingNav />
        <div className="container text-center py-5 mt-5">
          <h5 className="text-danger">ไม่พบข้อมูลการจอง</h5>
        </div>
      </>
    );
  }

  return (
    <>
      <BookingNav />

      {/* Watermark ทุกขนาดจอ */}
      {booking.checkinStatus === 1 && (
        <div
          className="position-fixed top-50 start-50 fw-bold text-danger"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            opacity: 0.25,
            transform: "translate(-50%, -50%) rotate(-30deg)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
            whiteSpace: "nowrap",
          }}
        >
          เช็คอินแล้ว
        </div>
      )}

      <div className="container-fluid pt-5 mt-4 mb-5">
        <div
          className="card shadow-lg border-0 rounded-4 mx-auto"
          style={{
            maxWidth:
              window.innerWidth < 600
                ? "480px"
                : window.innerWidth < 1400
                ? "580px"
                : "680px",
            width: "100%",
          }}
        >
          <div className="card-body p-3 p-sm-4">
            <h4 className="fw-bold text-success text-center">
              🧾 รายละเอียดการจองหอพัก
            </h4>

            {/* ข้อมูลผู้จอง */}
            <h4 className="fw-bold text-primary text-center mb-2">
              ข้อมูลผู้จอง
            </h4>

            <table className="table table-bordered table-sm text-center align-middle mb-4">
              <tbody>
                <tr>
                  <td>รหัสการจอง</td>
                  <td>{booking.bookingId}</td>
                </tr>
                <tr>
                  <td>ห้อง</td>
                  <td>{booking.room.number}</td>
                </tr>
                <tr>
                  <td>ชื่อ-สกุล</td>
                  <td>{booking.fullName ?? "-"}</td>
                </tr>
                <tr>
                  <td>เบอร์โทร</td>
                  <td>{booking.cphone ?? "-"}</td>
                </tr>
                <tr>
                  <td>LINE ผู้ใช้</td>
                  <td>{booking.customer?.userName ?? "-"}</td>
                </tr>
              </tbody>
            </table>

            {/* รายละเอียดการจอง */}
            <h4 className="fw-bold text-primary text-center mb-2">
              รายละเอียดการจอง
            </h4>

            <table className="table table-bordered table-sm text-center align-middle">
              <tbody>
                <tr>
                  <td>วันจอง</td>
                  <td>{formatThaiDate(booking.createdAt)}</td>
                </tr>
                <tr>
                  <td>วันที่แจ้งเข้าพัก</td>
                  <td>{formatThaiDate(booking.checkin)}</td>
                </tr>
                <tr>
                  <td>สถานะการจอง</td>
                  <td>
                    {booking.approveStatus === 0 && "รออนุมัติ"}
                    {booking.approveStatus === 1 && "อนุมัติแล้ว"}
                    {booking.approveStatus === 2 && "ไม่อนุมัติ"}
                  </td>
                </tr>

                {booking.approveStatus === 1 && (
                  <tr>
                    <td>สถานะเช็คอิน</td>
                    <td>
                      {booking.checkinStatus === 1
                        ? "เช็คอินแล้ว"
                        : "ยังไม่เช็คอิน"}
                    </td>
                  </tr>
                )}

                {booking.checkinAt && (
                  <tr>
                    <td>วันเข้าเช็คอิน</td>
                    <td>{formatThaiDate(booking.checkinAt)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="text-center small text-muted mt-3">
              📌 หากข้อมูลไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่
            </div>
          </div>
        </div>
      </div>
    </>
  );
}