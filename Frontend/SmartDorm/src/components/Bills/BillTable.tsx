import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";
import BillRow from "./BillRows";

interface BillTableProps {
  rooms: Room[];
  bookings: Booking[];
  existingBills: string[];
  canCreateBill: boolean;
  formatThaiDate: (d: string) => string;
  onCreateBill: (room: Room) => void;
}

export default function BillTable({
  rooms,
  bookings,
  existingBills,
  canCreateBill,
  formatThaiDate,
  onCreateBill,
}: BillTableProps) {
  return (
    <div className="table-responsive bg-white shadow-sm rounded-3 p-2">
      <table className="table table-hover table-striped mb-0 align-middle text-center">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ห้อง</th>
            <th>Line</th>
            <th>ค่าเช่า</th>
            <th>วันขอเข้าพัก</th>
            <th>วันเข้าพัก</th>
            <th>ออกบิล</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => {
            const booking = bookings.find((b) => b.room.number === room.number);
            const hasBill = existingBills.includes(room.roomId);

            return (
              <BillRow
                key={room.roomId}
                index={index}
                room={room}
                booking={booking}
                hasBill={hasBill}
                canCreateBill={canCreateBill}
                formatThaiDate={formatThaiDate}
                onCreateBill={onCreateBill}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
