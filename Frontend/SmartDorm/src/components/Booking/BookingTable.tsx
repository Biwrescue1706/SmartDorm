// ❌ useState ไม่ได้ใช้ → ลบออก
import { createPortal } from "react-dom";
import type { Booking } from "../../types/Booking";
import EditBookingDialog from "./EditBookingDialog";
import ManageBookingDialog from "./ManageBookingDialog";
import Swal from "sweetalert2";

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

  const formatThaiDate = (d?: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ---------------------------------------------------------
  // ⭐ CARD MODE (mobile + tablet)
  // ---------------------------------------------------------
  if (mode === "card") {
    return (
      <div
        className="shadow-sm rounded-4 p-3 bg-light border"
        style={{ textAlign: "center" }}
      >
        <h5 className="fw-bold mb-2">ห้อง {booking.room.number}</h5>

        <p className="mb-1">{booking.fullName}</p>
        <p className="mb-1 text-muted">LINE: {booking.customer?.userName}</p>
        <p className="mb-1">เบอร์: {booking.cphone}</p>
        <p className="mb-1">จองวันที่: {formatThaiDate(booking.createdAt)}</p>
        <p className="mb-1">แจ้งเข้าพัก: {formatThaiDate(booking.checkin)}</p>

        {/* ปุ่มจัดการ */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <ManageBookingDialog
            booking={booking}
            onApprove={onApprove}
            onReject={onReject}
            triggerClassName="btn btn-warning btn-sm"
            triggerLabel="จัดการ"
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

  // ---------------------------------------------------------
  // ⭐ TABLE MODE (desktop)
  // ---------------------------------------------------------
  return (
    <>
      <tr>
        <td>{index}</td>
        <td>{booking.room?.number}</td>
        <td>{booking.customer?.userName || "-"}</td>
        <td>{booking.fullName}</td>
        <td>{booking.cphone}</td>
        <td>{formatThaiDate(booking.createdAt)}</td>
        <td>{formatThaiDate(booking.checkin)}</td>

        <td>
          {booking.actualCheckin ? (
            <span className="text-success fw-semibold">
              {formatThaiDate(booking.actualCheckin)}
            </span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        <td>
          {booking.slipUrl ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => window.open(booking.slipUrl!, "_blank")}
            >
              ดูสลิป
            </button>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        <td>
          {booking.approveStatus === 1 ? (
            <span className="text-success fw-semibold">อนุมัติแล้ว</span>
          ) : booking.approveStatus === 2 ? (
            <span className="text-danger fw-semibold">ไม่อนุมัติ</span>
          ) : (
            <span className="text-warning fw-semibold">รออนุมัติ</span>
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
    </>
  );
}