import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";
import MonthlyBillCards from "./MonthlyBillCards";
import MonthlyBillTable from "./MonthlyBillTable";

/* ---------------- UI ---------------- */
function Section({ title, children }: any) {
  return (
    <div className="mt-4">
      <h4 className="fw-bold" style={{ color: "#4A0080" }}>{title}</h4>
      {children}
    </div>
  );
}

function Card({ title, value, color }: any) {
  return (
    <div className="card text-center shadow-sm"
      style={{ background: color, color: "#fff", borderRadius: 10 }}>
      <div className="card-body p-2">
        <b>{title}</b>
        <h5 className="fw-bold mt-1">{value.toLocaleString("th-TH")}</h5>
      </div>
    </div>
  );
}

function CardsGrid({ children }: any) {
  const arr = Array.isArray(children) ? children : [children];
  const w = window.innerWidth;

  if (w < 600)
    return arr.map((c: any, i: number) => <div key={i} className="my-2 w-100">{c}</div>);

  return (
    <div className="row g-2">
      {arr.map((c: any, i: number) => (
        <div key={i} className="col-6 col-md-3">{c}</div>
      ))}
    </div>
  );
}

/* ---------------- MAIN ---------------- */
export default function DashboardRevenue({
  bills,
  bookings,
}: { bills: Bill[]; bookings: Booking[] }) {

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const isDesktop = window.innerWidth >= 1400;

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  const YEARS = Array.from({ length: 11 }, (_, i) => 2566 + i);

  /* ---------------- FILTER DATA ---------------- */
  const FBills = useMemo(() => bills.filter(b => {
    const d = new Date(b.month);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return b.status === 1 &&
      (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  }), [bills, selectedYear, selectedMonth]);

  const FBookings = useMemo(() => bookings.filter(b => {
    if (!b.createdAt || b.approveStatus !== 1 || !b.room) return false;
    const d = new Date(b.createdAt);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  }), [bookings, selectedYear, selectedMonth]);

  /* ---------------- GROUP FOR CHART ---------------- */
  const groupBy = (arr: any[], getKey: (b: any) => string) =>
    arr.reduce((acc: any, b: any) => {
      const key = getKey(b);
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    }, {});

  const billGroup = groupBy(FBills, (b) => {
    const d = new Date(b.month);
    return `${d.getUTCFullYear() + 543}-${d.getUTCMonth() + 1}`;
  });

  const bookingGroup = groupBy(FBookings, (b) => {
    const d = new Date(b.createdAt);
    return `${d.getUTCFullYear() + 543}-${d.getUTCMonth() + 1}`;
  });

  const labels = Object.keys({ ...bookingGroup, ...billGroup })
    .sort((a, b) => +a.split("-")[1] - +b.split("-")[1])
    .map(k => monthNamesTH[+k.split("-")[1] - 1]);

  const sumArr = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

  /* BOOKING */
  const rentBookingArr = labels.map((_, i) => {
    const key = Object.keys(bookingGroup)[i];
    return sumArr((bookingGroup[key] ?? []).map(b => Number(b.room?.rent ?? 0)));
  });

  const depositBookingArr = labels.map((_, i) => {
    const key = Object.keys(bookingGroup)[i];
    return sumArr((bookingGroup[key] ?? []).map(b => Number(b.room?.deposit ?? 0)));
  });

  const feeBookingArr = labels.map((_, i) => {
    const key = Object.keys(bookingGroup)[i];
    return sumArr((bookingGroup[key] ?? []).map(b => Number(b.room?.bookingFee ?? 0)));
  });

  const totalBookingArr = labels.map((_, i) =>
    rentBookingArr[i] + depositBookingArr[i] + feeBookingArr[i]
  );

  /* BILLS */
  const rentBillArr = labels.map((_, i) => {
    const key = Object.keys(billGroup)[i];
    return sumArr((billGroup[key] ?? []).map(b => Number(b.rent ?? 0)));
  });

  const waterBillArr = labels.map((_, i) => {
    const key = Object.keys(billGroup)[i];
    return sumArr((billGroup[key] ?? []).map(b => Number(b.waterCost ?? 0)));
  });

  const electricBillArr = labels.map((_, i) => {
    const key = Object.keys(billGroup)[i];
    return sumArr((billGroup[key] ?? []).map(b => Number(b.electricCost ?? 0)));
  });

  const totalBillArr = labels.map((_, i) =>
    rentBillArr[i] + waterBillArr[i] + electricBillArr[i]
  );

  const totalAll = sumArr(totalBookingArr) + sumArr(totalBillArr);

  /* ---------------- DATASETS ---------------- */
  const bookingCharts = [
    { label: "ค่าเช่า", data: rentBookingArr, borderColor: "#4A148C" },
    { label: "ค่ามัดจำ", data: depositBookingArr, borderColor: "#7B1FA2" },
    { label: "ค่าจอง", data: feeBookingArr, borderColor: "#FFC107" },
    { label: "รวมรายรับการจอง", data: totalBookingArr, borderColor: "#2E7D32" },
  ];

  const billCharts = [
    { label: "ค่าเช่าห้อง", data: rentBillArr, borderColor: "#3F51B5" },
    { label: "ค่าน้ำ", data: waterBillArr, borderColor: "#29B6F6" },
    { label: "ค่าไฟ", data: electricBillArr, borderColor: "#FF7043" },
    { label: "รวมรายรับบิล", data: totalBillArr, borderColor: "#00838F" },
  ];

  const suffix =
    !selectedYear && !selectedMonth
      ? "ทุกปี"
      : selectedYear && !selectedMonth
      ? `ปี ${selectedYear}`
      : `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`;

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-4">

      <h2 className="fw-bold text-center" style={{ color: "#4A0080" }}>รายรับ SmartDorm</h2>
      <h6 className="text-center mb-3">({suffix})</h6>

      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        <select className="form-select w-auto"
          value={selectedYear}
          onChange={e => { setSelectedYear(e.target.value); setSelectedMonth(""); }}>
          <option value="">ทุกปี</option>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>

        <select className="form-select w-auto"
          disabled={!selectedYear}
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
          ))}
        </select>
      </div>

      {/* BOOKING */}
      <Section title="รายรับการจอง">
        <CardsGrid>
          <Card title="ค่าเช่า" value={sumArr(rentBookingArr)} color="#4A148C" />
          <Card title="ค่ามัดจำ" value={sumArr(depositBookingArr)} color="#7B1FA2" />
          <Card title="ค่าจอง" value={sumArr(feeBookingArr)} color="#FFC107" />
          <Card title="รวมรายรับการจอง" value={sumArr(totalBookingArr)} color="#2E7D32" />
        </CardsGrid>
        <DashboardRevenueChart labels={labels} datasets={bookingCharts} title={`รายรับการจอง (${suffix})`} />
      </Section>

      {/* BILL */}
      <Section title="รายรับบิล">
        <CardsGrid>
          <Card title="ค่าเช่าห้อง" value={sumArr(rentBillArr)} color="#3F51B5" />
          <Card title="ค่าน้ำ" value={sumArr(waterBillArr)} color="#29B6F6" />
          <Card title="ค่าไฟ" value={sumArr(electricBillArr)} color="#FF7043" />
          <Card title="รวมรายรับบิล" value={sumArr(totalBillArr)} color="#00838F" />
        </CardsGrid>
        <DashboardRevenueChart labels={labels} datasets={billCharts} title={`รายรับบิล (${suffix})`} />
      </Section>

      {/* TOTAL */}
      <Section title="รวมรายรับทั้งหมด">
        <Card title="รวมรายรับทั้งหมด" value={totalAll} color="#4A0080" />
      </Section>

      <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />

      {isDesktop && (
        <>
          <h4 className="fw-bold mt-4" style={{ color: "#4A0080" }}>📅 รายรับรายเดือนจากบิล</h4>
          <MonthlyBillTable bills={FBills} monthNamesTH={monthNamesTH} />
        </>
      )}
    </div>
  );
}