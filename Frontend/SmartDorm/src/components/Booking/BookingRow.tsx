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

  const formatThai = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  // ⭐ Checkin logic
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

  // ⭐ ปุ่ม "จัดการ (อนุมัติ/ไม่อนุมัติ)" โชว์เฉพาะ "รออนุมัติ"
  const showManage = booking.approveStatus === 0;

  // ⭐ แก้ไข/ลบ ต้องเห็นทุก filter ยกเว้น "อนุมัติแล้ว"
  const showEditDelete = booking.approveStatus !== 1;

  // ⭐ Modal slip viewer
  const [showSlip, setShowSlip] = useState(false);

  // ⭐ Actual Checkin: ถ้า null/0 ให้ไม่แสดงแทบนี้
  const actualCheckinStr = formatThai(booking.actualCheckin);

  // =========================================================================================
  // ⭐ CARD MODE (Mobile)
  // =========================================================================================
  if (mode === "card") {
    return (
      <div className="shadow-sm rounded-4 p-3 bg-light border text-center">

        <h5 className="fw-bold mb-2">ห้อง : {booking.room.number}</h5>
        <p>ชื่อผู้จอง : {booking.fullName}</p>
        <p>LINE : {booking.customer?.userName}</p>
        <p>เบอร์ : {booking.cphone}</p>
        <p>วันจอง : {formatThai(booking.createdAt)}</p>
        <p>วันที่แจ้งเข้าพัก : {formatThai(booking.checkin)}</p>

        {actualCheckinStr && (
          <p>
            <b>วันที่เข้าพักจริง :</b> {actualCheckinStr}
          </p>
        )}

        <p className="mt-2">
          <b>สถานะการจอง : </b>
          <span className={statusClass}>{statusText}</span>
        </p>

        {/* ⭐ ปุ่มดูสลิป Popup */}
        {booking.slipUrl && (
          <>
            <button
              className="btn btn-primary btn-sm mt-1"
              onClick={() => setShowSlip(true)}
            >
              ดูสลิป
            </button>

            {showSlip && (
              <div
                className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
                style={{ zIndex: 9999 }}
                onClick={() => setShowSlip(false)}
              >
                <img
                  src={booking.slipUrl}
                  alt="slip"
                  style={{
                    maxWidth: "90%",
                    maxHeight: "90%",
                    borderRadius: "10px",
                    boxShadow: "0 0 10px #000",
                  }}
                />
              </div>
            )}
          </>
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

          {/* 🟢 เช็คอิน (เฉพาะรอเข้าพัก และวันตรงวันนี้) */}
          {canCheckin && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onCheckin?.(booking.bookingId)}
            >
              เช็คอิน
            </button>
          )}

          {/* 🔵 แก้ไข + ลบ (ทุก filter ยกเว้น “อนุมัติแล้ว”) */}
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

  // =========================================================================================
  // ⭐ TABLE MODE (Desktop)
  // =========================================================================================
  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.customer?.userName}</td>
      <td>{booking.fullName}</td>
      <td>{booking.cphone}</td>
      <td>{formatThai(booking.createdAt)}</td>
      <td>{formatThai(booking.checkin)}</td>
      <td>{actualCheckinStr || "-"}</td>

      {/* ⭐ ดูสลิป Popup */}
      <td>
        {booking.slipUrl ? (
          <>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowSlip(true)}
            >
              ดู
            </button>

            {showSlip && (
              <div
                className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
                style={{ zIndex: 9999 }}
                onClick={() => setShowSlip(false)}
              >
                <img
                  src={booking.slipUrl}
                  alt="slip"
                  style={{
                    maxWidth: "90%",
                    maxHeight: "90%",
                    borderRadius: "10px",
                  }}
                />
              </div>
            )}
          </>
        ) : (
          "-"
        )}
      </td>

      <td>
        <span className={statusClass}>{statusText}</span>
      </td>

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
                onClick={() =>
                  onDelete(booking.bookingId, booking.room.number)
                }
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