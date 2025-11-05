import { useParams } from "react-router-dom";
import { useCheckoutDetail } from "../hooks/useCheckoutDetail";
import CustomerInfoTable from "../components/Checkout/CustomerInfoTable";
import CheckoutInfoTable from "../components/Checkout/CheckoutInfoTable";

export default function CheckoutDetail() {
  const { bookingId } = useParams();
  const { booking, loading } = useCheckoutDetail(bookingId);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-3">กำลังโหลดข้อมูลการคืนห้อง...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container text-center py-5">
        <h5 className="text-danger">ไม่พบข้อมูลการคืนห้อง</h5>
      </div>
    );
  }

  return (
    <div className="container my-4 text-center position-relative">
      {/* ✅ ลายน้ำ “คืนห้องแล้ว” */}
      {booking.returnStatus === 1 && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-25deg)",
            fontSize: "5rem",
            fontWeight: "bold",
            color: "rgba(25, 135, 84, 0.15)",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 999,
            whiteSpace: "nowrap",
          }}
        >
          คืนห้องแล้ว
        </div>
      )}

      <div
        className="card shadow-lg border-0 rounded-4 mx-auto"
        style={{ maxWidth: "480px", background: "white" }}
      >
        <div
          className="card-header text-white text-center fw-bold fs-5"
          style={{ background: "linear-gradient(90deg, #198754, #00b09b)" }}
        >
          รายละเอียดการคืนห้องพัก
        </div>

        <div className="card-body p-3 text-center">
          <CustomerInfoTable booking={booking} customer={booking.customer} />
          <CheckoutInfoTable booking={booking} />
        </div>
      </div>
    </div>
  );
}
