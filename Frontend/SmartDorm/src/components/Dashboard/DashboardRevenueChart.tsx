import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function DashboardRevenueChart({ labels, datasets, title }: any) {
  return (
    <Line
      data={{ labels, datasets }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "top" as const },
          title: { display: true, text: title },
        },
      }}
    />
  );
}