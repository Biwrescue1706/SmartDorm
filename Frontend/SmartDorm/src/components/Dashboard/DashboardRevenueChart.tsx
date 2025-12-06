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
  bills: any[];
  bookings: any[];
  year: string;
  month: string;
}

export default function DashboardRevenueChart({ bills, bookings, year, month }: Props) {
  const labels = getLabels(year, month);
  const datasets = getDatasets(bills, bookings);

  return (
    <section className="row g-3 mt-4">
      {datasets.map((d: any, i: number) => (
        <div key={i} className="col-12 col-md-6 col-xl-3">
          <ChartCard title={d.title} color={d.color} value={d.value} labels={labels} />
        </div>
      ))}
    </section>
  );
}

/* ==================== LABEL GEN ==================== */
function getLabels(year: string, month: string) {
  if (!year) return []; // ไม่ใช้แล้ว -> ไม่ต้องสร้าง label รายปี
  if (!month)
    return ["ม.ค", "ก.พ", "มี.ค", "เม.ย", "พ.ค", "มิ.ย", "ก.ค", "ส.ค", "ก.ย", "ต.ค", "พ.ย", "ธ.ค"];
  return [`${month}/${year}`];
}

/* ==================== DATASETS ==================== */
function getDatasets(bills: any[], bookings: any[]) {
  return [
    make("ค่าเช่าจอง", sumBooking(bookings, "rent"), "#5A00A8"),
    make("ค่ามัดจำ", sumBooking(bookings, "deposit"), "#8D41D8"),
    make("ค่าจอง", sumBooking(bookings, "bookingFee"), "#FBD341"),
    make("รวมการจอง", sumBooking(bookings, "totalBooking"), "#00916E"),
    make("ค่าเช่าห้อง", sum(bills, "rent"), "#5A00A8"),
    make("ค่าน้ำ", sum(bills, "waterCost"), "#48CAE4"),
    make("ค่าไฟ", sum(bills, "electricCost"), "#FF9800"),
    make("รวมบิล", sum(bills, "total"), "#00B4D8"),
  ];
}

function make(title: string, value: number, color: string) {
  return { title, value, color };
}

/* ==================== SUM HELPERS ==================== */
function sum(arr: any[], key: string) {
  return arr.reduce((s, b) => s + (b[key] || 0), 0);
}

function sumBooking(arr: any[], key: string) {
  return arr.reduce((s, b) => s + (b.room?.[key] || 0), 0);
}

/* ==================== CARD ==================== */
function ChartCard({ title, labels, value, color }: any) {
  const data = {
    labels: labels.length ? labels : [title],
    datasets: [
      {
        label: title,
        data: [value],
        backgroundColor: color,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="card shadow-sm" style={{ borderRadius: "16px" }}>
      <div className="card-body">
        <strong style={{ color: "#4A0080" }}>{title}</strong>
        <div style={{ height: 180 }}>
          <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
}