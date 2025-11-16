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
      className="card shadow-sm border-0 mb-3"
      style={{
        borderRadius: "15px",
        minHeight: "260px",
        backgroundColor: "#f1f3f5",
        position: "relative",
        paddingBottom: "70px",
        textAlign: "center", // ⭐ จัดข้อความอยู่กลาง
      }}
    >
      <div className="card-body" style={{ padding: "20px" }}>

        {/* 🏷️ ชื่อห้องใหญ่ขึ้น (fs-4) */}
        <h4 className="fw-bold mb-3 fs-4">ห้อง {room.number}</h4>

        {/* ⭐ ข้อมูลใหญ่ขึ้น → fs-5 */}
        <p className="mb-1 fs-5"><b>ขนาด :</b> {room.size}</p>

        <p className="mb-1 fs-5">
          <b>ค่าเช่า :</b> {room.rent.toLocaleString("th-TH")} บาท
        </p>

        <p className="mb-1 fs-5"><b>ผู้สร้าง :</b> {room.adminCreated?.name || "-"}</p>

        <p className="mb-1 fs-5"><b>ผู้แก้ไข :</b> {room.adminUpdated?.name || "-"}</p>

        <p className="mb-2 fs-5">
          <b>สถานะ :</b>{" "}
          <span
            className={`badge px-3 py-1 ${
              room.status === 0 ? "bg-success" : "bg-danger"
            }`}
          >
            {room.status === 0 ? "ว่าง" : "เต็ม"}
          </span>
        </p>
      </div>

      {/* ⭐ ปุ่มแก้ไข + ลบ */}
      {isSuperAdmin && (
        <div
          className="d-flex justify-content-center gap-4"
          style={{
            width: "100%",
            position: "absolute",
            bottom: "15px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "0 20px",
          }}
        >
          <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />

          {room.status === 0 && (
            <button
              className="btn btn-sm fw-semibold text-white px-2 mx-2 my-2 py-1"
              style={{
                background: "linear-gradient(135deg, #ff512f, #dd2476)",
                border: "none",
              }}
              onClick={handleDelete}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}