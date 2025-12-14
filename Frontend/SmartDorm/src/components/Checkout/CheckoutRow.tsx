import type { Checkout } from "../../types/Checkout";

interface Props {
  checkout: Checkout;
  index: number;
  role: number | null;

  onView: (checkout: Checkout) => void;      // ดูรายละเอียด + อนุมัติ/ปฏิเสธ
  onCheckout: (checkout: Checkout) => void;  // ยืนยันเช็คเอาท์
  onEdit: (checkout: Checkout) => void;      // แก้ไขวันที่คืน
  onDelete: (id: string) => void;             // ลบ
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
    // 🔶 รออนุมัติ
    if (checkout.status === 0)
      return (
        <button
          className="btn btn-warning btn-sm"
          onClick={() => onView(checkout)}
        >
          รออนุมัติ
        </button>
      );

    // 🔵 รอการเช็คเอาท์
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
      <td>{checkout.booking?.fullName}</td>
      <td>{checkout.booking?.cphone}</td>
      <td>
        {checkout.requestedCheckout
          ? new Date(checkout.requestedCheckout).toLocaleDateString("th-TH")
          : "-"}
      </td>

      {/* 🔹 สถานะ (อนุมัติ / เช็คเอาท์ / badge) */}
      <td>{renderStatus()}</td>

      {/* 🔹 แก้ไข */}
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

      {/* 🔹 ลบ */}
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