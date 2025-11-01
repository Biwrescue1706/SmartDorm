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
  const checkin = booking ? formatThaiDate(booking.checkin) : "-";
  const actual = booking ? formatThaiDate(booking.actualCheckin) : "-";

  return (
    <tr key={room.roomId}>
      <td>{index + 1}</td>
      <td>{room.number}</td>
      <td>{booking?.customer.userName || "-"}</td>
      <td>{room.rent.toLocaleString()}</td>
      <td>{checkin}</td>
      <td>{actual}</td>
      <td>
        {canCreateBill && !hasBill ? (
          <button
            className="btn btn-primary btn-sm fw-semibold"
            onClick={() => onCreateBill(room)}
          >
            ออกบิล
          </button>
        ) : hasBill ? (
          <button className="btn btn-success btn-sm fw-semibold" disabled>
            ✅ ออกแล้ว
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm fw-semibold" disabled>
            ออกบิล
          </button>
        )}
      </td>
    </tr>
  );
}
