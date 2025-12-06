// src/components/Dashboard/DashboardRevenue.tsx
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

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1400
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmall = windowWidth < 600;
  const isLarge = windowWidth >= 1400;

  const monthNamesTH = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const availableYears = Array.from({ length: 8 }, (_, i) =>
    (2568 + i).toString()
  );

  const selectedMonthName =
    selectedMonth && monthNamesTH[parseInt(selectedMonth) - 1];

  const displayTitle =
    selectedYear && selectedMonth
      ? `${selectedMonthName} ${selectedYear}`
      : selectedYear
      ? `ปี ${selectedYear}`
      : "ทุกปี (รวมทั้งหมด)";

  /* ================= FILTER ================= */
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const year = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return (
        b.status === 1 &&
        (!selectedYear || year.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      );
    });
  }, [bills, selectedYear, selectedMonth]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt || b.approveStatus !== 1) return false;
      const d = new Date(b.createdAt);
      const year = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return (
        (!selectedYear || year.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      );
    });
  }, [bookings, selectedYear, selectedMonth]);

  /* ================= REVENUE (TOTAL) ================= */
  const totalRentBooking = filteredBookings.reduce(
    (s, b) => s + (b.room?.rent || 0),
    0
  );
  const totalDepositBooking = filteredBookings.reduce(
    (s, b) => s + (b.room?.deposit || 0),
    0
  );
  const totalBookingFee = filteredBookings.reduce(
    (s, b) => s + (b.room?.bookingFee || 0),
    0
  );

  const totalRentBill = filteredBills.reduce(
    (s, b) => s + (b.rent || 0),
    0
  );
  const totalWaterBill = filteredBills.reduce(
    (s, b) => s + (b.waterCost || 0),
    0
  );
  const totalElectricBill = filteredBills.reduce(
    (s, b) => s + (b.electricCost || 0),
    0
  );
  const totalAllBill = filteredBills.reduce(
    (s, b) => s + (b.total || 0),
    0
  );

  const totalAllRevenue =
    totalRentBooking + totalDepositBooking + totalBookingFee + totalAllBill;

  /* ================= TIME-SERIES สำหรับกราฟ ================= */
  const chartSeries = useMemo(() => {
    const labels: string[] = [];
    const bookingRent: number[] = [];
    const bookingDeposit: number[] = [];
    const bookingFee: number[] = [];
    const bookingTotal: number[] = [];
    const billRent: number[] = [];
    const billWater: number[] = [];
    const billElectric: number[] = [];
    const billTotal: number[] = [];

    // ดึงข้อมูลปี/เดือนจากทั้งบิลและการจอง
    if (!selectedYear) {
      // โหมด "ทุกปี" => แกน X เป็นปี
      const yearSet = new Set<number>();
      filteredBills.forEach((b) => {
        const d = new Date(b.month);
        yearSet.add(d.getUTCFullYear() + 543);
      });
      filteredBookings.forEach((b) => {
        const d = new Date(b.createdAt!);
        yearSet.add(d.getUTCFullYear() + 543);
      });

      const years = Array.from(yearSet).sort((a, b) => a - b);

      years.forEach((yearBE) => {
        labels.push(yearBE.toString());

        let rB = 0,
          dB = 0,
          fB = 0;
        let rBill = 0,
          wBill = 0,
          eBill = 0,
          tBill = 0;

        filteredBookings.forEach((b) => {
          const d = new Date(b.createdAt!);
          const y = d.getUTCFullYear() + 543;
          if (y === yearBE) {
            rB += b.room?.rent || 0;
            dB += b.room?.deposit || 0;
            fB += b.room?.bookingFee || 0;
          }
        });

        filteredBills.forEach((b) => {
          const d = new Date(b.month);
          const y = d.getUTCFullYear() + 543;
          if (y === yearBE) {
            rBill += b.rent || 0;
            wBill += b.waterCost || 0;
            eBill += b.electricCost || 0;
            tBill += b.total || 0;
          }
        });

        bookingRent.push(rB);
        bookingDeposit.push(dB);
        bookingFee.push(fB);
        bookingTotal.push(rB + dB + fB);

        billRent.push(rBill);
        billWater.push(wBill);
        billElectric.push(eBill);
        billTotal.push(tBill);
      });
    } else if (selectedYear && !selectedMonth) {
      // เลือกปีอย่างเดียว => แกน X เป็นเดือน
      for (let i = 0; i < 12; i++) {
        const label = monthNamesTH[i];
        labels.push(label);
        const monthStr = String(i + 1).padStart(2, "0");

        let rB = 0,
          dB = 0,
          fB = 0;
        let rBill = 0,
          wBill = 0,
          eBill = 0,
          tBill = 0;

        filteredBookings.forEach((b) => {
          const d = new Date(b.createdAt!);
          const y = d.getUTCFullYear() + 543;
          const m = String(d.getUTCMonth() + 1).padStart(2, "0");
          if (y.toString() === selectedYear && m === monthStr) {
            rB += b.room?.rent || 0;
            dB += b.room?.deposit || 0;
            fB += b.room?.bookingFee || 0;
          }
        });

        filteredBills.forEach((b) => {
          const d = new Date(b.month);
          const y = d.getUTCFullYear() + 543;
          const m = String(d.getUTCMonth() + 1).padStart(2, "0");
          if (y.toString() === selectedYear && m === monthStr) {
            rBill += b.rent || 0;
            wBill += b.waterCost || 0;
            eBill += b.electricCost || 0;
            tBill += b.total || 0;
          }
        });

        bookingRent.push(rB);
        bookingDeposit.push(dB);
        bookingFee.push(fB);
        bookingTotal.push(rB + dB + fB);

        billRent.push(rBill);
        billWater.push(wBill);
        billElectric.push(eBill);
        billTotal.push(tBill);
      }
    } else if (selectedYear && selectedMonth) {
      // เลือกปี + เดือน => กราฟ 1 จุดของช่วงนั้น
      const label = `${selectedMonthName} ${selectedYear}`;
      labels.push(label);

      let rB = 0,
        dB = 0,
        fB = 0;
      let rBill = 0,
        wBill = 0,
        eBill = 0,
        tBill = 0;

      filteredBookings.forEach((b) => {
        const d = new Date(b.createdAt!);
        const y = d.getUTCFullYear() + 543;
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        if (y.toString() === selectedYear && m === selectedMonth) {
          rB += b.room?.rent || 0;
          dB += b.room?.deposit || 0;
          fB += b.room?.bookingFee || 0;
        }
      });

      filteredBills.forEach((b) => {
        const d = new Date(b.month);
        const y = d.getUTCFullYear() + 543;
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        if (y.toString() === selectedYear && m === selectedMonth) {
          rBill += b.rent || 0;
          wBill += b.waterCost || 0;
          eBill += b.electricCost || 0;
          tBill += b.total || 0;
        }
      });

      bookingRent.push(rB);
      bookingDeposit.push(dB);
      bookingFee.push(fB);
      bookingTotal.push(rB + dB + fB);

      billRent.push(rBill);
      billWater.push(wBill);
      billElectric.push(eBill);
      billTotal.push(tBill);
    }

    return {
      labels,
      bookingRent,
      bookingDeposit,
      bookingFee,
      bookingTotal,
      billRent,
      billWater,
      billElectric,
      billTotal,
    };
  }, [
    filteredBills,
    filteredBookings,
    monthNamesTH,
    selectedMonth,
    selectedMonthName,
    selectedYear,
  ]);

  /* ================= MONTHLY TABLE DATA (สำหรับตาราง/การ์ดรายเดือน) ================= */
  const monthlyTableData = useMemo(() => {
    const acc = new Map<
      string,
      { rent: number; water: number; electric: number; total: number }
    >();

    filteredBills.forEach((b) => {
      const d = new Date(b.month);
      const year = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const key = `${year}-${m}`;
      const current = acc.get(key) || {
        rent: 0,
        water: 0,
        electric: 0,
        total: 0,
      };
      current.rent += b.rent || 0;
      current.water += b.waterCost || 0;
      current.electric += b.electricCost || 0;
      current.total += b.total || 0;
      acc.set(key, current);
    });

    return Array.from(acc.entries()).map(([key, v]) => {
      const [y, m] = key.split("-");
      return {
        month: `${monthNamesTH[+m - 1]} ${y}`,
        sortKey: key,
        ...v,
      };
    });
  }, [filteredBills, monthNamesTH]);

  /* ================= UI ================= */
  const graphColClass = isSmall ? "col-12" : "col-12 col-md-6 col-lg-4";

  return (
    <div className="mt-4">
      {/* TITLE */}
      <div className="text-center mb-4">
        <h2
          className="fw-bold"
          style={{
            color: "#4A0080",
            textShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          💜 รายรับรวม SmartDorm
        </h2>
        <div
          className="badge px-3 py-2 mt-2"
          style={{
            background: "#FBD341",
            fontSize: "1rem",
            borderRadius: "12px",
            color: "#4A0080",
            boxShadow: "0 0 10px rgba(251, 211, 65, 0.45)",
          }}
        >
          {displayTitle}
        </div>
      </div>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
        <Select
          value={selectedYear}
          setter={(v: string) => {
            setSelectedYear(v);
            setSelectedMonth("");
          }}
          items={availableYears}
          placeholder="ทุกปี"
        />
        <Select
          value={selectedMonth}
          setter={setSelectedMonth}
          items={monthNamesTH}
          placeholder="ทุกเดือน"
          disabled={!selectedYear}
          withIndex
        />
      </div>

      {/* SUMMARY CARD รวมทุกอย่าง */}
      <div
        className="card shadow-sm text-center mx-auto mb-4"
        style={{
          maxWidth: "420px",
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, #4A0080 0%, #7B2CBF 50%, #FBD341 100%)",
          color: "white",
        }}
      >
        <div className="card-body">
          <h5 className="fw-semibold mb-2">💰 รายรับทั้งหมด (จอง + บิล)</h5>
          <h3 className="fw-bold mb-0">
            {totalAllRevenue.toLocaleString("th-TH")} บาท
          </h3>
        </div>
      </div>

      {/* 🔹 กราฟ (มาก่อนการ์ดรายเดือน) */}
      <section className="mb-4">
        <h4 className="fw-bold mb-3" style={{ color: "#4A0080" }}>
          📊 กราฟรายรับ (ปรับตามปี / เดือนที่เลือก)
        </h4>
        <div className="row g-3">
          {/* Booking */}
          <div className={graphColClass}>
            <MetricChartCard
              title="ค่าเช่าจากการจอง"
              labels={chartSeries.labels}
              data={chartSeries.bookingRent}
              color="#5A00A8"
            />
          </div>
          <div className={graphColClass}>
            <MetricChartCard
              title="ค่ามัดจำ"
              labels={chartSeries.labels}
              data={chartSeries.bookingDeposit}
              color="#8D41D8"
            />
          </div>
          <div className={graphColClass}>
            <MetricChartCard
              title="ค่าจอง"
              labels={chartSeries.labels}
              data={chartSeries.bookingFee}
              color="#FBD341"
              textColor="#4A0080"
            />
          </div>
          <div className={graphColClass}>
            <MetricChartCard
              title="รวมรายรับจากการจอง"
              labels={chartSeries.labels}
              data={chartSeries.bookingTotal}
              color="#00916E"
            />
          </div>

          {/* Bills */}
          <div className={graphColClass}>
            <MetricChartCard
              title="ค่าเช่าห้อง (บิล)"
              labels={chartSeries.labels}
              data={chartSeries.billRent}
              color="#5A00A8"
            />
          </div>
          <div className={graphColClass}>
            <MetricChartCard
              title="ค่าน้ำ"
              labels={chartSeries.labels}
              data={chartSeries.billWater}
              color="#48CAE4"
              textColor="#002B3D"
            />
          </div>
          <div className={graphColClass}>
            <MetricChartCard
              title="ค่าไฟ"
              labels={chartSeries.labels}
              data={chartSeries.billElectric}
              color="#FF9800"
            />
          </div>
          <div className={graphColClass}>
            <MetricChartCard
              title="รวมรายรับจากบิล"
              labels={chartSeries.labels}
              data={chartSeries.billTotal}
              color="#00B4D8"
            />
          </div>
        </div>
      </section>

      {/* 🔹 การ์ดสรุปหมวด Booking / Bill / รวม */}
      <Section title="📦 รายรับจากการจอง">
        <RevenueCard
          title="ค่าเช่า"
          amount={totalRentBooking}
          color="#5A00A8"
        />
        <RevenueCard
          title="ค่ามัดจำ"
          amount={totalDepositBooking}
          color="#8D41D8"
        />
        <RevenueCard
          title="ค่าจอง"
          amount={totalBookingFee}
          color="#FBD341"
          dark
        />
        <RevenueCard
          title="รวมการจอง"
          amount={totalRentBooking + totalDepositBooking + totalBookingFee}
          color="#00916E"
        />
      </Section>

      <Section title="📄 รายรับจากบิล">
        <RevenueCard
          title="ค่าเช่าห้อง"
          amount={totalRentBill}
          color="#5A00A8"
        />
        <RevenueCard
          title="ค่าน้ำ"
          amount={totalWaterBill}
          color="#48CAE4"
          dark
        />
        <RevenueCard
          title="ค่าไฟ"
          amount={totalElectricBill}
          color="#FF9800"
        />
        <RevenueCard
          title="รวมบิล"
          amount={totalAllBill}
          color="#00B4D8"
        />
      </Section>

      <Section title="💵 รายรับทั้งหมด">
        <RevenueCard
          title="รวมทั้งหมด (จอง + บิล)"
          amount={totalAllRevenue}
          color="#1DB954"
          big
        />
      </Section>

      {/* 🔹 รายรับรายเดือน (ตาราง / การ์ด) */}
      <h3
        className="fw-bold text-center mt-4 mb-2"
        style={{ color: "#4A0080" }}
      >
        📅 รายรับรายเดือนจากบิล
      </h3>

      {isLarge ? (
        <table
          className="table table-hover text-center align-middle"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        >
          <thead style={{ background: "#4A0080", color: "white" }}>
            <tr>
              <th>#</th>
              <th>เดือน</th>
              <th>ค่าเช่า</th>
              <th>ค่าน้ำ</th>
              <th>ค่าไฟ</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {monthlyTableData.length ? (
              monthlyTableData
                .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
                .map((m, i) => (
                  <tr key={m.sortKey}>
                    <td>{i + 1}</td>
                    <td>{m.month}</td>
                    <td>{m.rent.toLocaleString("th-TH")}</td>
                    <td>{m.water.toLocaleString("th-TH")}</td>
                    <td>{m.electric.toLocaleString("th-TH")}</td>
                    <td>
                      <strong>{m.total.toLocaleString("th-TH")}</strong>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={6}>ไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <div className="d-flex flex-column gap-3">
          {monthlyTableData.length ? (
            monthlyTableData
              .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
              .map((m) => <MobileMonthCard key={m.sortKey} data={m} />)
          ) : (
            <p className="text-muted text-center">ไม่มีข้อมูล</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Select({
  value,
  setter,
  items,
  placeholder,
  disabled,
  withIndex,
}: {
  value: string;
  setter: (v: string) => void;
  items: string[];
  placeholder: string;
  disabled?: boolean;
  withIndex?: boolean;
}) {
  return (
    <select
      className="form-select shadow-sm"
      disabled={disabled}
      style={{ width: "auto", borderRadius: "10px" }}
      value={value}
      onChange={(e) => setter(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {items.map((v, i) => (
        <option
          key={v}
          value={withIndex ? String(i + 1).padStart(2, "0") : v}
        >
          {v}
        </option>
      ))}
    </select>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-4">
      <h4 className="fw-bold mb-3" style={{ color: "#4A0080" }}>
        {title}
      </h4>
      <div className="row g-3 justify-content-center">{children}</div>
    </div>
  );
}

function RevenueCard({
  title,
  amount,
  color,
  dark,
  big,
}: {
  title: string;
  amount: number;
  color: string;
  dark?: boolean;
  big?: boolean;
}) {
  return (
    <div
      className="card border-0 shadow-sm text-center col-6 col-md-3 col-lg-2"
      style={{
        background: color,
        color: dark ? "#4A0080" : "white",
        height: big ? "110px" : "90px",
        borderRadius: "14px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
      }}
    >
      <div className="d-flex flex-column justify-content-center h-100 px-1">
        <strong style={{ fontSize: "0.95rem" }}>{title}</strong>
        <span style={{ fontSize: "0.95rem" }}>
          {amount.toLocaleString("th-TH")}
        </span>
      </div>
    </div>
  );
}

function MetricChartCard({
  title,
  labels,
  data,
  color,
  textColor = "white",
}: {
  title: string;
  labels: string[];
  data: number[];
  color: string;
  textColor?: string;
}) {
  const chartData: any = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: color,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          color: "#4A0080",
          font: { weight: "bold" },
        },
      },
      x: {
        ticks: {
          color: "#4A0080",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("th-TH")} บาท`,
        },
      },
    },
  };

  return (
    <div
      className="card shadow-sm"
      style={{
        borderRadius: "16px",
        background: "white",
        border: "1px solid rgba(0,0,0,0.03)",
      }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold" style={{ color: "#4A0080" }}>
            {title}
          </span>
          <span
            className="fw-bold"
            style={{ color: "#4A0080", fontSize: "0.9rem" }}
          >
            รวม {data.reduce((s, v) => s + v, 0).toLocaleString("th-TH")} บาท
          </span>
        </div>
        <div style={{ height: 220 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

function MobileMonthCard({
  data,
}: {
  data: {
    month: string;
    rent: number;
    water: number;
    electric: number;
    total: number;
  };
}) {
  return (
    <div
      className="card shadow-sm p-3"
      style={{
        borderRadius: "14px",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <h5
        className="fw-bold text-center mb-2"
        style={{ color: "#4A0080" }}
      >
        📆 {data.month}
      </h5>
      <div className="row text-center fw-bold">
        <div className="col-6">
          ค่าเช่า
          <br />
          {data.rent.toLocaleString("th-TH")}
        </div>
        <div className="col-6">
          ค่าน้ำ
          <br />
          {data.water.toLocaleString("th-TH")}
        </div>
        <div className="col-6 mt-2">
          ค่าไฟ
          <br />
          {data.electric.toLocaleString("th-TH")}
        </div>
        <div className="col-6 mt-2" style={{ color: "#4A0080" }}>
          รวม
          <br />
          {data.total.toLocaleString("th-TH")}
        </div>
      </div>
    </div>
  );
}