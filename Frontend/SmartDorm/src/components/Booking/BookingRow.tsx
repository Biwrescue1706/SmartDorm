import { useState } from "react";
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
  onCheckin?: (id: string) => void;
  index: number;
  role?: number | null;
  activeFilter: "pending" | "approved" | "rejected" | "checkinPending";
}

export default function BookingRow({
  booking,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  onCheckin,
  index,
  role,
  activeFilter,
}: Props) {
  const [showSlip, setShowSlip] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  // ✅ สิทธิ์
  const canManage = role === 0 || role === 1; // SuperAdmin + Admin
  const isSuperAdmin = role === 0; // SuperAdmin เท่านั้น

  const formatThaiDate = (d?: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirmCheckin = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการเช็คอิน",
      text: `คุณแน่ใจหรือไม่ว่าลูกค้าห้อง ${booking.room?.number} ได้มาเช็คอินแล้ว?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่, เช็คอินเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#28a745",
    });

    if (result.isConfirmed) {
      onCheckin?.(booking.bookingId);
      setShowCheckinModal(false);
      Swal.fire({
        icon: "success",
        title: "เช็คอินสำเร็จแล้ว!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const now = new Date();
  const checkinDate = new Date(booking.checkin || "");
  const hasReachedCheckinDay = now >= checkinDate;

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

        {/* ✅ วันเข้าพักจริง */}
        <td>
          {booking.actualCheckin ? (
            <span className="text-success fw-semibold">
              {formatThaiDate(booking.actualCheckin)}
            </span>
          ) : canManage && activeFilter === "checkinPending" ? (
            hasReachedCheckinDay ? (
              <button
                type="button"
                className="btn btn-sm btn-warning fw-semibold"
                onClick={() => setShowCheckinModal(true)}
              >
                จัดการ
              </button>
            ) : (
              "-"
            )
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        {/* ปุ่มดูสลิป */}
        <td>
          {booking.slipUrl ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowSlip(true)}
            >
              ดูสลิป
            </button>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        {/* ✅ ปุ่มจัดการการจอง */}
        <td>
          {canManage ? (
            booking.approveStatus === 0 ? (
              <ManageBookingDialog
                booking={booking}
                onApprove={onApprove}
                onReject={onReject}
                triggerClassName="btn btn-sm btn-warning"
                triggerLabel="จัดการ"
              />
            ) : booking.approveStatus === 1 ? (
              <span className="text-success fw-semibold">อนุมัติแล้ว</span>
            ) : (
              <span className="text-danger fw-semibold">ไม่อนุมัติ</span>
            )
          ) : booking.approveStatus === 1 ? (
            <span className="text-success fw-semibold">อนุมัติแล้ว</span>
          ) : booking.approveStatus === 2 ? (
            <span className="text-danger fw-semibold">ไม่อนุมัติ</span>
          ) : (
            <span className="text-warning fw-semibold">รออนุมัติ</span>
          )}
        </td>

        {/* ✅ เฉพาะ SuperAdmin เท่านั้น */}
        {isSuperAdmin && (
          <>
            <td>
              <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
            </td>
            <td>
              <button
                type="button"
                className="btn btn-sm fw-semibold text-white ms-1 mt-1 mx-1 my-1 "
                style={{
                  background: "linear-gradient(100deg, #ff0505, #f645c4)",
                  border: "none",
                  padding: "4px 8px",
                }}
                onClick={() => onDelete(booking.bookingId, booking.room.number)}
              >
                🗑️
              </button>
            </td>
          </>
        )}
      </tr>

      {/* ===== Modal: จัดการวันเข้าพักจริง ===== */}
      {showCheckinModal &&
        createPortal(
          <div
            className="modal fade show"
            style={{
              display: "block",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1060,
            }}
            onClick={() => setShowCheckinModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">จัดการวันเข้าพักจริง</h5>
                </div>
                <div className="modal-body text-center">
                  <p className="fw-semibold fs-5 mb-3">
                    ห้อง {booking.room.number}
                  </p>
                  <p>ลูกค้าท่านนี้มาเช็คอินแล้วหรือยัง?</p>
                </div>
                <div className="modal-footer justify-content-center">
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={handleConfirmCheckin}
                  >
                    มาเช็คอินแล้ว
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={() => setShowCheckinModal(false)}
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ===== Modal: แสดงสลิป ===== */}
      {showSlip &&
        createPortal(
          <div
            className="modal fade show"
            style={{
              display: "block",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1050,
            }}
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
                    src={booking.slipUrl || ""}
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
