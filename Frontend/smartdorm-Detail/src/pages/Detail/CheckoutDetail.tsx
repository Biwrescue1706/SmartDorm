// src/pages/CheckoutDetail.tsx
import { useParams } from "react-router-dom";
import CheckoutNav from "../../components/CheckoutNav";
import { useCheckoutDetail } from "../../hooks/Checkout/useCheckoutDetail";

/* utils */
const formatThaiDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* Badge */
const StatusBadge = ({ text, color }: { text: string; color: string }) => (
  <span
    className="px-3 py-1 fw-semibold rounded-pill"
    style={{ background: color, color: "#fff", fontSize: "0.8rem" }}
  >
    {text}
  </span>
);

export default function CheckoutDetail() {
  const { checkoutId } = useParams();
  const { checkout, loading } = useCheckoutDetail(checkoutId);

  /* Loading */
  if (loading) {
    return (
      <>
        <CheckoutNav />
        <div className="container text-center py-5 mt-5">
          <div className="spinner-border text-primary" />
          <p className="mt-3 fw-semibold text-black">
            กำลังโหลดข้อมูลการคืนห้อง...
          </p>
        </div>
      </>
    );
  }

  /* Not found */
  if (!checkout) {
    return (
      <>
        <CheckoutNav />
        <div className="container text-center py-5 mt-5">
          <h5 className="fw-bold text-danger">ไม่พบข้อมูลการคืนห้อง</h5>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutNav />

      {/* Watermark เช็คเอาท์แล้ว */}
      {checkout.checkoutStatus === 1 && (
        <div
          className="position-fixed top-50 start-50 fw-bold text-danger"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            opacity: 0.2,
            transform: "translate(-50%, -50%) rotate(-30deg)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
            whiteSpace: "nowrap",
          }}
        >
          เช็คเอาท์แล้ว
        </div>
      )}

      <div className="container-fluid pt-5 mt-4 mb-5">
        <div
          className="card shadow-lg border-0 rounded-4 mx-auto"
          style={{ maxWidth: "720px" }}
        >
          <div className="card-body p-4">
            <h4 className="fw-bold text-center text-success mb-3">
              🧾 รายละเอียดการคืนห้อง
            </h4>

            {/* ข้อมูลผู้เช่า */}
            <table className="table table-sm text-center align-middle mb-4">
              <tbody>
                <tr>
                  <td className="fw-semibold text-black">รหัสการจอง</td>
                  <td className="fw-semibold text-black">
                    {checkout.booking.bookingId}
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold text-black">ห้อง</td>
                  <td className="fw-semibold text-black">
                    {checkout.room.number}
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold text-black">ชื่อผู้เช่า</td>
                  <td className="fw-semibold text-black">
                    {checkout.booking.fullName || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold text-black">เบอร์โทร</td>
                  <td className="fw-semibold text-black">
                    {checkout.booking.cphone || "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* สถานะ */}
            <table className="table table-sm text-center align-middle">
              <tbody>
                <tr>
                  <td className="fw-semibold text-black">วันที่ขอคืน</td>
                  <td className="fw-semibold text-black">
                    {formatThaiDate(checkout.checkout)}
                  </td>
                </tr>
                <tr>
  <td className="fw-semibold text-black">สถานะคำขอ</td>
  <td>
    {checkout.ReturnApprovalStatus === 0 && (
      <StatusBadge text="รออนุมัติ" color="#F9A825" />
    )}
    {checkout.ReturnApprovalStatus === 1 && (
      <StatusBadge text="อนุมัติแล้ว" color="#2E7D32" />
    )}
    {checkout.ReturnApprovalStatus === 2 && (
      <StatusBadge text="ปฏิเสธ" color="#C62828" />
    )}
  </td>
</tr>

<tr>
  <td className="fw-semibold text-black">วันที่อนุมัติ</td>
  <td className="fw-semibold text-black">
    {checkout.RefundApprovalDate
      ? formatThaiDate(checkout.RefundApprovalDate)
      : "-"}
  </td>
</tr>

{checkout.checkoutAt && (
  <tr>
    <td className="fw-semibold text-black">วันที่เช็คเอาท์</td>
    <td className="fw-semibold text-black">
      {formatThaiDate(checkout.checkoutAt)}
    </td>
  </tr>
)}
                {checkout.checkoutAt && (
  <tr>
    <td className="fw-semibold text-black">สถานะเช็คเอาท์</td>
    <td>
      {checkout.checkoutStatus === 1 && (
        <StatusBadge text="เช็คเอาท์แล้ว" color="#2E7D32" />
      )}
    </td>
  </tr>
)}
              </tbody>
            </table>

            <div className="text-center fw-semibold text-black mt-3">
              หากข้อมูลไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
