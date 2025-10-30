import RoomRow from "./RoomRow";
import type { Room } from "../../types/Room";

interface Props {
  rooms: Room[];
  startIndex: number;
  onUpdated: () => void;
}

export default function RoomTable({ rooms, startIndex, onUpdated }: Props) {
  return (
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-sm table-striped align-middle text-center"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <thead className="table-dark">
          <tr>
            <th style={{ width: "8%" }}>#</th>
            <th style={{ width: "15%" }}>ห้อง</th>
            <th style={{ width: "25%" }}>ขนาด</th>
            <th style={{ width: "15%" }}>ค่าเช่า</th>
            <th style={{ width: "20%" }}>ผู้สร้าง</th>
            <th style={{ width: "20%" }}>ผู้แก้ไข</th>
            <th style={{ width: "15%" }}>สถานะ</th>
            <th style={{ width: "10%" }}>แก้ไข</th>
            <th style={{ width: "10%" }}>ลบ</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-3 text-muted">
                ไม่มีข้อมูลห้อง
              </td>
            </tr>
          ) : (
            rooms.map((room, index) => (
              <RoomRow
                key={room.roomId}
                room={room}
                index={startIndex + index}
                onUpdated={onUpdated}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
