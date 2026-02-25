import RoomRow from "./RoomRow";
import type { Room } from "../../types/All";

interface Props {
  rooms: Room[];
  startIndex: number;
  onUpdated: () => void;
  role?: number | null;
  filter: "all" | "available" | "booked";
}

export default function RoomTable({
  rooms,
  startIndex,
  onUpdated,
  role,
  filter,
}: Props) {
  const isSuperAdmin = role === 0;

  const hideTenant = filter === "available";
  const hideDelete = filter === "booked";

  const columnCount =
    4 + // # ห้อง ขนาด ค่าเช่า
    7 + // ข้อมูลห้อง
    (!hideTenant ? 3 : 0) +
    (isSuperAdmin ? (hideDelete ? 1 : 2) : 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className="table table-sm table-striped align-middle text-center"
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
        }}
      >
        {/* ================= HEADER ================= */}
        <thead className="table-dark">

          {/* ===== แถวหัวข้อหลัก ===== */}
          <tr>
            <th rowSpan={2}>#</th>
            <th rowSpan={2}>ห้อง</th>
            <th rowSpan={2}>ขนาด (กว้าง x ยาว)</th>
            <th rowSpan={2}>ค่าเช่า</th>

            {/* ข้อมูลห้อง */}
            <th colSpan={7}>ข้อมูลห้อง</th>

            {/* ข้อมูลผู้เช่า */}
            {!hideTenant && (
              <th colSpan={3}>ข้อมูลผู้เช่า</th>
            )}

            <th rowSpan={2}>สถานะ</th>

            {isSuperAdmin && <th rowSpan={2}>แก้ไข</th>}
            {isSuperAdmin && !hideDelete && (
              <th rowSpan={2}>ลบ</th>
            )}
          </tr>

          {/* ===== แถวรายละเอียด ===== */}
          <tr>
            <th>ผู้สร้าง</th>
            <th>วันที่สร้าง</th>
            <th>เวลาที่สร้าง</th>

            <th>ผู้แก้ไข</th>
            <th>วันแก้ไข</th>
            <th>เวลาแก้ไข</th>

            <th>-</th>

            {!hideTenant && (
              <>
                <th>ผู้เช่า</th>
                <th>วันที่จอง</th>
                <th>วันที่เข้าพัก</th>
              </>
            )}
          </tr>

        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {rooms.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="py-3 text-muted">
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
                hideTenant={hideTenant}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}