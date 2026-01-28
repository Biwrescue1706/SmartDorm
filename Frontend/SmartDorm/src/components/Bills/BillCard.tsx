// src/components/Bills/BillCard.tsx
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
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";

  return (
    <div
      className="p-3 rounded-4 shadow-sm"
      style={{
        background: "#FFFFFF",
        borderLeft: `6px solid ${SCB_PURPLE}`,
        borderRadius: "14px",
        boxShadow: "0 4px 8px rgba(0,0,0,.12)",
        transition: ".25s",
      }}
    >
      <h5
        className="fw-bold text-center justify-content-center"
        style={{ color: SCB_PURPLE, marginBottom: "10px" }}
      >
        ห้อง {room.number}
      </h5>

      <div className="fw-bold text-black">
        <hr />
      </div>

      <div className="mb-1 text-black h6">
        <b>LINE :</b> {booking?.customer?.userName || "-"}
      </div>
      <div className="mb-1 text-black h6">
        <b>ชื่อ :</b> {booking?.fullName || "-"}
      </div>
      <div className="mb-3 text-black h6">
        <b>เข้าพักจริง :</b>{" "}
        {booking?.checkinAt ? formatThaiDate(booking.checkinAt) : "-"}
      </div>

      <div className="fw-bold text-black "><hr /></div>

      {!hasBill && booking?.checkinAt && canCreateBill && (
        <button
          className="btn w-100 fw-bold"
          style={{
            background: SCB_GOLD,
            color: "#2D1A47",
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,.15)",
          }}
          onClick={() => onCreateBill(room)}
        >
          ออกบิล
        </button>
      )}

      {hasBill && (
        <div className="text-center fw-bold mt-2" style={{ color: SCB_PURPLE }}>
          ออกบิลแล้ว
        </div>
      )}
    </div>
  );
}
