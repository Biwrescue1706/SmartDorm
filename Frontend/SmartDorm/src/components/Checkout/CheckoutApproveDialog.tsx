import type { Checkout } from "../../types/Checkout";

interface Props {
  checkout: Checkout;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

const formatThaiDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

export default function CheckoutApproveDialog({
  checkout,
  onApprove,
  onReject,
  onClose,
}: Props) {
  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title fw-bold">ตรวจสอบคำขอคืนห้อง</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <p><b>ชื่อผู้เช่า:</b> {checkout.booking?.fullName}</p>
            <p><b>LINE:</b> {checkout.customer?.userName}</p>
            <p><b>วันที่จอง:</b> {formatThaiDate(checkout.createdAt)}</p>
            <p><b>วันเช็คอิน:</b> {formatThaiDate(checkout.booking?.checkin)}</p>
            <p><b>วันที่ขอคืน:</b> {formatThaiDate(checkout.requestedCheckout)}</p>
          </div>

          <div className="modal-footer">
            <button className="btn btn-danger" onClick={onReject}>
              ปฏิเสธ
            </button>
            <button className="btn btn-success" onClick={onApprove}>
              อนุมัติ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}