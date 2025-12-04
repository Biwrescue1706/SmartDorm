// Booking/src/pages/BookingDetail.tsx
import { useParams } from "react-router-dom";
import { useBookingDetail } from "../hooks/useBookingDetail";
import CustomerInfoTable from "../components/Booking/CustomerInfoTable";
import BookingInfoTable from "../components/Booking/BookingInfoTable";
import NavBar from "../components/NavBar"; // 👈 ใช้ Navbar ใหม่

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { booking, loading } = useBookingDetail(bookingId);

  if (loading)
    return (
      <>
        <NavBar />
        <div className="container text-center py-5" style={{ paddingTop: 80 }}>
          <div className="spinner-border text-primary"></div>
          <p className="text-muted mt-2">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </>
    );

  if (!booking)
    return (
      <>
        <NavBar />
        <div className="container text-center py-5" style={{ paddingTop: 80 }}>
          <h5 className="text-danger fw-bold">ไม่พบข้อมูลการจอง</h5>
        </div>
      </>
    );

  return (
    <>
      <NavBar />

      <div
        className="container d-flex justify-content-center"
        style={{
          paddingTop: "100px",
          paddingBottom: "40px",
          minHeight: "100vh",
          background: "linear-gradient(135deg,#eef9ff,#e7fff1)",
        }}
      >
        <div
          className="card shadow-lg border-0 rounded-4 w-100"
          style={{ maxWidth: "520px" }}
        >
          {/* Header */}
          <div
            className="text-center text-white p-4 rounded-top-4"
            style={{
              background: "linear-gradient(135deg,#6FF5C2,#38A3FF)",
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src="https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png"
              alt="SmartDorm Logo"
              style={{
                width: "85px",
                height: "85px",
                borderRadius: "12px",
                background: "white",
                padding: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,.2)",
              }}
            />
            <h3 className="fw-bold mt-3">รายละเอียดการจองห้องพัก</h3>
            <small className="opacity-75">รหัสการจอง #{booking.bookingId}</small>
          </div>

          {/* ลายน้ำ เช็คอินแล้ว */}
          {booking.checkinStatus === 1 && (
            <div
              style={{
                position: "absolute",
                top: "43%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-18deg)",
                fontSize: "3.8rem",
                fontWeight: "900",
                color: "rgba(0,145,0,0.18)",
                textTransform: "uppercase",
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              ✓ เช็คอินแล้ว
            </div>
          )}

          <div className="card-body p-4">
            <CustomerInfoTable booking={booking} customer={booking.customer} />
            <BookingInfoTable booking={booking} />
          </div>
        </div>
      </div>
    </>
  );
}