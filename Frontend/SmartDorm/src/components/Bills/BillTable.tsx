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
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-sm table-striped align-middle text-center"
        style={{
          tableLayout: "fixed",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead className="table-dark">
          <tr>
            <th scope="col" style={{ width: "10%" }}>
              #
            </th>
            <th scope="col" style={{ width: "10%" }}>
              ห้อง
            </th>
            <th scope="col" style={{ width: "15%" }}>
              Line
            </th>
            <th scope="col" style={{ width: "20%" }}>
              ค่าเช่า
            </th>
            <th scope="col" style={{ width: "20%" }}>
              วันขอเข้าพัก
            </th>
            <th scope="col" style={{ width: "20%" }}>
              วันเข้าพัก
            </th>
            <th scope="col" style={{ width: "20%" }}>
              ออกบิล
            </th>
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
