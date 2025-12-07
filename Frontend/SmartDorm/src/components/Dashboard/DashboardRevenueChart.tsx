import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
  }[];
  title: string;
}

export default function DashboardRevenueChart({
  labels,
  datasets,
  title,
}: Props) {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? ds.borderColor + "33", // สีโปร่งใสโทน SCB
      borderColor: ds.borderColor,
      borderWidth: 2,
      borderRadius: 6,
    })),
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 12 } },
          },
          title: {
            display: true,
            text: title, // ❌ ไม่มีคำว่า บาท
            color: "#4A148C",
            font: { size: 14, weight: "bold" },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (v: any) => v.toLocaleString("th-TH"), // ❌ เอา "บาท" ออก
              color: "#4A148C",
              font: { weight: "bold" },
            },
            grid: { color: "#E1D5F9" },
          },
          x: {
            ticks: { color: "#4A148C" },
            grid: { display: false },
          },
        },
      }}
    />
  );
}
