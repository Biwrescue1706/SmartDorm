// ================= DashboardRevenueChart.tsx =================
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DashboardRevenueChart({
  labels,
  data,
  title,
  subtitle,
  color,
}: {
  labels: string[];
  data: number[];
  title: string;
  subtitle: string;
  color: string;
}) {
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: color,
          borderRadius: 12,
        },
      ],
    }),
    [labels, data, title, color]
  );

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${title}: ${(ctx.raw as number).toLocaleString("th-TH")} บาท`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#2E2E2E", font: { weight: "bold" } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#555",
          callback(value) {
            return Number(value).toLocaleString("th-TH");
          },
        },
      },
    },
  };

  return (
    <div
      className="p-3 shadow-sm bg-white"
      style={{ height: 320, borderRadius: 16, marginBottom: 25 }}
    >
      <h5 className="fw-bold text-center" style={{ color }}>
        {title}
      </h5>
      <p className="text-center mb-1" style={{ fontSize: 13 }}>
        ({subtitle})
      </p>
      <Bar data={chartData} options={options} />
    </div>
  );
}