import { useState, useEffect } from "react";
import BookingRow from "./BookingRow";
import type { Booking } from "../../types/Booking";

interface Props {
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  role?: number | null;
  activeFilter: "pending" | "approved" | "rejected" | "checkinPending";
}

export default function BookingTable({
  bookings,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  role,
  activeFilter,
}: Props) {
  const [screen, setScreen] = useState(window.innerWidth);

  useEffect(() => {
    const resize = () => setScreen(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const isMobile = screen < 600;
  const isDesktop = screen >= 1400;

  const bgColor =
    activeFilter === "pending"
      ? "#fff7d6"
      : activeFilter === "approved"
      ? "#e5ffe5"
      : activeFilter === "rejected"
      ? "#ffe5e5"
      : "#e5f4ff";

  // ⭐ DESKTOP MODE
  if (isDesktop) {
    return (
      <div className="table-responsive shadow rounded p-2">
        <table className="table table-striped text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>ห้อง</th>
              <th>LINE</th>
              <th>ชื่อ</th>
              <th>เบอร์</th>
              <th>จอง</th>
              <th>แจ้งเข้าพัก</th>
              <th>เข้าจริง</th>
              <th>สลิป</th>
              <th>สถานะ</th>
              {role === 0 && <th>แก้ไข</th>}
              {role === 0 && <th>ลบ</th>}
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, i) => (
              <BookingRow
                key={b.bookingId}
                booking={b}
                index={i + 1}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                onEditSuccess={onEditSuccess}
                role={role}
                mode="table"
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ⭐ CARD MODE
  return (
    <div
      className="p-3"
      style={{
        display: "grid",
        gap: "15px",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      }}
    >
      {bookings.map((b, i) => (
        <div
          key={b.bookingId}
          style={{
            background: bgColor,
            borderRadius: "12px",
          }}
        >
          <BookingRow
            booking={b}
            index={i + 1}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
            onEditSuccess={onEditSuccess}
            role={role}
            mode="card"
          />
        </div>
      ))}
    </div>
  );
}