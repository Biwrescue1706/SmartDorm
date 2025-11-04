interface RoomFilterProps {
  activeFilter: "all" | "available" | "booked";
  counts: { total: number; available: number; booked: number };
  onFilterChange: (filter: "all" | "available" | "booked") => void;
}

export default function RoomFilter({
  activeFilter,
  counts,
  onFilterChange,
}: RoomFilterProps) {
  const filters = [
    {
      key: "all",
      label: "ทั้งหมด",
      count: counts.total,
      color: "linear-gradient(135deg, #00b4d8, #0077b6)",
    },
    {
      key: "available",
      label: "ห้องว่าง",
      count: counts.available,
      color: "linear-gradient(135deg, #38b000, #008000)",
    },
    {
      key: "booked",
      label: "ห้องเต็ม",
      count: counts.booked,
      color: "linear-gradient(135deg, #ef233c, #d90429)",
    },
  ] as const;

  return (
    <div className="container mb-3">
      <div className="row g-2 justify-content-center">
        {filters.map((f) => (
          <div key={f.key} className="col-3 col-sm-3 col-md-2 col-lg-2">
            <div
              className="card text-center border-0 shadow-sm"
              style={{
                background: f.color,
                color: "white",
                borderRadius: "10px",
                height: "65px",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                opacity: activeFilter === f.key ? 1 : 0.6,
                transform: activeFilter === f.key ? "scale(1.05)" : "scale(1.0)",
              }}
              onClick={() => onFilterChange(f.key)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform =
                  activeFilter === f.key ? "scale(1.05)" : "scale(1.0)")
              }
            >
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <div className="fw-bold" style={{ fontSize: "1rem" }}>
                  {f.label}
                </div>
                <div className="fw-semibold" style={{ fontSize: "1rem" }}>
                  {f.count}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
