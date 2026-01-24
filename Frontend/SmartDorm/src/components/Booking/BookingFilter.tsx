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

  const activeItem = items.find((i) => i.key === active) ?? items[0];

  return (
    <>
      {/* < 1400 = Dropdown */}
      <div className="d-flex d-xxl-none align-items-center gap-2 justify-content-center">
        <div className="dropdown">
          <button
            className="btn dropdown-toggle fw-bold px-3"
            data-bs-toggle="dropdown"
            style={{
              background: activeItem.color,
              color: "#fff",
              borderColor: activeItem.color,
              height: 38,
            }}
          >
            {activeItem.label} ({counts[activeItem.key]})
          </button>

          <div className="dropdown-menu">
            {items.map((i) => (
              <button
                key={i.key}
                className="dropdown-item fw-bold"
                style={{
                  background: active === i.key ? i.color : "transparent",
                  color: active === i.key ? "#fff" : i.color,
                }}
                onClick={() => onChange(i.key)}
              >
                {i.label} ({counts[i.key]})
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-outline-secondary fw-semibold"
          onClick={onReset}
        >
          🔄 รีเซ็ตข้อมูล
        </button>
      </div>

      {/* >= 1400 = Cards */}
      <div className="d-none d-xxl-flex flex-wrap justify-content-center gap-3">
        {items.map((card) => (
          <div
            key={card.key}
            role="button"
            onClick={() => onChange(card.key)}
            className="card shadow-sm text-center border-0 p-3"
            style={{
              cursor: "pointer",
              width: "120px",
              borderRadius: "1rem",
              background:
                active === card.key
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
    </>
  );
}
