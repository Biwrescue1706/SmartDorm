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

  // ⭐ เช็คปุ่มเช็คอิน
  const canCheckin =
    booking.approveStatus === 1 &&
    !booking.actualCheckin &&
    new Date().toDateString() ===
      new Date(booking.checkin).toDateString();

  // ⭐ ข้อความสถานะ
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

  // -------------------------------------------
  // ⭐ CARD MODE
  // -------------------------------------------
  if (mode === "card") {
    return (
      <div className="shadow-sm rounded-4 p-3 bg-light border text-center">
        <h5 className="fw-bold mb-2">ห้อง {booking.room.number}</h5>

        <p className="mb-1">{booking.fullName}</p>
        <p className="mb-1 text-muted">LINE: {booking.customer?.userName}</p>
        <p className="mb-1">เบอร์: {booking.cphone}</p>

        <p className="mb-1">
          <b>จอง:</b> {formatThai(booking.createdAt)}
        </p>
        <p className="mb-1">
          <b>เข้าพัก:</b> {formatThai(booking.checkin)}
        </p>

        {/* ⭐ แสดงสถานะ */}
        <p className="mt-2">
          <b>สถานะ : </b>
          <span className={statusClass}>{statusText}</span>
        </p>

        {/* ⭐ ปุ่มต่าง ๆ */}
        <div className="d-flex justify-content-center gap-2 mt-3">

          {/* ปุ่มจัดการ (เฉพาะรออนุมัติ) */}
          {booking.approveStatus === 0 && (
            <ManageBookingDialog
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}

          {/* ปุ่มเช็คอิน เฉพาะวันที่ตรงกัน */}
          {canCheckin && onCheckin && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onCheckin(booking.bookingId)}
            >
              เช็คอิน
            </button>
          )}

          {/* ปุ่มแก้ไข / ลบ เฉพาะ super admin + ต้องไม่ใช่ไม่อนุมัติ */}
          {isSuperAdmin && booking.approveStatus !== 2 && (
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

  // -------------------------------------------
  // ⭐ TABLE MODE
  // -------------------------------------------
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

      {/* สลิป */}
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

      {/* ⭐ สถานะ */}
      <td>
        <span className={statusClass}>{statusText}</span>
      </td>

      {/* ⭐ ปุ่มใน Desktop */}
      {isSuperAdmin && (
        <>
          <td>
            {/* เฉพาะรออนุมัติ */}
            {booking.approveStatus === 0 && (
              <ManageBookingDialog
                booking={booking}
                onApprove={onApprove}
                onReject={onReject}
              />
            )}

            {/* เช็คอิน */}
            {canCheckin && onCheckin && (
              <button
                className="btn btn-success btn-sm mt-1"
                onClick={() => onCheckin(booking.bookingId)}
              >
                เช็คอิน
              </button>
            )}

            {/* แก้ไข */}
            {booking.approveStatus !== 2 && (
              <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
            )}
          </td>

          {/* ลบ */}
          <td>
            {booking.approveStatus !== 2 && (
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