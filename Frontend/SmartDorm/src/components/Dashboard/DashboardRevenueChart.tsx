// src/components/Dashboard/DashboardRevenueChart.tsx

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartOptions,
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
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: color,
          borderRadius: 10,
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
        ticks: { color: "#222", font: { weight: "bold" } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#444",
          callback: (v: string | number) => Number(v).toLocaleString("th-TH"),
        },
      },
    },
  };

  return (
    <div
      className="p-3 shadow-sm bg-white"
      style={{ height: 300, borderRadius: 14, marginBottom: 20 }}
    >
      <h5 className="fw-bold text-center mb-2" style={{ color }}>
        {title}
      </h5>
      <Bar data={chartData} options={options} />
    </div>
  );
}