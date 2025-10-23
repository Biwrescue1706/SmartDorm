import { useState } from "react";
import Swal from "sweetalert2";
import type { Booking } from "../../types/Checkout";

interface Props {
  booking: Booking | null;
  onSave: (bookingId: string, values: { checkout: string }) => Promise<void>;
  onClose: () => void;
}

export default function CheckoutEditDialog({ booking, onSave, onClose }: Props) {
  const [checkoutDate, setCheckoutDate] = useState<string>(
    booking?.checkout
      ? new Date(booking.checkout).toISOString().split("T")[0]
      : ""
  );

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutDate) {
      Swal.fire("โปรดเลือกวันที่คืนห้อง", "", "warning");
      return;
    }
    await onSave(booking.bookingId, { checkout: checkoutDate });
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
        <div className="modal-content shadow-lg rounded-4 border-0">
          {/* Header */}
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(135deg, #00b09b, #96c93d)",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          >
            <h5 className="modal-title fw-bold">แก้ไขการคืนห้อง</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3 text-center">
                <label className="form-label fw-semibold">หมายเลขห้อง</label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={booking.room?.number || ""}
                  disabled
                />
              </div>

              <div className="mb-3 text-center">
                <label className="form-label fw-semibold">วันที่ขอคืน</label>
                <input
                  type="date"
                  className="form-control text-center"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer d-flex justify-content-between px-4 pb-3">
              <button
                type="button"
                className="btn fw-semibold text-white px-4"
                style={{
                  background: "linear-gradient(135deg, #ff512f, #dd2476)",
                  border: "none",
                }}
                onClick={onClose}
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="btn fw-semibold text-white px-4"
                style={{
                  background: "linear-gradient(135deg, #00b09b, #96c93d)",
                  border: "none",
                }}
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
