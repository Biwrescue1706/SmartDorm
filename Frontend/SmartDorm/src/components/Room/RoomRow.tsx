import { useEffect } from "react";
import { useRooms } from "../../hooks/useRooms";
import type { Room } from "../../types/Room";
import EditRoomDialog from "./EditRoomDialog";

interface Props {
  room: Room;
  index: number;
  onUpdated: () => void;
}

export default function RoomRow({ room, index, onUpdated }: Props) {
  const { deleteRoom, fetchRooms } = useRooms();

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
      {status === 0 ? "ว่าง" : status === 1 ? "ไม่ว่าง" : "ไม่ทราบ"}
    </span>
  );

  // ลบห้อง
  const handleDelete = async () => {
    const success = await deleteRoom(room.roomId);
    if (success) {
      onUpdated(); // refresh ตาราง
      fetchRooms(); // โหลดข้อมูลใหม่
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
      <td>
        <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />

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
      </td>
    </tr>
  );
}
