//src/components/Room/RoomRow.tsx
import { useRooms } from "../../hooks/ManageRooms/useRooms";
import type { Room } from "../../types/All";
import EditRoomDialog from "./EditRoomDialog";

import { formatThaiDate, formatThaiTime } from "../../utils/thaiDate";

interface Props {
  room: Room;
  index: number;
  onUpdated: () => void;
  hideTenant?: boolean;
  role?: number | null;
  hideDelete?: boolean;
}

export default function RoomRow({
  room,
  index,
  onUpdated,
  role,
  hideTenant,
  hideDelete,
}: Props) {
  const { deleteRoom } = useRooms();
  const isSuperAdmin = role === 0;

  // ✅ เอาเฉพาะ booking ตอนห้อง "เต็ม"
  const latestBooking = room.status === 1 && room.booking ? room.booking : null;

  const getStatus = (status?: number) => (
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
    }
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{room.number}</td>
      <td>{room.size ?? "-"}</td>
      <td>{room.rent?.toLocaleString("th-TH") ?? "-"}</td>

      <td>{room.adminCreated?.name ?? "-"}</td>
      <td>
        {formatThaiDate(room.createdAt)} {formatThaiTime(room.createdAt)} น.
      </td>

      <td>{room.adminUpdated?.name ?? "-"}</td>
      <td>
        {formatThaiDate(room.updatedAt)} {formatThaiTime(room.updatedAt)} น.
      </td>

      <td>{getStatus(room.status)}</td>

      {isSuperAdmin && (
        <>
          <td>
            <EditRoomDialog roomId={room.roomId} onSuccess={onUpdated} />
          </td>

          {!hideDelete && (
            <td>
              {room.status !== 1 && (
                <button
                  className="btn btn-sm text-white fw-semibold"
                  style={{
                    background: "linear-gradient(100deg,#ff0505,#f645c4)",
                    border: "none",
                  }}
                  onClick={handleDelete}
                >
                  🗑️
                </button>
              )}
            </td>
          )}
        </>
      )}

      {!hideTenant && (
        <>
          <td>{latestBooking?.fullName ?? ""}</td>
          <td>{formatThaiDate(latestBooking?.bookingDate ?? null)}</td>
          <td>{formatThaiDate(latestBooking?.checkinAt ?? null)}</td>
        </>
      )}
    </tr>
  );
}
