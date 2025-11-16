import type { Booking } from "../../types/Booking";
import EditBookingDialog from "./EditBookingDialog";
import ManageBookingDialog from "./ManageBookingDialog";

interface Props {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  role?: number | null;
  index: number;
  mode?: "table" | "card";
}

export default function BookingRow({
  booking,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  role,
  index,
  mode = "table",
}: Props) {
  const isSuperAdmin = role === 0;

  const formatThai = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  // ⭐ CARD MODE
  if (mode === "card") {
    return (
      <div className="shadow-sm rounded-4 p-3 bg-light border text-center">
        <h5 className="fw-bold mb-2">ห้อง {booking.room.number}</h5>
        <p className="mb-1">{booking.fullName}</p>
        <p className="mb-1 text-muted">LINE: {booking.customer?.userName}</p>
        <p className="mb-1">เบอร์: {booking.cphone}</p>
        <p className="mb-1">จอง: {formatThai(booking.createdAt)}</p>
        <p className="mb-1">เข้าพัก: {formatThai(booking.checkin)}</p>

        <div className="d-flex justify-content-center gap-2 mt-3">
          <ManageBookingDialog
            booking={booking}
            onApprove={onApprove}
            onReject={onReject}
          />

          {isSuperAdmin && (
            <>
              <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(booking.bookingId, booking.room.number)}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ⭐ TABLE MODE
  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.customer?.userName}</td>
      <td>{booking.fullName}</td>
      <td>{booking.cphone}</td>
      <td>{formatThai(booking.createdAt)}</td>
      <td>{formatThai(booking.checkin)}</td>
      <td>{formatThai(booking.actualCheckin)}</td>

      <td>
        {booking.slipUrl ? (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => window.open(booking.slipUrl!, "_blank")}
          >
            ดู
          </button>
        ) : (
          "-"
        )}
      </td>

      <td>
        {booking.approveStatus === 1 ? (
          <span className="text-success fw-bold">อนุมัติ</span>
        ) : booking.approveStatus === 2 ? (
          <span className="text-danger fw-bold">ไม่อนุมัติ</span>
        ) : (
          <span className="text-warning fw-bold">รอ</span>
        )}
      </td>

      {isSuperAdmin && (
        <>
          <td>
            <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
          </td>
          <td>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(booking.bookingId, booking.room.number)}
            >
              🗑️
            </button>
          </td>
        </>
      )}
    </tr>
  );
}