import { useParams } from "react-router-dom";
import { useBookingDetail } from "../hooks/useBookingDetail";
import CustomerInfoTable from "../components/Booking/CustomerInfoTable";
import BookingInfoTable from "../components/Booking/BookingInfoTable";
import BookingNav from "../components/BookingNav";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { booking, loading } = useBookingDetail(bookingId);

  /* =======================
     Loading
  ======================= */
  if (loading) {
    return (
      <>
        <BookingNav />
        <div className="container text-center py-5 mt-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </>
    );
  }

  /* =======================
     Not found
  ======================= */
  if (!booking) {
    return (
      <>
        <BookingNav />
        <div className="container text-center py-5 mt-4">
          <h5 className="text-danger">ไม่พบข้อมูลการจอง</h5>
        </div>
      </>
    );
  }

  return (
    <>
      <BookingNav />

      {/* =======================
         Watermark (เฉียง / ทุกขนาดจอ)
      ======================= */}
      {booking.checkinStatus === 1 && (
        <div
          className="position-fixed top-50 start-50 fw-bold text-danger"
          style={{
            transform: "translate(-50%, -50%) rotate(-25deg)",
            fontSize: "clamp(3rem, 6vw, 4.2rem)",
            opacity: 0.18,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 2,
            whiteSpace: "nowrap",
          }}
        >
          เช็คอินแล้ว
        </div>
      )}

      {/* =======================
         Content (การ์ดใบเดียว)
      ======================= */}
      <div className="container-fluid pt-5 mt-3 mb-5">
        <div
          className="card shadow-lg border-0 rounded-4 mx-auto"
          style={{
            width: "100%",
            maxWidth: "680px", // default ≥1400
          }}
        >
          <div
            className="card-body p-3 p-sm-4"
            style={{
              /* คุมขนาดการ์ดตามหน้าจอแบบไม่แยก JSX */
              maxWidth: "100%",
            }}
          >
            <h4 className="fw-bold text-success text-center">🏫 SmartDorm</h4>
            <h6 className="text-secondary text-center mb-3">
              รายละเอียดการจองหอพัก
            </h6>

            <CustomerInfoTable booking={booking} customer={booking.customer} />

            <BookingInfoTable booking={booking} />

            <div className="small text-muted text-center mt-3">
              📌 กรุณาติดต่อเจ้าหน้าที่ หากข้อมูลไม่ถูกต้อง
            </div>
          </div>
        </div>
      </div>

      {/* =======================
         Responsive Width (inline CSS)
         - <600   → 480px
         - <1400  → 580px
         - ≥1400  → 680px
      ======================= */}
      <style>{`
        @media (max-width: 599px) {
          .card {
            max-width: 480px !important;
          }
        }
        @media (min-width: 600px) and (max-width: 1399px) {
          .card {
            max-width: 580px !important;
          }
        }
        @media (min-width: 1400px) {
          .card {
            max-width: 680px !important;
          }
        }
      `}</style>
    </>
  );
}
