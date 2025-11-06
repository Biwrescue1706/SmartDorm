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
      <h5 className="fw-bold text-primary text-center mt-3 mb-3">
        รายละเอียดการจอง
      </h5>
      <table className="table table-sm table-bordered">
        <thead>
          <tr className="table-light text-center">
            <th style={{ width: "40%" }}>รายการ</th>
            <th>ข้อมูล</th>
          </tr>
        </thead>
        <tbody>
          <BookingInfoRow
            label="วันจอง"
            value={formatThaiDate(booking.createdAt)}
          />
          <BookingInfoRow
            label="วันขอเข้าพัก"
            value={formatThaiDate(booking.checkin)}
          />
          <BookingInfoRow
            label="วันเข้าเช็คอิน"
            value={formatThaiDate(booking.actualCheckin)}
          />
          <BookingInfoRow
            label="สถานะการจอง"
            value={
              <StatusBadge type="approve" status={booking.approveStatus} />
            }
          />
          {booking.approveStatus === 1 && (
            <BookingInfoRow
              label="สถานะการเช็คอิน"
              value={
                <StatusBadge type="checkin" status={booking.checkinStatus} />
              }
            />
          )}
        </tbody>
      </table>
    </div>
  );
}
