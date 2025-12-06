import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title
);

interface Props {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
  }[];
  title: string;
}

export default function DashboardRevenueChart({ labels, datasets, title }: Props) {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      tension: 0.3,
      pointRadius: 3,
      borderWidth: 2,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
        color: "#4A0080",
        font: { size: 18, weight: "bold" as const },
      },
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${ctx.raw.toLocaleString("th-TH")} บาท`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v: any) => v.toLocaleString("th-TH"),
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}