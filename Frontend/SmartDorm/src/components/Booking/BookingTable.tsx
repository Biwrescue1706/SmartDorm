import BookingRow from "./BookingRow";
import type { Booking } from "../../types/Booking";

interface Props {
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  onCheckin?: (id: string) => void;   // ⭐ ต้องเพิ่ม
  role?: number | null;
  activeFilter: "pending" | "approved" | "rejected" | "checkinPending";
}

export default function BookingTable({
  bookings,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  onCheckin,
  role,
  activeFilter,
}: Props) {
  const useCard =
    window.innerWidth < 600 || (window.innerWidth < 1400 && window.innerWidth >= 600);

  const mode = useCard ? "card" : "table";

  return (
    <div className="mt-3">
      {mode === "table" ? (
        <table className="table table-bordered table-hover text-center">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>ห้อง</th>
              <th>LINE</th>
              <th>ชื่อ</th>
              <th>เบอร์</th>
              <th>วันที่จอง</th>
              <th>แจ้งเข้าพัก</th>
              <th>เข้าพักจริง</th>
              <th>สลิป</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
              <th>ลบ</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, i) => (
              <BookingRow
                key={b.bookingId}
                booking={b}
                index={i + 1}
                role={role}
                mode="table"
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                onEditSuccess={onEditSuccess}
                onCheckin={onCheckin}     // ⭐ ส่งลงไป
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="row g-3">
          {bookings.map((b, i) => (
            <div
              key={b.bookingId}
              className="col-12 col-md-4"
            >
              <BookingRow
                booking={b}
                index={i + 1}
                role={role}
                mode="card"
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                onEditSuccess={onEditSuccess}
                onCheckin={onCheckin}     // ⭐ ส่งลงไป
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}