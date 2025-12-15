import type { Checkout } from "../../types/Checkout";

const thaiDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

interface Props {
  checkout: Checkout;
  index: number;
  role: number | null;
  canEdit: boolean;
  onView: (c: Checkout) => void;
  onCheckout: (c: Checkout) => void;
  onEdit: (c: Checkout) => void;
  onDelete: (id: string) => void;
}

export default function CheckoutRow({
  checkout,
  index,
  role,
  canEdit,
  onView,
  onCheckout,
  onEdit,
  onDelete,
}: Props) {
  return (
    <tr>
      <td>{index}</td>
      <td>{checkout.room?.number}</td>
      <td>{checkout.customer?.userName}</td>
      <td>{checkout.booking?.fullName}</td>
      <td>{checkout.booking?.cphone}</td>
      <td>{thaiDate(checkout.requestedCheckout)}</td>

      <td>
        {checkout.checkoutStatus === 1
          ? thaiDate(checkout.actualCheckout)
          : "-"}
      </td>

      <td>
        {checkout.status === 0 && (
          <button
            className="btn btn-warning btn-sm"
            onClick={() => onView(checkout)}
          >
            รออนุมัติ
          </button>
        )}

        {checkout.status === 1 && checkout.checkoutStatus === 0 && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onCheckout(checkout)}
          >
            รอเช็คเอาท์
          </button>
        )}

        {checkout.checkoutStatus === 1 && (
          <span className="badge bg-info">คืนแล้ว</span>
        )}

        {checkout.status === 2 && (
          <span className="badge bg-danger">ปฏิเสธ</span>
        )}
      </td>

      {canEdit && (
        <td>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit(checkout)}
          >
            ✏️
          </button>
        </td>
      )}

      {role === 0 && (
        <td>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(checkout.checkoutId)}
          >
            🗑️
          </button>
        </td>
      )}
    </tr>
  );
}
