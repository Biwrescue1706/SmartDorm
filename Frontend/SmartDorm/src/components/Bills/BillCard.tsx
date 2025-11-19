import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

interface Props {
  room: Room;
  booking?: Booking;
  hasBill: boolean;
  canCreateBill: boolean;
  formatThaiDate: (date: string) => string;
  onCreateBill: (room: Room) => void;
}

export default function BillCard({
  room,
  booking,
  hasBill,
  canCreateBill,
  formatThaiDate,
  onCreateBill,
}: Props) {
  return (
    <div
      className="p-3 rounded-4 shadow-sm"
      style={{
        background: "#f1f1f1",
        transition: "0.2s",
        border: "1px solid #ddd",
      }}
    >
      <h5 className="fw-bold text-center mb-2">ห้อง {room.number}</h5>

      <p className="mb-1">
        <b>LINE :</b> {booking?.customer?.userName || "-"}
      </p>
      <p className="mb-1">
        <b>ค่าเช่า :</b> {room.rent.toLocaleString()}
      </p>
      <p className="mb-1">
        <b>ขอเข้าพัก :</b>{" "}
        {booking?.checkin ? formatThaiDate(booking.checkin) : "-"}
      </p>
      <p className="mb-2">
        <b>เข้าพักจริง :</b>{" "}
        {booking?.actualCheckin ? formatThaiDate(booking.actualCheckin) : "-"}
      </p>

      {/* ปุ่มออกบิล */}
      {!hasBill && booking?.actualCheckin && canCreateBill && (
        <button
          className="btn w-100 fw-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #11998e, #38ef7d)",
            borderRadius: "10px",
            border: "none",
          }}
          onClick={() => onCreateBill(room)}
        >
          ออกบิล
        </button>
      )}

      {/* ออกบิลแล้ว */}
      {hasBill && (
        <div className="text-center fw-bold text-success mt-2">ออกบิลแล้ว</div>
      )}
    </div>
  );
}
