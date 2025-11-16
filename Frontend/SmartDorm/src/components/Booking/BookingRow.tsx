import type { Booking } from "../../types/Booking";
import EditBookingDialog from "./EditBookingDialog";
import ManageBookingDialog from "./ManageBookingDialog";

interface Props {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  onCheckin?: (id: string) => void;
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
  onCheckin,
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

  // ⭐ Checkin date parse
  const checkinDate = new Date(booking.checkin as any);
  const today = new Date();

  const canCheckin =
    booking.approveStatus === 1 &&
    !booking.actualCheckin &&
    checkinDate.getFullYear() === today.getFullYear() &&
    checkinDate.getMonth() === today.getMonth() &&
    checkinDate.getDate() === today.getDate();

  const statusText =
    booking.approveStatus === 1
      ? "อนุมัติแล้ว"
      : booking.approveStatus === 2
      ? "ไม่อนุมัติ"
      : "รออนุมัติ";

  const statusClass =
    booking.approveStatus === 1
      ? "text-success fw-bold"
      : booking.approveStatus === 2
      ? "text-danger fw-bold"
      : "text-warning fw-bold";

  const showManage = booking.approveStatus === 0;
  const showEditDelete = booking.approveStatus !== 1;

  // ⭐ CARD MODE (Mobile)
  if (mode === "card") {
    return (
      <div className="shadow-sm rounded-4 p-3 bg-light border text-center">

        <h5 className="fw-bold mb-2">ห้อง : {booking.room.number}</h5>
        <p>ชื่อผู้จอง : {booking.fullName}</p>
        <p>LINE : {booking.customer?.userName}</p>
        <p>เบอร์ : {booking.cphone}</p>
        <p>วันจอง : {formatThai(booking.createdAt)}</p>
        <p>วันที่แจ้งเข้าพัก : {formatThai(booking.checkin)}</p>
        <p><b>วันที่เข้าพักจริง :</b> {formatThai(booking.actualCheckin)}</p>

        <p className="mt-2">
          <b>สถานะการจอง : </b>
          <span className={statusClass}>{statusText}</span>
        </p>

        {/* ⭐ ปุ่มดูสลิป */}
        {booking.slipUrl && (
          <button
            className="btn btn-primary btn-sm mt-1"
            onClick={() => window.open(booking.slipUrl!, "_blank")}
          >
            ดูสลิป
          </button>
        )}

        <div className="d-flex justify-content-center gap-2 mt-3">

          {/* 🟡 รออนุมัติ */}
          {showManage && (
            <ManageBookingDialog
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}

          {/* 🟢 เช็คอิน */}
          {canCheckin && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onCheckin?.(booking.bookingId)}
            >
              เช็คอิน
            </button>
          )}

          {/* 🔵 แก้ไข + ลบ (ไม่อนุมัติ/รออนุมัติ เท่านั้น) */}
          {isSuperAdmin && showEditDelete && (
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

  // ⭐ TABLE MODE (Desktop)
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

      {/* ปุ่มดูสลิป */}
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
        <span className={statusClass}>{statusText}</span>
      </td>

      {/* ปุ่ม Desktop */}
      {isSuperAdmin && (
        <>
          <td>
            {showManage && (
              <ManageBookingDialog
                booking={booking}
                onApprove={onApprove}
                onReject={onReject}
              />
            )}

            {canCheckin && (
              <button
                className="btn btn-success btn-sm mt-1"
                onClick={() => onCheckin?.(booking.bookingId)}
              >
                เช็คอิน
              </button>
            )}

            {showEditDelete && (
              <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
            )}
          </td>

          <td>
            {showEditDelete && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(booking.bookingId, booking.room.number)}
              >
                🗑️
              </button>
            )}
          </td>
        </>
      )}
    </tr>
  );
}