//  src/components/Dashboard/DashboardRow.tsx
import type { Room } from "../../types/Room";

interface Props {
  room: Room;
  idx: number;
}

//  แถวของตาราง Dashboard (ใช้ใน DashboardTable)
export default function DashboardRow({ room, idx }: Props) {
  const getStatusElement = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge bg-success">ว่าง</span>;
      case 1:
        return <span className="badge bg-danger">จองแล้ว</span>;
      case 2:
        return <span className="badge bg-secondary">ไม่ว่าง</span>;
      default:
        return <span className="badge bg-light text-dark">-</span>;
    }
  };

  return (
    <tr>
      <td>{idx + 1}</td>
      <td>{room.number}</td>
      <td>{room.size}</td>
      <td>{room.rent.toLocaleString("th-TH")}</td>
      <td>{getStatusElement(room.status)}</td>
    </tr>
  );
}
