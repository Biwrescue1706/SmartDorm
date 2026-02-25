import { useEffect } from "react";
import { useRooms } from "../../hooks/ManageRooms/useRooms";
import type { Room, Booking } from "../../types/All";
import EditRoomDialog from "./EditRoomDialog";

import {
  formatThaiDate,
  formatThaiTime,
} from "../../utils/thaiDate";


interface Props {
  room: Room;
  index: number;
  onUpdated: () => void;
  hideTenant?: boolean;
  role?: number | null;
}

export default function RoomRow({
  room,
  index,
  onUpdated,
  role,
  hideTenant,
}: Props) {
  const { deleteRoom, fetchRooms } = useRooms();
  const isSuperAdmin = role === 0;

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
      {/* ===== พื้นฐาน ===== */}
      <td>{index + 1}</td>
      <td>{room.number}</td>
      <td>{room.size ?? "-"}</td>
      <td>{room.rent?.toLocaleString("th-TH")}</td>

      {/* ===== ข้อมูลห้อง ===== */}
      <td>{room.adminCreated?.name ?? "-"}</td>

      <td>{formatThaiDate(room.createdAt)}</td>
      <td>{formatThaiTime(room.createdAt)}</td>

      <td>{room.adminUpdated?.name ?? "-"}</td>

      <td>{formatThaiDate(room.updatedAt)}</td>
      <td>{formatThaiTime(room.updatedAt)}</td>

      {/* ช่อง placeholder (ตรงกับ header '-') */}
      <td>-</td>

      {/* ===== ข้อมูลผู้เช่า ===== */}
      {!hideTenant && (
        <>
          <td>{room.booking?.fullName ?? "-"}</td>
          <td>
            {formatThaiDate(room.booking?.bookingDate)}
          </td>
          <td>
            {formatThaiDate(room.booking?.checkinAt)}
          </td>
        </>
      )}

      {/* ===== สถานะ ===== */}
      <td>{getStatus(room.status)}</td>

      {/* ===== ADMIN ACTION ===== */}
      {isSuperAdmin ? (
        <>
          <td>
            <EditRoomDialog
              roomId={room.roomId}
              onSuccess={onUpdated}
            />
          </td>

          <td>
            {room.status !== 1 && (
              <button
                className="btn btn-sm text-white fw-semibold"
                style={{
                  background:
                    "linear-gradient(100deg,#ff0505,#f645c4)",
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