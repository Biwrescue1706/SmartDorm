import EditRoomDialog from "./EditRoomDialog";
import { useRooms } from "../../hooks/useRooms";
import type { Room } from "../../types/Room";

interface Props {
  room: Room;
  role?: number | null;
  onUpdated: () => void;
}

export default function RoomCard({ room, role, onUpdated }: Props) {
  const isSuperAdmin = role === 0;
  const { deleteRoom, fetchRooms } = useRooms();

  const handleDelete = async () => {
    const ok = await deleteRoom(room.roomId);
    if (ok) {
      fetchRooms();
      onUpdated();
    }
  };

  return (
    <div className="card shadow-sm mb-3 border-0" style={{ borderRadius: "12px" }}>
      <div className="card-body">
        <h5 className="fw-bold mb-2">ห้อง {room.number}</h5>

        <p className="mb-1"><b>ขนาด:</b> {room.size}</p>
        <p className="mb-1">
          <b>ค่าเช่า:</b> {room.rent.toLocaleString("th-TH")} บาท
        </p>
        <p className="mb-1"><b>ผู้สร้าง:</b> {room.adminCreated?.name || "-"}</p>
        <p className="mb-1"><b>ผู้แก้ไข:</b> {room.adminUpdated?.name || "-"}</p>

        <p className="mb-2">
          <b>สถานะ:</b>{" "}
          <span className={`badge px-3 py-1 ${room.status === 0 ? "bg-success" : "bg-danger"}`}>
            {room.status === 0 ? "ว่าง" : "เต็ม"}
          </span>
        </p>

        {isSuperAdmin && (
          <div className="d-flex justify-content-end gap-2">
            {/* ปุ่มแก้ไข */}
            <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />

            {/* ปุ่มลบ */}
            {room.status === 0 && (
              <button
                className="btn btn-danger btn-sm fw-bold"
                onClick={handleDelete}
              >
                🗑️ ลบ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}