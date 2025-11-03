import type { Booking } from "../../../types/pagesDetail/checkout";
import CheckoutInfoRow from "./CheckoutInfoRow";
import StatusBadge from "./StatusBadge";

const formatThaiDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CheckoutInfoTable({ booking }: { booking: Booking }) {
  return (
    <div className="mb-3">
      <h5 className="fw-bold text-success">รายละเอียดการคืนห้อง</h5>
      <table className="table table-sm table-bordered">
        <tbody>
          <CheckoutInfoRow label="วันที่เข้าพัก" value={formatThaiDate(booking.actualCheckin)} />
          <CheckoutInfoRow label="วันที่ขอคืน" value={formatThaiDate(booking.checkout)} />
          <CheckoutInfoRow label="วันที่คืนจริง" value={formatThaiDate(booking.actualCheckout)} />
          <CheckoutInfoRow
            label="สถานะการคืนห้อง"
            value={<StatusBadge type="return" status={booking.returnStatus} />}
          />
          <CheckoutInfoRow
            label="สถานะการเช็คเอาท์"
            value={<StatusBadge type="checkout" status={booking.checkoutStatus} />}
          />
        </tbody>
      </table>
    </div>
  );
}
