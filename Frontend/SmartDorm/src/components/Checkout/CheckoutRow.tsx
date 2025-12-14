import type { Checkout } from "../../types/Checkout";

interface Props {
  checkout: Checkout;
  index: number;
  role: number | null;

  onEdit: (checkout: Checkout) => void;
  onDelete: (id: string) => void;
}

export default function CheckoutRow({
  checkout,
  index,
  role,
  onEdit,
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

  const isSuperAdmin = role === 0;
  const canEditOrDelete = isSuperAdmin && checkout.checkoutStatus === 0;

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

      {/* ตารางแก้ไข */}
      <td>
        {canEditOrDelete && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit(checkout)}
          >
            แก้ไข
          </button>
        )}
      </td>

      {/* ตารางลบ */}
      <td>
        {canEditOrDelete && (
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