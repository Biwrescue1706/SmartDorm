import { useNavigate } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  count: number;
  color: string;
  link: string;
  icon: string;
}

export default function DashboardCard({
  title,
  count,
  color,
  link,
  icon,
}: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="card text-center border-0 shadow-sm"
      style={{
        background: color,
        color: "white",
        borderRadius: "10px",
        height: "100px", // 🟢 การ์ดเตี้ยลง
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onClick={() => navigate(link)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <div
        className="d-flex flex-column justify-content-center align-items-center h-100"
        style={{ lineHeight: 1.1 }}
      >
        <div className="fs-5">{icon}</div>
        <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>
          {title}
        </div>
        <div className="fw-bold" style={{ fontSize: "1.2rem" }}>
          {count}
        </div>
      </div>
    </div>
  );
}
