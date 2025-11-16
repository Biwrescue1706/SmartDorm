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
  // ⭐ ฟังก์ชันแปลงวันที่ไทย → Date()
  // -------------------------
  function parseThaiDate(d: any) {
    if (!d) return null;

    if (d instanceof Date) return d; // กันค่า Date อยู่แล้ว

    try {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) return dt;
    } catch {}

    const parts = String(d).split(" ");
    if (parts.length < 3) return null;

    const day = parseInt(parts[0]);
    const monthTh = parts[1];
    const yearTh = parseInt(parts[2]);

    const monthMap: any = {
      "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3,
      "พ.ค.": 4, "มิ.ย.": 5, "ก.ค.": 6, "ส.ค.": 7,
      "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11,
    };

    const m = monthMap[monthTh];
    if (m === undefined) return null;

    return new Date(yearTh - 543, m, day);
  }

  // -------------------------
  // ⭐ เช็คค่าว่าง actualCheckin
  // -------------------------
  function isEmpty(v: any) {
    return v === null || v === undefined || v === "" || v === "null" || v === "undefined";
  }

  // -------------------------
  // ⭐ ฟอร์แมตวันที่โชว์
  // -------------------------
  const formatThai = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const checkinDate = parseThaiDate(booking.checkin);
  const today = new Date();

  // -------------------------
  // ⭐ เงื่อนไขปุ่มเช็คอิน
  // -------------------------
  const canCheckin =
    booking.approveStatus === 1 &&
    isEmpty(booking.actualCheckin) &&
    checkinDate &&
    today.getTime() >= checkinDate.getTime();

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
  const actualCheckinStr = formatThai(booking.actualCheckin);

  // -------------------------
  // ⭐ Popup สลิป
  // -------------------------
  const SlipPopup = () =>
    showSlip && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
        style={{ zIndex: 9999 }}
      >
        <div
          className="bg-white p-3 rounded-4 shadow-lg"
          style={{
            maxWidth: "95%",
            maxHeight: "95%",
            position: "relative",
          }}
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
              maxWidth: "90vw",
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

  // ============================================================================
  // ⭐ CARD MODE
  // ============================================================================
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
          <p>
            <b>วันที่เข้าพักจริง :</b> {actualCheckinStr}
          </p>
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

  // ============================================================================
  // ⭐ TABLE MODE
  // ============================================================================
  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.customer?.userName}</td>
      <td>{booking.fullName}</td>
      <td>{booking.cphone}</td>
      <td>{formatThai(booking.createdAt)}</td>
      <td>{formatThai(booking.checkin)}</td>
      <td>{!isEmpty(booking.actualCheckin) ? actualCheckinStr : "-"}</td>

      <td>
        {booking.slipUrl ? (
          <>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setShowSlip(true)}>
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