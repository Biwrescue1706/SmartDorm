// src/components/BookingFilter.tsx
import type { Booking } from "../../types/Booking";

interface BookingFilterProps {
  active: "pending" | "approved" | "rejected" | "checkinPending";
  onChange: (
    status: "pending" | "approved" | "rejected" | "checkinPending",
  ) => void;
  bookings: Booking[];
  onReset: () => void;
}

export default function BookingFilter({
  active,
  onChange,
  bookings,
  onReset,
}: BookingFilterProps) {
  const counts = {
    pending: bookings.filter((b) => b.approveStatus === 0).length,
    approved: bookings.filter(
      (b) => b.approveStatus === 1 && b.checkinStatus === 1,
    ).length,
    rejected: bookings.filter((b) => b.approveStatus === 2).length,
    checkinPending: bookings.filter(
      (b) => b.approveStatus === 1 && b.checkinStatus === 0,
    ).length,
  };

  const items = [
    { key: "pending", label: "รออนุมัติ", color: "#ffc107" },
    { key: "approved", label: "อนุมัติ", color: "#28a745" },
    { key: "rejected", label: "ไม่อนุมัติ", color: "#dc3545" },
    { key: "checkinPending", label: "รอเข้าพัก", color: "#0dcaf0" },
  ] as const;

  return (
    <div className="d-flex flex-wrap justify-content-center gap-2">
      {items.map((i) => {
        const isActive = active === i.key;

        return (
          <button
            key={i.key}
            className="btn fw-bold"
            style={{
              background: i.color,
              color: "#fff",
              opacity: isActive ? 1 : 0.6,
              borderRadius: 12,
              height: 38,
              minWidth: 120,
              transition: "0.2s",
              transform: isActive ? "scale(1.05)" : "scale(1)",
              boxShadow: isActive
                ? "0 4px 10px rgba(0,0,0,0.25)"
                : "none",
            }}
            onClick={() => onChange(i.key)}
          >
            {i.label} ({counts[i.key]})
          </button>
        );
      })}

      {/* ปุ่มรีเซ็ต */}
      <button
        className="btn btn-outline-secondary fw-semibold"
        style={{ height: 38, borderRadius: 12 }}
        onClick={onReset}
      >
        🔄 รีเซ็ต
      </button>
    </div>
  );
}