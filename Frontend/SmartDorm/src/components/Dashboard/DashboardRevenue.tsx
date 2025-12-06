import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";

/* -----------------------------------
   UI COMPONENTS ต้องอยู่บนสุด
----------------------------------- */
function Section({ title, children }: any) {
  return <div className="mt-4"><h4 className="fw-bold">{title}</h4>{children}</div>;
}

function Card({ title, value, color }: any) {
  return (
    <div
      className="card text-center shadow-sm"
      style={{
        background: color,
        color: "#fff",
        borderRadius: 10,
        padding: "6px",
      }}
    >
      <div className="card-body p-2">
        <b style={{ fontSize: "0.9rem" }}>{title}</b>
        <h5 className="fw-bold mt-1" style={{ fontSize: "1.1rem" }}>
          {value.toLocaleString("th-TH")} บาท
        </h5>
      </div>
    </div>
  );
}

/* ===== Responsive Card Grid ===== */
function CardsGrid({ children }: any) {
  const screen = window.innerWidth;
  const cards = Array.isArray(children) ? children : [children];

  // MOBILE < 600px = 1 card / row
  if (screen < 600)
    return cards.map((c: any, i: number) => (
      <div key={i} className="my-2 w-100">{c}</div>
    ));

  // TABLET 600 - 1399px = 4 cards / row
  if (screen < 1400)
    return (
      <div className="row g-2">
        {cards.map((c: any, i: number) => (
          <div key={i} className="col-6 col-md-3">{c}</div>
        ))}
      </div>
    );

  // DESKTOP >= 1400
  return (
    <div className="row g-2">
      {cards.map((c: any, i: number) => (
        <div key={i} className="col-lg-3 col-md-6">{c}</div>
      ))}
    </div>
  );
}

/* ===== Responsive Chart Grid ===== */
function ChartsGrid({ labels, charts, titleSuffix }: any) {
  const screen = window.innerWidth;

  // DESKTOP >= 1400 = 2 chart / row
  if (screen >= 1400)
    return (
      <div className="row g-2 mt-2">
        {charts.map((d: any, i: number) => (
          <div key={i} className="col-6">
            <DashboardRevenueChart labels={labels} datasets={[d]} title={`${d.label} (${titleSuffix})`} />
          </div>
        ))}
      </div>
    );

  // MOBILE < 600 = 1 chart / row
  if (screen < 600)
    return charts.map((d: any, i: number) => (
      <div key={i} className="my-3">
        <DashboardRevenueChart labels={labels} datasets={[d]} title={`${d.label} (${titleSuffix})`} />
      </div>
    ));

  // TABLET 600 - 1399 = 4 chart / row
  return (
    <div className="row g-2 mt-2">
      {charts.map((d: any, i: number) => (
        <div key={i} className="col-6 col-md-3">
          <DashboardRevenueChart labels={labels} datasets={[d]} title={`${d.label} (${titleSuffix})`} />
        </div>
      ))}
    </div>
  );
}

/* ===== Monthly Cards and Table (unchanged) ===== */
function MonthlyBillCards({ bills, monthNamesTH }: any) {
  const acc: any = {};
  bills.forEach((b: Bill) => {
    const d = new Date(b.month);
    const key = `${d.getUTCFullYear() + 543}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = { rent: 0, water: 0, electric: 0, total: 0 };
    acc[key].rent += Number(b.rent ?? 0);
    acc[key].water += Number(b.waterCost ?? 0);
    acc[key].electric += Number(b.electricCost ?? 0);
    acc[key].total += Number(b.total ?? 0);
  });

  return (
    <div className="mt-4">
      {Object.entries(acc).map(([k, v]: any, i) => {
        const [y, m] = k.split("-");
        return (
          <div key={i} className="card shadow-sm mb-2" style={{ borderRadius: 10 }}>
            <div className="card-body p-2">
              <h6 className="fw-bold text-primary">📅 {monthNamesTH[+m - 1]} {y}</h6>
              <p className="mb-1">- ค่าเช่าห้อง: {v.rent.toLocaleString("th-TH")} บาท</p>
              <p className="mb-1">- ค่าน้ำ: {v.water.toLocaleString("th-TH")} บาท</p>
              <p className="mb-1">- ค่าไฟ: {v.electric.toLocaleString("th-TH")} บาท</p>
              <b className="text-success">- รวมรายรับบิล: {v.total.toLocaleString("th-TH")} บาท</b>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyBillTable({ bills, monthNamesTH }: any) {
  const acc: any = {};
  bills.forEach((b: Bill) => {
    const d = new Date(b.month);
    const key = `${d.getUTCFullYear() + 543}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = { rent: 0, water: 0, electric: 0, total: 0 };
    acc[key].rent += Number(b.rent ?? 0);
    acc[key].water += Number(b.waterCost ?? 0);
    acc[key].electric += Number(b.electricCost ?? 0);
    acc[key].total += Number(b.total ?? 0);
  });

  return (
    <table className="table table-hover text-center mt-3">
      <thead style={{ background: "#4A0080", color: "#fff" }}>
        <tr>
          <th>#</th>
          <th>เดือน</th>
          <th>ค่าเช่าห้อง</th>
          <th>ค่าน้ำ</th>
          <th>ค่าไฟ</th>
          <th>รวม</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(acc).map(([k, v]: any, i) => {
          const [y, m] = k.split("-");
          return (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{monthNamesTH[+m - 1]} {y}</td>
              <td>{v.rent.toLocaleString("th-TH")}</td>
              <td>{v.water.toLocaleString("th-TH")}</td>
              <td>{v.electric.toLocaleString("th-TH")}</td>
              <td className="fw-bold text-primary">{v.total.toLocaleString("th-TH")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* -----------------------------------
   MAIN COMPONENT (ไม่มี error แล้ว)
----------------------------------- */

export default function DashboardRevenue({ bills, bookings }: { bills: Bill[]; bookings: Booking[] }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const screen = window.innerWidth;
  const isDesktop = screen >= 1400;

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  const YEARS = Array.from({ length: 11 }, (_, i) => 2568 + i);

  const yearsInData = [
    ...new Set(bills.map(b => new Date(b.month).getUTCFullYear() + 543))
  ].sort();

  const labels = useMemo(() => {
    if (!selectedYear) return yearsInData.map(String);
    const months = bills
      .filter(b => new Date(b.month).getUTCFullYear() + 543 === +selectedYear)
      .map(b => new Date(b.month).getUTCMonth());
    const uniq = [...new Set(months)].sort();
    if (!selectedMonth) return uniq.map(i => monthNamesTH[i]);
    return [monthNamesTH[+selectedMonth - 1]];
  }, [bills, selectedYear, selectedMonth]);

  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

  /* ===== Filter Data ===== */
  const FBills = bills.filter(b => {
    const d = new Date(b.month);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return b.status === 1 &&
      (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  });

  const FBookings = bookings.filter(b => {
    if (!b.createdAt || b.approveStatus !== 1 || !b.room) return false;
    const d = new Date(b.createdAt);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  });

  /* ===== Compute ===== */
  const rentBookingArr = FBookings.map(b => Number(b.room?.rent ?? 0));
  const depositBookingArr = FBookings.map(b => Number(b.room?.deposit ?? 0));
  const bookingFeeArr = FBookings.map(b => Number(b.room?.bookingFee ?? 0));
  const totalBookingArr = FBookings.map(b => Number(b.room?.rent ?? 0) + Number(b.room?.deposit ?? 0) + Number(b.room?.bookingFee ?? 0));

  const rentBillArr = FBills.map(b => Number(b.rent ?? 0));
  const waterBillArr = FBills.map(b => Number(b.waterCost ?? 0));
  const electricBillArr = FBills.map(b => Number(b.electricCost ?? 0));
  const totalBillArr = FBills.map(b => Number(b.total ?? 0));

  const totalAllRevenue = sum(totalBookingArr) + sum(totalBillArr);

  /* ===== Datasets ===== */
  const bookingCharts = [
    { label: "ค่าเช่า", data: rentBookingArr, borderColor: "#4A148C" },
    { label: "ค่ามัดจำ", data: depositBookingArr, borderColor: "#7B1FA2" },
    { label: "ค่าจอง", data: bookingFeeArr, borderColor: "#FFC107" },
    { label: "รวมรายรับการจอง", data: totalBookingArr, borderColor: "#2E7D32" },
  ];

  const billCharts = [
    { label: "ค่าเช่าห้อง", data: rentBillArr, borderColor: "#3F51B5" },
    { label: "ค่าน้ำ", data: waterBillArr, borderColor: "#29B6F6" },
    { label: "ค่าไฟ", data: electricBillArr, borderColor: "#FF7043" },
    { label: "รวมรายรับบิล", data: totalBillArr, borderColor: "#00838F" },
  ];

  const suffix =
    !selectedYear && !selectedMonth ? "ทุกปี" :
    selectedYear && !selectedMonth ? `ปี ${selectedYear}` :
    `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`;

  return (
    <div className="mt-4">
      <h2 className="fw-bold text-center" style={{ color: "#4A0080" }}>💜 รายรับ SmartDorm</h2>
      <h5 className="text-center mb-3">({suffix})</h5>

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
        <Card title="รวมรายรับทั้งหมด" value={totalAllRevenue} color="#4A0080" />
      </Section>

      <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />

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