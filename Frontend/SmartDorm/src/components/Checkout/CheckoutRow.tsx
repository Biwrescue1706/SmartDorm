import type { Booking } from "../../types/Checkout";

interface Props {
  booking: Booking;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string, roomNum: string) => void;
}

export default function CheckoutRow({
  booking,
  index,
  onApprove,
  onReject,
  onEdit,
  onDelete,
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
        return "-";
    }
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{booking.room.number}</td>
      <td>{booking.customer.fullName}</td>
      <td>{booking.customer.cphone}</td>
      <td>{new Date(booking.checkin).toLocaleDateString("th-TH")}</td>
      <td>
        {booking.checkout
          ? new Date(booking.checkout).toLocaleDateString("th-TH")
          : "-"}
      </td>
      <td>{renderStatus(booking.returnStatus)}</td>
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
              className="btn btn-danger btn-sm"
              onClick={() => onReject(booking.bookingId)}
            >
              ปฏิเสธ
            </button>
          </>
        )}
      </td>
      <td>
        <button
          className="btn btn-outline-primary btn-sm me-1"
          onClick={() => onEdit(booking)}
        >
          แก้ไข
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(booking.bookingId, booking.room.number)}
        >
          ลบ
        </button>
      </td>
    </tr>
  );
}
