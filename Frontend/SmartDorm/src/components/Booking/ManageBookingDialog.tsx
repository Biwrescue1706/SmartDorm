// src/components/Booking/ManageBookingDialog.tsx
import { useEffect, useRef, useState } from "react";
import type { Booking } from "../../types/Booking";

interface ManageBookingDialogProps {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  triggerClassName?: string;
  triggerLabel?: string;
}

export default function ManageBookingDialog({
  booking,
  onApprove,
  onReject,
  triggerClassName = "btn btn-sm btn-warning shadow-sm fw-semibold ms-2 mt-1 mx-2 my-1",
  triggerLabel = "จัดการ",
}: ManageBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isPending = booking.approveStatus === 0;
  const statusText =
    booking.approveStatus === 0
      ? "รอตรวจสอบ"
      : booking.approveStatus === 1
      ? "อนุมัติแล้ว"
      : "ไม่อนุมัติ";

  const formatThaiDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  return (
    <>
      <button className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 2000 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg border-0 overflow-hidden"
            style={{
              width: "min(550px, 95vw)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="bg-primary text-white d-flex align-items-center justify-content-between px-4 py-3">
              <h5 className="m-0 fw-bold fs-4">
                จัดการการจองห้อง{" "}
                <span className="badge text-bg-light text-primary fs-6 ms-1">
                  {booking.room.number}
                </span>
              </h5>
            </div>

            {/* Body */}
            <div
              className="px-4 py-3 bg-light flex-grow-1"
              style={{ overflowY: "auto" }}
            >
              {/* 🔹 รายละเอียดผู้จอง */}
              <div
                className="border rounded-3 p-3 bg-white shadow-sm mb-3"
                style={{ lineHeight: "2" }}
              >
                {[
                  ["ผู้ใช้ (LIFF)", booking.customer.userName],
                  ["ชื่อ-สกุล", booking.fullName],
                  ["เบอร์โทร", booking.cphone || "-"],
                  ["จองเมื่อ", formatThaiDate(booking.createdAt)],
                  ["เช็คอิน", formatThaiDate(booking.checkin)],
                ].map(([label, value], i) => (
                  <div
                    key={i}
                    className="border-bottom pb-2 mb-2"
                    style={{ marginBottom: i === 5 ? "0" : "8px" }}
                  >
                    <div className="fw-bold text-black small">{label}</div>
                    <div className="fw-semibold fs-6 text-black">{value}</div>
                  </div>
                ))}
              </div>

              {/* 🔹 สลิปโอนเงิน */}
              <div className="bg-white rounded-3 shadow-sm p-3 text-center">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold m-0">สลิปโอนเงิน</h6>
                  {booking.slipUrl && (
                    <a
                      href={booking.slipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="small text-primary fw-semibold"
                    >
                      เปิดภาพเต็ม ↗
                    </a>
                  )}
                </div>

                {booking.slipUrl ? (
                  <img
                    src={booking.slipUrl}
                    alt="สลิปโอนเงิน"
                    className="img-fluid rounded-3 shadow-sm mt-2"
                    style={{
                      maxHeight: "320px",
                      cursor: "zoom-in",
                      objectFit: "contain",
                    }}
                    onClick={() => setZoom(true)}
                  />
                ) : (
                  <div className="text-muted py-5">ไม่มีสลิปแนบมา</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-top bg-white px-4 py-3 d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                สถานะปัจจุบัน:{" "}
                <span
                  className={
                    booking.approveStatus === 1
                      ? "text-success fw-semibold"
                      : booking.approveStatus === 2
                      ? "text-danger fw-semibold"
                      : "text-warning fw-semibold"
                  }
                >
                  {statusText}
                </span>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-dark px-2"
                  onClick={() => setOpen(false)}
                >
                  ปิด
                </button>
                <button
                  className="btn btn-danger px-2"
                  disabled={!isPending}
                  onClick={() => {
                    onReject(booking.bookingId);
                    setOpen(false);
                  }}
                >
                  ปฏิเสธ
                </button>
                <button
                  className="btn btn-success px-2"
                  disabled={!isPending}
                  onClick={() => {
                    onApprove(booking.bookingId);
                    setOpen(false);
                  }}
                >
                  อนุมัติ
                </button>
              </div>
            </div>
          </div>

          {/* Zoom Overlay */}
          {zoom && booking.slipUrl && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ background: "rgba(0,0,0,0.8)", zIndex: 2100 }}
              onClick={() => setZoom(false)}
            >
              <img
                src={booking.slipUrl}
                alt="สลิปขยาย"
                className="rounded-3 shadow-lg"
                style={{
                  maxWidth: "95vw",
                  maxHeight: "95vh",
                  cursor: "zoom-out",
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}