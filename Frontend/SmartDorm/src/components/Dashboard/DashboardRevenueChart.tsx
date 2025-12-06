// src/components/Dashboard/DashboardRevenueChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  labels: string[];
  data: number[];
  title: string;
  color: string;
}

export default function DashboardRevenueChart({ labels, data, title, color }: Props) {
  return (
    <div className="card shadow-sm p-3" style={{ borderRadius: "14px" }}>
      <h5 className="fw-bold text-center mb-3" style={{ color: "#4A0080" }}>
        {title}
      </h5>

      <Bar
        data={{
          labels,
          datasets: [
            {
              label: title,
              data,
              backgroundColor: color,
              borderRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { ticks: { color: "#4A0080" } },
            y: { ticks: { color: "#4A0080" } },
          }
        }}
      />
    </div>
  );
}