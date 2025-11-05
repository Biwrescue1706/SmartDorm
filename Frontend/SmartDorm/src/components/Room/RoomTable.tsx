import RoomRow from "./RoomRow";
import type { Room } from "../../types/Room";

interface Props {
  rooms: Room[];
  startIndex: number;
  onUpdated: () => void;
  role?: number | null;
}

export default function RoomTable({
  rooms,
  startIndex,
  onUpdated,
  role,
}: Props) {
  const isSuperAdmin = role === 0;
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
            <th scope="col" style={{ width: "20%" }}>
              #
            </th>
            <th scope="col" style={{ width: "35%" }}>
              ห้อง
            </th>
            <th scope="col" style={{ width: "80%" }}>
              ขนาด
            </th>
            <th scope="col" style={{ width: "45%" }}>
              ค่าเช่า
            </th>
            <th scope="col" style={{ width: "45%" }}>
              ผู้สร้าง
            </th>
            <th scope="col" style={{ width: "45%" }}>
              ผู้แก้ไข
            </th>
            <th scope="col" style={{ width: "45%" }}>
              สถานะ
            </th>
            {isSuperAdmin && (
              <th scope="col" style={{ width: "45%" }}>
                แก้ไข
              </th>
            )}
            {isSuperAdmin && (
              <th scope="col" style={{ width: "45%" }}>
                ลบ
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rooms.length === 0 ? (
            <tr>
              <td colSpan={isSuperAdmin ? 9 : 7} className="py-3 text-muted">
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
                role={role}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
