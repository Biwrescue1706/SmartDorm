// src/components/Bills/BillCard.tsx
import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

interface Bill {
  month: string;
  createdAt: string;
}

interface Props {
  room: Room;
  booking?: Booking;

  // บิลของห้องนี้
  bill?: Bill;
  hasBill: boolean;

  // วันนี้ >= 25
  canCreateBill: boolean;

  // rule 25 ต่อ booking
  canCreateBillForBooking: (booking: Booking) => boolean;

  formatThaiDate: (date: string) => string;
  onCreateBill: (room: Room) => void;
}

const Divider = () => (
  <hr
    className=" py-2 pb-2 pt-3"
    style={{
      border: "none",
      borderTop: "2px solid #000000",
      opacity: 1,
      margin: "10px 0",
    }}
  />
);

export default function BillCard({
  room,
  booking,
  bill,
  hasBill,
  canCreateBill,
  canCreateBillForBooking,
  formatThaiDate,
  onCreateBill,
}: Props) {
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";

  // เงื่อนไขแสดงปุ่มออกบิล
  const canShowCreateButton =
    !hasBill &&
    !!booking &&
    !!booking.checkinAt &&
    canCreateBill &&
    canCreateBillForBooking(booking);

  return (
    <div
      className="p-3 rounded-4 shadow-sm"
      style={{
        background: "#FFFFFF",
        borderLeft: `6px solid ${SCB_PURPLE}`,
        borderRadius: "14px",
        boxShadow: "0 4px 8px rgba(0,0,0,.12)",
      }}
    >
      <h5 className="fw-bold text-center mb-2" style={{ color: SCB_PURPLE }}>
        ห้อง {room.number}
      </h5>

      <Divider />

      <p className="mb-1 text-black text-center fw-bold">รายละเอียดผู้เช่า</p>

      <p className="mb-1 text-black">
        <b>LINE :</b> {booking?.customer?.userName || "-"}
      </p>

      <p className="mb-1 text-black">
        <b>ชื่อ :</b> {booking?.fullName || "-"}
      </p>

      <p className="mb-2 text-black">
        <b>เข้าพักจริง :</b>{" "}
        {booking?.checkinAt ? formatThaiDate(booking.checkinAt) : "-"}
      </p>

      {/* แสดงข้อมูลบิล */}
      {hasBill && bill && (
        <>
          <Divider />

          <p className="mb-1 text-black text-center fw-bold">รายละเอียดบิล</p>

          <p className="mb-1 text-black">
            <b>เดือนที่ออกบิล :</b>{" "}
            {bill.month ? formatThaiDate(bill.month) : "-"}
          </p>

          <p className="mb-3 text-black">
            <b>วันที่ออกบิล :</b>{" "}
            {bill.createdAt ? formatThaiDate(bill.createdAt) : "-"}
          </p>
        </>
      )}

      {/* ปุ่มออกบิล */}
      {canShowCreateButton && (
        <button
          className="btn w-100 fw-bold mt-3"
          style={{
            background: SCB_GOLD,
            color: "#2D1A47",
            borderRadius: "10px",
            border: "none",
          }}
          onClick={() => onCreateBill(room)}
        >
          ออกบิล
        </button>
      )}
    </div>
  );
}
