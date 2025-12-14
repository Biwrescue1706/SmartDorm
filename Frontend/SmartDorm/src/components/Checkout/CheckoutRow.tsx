import type { Checkout } from "../../types/Checkout";

interface Props {
  checkout: Checkout;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CheckoutRow({
  checkout,
  index,
  onApprove,
  onReject,
  onDelete,
}: Props) {
  const renderStatus = () => {
    if (checkout.status === 0)
      return <span className="badge bg-warning">รออนุมัติ</span>;

    if (checkout.status === 1 && checkout.checkoutStatus === 0)
      return <span className="badge bg-primary">รอการเช็คเอาท์</span>;

    if (checkout.status === 1 && checkout.checkoutStatus === 1)
      return <span className="badge bg-info">คืนแล้ว</span>;

    if (checkout.status === 2)
      return <span className="badge bg-danger">ปฏิเสธ</span>;

    return "-";
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{checkout.room?.number}</td>
      <td>{checkout.booking?.fullName}</td>
      <td>{checkout.booking?.cphone}</td>
      <td>
        {checkout.requestedCheckout
          ? new Date(checkout.requestedCheckout).toLocaleDateString("th-TH")
          : "-"}
      </td>
      <td>{renderStatus()}</td>
      <td>
        {checkout.status === 0 && (
          <>
            <button
              className="btn btn-success btn-sm me-1"
              onClick={() => onApprove(checkout.checkoutId)}
            >
              อนุมัติ
            </button>
            <button
              className="btn btn-danger btn-sm me-1"
              onClick={() => onReject(checkout.checkoutId)}
            >
              ปฏิเสธ
            </button>
          </>
        )}

        {checkout.checkoutStatus === 0 && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(checkout.checkoutId)}
          >
            ลบ
          </button>
        )}
      </td>
    </tr>
  );
}