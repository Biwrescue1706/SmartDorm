// src/components/Bills/BillCard.tsx
import type { Room, Booking, Bill } from "../../types/All";

interface Props {
  room: Room;
  booking?: Booking;
  bill?: Bill;
  hasBill: boolean;

  canCreateBill: boolean;
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
        border: "2px solid #000",
        borderRadius: "14px",
        boxShadow: "2px 4px 8px rgb(0, 0, 0)",
      }}
    >
      <h4 className="fw-bold text-center mb-2" style={{ color: SCB_PURPLE }}>
        ห้อง {room.number}
      </h4>

      <Divider />

      <h4 className="mb-1 text-black text-center fw-bold">รายละเอียดผู้เช่า</h4>

      <br />

      <div className="text-center">
        {" "}
        <p className="text-black">
          <b>LINE :</b>
          <p>{booking?.customer?.userName || "-"}</p>
        </p>
        <p className="mb-1 text-black">
          <b>ชื่อ :</b>
          <p>{booking?.fullName || "-"}</p>
        </p>
        <p className="mb-3 text-black">
          <b>เข้าพักจริง :</b>{" "}
          <p>{booking?.checkinAt ? formatThaiDate(booking.checkinAt) : "-"}</p>
        </p>
      </div>
      {/* แสดงข้อมูลบิล */}
      {hasBill && bill && (
        <>
          <Divider />

          <h5 className="mb-1 text-black text-center fw-bold">รายละเอียดบิล</h5>
          <br />
          <div className="text-center">
            <p className="mb-1 text-black">
              <b>เดือนที่ออกบิล :</b>{" "}
            </p>
            <p className="mb-1 text-black text-center">
              {bill.month ? formatThaiDate(bill.month) : "-"}
            </p>
            <p className="mb-1 text-black">
              <b>วันที่ออกบิล :</b>{" "}
            </p>
            <p className="mb-1 text-black text-center">
              {bill.createdAt ? formatThaiDate(bill.createdAt) : "-"}
            </p>
          </div>
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
