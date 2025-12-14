import type { Checkout } from "../../types/Checkout";

interface Props {
  checkout: Checkout & {
    requestedCheckoutFormatted?: string;
    actualCheckoutFormatted?: string | null;
  };
  index: number;
  role: number | null;

  onView: (checkout: Checkout) => void;
  onCheckout: (checkout: Checkout) => void;
  onEdit: (checkout: Checkout) => void;
  onDelete: (id: string) => void;
}

export default function CheckoutRow({
  checkout,
  index,
  role,
  onView,
  onCheckout,
  onEdit,
  onDelete,
}: Props) {
  const isSuperAdmin = role === 0;
  const canEditOrDelete = isSuperAdmin;

  const renderStatus = () => {
    // 🟡 รออนุมัติ → เปิด dialog ดูรายละเอียด
    if (checkout.status === 0)
      return (
        <button
          className="btn btn-warning btn-sm"
          onClick={() => onView(checkout)}
        >
          รออนุมัติ
        </button>
      );

    // 🔵 รอการเช็คเอาท์ → confirm 2 ชั้น
    if (checkout.status === 1 && checkout.checkoutStatus === 0)
      return (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onCheckout(checkout)}
        >
          รอการเช็คเอาท์
        </button>
      );

    // ✅ คืนแล้ว
    if (checkout.status === 1 && checkout.checkoutStatus === 1)
      return <span className="badge bg-info">คืนแล้ว</span>;

    // ❌ ปฏิเสธ
    if (checkout.status === 2)
      return <span className="badge bg-danger">ปฏิเสธ</span>;

    return "-";
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{checkout.room?.number}</td>
      <td>{checkout.customer?.userName || "-"}</td>
      <td>{checkout.booking?.fullName || "-"}</td>
      <td>{checkout.booking?.cphone || "-"}</td>

      {/* วันที่ขอคืน */}
      <td>{checkout.requestedCheckoutFormatted || "-"}</td>

      {/* วันที่เช็คเอาท์จริง
          แสดงเฉพาะ status === 1 */}
      <td>
        {checkout.status === 1
          ? checkout.actualCheckoutFormatted || "-"
          : "-"}
      </td>

      {/* สถานะ */}
      <td>{renderStatus()}</td>

      {/* แก้ไข */}
      {role === 0 && (
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
      )}

      {/* ลบ */}
      {role === 0 && (
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
      )}
    </tr>
  );
}