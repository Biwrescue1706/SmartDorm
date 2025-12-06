// ---------------- DashboardRevenueChart.tsx ----------------
// ใช้แสดงเฉพาะกราฟ
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  labels: string[];
  bookingData: number[];
  billData: number[];
  title: string;
}

export default function DashboardRevenueChart({
  labels,
  bookingData,
  billData,
  title,
}: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: "รายรับจากการจอง",
        data: bookingData,
        backgroundColor: "#FBD341",
        borderRadius: 8,
      },
      {
        label: "รายรับจากบิล",
        data: billData,
        backgroundColor: "#4A0080",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#4A0080", font: { weight: "bold" } } },
      tooltip: { bodyFont: { weight: "bold" } },
    },
    scales: {
      x: { ticks: { color: "#4A0080" } },
      y: { ticks: { color: "#4A0080" } },
    },
  };

  return (
    <div className="card shadow-sm p-4 my-3" style={{ borderRadius: "16px" }}>
      <h5 className="fw-bold text-center mb-3" style={{ color: "#4A0080" }}>
        📊 {title}
      </h5>
      <Bar data={data} options={options} />
    </div>
  );
}