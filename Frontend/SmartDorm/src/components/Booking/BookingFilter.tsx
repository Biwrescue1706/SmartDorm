
import type { Booking } from "../../types/Booking";

interface BookingFilterProps {
  active: "pending" | "approved" | "rejected" | "checkinPending";
  onChange: (
    status: "pending" | "approved" | "rejected" | "checkinPending"
  ) => void;
  bookings: Booking[]; //  รับ bookings เพื่อคำนวณจำนวนแต่ละสถานะ
}

export default function BookingFilter({ active, onChange, bookings }: BookingFilterProps) {
  //  คำนวณจำนวนแต่ละสถานะ
  const counts = {
    pending: bookings.filter((b) => b.approveStatus === 0).length,
    approved: bookings.filter((b) => b.approveStatus === 1).length,
    rejected: bookings.filter((b) => b.approveStatus === 2).length,
    checkinPending: bookings.filter(
  (b) => b.approveStatus === 1 && !b.checkinAt
).length,
  };

  //  รายการการ์ดแต่ละประเภท
  const cards = [
    { key: "pending", label: "รออนุมัติ", color: "#ffc107" },
    { key: "approved", label: "อนุมัติ", color: "#28a745" },
    { key: "rejected", label: "ไม่อนุมัติ", color: "#dc3545" },
    { key: "checkinPending", label: "รอเข้าพัก", color: "#0dcaf0" },
  ] as const;

  return (
    <div className="d-flex flex-wrap justify-content-center gap-3">
      {cards.map((card) => (
        <div
          key={card.key}
          role="button"
          onClick={() => onChange(card.key)}
          className={`card shadow-sm text-center border-0 p-3 ${
            active === card.key ? "shadow-md border-2 border-primary" : ""
          }`}
          style={{
            cursor: "pointer",
            width: "120px",
            borderRadius: "1rem",
            background: active === card.key
              ? `linear-gradient(135deg, ${card.color}, #ffffff)`
              : "#f8f9fa",
            transition: "all 0.25s ease-in-out",
          }}
        >
          <h5
            className="fw-bold mb-2"
            style={{
              color: active === card.key ? "#000" : card.color,
              fontSize: "1rem",
            }}
          >
            {card.label}
          </h5>
          <h3 className="fw-bold" style={{ color: card.color }}>
            {counts[card.key]}
          </h3>
        </div>
      ))}
    </div>
  );
}
