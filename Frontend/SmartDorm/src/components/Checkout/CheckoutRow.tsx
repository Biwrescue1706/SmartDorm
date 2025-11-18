// src/components/Checkout/CheckoutRow.tsx
import type { Booking } from "../../types/Checkout";

interface Props {
  booking: Booking;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string, roomNum: string) => void;
  onConfirmReturn: (id: string) => void; // ✅ เพิ่ม prop ใหม่
}

export default function CheckoutRow({
  booking,
  index,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onConfirmReturn, // ✅ รับ prop
}: Props) {
  const renderStatus = (status: number | null) => {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">รออนุมัติ</span>;
      case 1:
        return <span className="badge bg-success">อนุมัติแล้ว</span>;
      case 2:
        return <span className="badge bg-danger">ถูกปฏิเสธ</span>;
      default:
        return <span className="text-muted">-</span>;
    }
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.fullName}</td>
      <td>{booking.cphone}</td>
      <td>{new Date(booking.checkin).toLocaleDateString("th-TH")}</td>
      <td>
        {booking.checkout
          ? new Date(booking.checkout).toLocaleDateString("th-TH")
          : "-"}
      </td>
      <td>{renderStatus(booking.returnStatus)}</td>

      {/* ✅ ปุ่ม "จัดการ" หรือแสดงวันคืนจริง */}
      <td>
        {booking.checkoutStatus === 0 ? (
          <button
            className="btn btn-warning btn-sm fw-semibold"
            onClick={() => onConfirmReturn(booking.bookingId)}
          >
            จัดการ
          </button>
        ) : (
          <span className="text-success fw-semibold">
            {booking.actualCheckout
              ? new Date(booking.actualCheckout).toLocaleDateString("th-TH")
              : "คืนแล้ว"}
          </span>
        )}
      </td>

      {/* ปุ่มอนุมัติ/ปฏิเสธ/แก้ไข/ลบ */}
      <td>
        {booking.returnStatus === 0 && (
          <>
            <button
              className="btn btn-success btn-sm me-1"
              onClick={() => onApprove(booking.bookingId)}
            >
              อนุมัติ
            </button>
            <button
              className="btn btn-danger btn-sm me-1"
              onClick={() => onReject(booking.bookingId)}
            >
              ปฏิเสธ
            </button>
          </>
        )}
        <button
          className="btn btn-outline-primary btn-sm me-1"
          onClick={() => onEdit(booking)}
        >
          ✏️
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(booking.bookingId, booking.room.number)}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}
