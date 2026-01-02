// src/components/Bills/BillTable.tsx
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
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";

  return (
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-sm align-middle text-center"
        style={{
          tableLayout: "fixed",
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,.15)",
        }}
      >
        <thead
          style={{
            background: SCB_PURPLE,
            color: SCB_GOLD,
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          <tr>
            <th style={{ width: "6%" }}>#</th>
            <th style={{ width: "10%" }}>ห้อง</th>
            <th style={{ width: "18%" }}>LINE</th>
            <th style={{ width: "18%" }}>ชื่อ</th>
            <th style={{ width: "20%" }}>วันเข้าพัก</th>
            <th style={{ width: "15%" }}>ออกบิล</th>
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
