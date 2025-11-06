import { useParams } from "react-router-dom";
import { useBookingDetail } from "../hooks/useBookingDetail";
import CustomerInfoTable from "../components/Booking/CustomerInfoTable";
import BookingInfoTable from "../components/Booking/BookingInfoTable";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { booking, loading } = useBookingDetail(bookingId);

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
      </div>
    );
  }
  return (
    <div className="container my-4 text-center position-relative">
      {/* ✅ ลายน้ำ “เช็คอินแล้ว” */}
      {booking.checkinStatus === 1 && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "45%",
            transform: "translate(-50%, -50%) rotate(-25deg)",
            fontSize: "3.5rem",
            fontWeight: "bold",
            color: "#ff000050",
            textTransform: "uppercase",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 999,
            whiteSpace: "nowrap",
          }}
        >
          เช็คอินแล้ว
        </div>
      )}

      <div
        className="card shadow-lg border-0 rounded-4 mx-auto"
        style={{ maxWidth: "480px", background: "white" }}
      >
        {/* Header */}
        <div className="card-header text-white text-center fw-bold fs-5">
          <img
            src="https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png"
            alt="SmartDorm Logo"
            className="mb-0"
            style={{ width: "80px", height: "80px" }}
          />
          <h4 className="mt-2 fw-bold text-success">🏫 SmartDorm 🎉</h4>
          <h5 className="mt-2 fw-bold text-secondary">รายละเอียดการจองห้องพัก</h5>
        </div>
        <div className="card-body p-3 text-center">
          <CustomerInfoTable booking={booking} customer={booking.customer} />
          <BookingInfoTable booking={booking} />
        </div>
      </div>
    </div>
  );
}
