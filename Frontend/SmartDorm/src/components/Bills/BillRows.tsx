import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

interface BillRowProps {
  index: number;
  room: Room;
  booking?: Booking;
  hasBill: boolean;
  canCreateBill: boolean;
  formatThaiDate: (date: string) => string;
  onCreateBill: (room: Room) => void;
}

export default function BillRow({
  index,
  room,
  booking,
  hasBill,
  canCreateBill,
  formatThaiDate,
  onCreateBill,
}: BillRowProps) {
  // 🗓️ แปลงวันที่ ถ้าไม่มีให้แสดง "-"
  const checkin =
    booking?.checkin && booking.checkin !== "0"
      ? formatThaiDate(booking.checkin)
      : "-";

  const actual =
    booking?.actualCheckin && booking.actualCheckin !== 0
      ? formatThaiDate(booking.actualCheckin)
      : "-";

  // ✅ แสดงปุ่มเฉพาะเมื่อ actualCheckin มีค่า และยังไม่ออกบิล
  const canShowButton =
    canCreateBill &&
    !hasBill &&
    booking?.actualCheckin &&
    booking.actualCheckin !== 0;

  return (
    <tr key={room.roomId}>
      <td>{index + 1}</td>
      <td>{room.number}</td>
      <td>{booking?.customer.userName || "-"}</td>
      <td>{room.rent.toLocaleString()}</td>
      <td>{checkin}</td>
      <td>{actual}</td>
      <td>
        {hasBill ? (
          <button className="btn btn-success btn-sm fw-semibold" disabled>
            ✅ ออกแล้ว
          </button>
        ) : canShowButton ? (
          <button
            className="btn btn-primary btn-sm fw-semibold"
            onClick={() => onCreateBill(room)}
          >
            ออกบิล
          </button>
        ) : (
          ""
        )}
      </td>
    </tr>
  );
}
