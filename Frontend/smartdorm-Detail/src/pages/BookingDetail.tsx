// Booking/src/pages/BookingDetail.tsx
import { useParams } from "react-router-dom";
import { useBookingDetail } from "../hooks/useBookingDetail";
import CustomerInfoTable from "../components/Booking/CustomerInfoTable";
import BookingInfoTable from "../components/Booking/BookingInfoTable";
import BookingNav from "../components/BookingNav";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { booking, loading } = useBookingDetail(bookingId);

  if (loading) {
    return (
      <>
        <BookingNav />
        <div className="container text-center py-5" style={{ paddingTop: "90px" }}>
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <BookingNav />
        <div className="container text-center py-5" style={{ paddingTop: "90px" }}>
          <h5 className="text-danger">ไม่พบข้อมูลการจอง</h5>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Navbar ใหม่ */}
      <BookingNav />

      <div className="container my-4 text-center">
        {/* Watermark เมื่อเช็คอินแล้ว */}
        {booking.checkinStatus === 1 && (
          <div
            style={{
              position: "fixed",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-25deg)",
              fontSize: "3.7rem",
              fontWeight: "bold",
              color: "#ff000050",
              textTransform: "uppercase",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            เช็คอินแล้ว
          </div>
        )}

        {/* Card รายละเอียด */}
        <div
          className="card shadow-lg border-0 rounded-4 mx-auto mt-4"
          style={{ maxWidth: "500px" }}
        >
          <div className="card-body p-3 text-center">
            
            <h4 className="mt-2 fw-bold text-success">🏫 SmartDorm 🎉</h4>
            <h5 className="mt-1 fw-bold text-secondary">รายละเอียดการจองหอพัก</h5>

            {/* ตารางข้อมูลผู้จอง */}
            <CustomerInfoTable booking={booking} customer={booking.customer} />

            {/* ตารางสถานะการจอง */}
            <BookingInfoTable booking={booking} />

            {/* Footer Note */}
            <div className="small text-muted mt-3">
              📌 กรุณาติดต่อเจ้าหน้าที่ หากข้อมูลไม่ถูกต้อง
            </div>
          </div>
        </div>
      </div>
    </>
  );
}