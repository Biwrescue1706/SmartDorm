//src/components/Room/RoomTable.tsx
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

  // ✅ คำนวณใหม่ให้ตรงจริง
  const columnCount =
    4 + // # ห้อง ขนาด ค่าเช่า
    4 + // ข้อมูลห้อง
    1 + // สถานะ
    (isSuperAdmin ? 1 : 0) + // แก้ไข
    (isSuperAdmin && !hideDelete ? 1 : 0) + // ลบ
    (!hideTenant ? 3 : 0); // ผู้เช่า

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table table-sm table-striped align-middle text-center">
        <thead className="table-dark">
          <tr>
            <th rowSpan={2}>#</th>
            <th rowSpan={2}>ห้อง</th>
            <th rowSpan={2}>ขนาด (กว้าง x ยาว)</th>
            <th rowSpan={2}>ค่าเช่า</th>

            <th colSpan={4}>ข้อมูลห้อง</th>
            <th rowSpan={2}>สถานะ</th>

            {isSuperAdmin && <th rowSpan={2}>แก้ไข</th>}
            {isSuperAdmin && !hideDelete && <th rowSpan={2}>ลบ</th>}

            {/* ✅ แก้จาก 4 → 3 */}
            {!hideTenant && <th colSpan={3}>ข้อมูลผู้เช่า</th>}
          </tr>

          <tr>
            <th>ผู้สร้าง</th>
            <th>วันที่สร้าง</th>
            <th>ผู้แก้ไข</th>
            <th>วันแก้ไข</th>

            {!hideTenant && (
              <>
                <th>ผู้เช่า</th>
                <th>วันที่จอง</th>
                <th>วันที่เข้าพัก</th>
              </>
            )}
          </tr>
        </thead>

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
                hideDelete={hideDelete} // ✅ เพิ่มบรรทัดนี้
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
