// src/components/Bills/BillTable.tsx
import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";
import BillRow from "./BillRows";

interface BillTableProps {
  rooms: Room[];
  bookings: Booking[];
  existingBills: any[];
  canCreateBill: boolean;
  canCreateBillForBooking: (booking: Booking) => boolean;

  // ✅ เพิ่ม 2 ตัวนี้
  showBillDateColumn: boolean;
  showActionColumn: boolean;

  formatThaiDate: (d: string) => string;
  onCreateBill: (room: Room) => void;
}

export default function BillTable({
  rooms,
  bookings,
  existingBills,
  canCreateBill,
  canCreateBillForBooking,
  showBillDateColumn,
  showActionColumn,
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
            {showBillDateColumn && (
              <th style={{ width: "13%" }}>เดือนที่ออกบิล</th>
            )}
            {showBillDateColumn && (
              <th style={{ width: "13%" }}>วันที่ออกบิล</th>
            )}

            {showActionColumn && <th style={{ width: "15%" }}>จัดการ</th>}
          </tr>
        </thead>

        <tbody>
          {rooms.map((room, index) => {
            const booking = bookings.find((b) => b.roomId === room.roomId);

            // ✅ หา "บิลล่าสุด" ของห้องนี้
            const bill = existingBills
              .filter((b: any) => b.roomId === room.roomId)
              .sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0];
            ;

            const hasBill = !!bill;

            return (
              <BillRow
                key={room.roomId}
                index={index}
                room={room}
                bill={bill}
                booking={booking}
                hasBill={hasBill}
                showBillDateColumn={showBillDateColumn}
                showActionColumn={showActionColumn}
                canCreateBill={canCreateBill}
                canCreateBillForBooking={canCreateBillForBooking}
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
