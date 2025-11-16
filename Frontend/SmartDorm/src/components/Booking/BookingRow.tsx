import { useState } from "react";
import Swal from "sweetalert2";
import type { Booking } from "../../types/Booking";
import EditBookingDialog from "./EditBookingDialog";
import ManageBookingDialog from "./ManageBookingDialog";

interface Props {
  booking: Booking;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  onCheckin?: (id: string) => void;
  role?: number | null;
  activeFilter: "pending" | "approved" | "rejected" | "checkinPending";
  mode?: "table" | "card"; // ⭐ เพิ่ม mode
}

export default function BookingRow({
  booking,
  index,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  onCheckin,
  role,
  activeFilter,
  mode = "table",
}: Props) {
  const canManage = role === 0 || role === 1;
  const isSuperAdmin = role === 0;

  const formatThaiDate = (d?: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =======================
  //  🖥 TABLE MODE (≥1400)
  // =======================
  if (mode === "table") {
    return (
      <tr>
        <td>{index}</td>
        <td>{booking.room?.number}</td>
        <td>{booking.customer?.userName || "-"}</td>
        <td>{booking.fullName}</td>
        <td>{booking.cphone}</td>
        <td>{formatThaiDate(booking.createdAt)}</td>
        <td>{formatThaiDate(booking.checkin)}</td>

        {/* วันเข้าพักจริง */}
        <td>
          {booking.actualCheckin ? (
            <span className="text-success fw-semibold">
              {formatThaiDate(booking.actualCheckin)}
            </span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        {/* สลิป */}
        <td>
          {booking.slipUrl ? (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                Swal.fire({
                  imageUrl: booking.slipUrl,
                  imageAlt: "Slip",
                  width: "auto",
                  background: "#fff",
                })
              }
            >
              ดูสลิป
            </button>
          ) : (
            "-"
          )}
        </td>

        {/* สถานะ */}
        <td>
          {booking.approveStatus === 1 ? (
            <span className="text-success fw-semibold">อนุมัติแล้ว</span>
          ) : booking.approveStatus === 2 ? (
            <span className="text-danger fw-semibold">ไม่อนุมัติ</span>
          ) : (
            <span className="text-warning fw-semibold">รออนุมัติ</span>
          )}
        </td>

        {/* ปุ่มแก้ไข/ลบ เฉพาะ SuperAdmin */}
        {isSuperAdmin && (
          <td>
            <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
          </td>
        )}
        {isSuperAdmin && (
          <td>
            <button
              className="btn btn-sm text-white fw-bold"
              style={{
                background: "linear-gradient(135deg, #ff512f, #dd2476)",
                border: "none",
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

  // =======================
  //  📱 CARD MODE (<1400)
  // =======================
  return (
    <div
      className="card shadow-sm border-0"
      style={{
        borderRadius: "16px",
        padding: "20px",
        background: "#f8f9fa",
        position: "relative",
        minHeight: "260px",
        textAlign: "center",
        paddingBottom: "90px", // เว้นที่ให้ปุ่มอยู่ด้านล่าง
      }}
    >
      <h4 className="fw-bold mb-2">ห้อง {booking.room.number}</h4>

      <p className="mb-1 fs-6">
        <b>ผู้จอง : </b> {booking.fullName}
      </p>

      <p className="mb-1 fs-6">
        <b>เบอร์โทร : </b> {booking.cphone}
      </p>

      <p className="mb-1 fs-6">
        <b>จองเมื่อ : </b> {formatThaiDate(booking.createdAt)}
      </p>

      <p className="mb-1 fs-6">
        <b>เข้าพัก : </b> {formatThaiDate(booking.checkin)}
      </p>

      <p className="mb-2 fs-6">
        <b>สถานะ : </b>
        <span
          className={`badge px-3 py-1 ${
            booking.approveStatus === 1
              ? "bg-success"
              : booking.approveStatus === 2
              ? "bg-danger"
              : "bg-warning"
          }`}
        >
          {booking.approveStatus === 1
            ? "อนุมัติแล้ว"
            : booking.approveStatus === 2
            ? "ไม่อนุมัติ"
            : "รออนุมัติ"}
        </span>
      </p>

      {/* ⭐ ปุ่มควบคุมทั้งหมดอยู่ล่างสุด ⭐ */}
      <div
        className="d-flex justify-content-center gap-3"
        style={{
          position: "absolute",
          bottom: "15px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* ปุ่มดูสลิป */}
        {booking.slipUrl && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              Swal.fire({
                imageUrl: booking.slipUrl,
                width: "auto",
                background: "#fff",
              })
            }
          >
            สลิป
          </button>
        )}

        {/* ปุ่มจัดการ (อนุมัติ/ไม่อนุมัติ) */}
        {canManage && booking.approveStatus === 0 && (
          <ManageBookingDialog
            booking={booking}
            onApprove={onApprove}
            onReject={onReject}
            triggerClassName="btn btn-sm btn-warning"
            triggerLabel="จัดการ"
          />
        )}

        {/* ปุ่มแก้ไข */}
        {isSuperAdmin && (
          <EditBookingDialog booking={booking} onSuccess={onEditSuccess} />
        )}

        {/* ปุ่มลบ */}
        {isSuperAdmin && (
          <button
            className="btn btn-sm text-white fw-bold"
            style={{
              background: "linear-gradient(135deg, #ff512f, #dd2476)",
              border: "none",
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