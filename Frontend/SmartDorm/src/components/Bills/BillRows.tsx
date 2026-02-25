// src/components/Bills/BillRows.tsx
import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

interface BillRowProps {
  index: number;
  room: Room;
  booking?: Booking;
  bill?: any;
  hasBill: boolean;

  showBillDateColumn: boolean;
  showActionColumn: boolean;

  // วันนี้ >= 25 หรือยัง
  canCreateBill: boolean;

  // ✅ rule 25 ต่อ booking
  canCreateBillForBooking: (booking: Booking) => boolean;

  formatThaiDate: (date: string) => string;
  onCreateBill: (room: Room) => void;
}

export default function BillRow({
  index,
  room,
  booking,
  hasBill,
  bill,
  canCreateBill,
  canCreateBillForBooking,
  showBillDateColumn,
  showActionColumn,
  formatThaiDate,
  onCreateBill,
}: BillRowProps) {
  // 🗓️ วันที่เข้าพักจริง
  const checkinAt = booking?.checkinAt
    ? formatThaiDate(booking.checkinAt)
    : "-";

  /**
   * เงื่อนไขแสดงปุ่มออกบิล
   * 1. วันนี้ต้อง >= 25
   * 2. ยังไม่มีบิลรอบนี้
   * 3. ต้อง checkin แล้ว
   * 4. ต้องผ่าน rule 25–31 ของ booking
   */
  const canShowButton =
    !!booking &&
    canCreateBill &&
    !hasBill &&
    !!booking.checkinAt &&
    canCreateBillForBooking(booking);

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{room.number}</td>
      <td>{booking?.customer?.userName || "-"}</td>
      <td>{booking?.fullName || "-"}</td>
      <td>{checkinAt}</td>
      {showBillDateColumn && (
        <td>{bill?.month ? formatThaiDate(bill.month) : "-"}</td>
      )}
      {showBillDateColumn && (
        <td>{bill?.createdAt ? formatThaiDate(bill.createdAt) : "-"}</td>
      )}

      {showActionColumn && (
        <td>
          {canShowButton && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onCreateBill(room)}
            >
              ออกบิล
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
