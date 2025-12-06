import { useMemo, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

// Register Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1400);

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 1400);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  const availableYears = Array.from({ length: 8 }, (_, i) =>
    (2568 + i).toString()
  );

  const displayTitle =
    selectedYear && selectedMonth
      ? `${monthNamesTH[parseInt(selectedMonth) - 1]} ${selectedYear}`
      : selectedYear
      ? `ปี ${selectedYear}`
      : "ทั้งหมด";

  /* ================= FILTER ================= */
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return b.status === 1 &&
        (!selectedYear || y.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth);
    });
  }, [bills, selectedYear, selectedMonth]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt || b.approveStatus !== 1) return false;
      const d = new Date(b.createdAt);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return (!selectedYear || y.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth);
    });
  }, [bookings, selectedYear, selectedMonth]);

  /* ================= REVENUE ================= */
  const sum = (arr: any[], key: any) => arr.reduce((s, b) => s + (b[key] || 0), 0);

  const totalRentBooking = sum(filteredBookings.map((b) => b.room), "rent");
  const totalDepositBooking = sum(filteredBookings.map((b) => b.room), "deposit");
  const totalBookingFee = sum(filteredBookings.map((b) => b.room), "bookingFee");

  const totalRentBill = sum(filteredBills, "rent");
  const totalWaterBill = sum(filteredBills, "waterCost");
  const totalElectricBill = sum(filteredBills, "electricCost");
  const totalAllBill = sum(filteredBills, "total");

  const totalAllRevenue =
    totalRentBooking + totalDepositBooking + totalBookingFee + totalAllBill;

  /* ================= MONTHLY DATA TABLE/GRAPH ================= */
  const monthlyBillData = useMemo(() => {
    const acc = Array.from({ length: 12 }, () => ({
      rent: 0, water: 0, electric: 0, total: 0,
    }));

    filteredBills.forEach((b) => {
      const d = new Date(b.month);
      const index = d.getUTCMonth();
      acc[index].rent += b.rent || 0;
      acc[index].water += b.waterCost || 0;
      acc[index].electric += b.electricCost || 0;
      acc[index].total += b.total || 0;
    });

    return acc.map((v, i) => ({
      month: `${monthNamesTH[i]} ${selectedYear}`,
      ...v,
      sortKey: `${selectedYear}-${String(i + 1).padStart(2, "0")}`,
    }));
  }, [filteredBills, selectedYear]);

  /* ================= CHART CONFIG ================= */
  const chartData = {
    labels: monthNamesTH,
    datasets: [
      {
        label: "รวมรายรับจากบิล (บาท)",
        data: monthlyBillData.map((d) => d.total),
        backgroundColor: "#4A0080",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#4A0080" } },
    },
    scales: {
      x: { ticks: { color: "#4A0080" } },
      y: { ticks: { color: "#4A0080" } },
    },
  };

  /* ================= UI ================= */
  return (
    <div className="mt-4">

      {/* TITLE */}
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: "#4A0080" }}>💜 รายรับรวม</h2>
        <span
          className="badge px-3 py-2 mt-2"
          style={{
            background: "#FBD341",
            borderRadius: "10px",
            color: "#4A0080",
            fontSize: "1rem",
          }}
        >
          {displayTitle}
        </span>
      </div>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
        <Select value={selectedYear} setter={setSelectedYear} items={availableYears} placeholder="ทุกปี" />
        <Select value={selectedMonth} setter={setSelectedMonth} items={monthNamesTH} withIndex placeholder="ทุกเดือน" disabled={!selectedYear} />
      </div>

      {/* SECTION - BOOKING */}
      <Section title="📦 รายรับจากการจอง">
        <RevenueCard title="ค่าเช่า" amount={totalRentBooking} color="#5A00A8" />
        <RevenueCard title="ค่ามัดจำ" amount={totalDepositBooking} color="#8D41D8" />
        <RevenueCard title="ค่าจอง" amount={totalBookingFee} color="#FBD341" dark />
        <RevenueCard title="รวม" amount={totalRentBooking + totalDepositBooking + totalBookingFee} color="#00916E" />
      </Section>

      {/* SECTION - BILL */}
      <Section title="📄 รายรับจากบิล">
        <RevenueCard title="ค่าเช่าห้อง" amount={totalRentBill} color="#5A00A8" />
        <RevenueCard title="ค่าน้ำ" amount={totalWaterBill} color="#48CAE4" />
        <RevenueCard title="ค่าไฟ" amount={totalElectricBill} color="#FF9800" />
        <RevenueCard title="รวม" amount={totalAllBill} color="#00B4D8" />
      </Section>

      {/* SECTION - TOTAL */}
      <Section title="💵 รายรับทั้งหมด">
        <RevenueCard title="รวมทั้งหมด" amount={totalAllRevenue} color="#1DB954" big />
      </Section>

      {/* SECTION - TABLE */}
      <h4 className="fw-bold text-center mt-4" style={{ color: "#4A0080" }}>
        📅 รายรับรายเดือน
      </h4>

      {isWideScreen ? (
        <table className="table table-hover text-center align-middle mt-3">
          <thead style={{ background: "#4A0080", color: "white" }}>
            <tr>
              <th>#</th><th>เดือน</th><th>ค่าเช่า</th><th>ค่าน้ำ</th><th>ค่าไฟ</th><th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBillData.map((m, i) => (
              <tr key={m.sortKey}>
                <td>{i + 1}</td>
                <td>{m.month}</td>
                <td>{m.rent.toLocaleString("th-TH")}</td>
                <td>{m.water.toLocaleString("th-TH")}</td>
                <td>{m.electric.toLocaleString("th-TH")}</td>
                <td><strong>{m.total.toLocaleString("th-TH")}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="d-flex flex-column gap-3 mt-3">
          {monthlyBillData.map((m) => <MobileMonthCard key={m.sortKey} data={m} />)}
        </div>
      )}

      {/* SECTION - CHART */}
      {selectedYear && (
        <div className="card shadow-sm p-4 mt-4" style={{ borderRadius: "14px" }}>
          <h4 className="fw-bold text-center mb-3" style={{ color: "#4A0080" }}>
            📊 กราฟรายรับรายเดือน (ปี {selectedYear})
          </h4>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Section({ title, children }: any) {
  return (
    <div className="my-4">
      <h4 className="fw-bold mb-3" style={{ color: "#4A0080" }}>{title}</h4>
      <div className="row g-3 justify-content-center">{children}</div>
    </div>
  );
}

function Select({ value, setter, items, placeholder, disabled, withIndex }: any) {
  return (
    <select
      className="form-select shadow-sm"
      style={{ width: "auto", borderRadius: "10px" }}
      disabled={disabled}
      value={value}
      onChange={(e) => setter(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {items.map((v: any, i: number) => (
        <option key={v} value={withIndex ? String(i + 1).padStart(2, "0") : v}>
          {v}
        </option>
      ))}
    </select>
  );
}

function RevenueCard({ title, amount, color, dark, big }: any) {
  return (
    <div
      className="card border-0 shadow-sm text-center col-4 col-md-2"
      style={{
        background: color,
        color: dark ? "#4A0080" : "white",
        height: big ? "110px" : "90px",
        borderRadius: "14px",
      }}
    >
      <div className="d-flex flex-column justify-content-center h-100">
        <strong>{title}</strong>
        <span>{amount.toLocaleString("th-TH")}</span>
      </div>
    </div>
  );
}

function MobileMonthCard({ data }: any) {
  return (
    <div className="card shadow-sm p-3" style={{ borderRadius: "14px" }}>
      <h5 className="fw-bold text-center mb-2" style={{ color: "#4A0080" }}>
        📆 {data.month}
      </h5>
      <div className="row text-center fw-bold">
        <div className="col-6">ค่าเช่า<br />{data.rent.toLocaleString("th-TH")}</div>
        <div className="col-6">ค่าน้ำ<br />{data.water.toLocaleString("th-TH")}</div>
        <div className="col-6 mt-2">ค่าไฟ<br />{data.electric.toLocaleString("th-TH")}</div>
        <div className="col-6 mt-2" style={{ color: "#4A0080" }}>
          รวม<br />{data.total.toLocaleString("th-TH")}
        </div>
      </div>
    </div>
  );
}