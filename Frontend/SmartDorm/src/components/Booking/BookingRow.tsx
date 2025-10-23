import { useState } from "react";
import { createPortal } from "react-dom";
import type { Booking } from "../../types/Booking";
import EditBookingDialog from "./EditBookingDialog";
import ManageBookingDialog from "./ManageBookingDialog";

interface Props {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  index: number;
}

export default function BookingRow({
  booking,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  index,
}: Props) {
  const [showSlip, setShowSlip] = useState(false);

  const formatThaiDate = (d?: string) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* แถวข้อมูลหลักในตาราง */}
      <tr>
        <td>{index}</td>
        <td>{booking.room.number}</td>
        <td>{booking.customer.userName}</td>
        <td>{booking.customer.fullName}</td>
        <td>{booking.customer.cphone}</td>
        <td>{formatThaiDate(booking.createdAt)}</td>
        <td>{formatThaiDate(booking.checkin)}</td>
        <td>{formatThaiDate(booking.checkout)}</td>

        {/* ปุ่มดูสลิป */}
        <td>
          {booking.slipUrl ? (
            <button
              className="btn btn-sm btn-primary mt3 mx-1 my-1"
              onClick={() => setShowSlip(true)}
            >
              สลิป
            </button>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        {/* สถานะการจอง */}
        <td>
          {booking.status === 0 ? (
            <ManageBookingDialog
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
              triggerClassName="btn btn-sm btn-warning"
              triggerLabel="จัดการ"
            />
          ) : booking.status === 1 ? (
            <span className="text-success fw-semibold">อนุมัติแล้ว</span>
          ) : (
            <span className="text-danger fw-semibold">ไม่อนุมัติ</span>
          )}
        </td>

        {/* ✏️ ปุ่มแก้ไขและลบ */}
        <td>
          <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
          <button
            className="btn btn-sm fw-semibold text-white ms-2 mt-1 mx-2 my-1 "
            style={{
              background: "linear-gradient(100deg, #ff0505ff, #f645c4ff)",
              border: "none",
              padding: "4px 8px",
            }}
            onClick={() => onDelete(booking.bookingId, booking.room.number)}
          >
            🗑️
          </button>
        </td>
      </tr>

      {/* Modal แสดงสลิป — ใช้ React Portal */}
      {showSlip &&
        createPortal(
          <div
            className="modal fade show"
            style={{
              display: "block",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1050,
            }}
            tabIndex={-1}
            onClick={() => setShowSlip(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    สลิปการจองห้อง {booking.room.number}
                  </h5>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={booking.slipUrl}
                    alt="Slip"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "75vh", objectFit: "contain" }}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSlip(false)}
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
