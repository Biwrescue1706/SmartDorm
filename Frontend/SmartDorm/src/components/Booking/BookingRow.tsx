//src/components/Booking/BookingRow.tsx
import { useState } from "react";
import Swal from "sweetalert2";
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
  mode: "table" | "card";
  showActualCheckinColumn: boolean;
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
  mode,
  showActualCheckinColumn,
}: Props) {
  const isSuperAdmin = role === 0;

  const isEmpty = (v: any) => v === null || v === undefined || v === "";

  const formatThai = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const normalizeDate = (d: any) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const today = normalizeDate(new Date());
  const checkinDate = booking.checkin ? normalizeDate(booking.checkin) : today;

  const canCheckin =
    booking.approveStatus === 1 &&
    isEmpty(booking.actualCheckin) &&
    today.getTime() >= checkinDate.getTime();

  const [showSlip, setShowSlip] = useState(false);

  const confirmCheckin = () => {
    Swal.fire({
      title: "ยืนยันการเช็คอิน?",
      html: `เช็คอินให้ <b>${booking.fullName}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((r) => {
      if (r.isConfirmed) {
        onCheckin?.(booking.bookingId);
        Swal.fire({
          icon: "success",
          title: "เช็คอินสำเร็จ",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

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

  const SlipPopup = () =>
    showSlip && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
        style={{ zIndex: 9999 }}
        onClick={() => setShowSlip(false)}
      >
        <div
          className="bg-white p-3 rounded-4 shadow-lg"
          style={{ maxWidth: "100%", maxHeight: "100%", position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="text-center fw-bold mb-3">
            สลิปห้อง {booking.room.number}
          </h1>

          <img
            src={booking.slipUrl!}
            style={{
              maxWidth: "70%",
              maxHeight: "50vh",
              objectFit: "contain",
              borderRadius: "10px",
            }}
          />

          <div className="text-center mt-3">
            <button
              className="btn btn-secondary "
              onClick={() => setShowSlip(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    );

  // ------------------------------ CARD MODE ------------------------------
  if (mode === "card") {
    return (
      <div className="shadow-sm rounded-4 p-3 bg-light border text-center mb-2">
        <h5 className="fw-bold">ห้อง {booking.room.number}</h5>

        <p className="mt-2 mb-1">
          <b>LINE :</b> {booking.customer?.userName}
        </p>
        <p className="mb-1">
          <b>ผู้จอง :</b> {booking.fullName}
        </p>
        <p className="mb-1">
          <b>เบอร์ :</b> {booking.cphone}
        </p>
        <p className="mb-1">
          <b>วันจอง :</b> {formatThai(booking.createdAt)}
        </p>
        <p className="mb-1">
          <b>แจ้งเข้าพัก :</b> {formatThai(booking.checkin)}
        </p>

        {showActualCheckinColumn && booking.actualCheckin !== null && (
          <p className="mb-1">
            <b>เข้าพักจริง :</b> {formatThai(booking.actualCheckin)}
          </p>
        )}

        <p className="mt-2">
          <b>สถานะ : </b> <span className={statusClass}>{statusText}</span>
        </p>

        {booking.slipUrl && (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowSlip(true)}
            >
              ดูสลิป
            </button>
            <SlipPopup />
          </>
        )}

        <div className="d-flex justify-content-center gap-2 mt-3">
          {booking.approveStatus === 0 && (
            <ManageBookingDialog
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}

          {canCheckin && (
            <button
              className="btn btn-success btn-sm ms-2 mt-1 mx-2 my-1"
              onClick={confirmCheckin}
            >
              เช็คอิน
            </button>
          )}

          {isSuperAdmin && (
            <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
          )}

          {isSuperAdmin && (
            <button
              className="btn btn-sm fw-semibold text-white ms-2 mt-1 mx-2 my-1"
              style={{
                background: "linear-gradient(135deg, #fc2525ff, #eac913ff)",
                border: "none",
                padding: "4px 8px",
              }}
              onClick={() => onDelete(booking.bookingId, booking.room.number)}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------ TABLE MODE ------------------------------
  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.customer?.userName}</td>
      <td>{booking.fullName}</td>
      <td>{booking.cphone}</td>
      <td>{formatThai(booking.createdAt)}</td>
      <td>{formatThai(booking.checkin)}</td>

      {showActualCheckinColumn && (
        <td className="text-center">
          {!isEmpty(booking.actualCheckin) && (
            <span>{formatThai(booking.actualCheckin)}</span>
          )}

          {isEmpty(booking.actualCheckin) && canCheckin && (
            <button
              className="btn btn-sm fw-semibold text-black ms-2 mt-1 mx-2 my-1"
              style={{
                background: "linear-gradient(135deg, #3fe64dff, #f0cd09ff)",
                border: "none",
                padding: "4px 8px",
              }}
              onClick={confirmCheckin}
            >
              เช็คอิน
            </button>
          )}
        </td>
      )}

      <td className="text-center">
        {booking.slipUrl ? (
          <>
            <button
              className="btn btn-outline-primary btn-sm fw-semibold text-whlie ms-2 mt-1 mx-2 my-1"
              onClick={() => setShowSlip(true)}
            >
              ดูสลิป
            </button>
            <SlipPopup />
          </>
        ) : (
          "-"
        )}
      </td>

      <td className="text-center">
        {booking.approveStatus !== 0 && (
          <span className={statusClass}>{statusText}</span>
        )}

        {booking.approveStatus === 0 && (
          <ManageBookingDialog
            booking={booking}
            onApprove={onApprove}
            onReject={onReject}
          />
        )}
      </td>

      {isSuperAdmin && (
        <td className="text-center">
          <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
        </td>
      )}

      {isSuperAdmin && (
        <td className="text-center">
          <button
            className="btn btn-sm fw-semibold text-white ms-2 mt-1 mx-2 my-1"
            style={{
              background: "linear-gradient(135deg, #fc2525ff, #eac913ff)",
              border: "none",
              padding: "4px 8px",
            }}
            onClick={() => onDelete(booking.bookingId, booking.room.number)}
          >
            🗑️
          </button>
        </td>
      )}
    </tr>
  );
}
