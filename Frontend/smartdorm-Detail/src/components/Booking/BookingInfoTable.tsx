// Booking/components/Booking/BookingInfoTable.tsx
import type { Booking } from "../../types/booking";
import BookingInfoRow from "./BookingInfoRow";
import StatusBadge from "./StatusBadge";

const formatThaiDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

export default function BookingInfoTable({ booking }: { booking: Booking }) {
  return (
    <div>
      <h5 className="fw-bold text-primary text-center mb-3">รายละเอียดการจอง</h5>

      <table className="table table-sm table-bordered text-center align-middle shadow-sm">
        <thead className="table-light">
          <tr>
            <th>รายการ</th>
            <th>ข้อมูล</th>
          </tr>
        </thead>

        <tbody>
          <BookingInfoRow label="วันจอง" value={formatThaiDate(booking.createdAt)} />
          <BookingInfoRow label="วันที่ขอเข้าพัก" value={formatThaiDate(booking.checkin)} />
          
          <BookingInfoRow
            label="สถานะการจอง"
            value={<StatusBadge type="approve" status={booking.approveStatus} />}
          />

          {booking.approveStatus === 1 && (
            <BookingInfoRow
              label="สถานะเช็คอิน"
              value={<StatusBadge type="checkin" status={booking.checkinStatus} />}
            />
          )}
{booking.actualCheckin !== null &&(
          <BookingInfoRow label="วันเข้าเช็คอิน" value={formatThaiDate(booking.actualCheckin)} />
)}
        </tbody>
      </table>
    </div>
  );
}