// src/components/pagesDetail/Booking/StatusBadge.tsx
interface Props {
  status: number;
  type: "approve" | "checkin";
}

export default function StatusBadge({ status, type }: Props) {
  if (type === "approve") {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">รออนุมัติ</span>;
      case 1:
        return <span className="badge bg-success">อนุมัติแล้ว</span>;
      case 2:
        return <span className="badge bg-danger">ถูกปฏิเสธ</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  }

  if (type === "checkin") {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">ยังไม่เช็คอิน</span>;
      case 1:
        return <span className="badge bg-success">เช็คอินแล้ว</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  }

  return null;
}
