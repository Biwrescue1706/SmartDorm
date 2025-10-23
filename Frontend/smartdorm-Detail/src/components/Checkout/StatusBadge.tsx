interface Props {
  status: number | null | undefined;
  type: "return" | "checkout";
}

export default function StatusBadge({ status, type }: Props) {
  if (type === "return") {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">รออนุมัติคืน</span>;
      case 1:
        return <span className="badge bg-success">คืนห้องแล้ว</span>;
      case 2:
        return <span className="badge bg-danger">ไม่อนุมัติ</span>;
      default:
        return <span className="badge bg-secondary">ยังไม่ขอคืน</span>;
    }
  }

  if (type === "checkout") {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">ยังไม่ขอคืน</span>;
      case 1:
        return <span className="badge bg-success">คืนห้องแล้ว</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  }

  return null;
}
