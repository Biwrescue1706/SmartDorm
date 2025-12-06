// src/components/Dashboard/DashboardRevenueChart.tsx
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DashboardRevenueChart({
  labels,
  data,
  title,
  color,
}: {
  labels: string[];
  data: number[];
  title: string;
  color: string;
}) {
  /* ================= CHART CONFIG ================= */
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: color,
          borderRadius: 8,
        },
      ],
    }),
    [labels, data, title, color]
  );

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // ไม่ต้องโชว์ legend ซ้ำ
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${title}: ${ctx.raw.toLocaleString("th-TH")} บาท`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#333",
          font: {
            weight: "bold",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#555",
          callback: (v) => v.toLocaleString("th-TH"),
        },
      },
    },
  };

  /* ================= UI ================= */
  return (
    <div
      className="p-3 shadow-sm bg-white"
      style={{
        borderRadius: "14px",
        height: "300px",
        marginBottom: "16px",
      }}
    >
      <h5 className="fw-bold text-center mb-2" style={{ color }}>
        {title}
      </h5>
      <Bar data={chartData} options={options} />
    </div>
  );
}