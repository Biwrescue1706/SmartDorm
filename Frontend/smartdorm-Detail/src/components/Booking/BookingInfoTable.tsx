import type { Booking } from "../../types/booking";
import BookingInfoRow from "./BookingInfoRow";
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

export default function BookingInfoTable({ booking }: { booking: Booking }) {
  return (
    <div className="mb-3">
      <h5 className="fw-bold text-primary">รายละเอียดการจอง</h5>
      <table className="table table-sm table-bordered">
        <tbody>
          <BookingInfoRow label="วันที่จอง" value={formatThaiDate(booking.createdAt)} />
          <BookingInfoRow label="วันที่ยื่นขอเข้าพัก" value={formatThaiDate(booking.checkin)} />
          <BookingInfoRow label="วันที่เข้าพักจริง" value={formatThaiDate(booking.actualCheckin)} />
          <BookingInfoRow
            label="สถานะการจอง"
            value={<StatusBadge type="approve" status={booking.approveStatus} />}
          />
          <BookingInfoRow
            label="สถานะการเช็คอิน"
            value={<StatusBadge type="checkin" status={booking.checkinStatus} />}
          />
        </tbody>
      </table>
    </div>
  );
}
