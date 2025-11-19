import { useEffect } from "react";
import { useRooms } from "../../hooks/useRooms";
import type { Room } from "../../types/Room";
import EditRoomDialog from "./EditRoomDialog";

interface Props {
  room: Room;
  index: number;
  onUpdated: () => void;
  role?: number | null;
}

export default function RoomRow({ room, index, onUpdated, role }: Props) {
  const { deleteRoom, fetchRooms } = useRooms();
  const isSuperAdmin = role === 0; // ✅ ตรวจสิทธิ์

  const getStatus = (status: number) => (
    <span
      className={`badge px-3 py-1 fw-semibold ${
        status === 0
          ? "bg-success"
          : status === 1
          ? "bg-danger"
          : "bg-secondary"
      }`}
    >
      {status === 0 ? "ว่าง" : status === 1 ? "เต็ม" : "-"}
    </span>
  );

  const handleDelete = async () => {
    const success = await deleteRoom(room.roomId);
    if (success) {
      onUpdated();
      fetchRooms();
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{room.number}</td>
      <td>{room.size}</td>
      <td>{room.rent.toLocaleString("th-TH")}</td>
      <td>{room.adminCreated?.name || "-"}</td>
      <td>{room.adminUpdated?.name || "-"}</td>
      <td>{getStatus(room.status)}</td>

      {/* ✅ เฉพาะ SuperAdmin เท่านั้นที่เห็นปุ่มแก้ไข/ลบ */}
      {isSuperAdmin ? (
        <>
          <td>
            <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />
          </td>
          <td>
            {room.status === 0 && (
              <button
                className="btn btn-sm text-white fw-semibold mx-2 my-2 mb-2"
                style={{
                  background: "linear-gradient(100deg, #ff0505ff, #f645c4ff)",
                  border: "none",
                }}
                onClick={handleDelete}
              >
                🗑️
              </button>
            )}
          </td>
        </>
      ) : (
        <>
          <td>-</td>
          <td>-</td>
        </>
      )}
    </tr>
  );
}
