import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";
import MonthlyBillCards from "./MonthlyBillCards";
import MonthlyBillTable from "./MonthlyBillTable";

/* ---------------- UI BASE COMPONENTS ---------------- */

const SCB_PURPLE = "#4A0080";
const SCB_GOLD = "#D4AF37";

function Section({ title, children }: any) {
  return (
    <div className="mt-4">
      <h4 className="fw-bold" style={{ color: SCB_PURPLE, borderLeft: `6px solid ${SCB_GOLD}`, paddingLeft: 10 }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function Card({ title, value, color }: any) {
  return (
    <div
      className="card shadow-sm text-center"
      style={{
        background: color,
        color: "#fff",
        borderRadius: 12,
        border: `2px solid ${SCB_GOLD}`,
      }}
    >
      <div className="card-body p-2">
        <b style={{ fontSize: "0.9rem" }}>{title}</b>
        <h4 className="fw-bold mt-1">{value.toLocaleString("th-TH")}</h4>
      </div>
    </div>
  );
}

/* ===== Responsive Card Layout ===== */
function CardsGrid({ children }: any) {
  const screen = window.innerWidth;
  const cards = Array.isArray(children) ? children : [children];

  if (screen < 600)
    return cards.map((c: any, i: number) => <div key={i} className="my-2">{c}</div>);

  return (
    <div className="row g-2">
      {cards.map((c: any, i: number) => (
        <div key={i} className="col-6 col-md-3">{c}</div>
      ))}
    </div>
  );
}

/* ===== Responsive Chart Layout ===== */
function ChartsGrid({ labels, charts, titleSuffix }: any) {
  const screen = window.innerWidth;

  if (screen >= 1400)
    return (
      <div className="row g-2 mt-2">
        {charts.map((c: any, i: number) => (
          <div key={i} className="col-6">
            <DashboardRevenueChart labels={labels} datasets={[c]} title={`${c.label} (${titleSuffix})`} />
          </div>
        ))}
      </div>
    );

  if (screen < 600)
    return charts.map((c: any, i: number) => (
      <div key={i} className="my-3">
        <DashboardRevenueChart labels={labels} datasets={[c]} title={`${c.label} (${titleSuffix})`} />
      </div>
    ));

  return (
    <div className="row g-2 mt-2">
      {charts.map((c: any, i: number) => (
        <div key={i} className="col-6 col-md-3">
          <DashboardRevenueChart labels={labels} datasets={[c]} title={`${c.label} (${titleSuffix})`} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function DashboardRevenue({ bills, bookings }: { bills: Bill[]; bookings: Booking[] }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const screen = window.innerWidth;
  const isDesktop = screen >= 1400;

  const monthNamesTH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

  const YEARS = Array.from({ length: 11 }, (_, i) => 2566 + i);

  const yearsInData = [...new Set(bills.map(b => new Date(b.month).getUTCFullYear() + 543))].sort();

  const labels = useMemo(() => {
    if (!selectedYear) return yearsInData.map(String);
    const months = bills
      .filter(b => new Date(b.month).getUTCFullYear() + 543 === +selectedYear)
      .map(b => new Date(b.month).getUTCMonth());
    const uniq = [...new Set(months)].sort();
    return selectedMonth ? [monthNamesTH[+selectedMonth - 1]] : uniq.map(i => monthNamesTH[i]);
  }, [bills, selectedYear, selectedMonth]);

  /* ===== Filter Monthly Data ===== */

  const FBills = bills.filter(b => {
    const d = new Date(b.month);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return b.status === 1 && (!selectedYear || y.toString() === selectedYear) && (!selectedMonth || m === selectedMonth);
  });

  const FBookings = bookings.filter(b => {
    if (!b.room || !b.createdAt || b.approveStatus !== 1) return false;
    const d = new Date(b.createdAt);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return (!selectedYear || y.toString() === selectedYear) && (!selectedMonth || m === selectedMonth);
  });

  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

  /* ===== Group Bills by Month EXACTLY same logic as MonthlyBillCards ===== */

  const billAcc: any = {};
  FBills.forEach(b => {
    const d = new Date(b.month);
    const key = `${d.getUTCFullYear() + 543}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!billAcc[key]) billAcc[key] = { rent: 0, water: 0, electric: 0, total: 0 };
    billAcc[key].rent += Number(b.rent ?? 0);
    billAcc[key].water += Number(b.waterCost ?? 0);
    billAcc[key].electric += Number(b.electricCost ?? 0);
    billAcc[key].total += Number(b.total ?? 0);
  });

  const keyList = Object.keys(billAcc);
  const rentBillArr     = keyList.map(k => billAcc[k].rent);
  const waterBillArr    = keyList.map(k => billAcc[k].water);
  const electricBillArr = keyList.map(k => billAcc[k].electric);
  const totalBillArr    = keyList.map(k => billAcc[k].total);

  /* ===== Booking Revenue ===== */
  const rentBookingArr = FBookings.map(b => Number(b.room?.rent ?? 0));
  const depositBookingArr = FBookings.map(b => Number(b.room?.deposit ?? 0));
  const bookingFeeArr = FBookings.map(b => Number(b.room?.bookingFee ?? 0));
  const totalBookingArr = FBookings.map(b => Number(b.room?.rent ?? 0) + Number(b.room?.deposit ?? 0) + Number(b.room?.bookingFee ?? 0));

  const totalAll = sum(totalBookingArr) + sum(totalBillArr);

  const bookingCharts = [
    { label: "ค่าเช่า", data: rentBookingArr, backgroundColor: SCB_PURPLE },
    { label: "ค่ามัดจำ", data: depositBookingArr, backgroundColor: "#7B1FA2" },
    { label: "ค่าจอง", data: bookingFeeArr, backgroundColor: "#FFC107" },
    { label: "รวมรายรับการจอง", data: totalBookingArr, backgroundColor: "#2E7D32" },
  ];

  const billCharts = [
    { label: "ค่าเช่าห้อง", data: rentBillArr, backgroundColor: "#3F51B5" },
    { label: "ค่าน้ำ", data: waterBillArr, backgroundColor: "#29B6F6" },
    { label: "ค่าไฟ", data: electricBillArr, backgroundColor: "#FF7043" },
    { label: "รวมรายรับบิล", data: totalBillArr, backgroundColor: "#00838F" },
  ];

  const suffix =
    !selectedYear && !selectedMonth ? "ทุกปี" :
    selectedYear && !selectedMonth ? `ปี ${selectedYear}` :
    `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`;

  return (
    <div className="container">
      <h2 className="fw-bold text-center mt-4" style={{ color: SCB_PURPLE }}>
        รายรับ SmartDorm
      </h2>
      <h6 className="text-center mb-3" style={{ color: SCB_GOLD }}>({suffix})</h6>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        <select className="form-select w-auto" value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setSelectedMonth(""); }}>
          <option value="">ทุกปี</option>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>

        <select className="form-select w-auto" disabled={!selectedYear} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m,i) => <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}
        </select>
      </div>

      {/* BOOKING */}
      <Section title="รายรับการจอง">
        <CardsGrid>
          <Card title="ค่าเช่า" value={sum(rentBookingArr)} color="#4A148C" />
          <Card title="ค่ามัดจำ" value={sum(depositBookingArr)} color="#7B1FA2" />
          <Card title="ค่าจอง" value={sum(bookingFeeArr)} color="#FFC107" />
          <Card title="รวมรายรับการจอง" value={sum(totalBookingArr)} color="#2E7D32" />
        </CardsGrid>
        <ChartsGrid labels={labels} charts={bookingCharts} titleSuffix={suffix} />
      </Section>

      {/* BILL */}
      <Section title="รายรับบิล">
        <CardsGrid>
          <Card title="ค่าเช่าห้อง" value={sum(rentBillArr)} color="#3F51B5" />
          <Card title="ค่าน้ำ" value={sum(waterBillArr)} color="#29B6F6" />
          <Card title="ค่าไฟ" value={sum(electricBillArr)} color="#FF7043" />
          <Card title="รวมรายรับบิล" value={sum(totalBillArr)} color="#00838F" />
        </CardsGrid>
        <ChartsGrid labels={labels} charts={billCharts} titleSuffix={suffix} />
      </Section>

      {/* TOTAL */}
      <Section title="รวมรายรับทั้งหมด">
        <Card title="รวมรายรับทั้งหมด" value={totalAll} color={SCB_PURPLE} />
      </Section>

      {/* MONTHLY CARDS & TABLE */}
      <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />
      {isDesktop && (
        <>
          <h4 className="fw-bold mt-4" style={{ color: SCB_PURPLE }}>
            📅 รายรับรายเดือนจากบิล
          </h4>
          <MonthlyBillTable bills={FBills} monthNamesTH={monthNamesTH} />
        </>
      )}
    </div>
  );
}