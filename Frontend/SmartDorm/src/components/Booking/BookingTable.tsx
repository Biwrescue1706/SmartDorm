import { useState, useEffect } from "react";
import Pagination from "../Pagination";
import BookingRow from "./BookingRow";
import type { Booking } from "../../types/Booking";

interface Props {
  bookings?: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  onCheckin?: (id: string) => void;
  role?: number | null;
  activeFilter: "pending" | "approved" | "rejected" | "checkinPending";
}

export default function BookingTable({
  bookings = [],
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  onCheckin,
  role,
  activeFilter,
}: Props) {
  const [width, setWidth] = useState(window.innerWidth);

  // ตรวจขนาดจอ
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1400;
  const isDesktop = width >= 1400;

  // ==========================
  //  🖥 DESKTOP: TABLE MODE
  // ==========================
  if (isDesktop) {
    return (
      <div className="mx-auto" style={{ maxWidth: "1500px", padding: "0 20px" }}>
        <div className="table-responsive shadow-sm rounded-3">
          <table className="table table-striped table-bordered text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>ห้อง</th>
                <th>Line</th>
                <th>ชื่อผู้จอง</th>
                <th>เบอร์โทร</th>
                <th>วันจอง</th>
                <th>วันที่แจ้งเข้าพัก</th>
                <th>วันเข้าพักจริง</th>
                <th>สลิป</th>
                <th>สถานะ</th>
                {role === 0 && <th>แก้ไข</th>}
                {role === 0 && <th>ลบ</th>}
              </tr>
            </thead>

            <tbody>
              {bookings.length ? (
                bookings.map((b, i) => (
                  <BookingRow
                    key={b.bookingId}
                    booking={b}
                    index={i + 1}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    onEditSuccess={onEditSuccess}
                    onCheckin={onCheckin}
                    role={role}
                    activeFilter={activeFilter}
                    mode="table"
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="py-4 text-muted">
                    ไม่พบข้อมูลการจอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================
  //  📱 MOBILE/TABLET: CARD MODE
  // ==========================
  const gridCols = isMobile ? "1fr" : "repeat(3, 1fr)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridCols,
        gap: "20px",
        padding: "10px 20px",
      }}
    >
      {bookings.map((b, i) => (
        <BookingRow
          key={b.bookingId}
          booking={b}
          index={i + 1}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
          onCheckin={onCheckin}
          role={role}
          activeFilter={activeFilter}
          mode="card"
        />
      ))}
    </div>
  );
}