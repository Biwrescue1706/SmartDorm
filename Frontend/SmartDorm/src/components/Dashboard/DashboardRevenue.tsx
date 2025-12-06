import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";
import MonthlyBillCards from "./MonthlyBillCards";
import MonthlyBillTable from "./MonthlyBillTable";

/* ---------------- UI COMPONENTS ---------------- */

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
    <div
      className="card text-center shadow-sm"
      style={{
        background: color,
        color: "#fff",
        borderRadius: 12,
        padding: "10px",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div className="card-body p-2">
        <b style={{ fontSize: "0.9rem" }}>{title}</b>
        <h5 className="fw-bold mt-1">{value.toLocaleString("th-TH")}</h5>
      </div>
    </div>
  );
}

function CardsGrid({ children }: any) {
  const cards = Array.isArray(children) ? children : [children];
  const w = window.innerWidth;

  if (w < 600)
    return cards.map((c: any, i: number) => (
      <div key={i} className="my-2 w-100">{c}</div>
    ));

  return (
    <div className="row g-2">
      {cards.map((c: any, i: number) => (
        <div key={i} className="col-6 col-md-3">{c}</div>
      ))}
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function DashboardRevenue({
  bills,
  bookings,
}: {
  bills: Bill[];
  bookings: Booking[];
}) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const isDesktop = window.innerWidth >= 1400;

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  /* เลือกปี */
  const YEARS = Array.from({ length: 11 }, (_, i) => 2566 + i);

  /* ปีที่มีข้อมูล */
  const yearsInData = useMemo(
    () => [...new Set(bills.map(b => new Date(b.month).getUTCFullYear() + 543))].sort(),
    [bills]
  );

  /* LABEL ของกราฟ */
  const labels = useMemo(() => {
    if (!selectedYear) return yearsInData.map(String);

    const months = bills
      .filter(b => new Date(b.month).getUTCFullYear() + 543 === +selectedYear)
      .map(b => new Date(b.month).getUTCMonth());

    const uniq = [...new Set(months)].sort();
    if (!selectedMonth) return uniq.map(i => monthNamesTH[i]);
    return [monthNamesTH[+selectedMonth - 1]];
  }, [bills, selectedYear, selectedMonth]);

  /* ฟิลเตอร์ BILL */
  const FBills = bills.filter(b => {
    const d = new Date(b.month);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return b.status === 1 &&
      (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  });

  /* ฟิลเตอร์ BOOKING */
  const FBookings = bookings.filter(b => {
    if (!b.createdAt || b.approveStatus !== 1 || !b.room) return false;
    const d = new Date(b.createdAt);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  });

  /* SUM FUNCTION */
  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

  /* คำนวณยอด Booking */
  const rentBookingArr = FBookings.map(b => Number(b.room?.rent ?? 0));
  const depositBookingArr = FBookings.map(b => Number(b.room?.deposit ?? 0));
  const bookingFeeArr = FBookings.map(b => Number(b.room?.bookingFee ?? 0));
  const totalBookingArr = FBookings.map(
    b => Number(b.room?.rent ?? 0) + Number(b.room?.deposit ?? 0) + Number(b.room?.bookingFee ?? 0)
  );

  /* คำนวณยอด Bill */
  const rentBillArr = FBills.map(b => Number(b.rent ?? 0));
  const waterBillArr = FBills.map(b => Number(b.waterCost ?? 0));
  const electricBillArr = FBills.map(b => Number(b.electricCost ?? 0));
  const totalBillArr = FBills.map(b => Number(b.total ?? 0));

  /* รวมทั้งหมด */
  const totalAll = sum(totalBookingArr) + sum(totalBillArr);

  /* DATASET — เพิ่ม borderColor ให้ตรง type */
  const bookingCharts = [
    { label: "ค่าเช่า", data: rentBookingArr, backgroundColor: "#4A148C", borderColor: "#4A148C" },
    { label: "ค่ามัดจำ", data: depositBookingArr, backgroundColor: "#7B1FA2", borderColor: "#7B1FA2" },
    { label: "ค่าจอง", data: bookingFeeArr, backgroundColor: "#FFC107", borderColor: "#FFC107" },
    { label: "รวมรายรับการจอง", data: totalBookingArr, backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  ];

  const billCharts = [
    { label: "ค่าเช่าห้อง", data: rentBillArr, backgroundColor: "#3F51B5", borderColor: "#3F51B5" },
    { label: "ค่าน้ำ", data: waterBillArr, backgroundColor: "#29B6F6", borderColor: "#29B6F6" },
    { label: "ค่าไฟ", data: electricBillArr, backgroundColor: "#FF7043", borderColor: "#FF7043" },
    { label: "รวมรายรับบิล", data: totalBillArr, backgroundColor: "#00838F", borderColor: "#00838F" },
  ];

  const suffix =
    !selectedYear && !selectedMonth ? "ทุกปี"
      : selectedYear && !selectedMonth ? `ปี ${selectedYear}`
      : `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`;

  /* ---------------- RENDER ---------------- */

  return (
    <div className="mt-4">
      <h2 className="fw-bold text-center" style={{ color: "#4A0080" }}>
        รายรับ SmartDorm
      </h2>
      <h6 className="text-center mb-3">({suffix})</h6>

      {/* FILTER */}
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
          {monthNamesTH.map((m, i) =>
            <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
          )}
        </select>
      </div>

      {/* BOOKING SECTION */}
      <Section title="รายรับการจอง">
        <CardsGrid>
          <Card title="ค่าเช่า" value={sum(rentBookingArr)} color="#4A148C" />
          <Card title="ค่ามัดจำ" value={sum(depositBookingArr)} color="#7B1FA2" />
          <Card title="ค่าจอง" value={sum(bookingFeeArr)} color="#FFC107" />
          <Card title="รวมรายรับการจอง" value={sum(totalBookingArr)} color="#2E7D32" />
        </CardsGrid>
        <DashboardRevenueChart
          labels={labels}
          datasets={bookingCharts}
          title={`กราฟรายรับการจอง (${suffix})`}
        />
      </Section>

      {/* BILL SECTION */}
      <Section title="รายรับบิล">
        <CardsGrid>
          <Card title="ค่าเช่าห้อง" value={sum(rentBillArr)} color="#3F51B5" />
          <Card title="ค่าน้ำ" value={sum(waterBillArr)} color="#29B6F6" />
          <Card title="ค่าไฟ" value={sum(electricBillArr)} color="#FF7043" />
          <Card title="รวมรายรับบิล" value={sum(totalBillArr)} color="#00838F" />
        </CardsGrid>
        <DashboardRevenueChart
          labels={labels}
          datasets={billCharts}
          title={`กราฟรายรับบิล (${suffix})`}
        />
      </Section>

      {/* TOTAL */}
      <Section title="รวมรายรับทั้งหมด">
        <Card title="รวมรายรับทั้งหมด" value={totalAll} color="#4A0080" />
      </Section>

      {/* MONTHLY CARDS */}
      <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />

      {/* DESKTOP TABLE */}
      {isDesktop && (
        <>
          <h4 className="fw-bold mt-4" style={{ color: "#4A0080" }}>
            📅 รายรับรายเดือนจากบิล
          </h4>
          <MonthlyBillTable bills={FBills} monthNamesTH={monthNamesTH} />
        </>
      )}
    </div>
  );
}