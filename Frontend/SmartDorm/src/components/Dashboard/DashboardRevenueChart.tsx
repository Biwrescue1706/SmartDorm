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

export default function DashboardRevenueChart({ labels, datasets, title }: Props) {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? ds.borderColor + "99", // ทำสีอ่อนลง
      borderColor: ds.borderColor,
      borderWidth: 1,
    })),
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "top" as const },
          title: { display: true, text: title },
        },
        scales: {
          y: {
            ticks: {
              callback: (v: any) => v.toLocaleString("th-TH") + " บาท",
            },
          },
        },
      }}
    />
  );
}