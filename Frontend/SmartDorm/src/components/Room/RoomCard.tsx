import EditRoomDialog from "./EditRoomDialog";
import { useRooms } from "../../hooks/ManageRooms/useRooms";
import type { Room } from "../../types/All";
import { formatThaiDate, formatThaiTime } from "../../utils/thaiDate";

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

  const Divider = () => (
    <hr
      className="mt-3 mb-3 pt-0"
      style={{
        border: "none",
        borderTop: "2px solid #000000",
        opacity: 1,
      }}
    />
  );

  return (
    <div
      className="card shadow-sm"
      style={{
        borderRadius: 12,
        border: "2px solid #000",
        background: room.status === 1 ? "#ffe5e5" : "#e6f7e6",
      }}
    >
      <div className="card-body text-start">
        {/* ================= ข้อมูลห้อง ================= */}
        <h5 className="fw-bold text-center mb-2">🏠 ห้อง {room.number}</h5>

        <Divider />
        <div className="text-center">
          <p>
            <b>ขนาด : </b>
          </p>
          <p>{room.size ?? "-"}</p>
          <p>
            <b>ขนาด :</b>
          </p>
          <p>{room.size ?? "-"}</p>
          <p>
            <b>ค่าเช่า :</b>
          </p>
          <p>{room.rent ? room.rent.toLocaleString("th-TH") : "-"}</p>
          <p>
            <b>ผู้สร้าง :</b>
          </p>
          <p>{room.adminCreated?.name ?? "-"}</p>
          <p>
            <b>วันที่สร้าง :</b>
          </p>
          <p>
            {formatThaiDate(room.createdAt)} เวลา{" "}
            {formatThaiTime(room.createdAt)} น.
          </p>
          {room.adminUpdated?.name && (
            <>
              <p>
                <b>ผู้แก้ไข :</b>
              </p>
              <p>{room.adminUpdated.name}</p>
            </>
          )}

          {room.updatedAt && (
            <>
              <p>
                <b>วันแก้ไข :</b>
              </p>
              <p>
                {formatThaiDate(room.updatedAt)} เวลา{" "}
                {formatThaiTime(room.updatedAt)} น.
              </p>
            </>
          )}

          <p>
            <b>สถานะ :</b>{" "}
            <span
              className={`badge ${
                room.status === 0 ? "bg-success" : "bg-danger"
              }`}
            >
              {room.status === 0 ? "ว่าง" : "เต็ม"}
            </span>
          </p>
          
        </div>
      </div>

      {/* ===== ปุ่ม ADMIN ===== */}
      {isSuperAdmin && (
        <div className="text-center pb-3">
          <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />

          {room.status === 0 && (
            <button
              className="btn btn-sm text-white ms-2"
              style={{
                background: "linear-gradient(135deg,#ff512f,#dd2476)",
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
