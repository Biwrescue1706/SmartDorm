import type { Checkout } from "../../types/Checkout";

interface Props {
  checkout: Checkout;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

const formatThaiDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("th-TH") : "-";

export default function CheckoutApproveDialog({
  checkout,
  onApprove,
  onReject,
  onClose,
}: Props) {
  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-warning">
            <h5>ตรวจสอบคำขอคืนห้อง</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <p>ชื่อ: {checkout.booking?.fullName || "-"}</p>
            <p>LINE: {checkout.customer?.userName || "-"}</p>
            <p>วันที่ขอคืน: {formatThaiDate(checkout.requestedCheckout)}</p>
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