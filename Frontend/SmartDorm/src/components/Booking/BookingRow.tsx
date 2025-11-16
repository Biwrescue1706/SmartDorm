import { useState } from "react";
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

  // -------------------------
  // ⭐ actualCheckin ว่างไหม
  // -------------------------
  const isEmpty = (v: any) => v === null || v === undefined || v === "";

  // -------------------------
  // ⭐ format Thai date
  // -------------------------
  const formatThai = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  // -------------------------
  // ⭐ Normalize วันที่ (ตั้งเวลาเป็น 00:00:00)
  // -------------------------
  const normalizeDate = (d: any) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  // ⭐ วันที่จาก backend (ISO ถูกต้องอยู่แล้ว)
  const checkinDate = normalizeDate(booking.checkin);
  const today = normalizeDate(new Date());

  // -------------------------
  // ⭐ เงื่อนไขปุ่มเช็คอิน
  // -------------------------
  const canCheckin =
    booking.approveStatus === 1 &&
    isEmpty(booking.actualCheckin) &&
    today.getTime() >= checkinDate.getTime();

  // -------------------------
  // ⭐ Status label
  // -------------------------
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

  const [showSlip, setShowSlip] = useState(false);

  const actualCheckinStr = isEmpty(booking.actualCheckin)
    ? "-"
    : formatThai(booking.actualCheckin);

  // -------------------------
  // ⭐ Popup สลิป
  // -------------------------
  const SlipPopup = () =>
    showSlip && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
        style={{ zIndex: 9999 }}
        onClick={() => setShowSlip(false)}
      >
        <div
          className="bg-white p-3 rounded-4 shadow-lg"
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowSlip(false)}
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              fontSize: "20px",
              fontWeight: "bold",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✖
          </button>

          <h5 className="text-center fw-bold mb-3">
            สลิปการโอน — ห้อง {booking.room.number}
          </h5>

          <img
            src={booking.slipUrl!}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: "10px",
              display: "block",
              margin: "0 auto",
            }}
          />

          <div className="text-center mt-3">
            <button className="btn btn-secondary" onClick={() => setShowSlip(false)}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    );

  // ==========================================================================
  // ⭐ CARD MODE
  // ==========================================================================
  if (mode === "card") {
    return (
      <div className="shadow-sm rounded-4 p-3 bg-light border text-center">

        <h5 className="fw-bold mb-2">ห้อง : {booking.room.number}</h5>
        <p>ชื่อผู้จอง : {booking.fullName}</p>
        <p>LINE : {booking.customer?.userName}</p>
        <p>เบอร์ : {booking.cphone}</p>
        <p>วันจอง : {formatThai(booking.createdAt)}</p>
        <p>วันที่แจ้งเข้าพัก : {formatThai(booking.checkin)}</p>

        {!isEmpty(booking.actualCheckin) && (
          <p><b>วันที่เข้าพักจริง :</b> {actualCheckinStr}</p>
        )}

        <p className="mt-2">
          <b>สถานะ : </b>
          <span className={statusClass}>{statusText}</span>
        </p>

        {booking.slipUrl && (
          <>
            <button className="btn btn-primary btn-sm mt-1" onClick={() => setShowSlip(true)}>
              ดูสลิป
            </button>
            <SlipPopup />
          </>
        )}

        <div className="d-flex justify-content-center gap-2 mt-3">

          {showManage && (
            <ManageBookingDialog
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}

          {canCheckin && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onCheckin?.(booking.bookingId)}
            >
              เช็คอิน
            </button>
          )}

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

  // ==========================================================================
  // ⭐ TABLE MODE
  // ==========================================================================
  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.customer?.userName}</td>
      <td>{booking.fullName}</td>
      <td>{booking.cphone}</td>
      <td>{formatThai(booking.createdAt)}</td>
      <td>{formatThai(booking.checkin)}</td>
      <td>{actualCheckinStr}</td>

      <td>
        {booking.slipUrl ? (
          <>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowSlip(true)}
            >
              ดู
            </button>
            <SlipPopup />
          </>
        ) : (
          "-"
        )}
      </td>

      <td>
        <span className={statusClass}>{statusText}</span>
      </td>

      <td className="text-center">
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

        {isSuperAdmin && (
          <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
        )}
      </td>

      <td className="text-center">
        {isSuperAdmin && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(booking.bookingId, booking.room.number)}
          >
            🗑️
          </button>
        )}
      </td>
    </tr>
  );
}