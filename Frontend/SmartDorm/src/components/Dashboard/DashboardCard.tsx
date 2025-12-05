import { useNavigate } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  count: number;
  link: string;
}

export default function DashboardCard({ title, count, link }: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="card text-center border-0 shadow-sm"
      style={{
        background: "linear-gradient(135deg, #4A0080, #2A0052)", // SCB purple
        color: "#F7D53D", // SCB gold
        borderRadius: "18px",
        height: "95px",
        cursor: "pointer",
        transition: "transform .15s",
      }}
      onClick={() => navigate(link)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
          {title}
        </div>
        <div className="fw-bold" style={{ fontSize: "1.6rem" }}>
          {count}
        </div>
      </div>
    </div>
  );
}