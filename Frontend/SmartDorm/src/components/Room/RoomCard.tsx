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
    <div
      className="card shadow-sm border-0 mb-mt-3 "
      style={{ borderRadius: "12px", minHeight: "220px", position: "relative" }}
    >
      <div className="card-body">
        <h5 className="fw-bold mb-2">ห้อง {room.number}</h5>

        <p className="mb-1"><b>ขนาด:</b> {room.size}</p>
        <p className="mb-1">
          <b>ค่าเช่า:</b> {room.rent.toLocaleString("th-TH")} บาท
        </p>
        <p className="mb-1"><b>ผู้สร้าง:</b> {room.adminCreated?.name || "-"}</p>
        <p className="mb-1"><b>ผู้แก้ไข:</b> {room.adminUpdated?.name || "-"}</p>

        <p className="mb-4">
          <b>สถานะ:</b>{" "}
          <span className={`badge px-3 py-1 ${room.status === 0 ? "bg-success" : "bg-danger"}`}>
            {room.status === 0 ? "ว่าง" : "เต็ม"}
          </span>
        </p>

        {/* ปุ่มแก้ไข + ลบ แบบลอยที่มุมขวาล่าง */}
        {isSuperAdmin && (
          <div
            className="d-flex gap-2 position-absolute"
            style={{
              right: "15px",
              bottom: "15px",
            }}
          >
            <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />

            {room.status === 0 && (
              <button
                className="btn btn-danger btn-sm fw-bold"
                onClick={handleDelete}
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}