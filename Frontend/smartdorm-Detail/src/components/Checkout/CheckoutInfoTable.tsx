import type { Booking } from "../../types/checkout";
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
      <h5 className="fw-bold text-success text-center mt-3 mb-3">
        รายละเอียดการคืนห้อง
      </h5>

      <table className="table table-sm table-bordered">
        {/*  หัวตาราง */}
        <thead className="text-center" style={{ backgroundColor: "#d1e7dd" }}>
          <tr>
            <th style={{ width: "40%" }}>รายการ</th>
            <th>ข้อมูล</th>
          </tr>
        </thead>

        {/*  เนื้อหาตาราง */}
        <tbody>
          <CheckoutInfoRow label="วันจอง" value={formatThaiDate(booking.createdAt)} />
          <CheckoutInfoRow label="วันขอเข้าพัก" value={formatThaiDate(booking.checkin)} />
          <CheckoutInfoRow label="วันเข้าเช็คอิน" value={formatThaiDate(booking.actualCheckin)} />
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
