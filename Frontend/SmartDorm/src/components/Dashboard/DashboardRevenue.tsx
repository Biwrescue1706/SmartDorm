// src/components/Dashboard/DashboardRevenue.tsx
import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";

export default function DashboardRevenue({ bills, bookings }: { bills: Bill[]; bookings: Booking[] }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  /* ===== Screen Breakpoints ===== */
  const screen = window.innerWidth;
  const isMobile = screen < 600;
  const isTablet = screen >= 600 && screen < 1400;
  const isDesktop = screen >= 1400;

  /* ===== Months ===== */
  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  /* ===== Years from Bills ===== */
  const yearsInData = Array.from(
    new Set(bills.map(b => new Date(b.month).getUTCFullYear() + 543))
  ).sort((a,b)=> a-b);

  /* ===== Labels ===== */
  const labels = useMemo(() => {
    if (!selectedYear) return yearsInData.map(String);

    const months = bills
      .filter(b => new Date(b.month).getUTCFullYear() + 543 === +selectedYear)
      .map(b => new Date(b.month).getUTCMonth());

    const uniqMonths = Array.from(new Set(months)).sort((a,b)=>a-b);

    if (!selectedMonth) return uniqMonths.map(i => monthNamesTH[i]);
    return [monthNamesTH[+selectedMonth - 1]];
  }, [bills, selectedYear, selectedMonth]);

  /* ===== Filter Bills ===== */
  const filteredBills = useMemo(() => bills.filter(b => {
    const d = new Date(b.month);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2,"0");
    return b.status === 1 &&
      (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  }), [bills, selectedYear, selectedMonth]);

  /* ===== Filter Bookings ===== */
  const filteredBookings = useMemo(() => bookings.filter(b => {
    if (!b.createdAt || b.approveStatus !== 1 || !b.room) return false;
    const d = new Date(b.createdAt);
    const y = d.getUTCFullYear() + 543;
    const m = String(d.getUTCMonth() + 1).padStart(2,"0");
    return (!selectedYear || y.toString() === selectedYear) &&
      (!selectedMonth || m === selectedMonth);
  }), [bookings, selectedYear, selectedMonth]);

  /* ===== Helpers ===== */
  const sum = (arr: number[]) => arr.reduce((s,n)=>s+n,0);

  /* ===== Booking Revenue ===== */
  const rentBookingArr = filteredBookings.map(b => Number(b.room?.rent ?? 0));
  const depositBookingArr = filteredBookings.map(b => Number(b.room?.deposit ?? 0));
  const bookingFeeArr = filteredBookings.map(b => Number(b.room?.bookingFee ?? 0));
  const totalBookingArr = filteredBookings.map(
    b => Number(b.room?.rent ?? 0) + Number(b.room?.deposit ?? 0) + Number(b.room?.bookingFee ?? 0)
  );

  const rentBooking = sum(rentBookingArr);
  const depositBooking = sum(depositBookingArr);
  const bookingFee = sum(bookingFeeArr);
  const totalBookingRevenue = sum(totalBookingArr);

  /* ===== Bill Revenue ===== */
  const rentBillArr = filteredBills.map(b => Number(b.rent ?? 0));
  const waterBillArr = filteredBills.map(b => Number(b.waterCost ?? 0));
  const electricBillArr = filteredBills.map(b => Number(b.electricCost ?? 0));
  const totalBillArr = filteredBills.map(b => Number(b.total ?? 0));

  const rentBill = sum(rentBillArr);
  const waterBill = sum(waterBillArr);
  const electricBill = sum(electricBillArr);
  const totalBillRevenue = sum(totalBillArr);

  const totalAllRevenue = totalBookingRevenue + totalBillRevenue;

  /* ===== Chart Datasets ===== */
  const bookingDetail = [
    { label:"ค่าเช่า", data: rentBookingArr, borderColor:"#4A148C" },
    { label:"ค่ามัดจำ", data: depositBookingArr, borderColor:"#7B1FA2" },
    { label:"ค่าจอง", data: bookingFeeArr, borderColor:"#FFC107" },
  ];
  const bookingTotal = [
    { label:"รวมรายรับการจอง", data: totalBookingArr, borderColor:"#2E7D32" },
  ];

  const billDetail = [
    { label:"ค่าเช่าห้อง", data: rentBillArr, borderColor:"#3F51B5" },
    { label:"ค่าน้ำ", data: waterBillArr, borderColor:"#29B6F6" },
    { label:"ค่าไฟ", data: electricBillArr, borderColor:"#FF7043" },
  ];
  const billTotal = [
    { label:"รวมรายรับบิล", data: totalBillArr, borderColor:"#00838F" },
  ];

  /* ===== Title ===== */
  const titleSuffix =
    !selectedYear && !selectedMonth ? "ทุกปี" :
    selectedYear && !selectedMonth ? `ปี ${selectedYear}` :
    `${monthNamesTH[+selectedMonth-1]} ${selectedYear}`;

  return (
    <div className="mt-4">
      <h2 className="fw-bold text-center" style={{color:"#4A0080"}}>💜 รายรับ SmartDorm</h2>
      <h5 className="text-center mb-3">({titleSuffix})</h5>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        <select className="form-select w-auto"
          value={selectedYear}
          onChange={e => { setSelectedYear(e.target.value); setSelectedMonth(""); }}>
          <option value="">ทุกปี</option>
          {Array.from({length:11},(_,i)=>2568+i).map(y => <option key={y}>{y}</option>)}
        </select>

        <select className="form-select w-auto"
          disabled={!selectedYear}
          value={selectedMonth}
          onChange={e=>setSelectedMonth(e.target.value)}>
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m,i)=>
            <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>
          )}
        </select>
      </div>

      {/* ===== รายรับการจอง ===== */}
      <Section title="รายรับการจอง">
        <CardsResponsive>
          <Card title="ค่าเช่า" value={rentBooking} color="#4A148C"/>
          <Card title="ค่ามัดจำ" value={depositBooking} color="#7B1FA2"/>
          <Card title="ค่าจอง" value={bookingFee} color="#FFC107"/>
          <Card title="รวมรายรับการจอง" value={totalBookingRevenue} color="#2E7D32"/>
        </CardsResponsive>

        <ChartResponsive
          detail={bookingDetail}
          total={bookingTotal}
          labels={labels}
          titleSuffix={titleSuffix}
          isDesktop={isDesktop}
        />
      </Section>

      {/* ===== รายรับบิล ===== */}
      <Section title="รายรับบิล">
        <CardsResponsive>
          <Card title="ค่าเช่าห้อง" value={rentBill} color="#3F51B5"/>
          <Card title="ค่าน้ำ" value={waterBill} color="#29B6F6"/>
          <Card title="ค่าไฟ" value={electricBill} color="#FF7043"/>
          <Card title="รวมรายรับบิล" value={totalBillRevenue} color="#00838F"/>
        </CardsResponsive>

        <ChartResponsive
          detail={billDetail}
          total={billTotal}
          labels={labels}
          titleSuffix={titleSuffix}
          isDesktop={isDesktop}
        />
      </Section>

      {/* ===== รวมรายรับทั้งหมด ===== */}
      <Section title="รวมรายรับทั้งหมด">
        <Card title="รวมรายรับทั้งหมด" value={totalAllRevenue} color="#4A0080"/>
      </Section>

      {/* ===== Monthly Cards ===== */}
      <MonthlyBillCards bills={filteredBills} monthNamesTH={monthNamesTH} />

      {/* ===== Desktop Table ===== */}
      {isDesktop && (
        <>
          <h4 className="fw-bold mt-4" style={{color:"#4A0080"}}>📅 รายรับรายเดือนจากบิล</h4>
          <MonthlyBillTable bills={filteredBills} monthNamesTH={monthNamesTH}/>
        </>
      )}
    </div>
  );
}

/* ===== Layout Components ===== */
function CardsResponsive({ children }: any) {
  const cards = Array.isArray(children) ? children : [children];
  const screen = window.innerWidth;

  if (screen < 600) { // mobile
    return cards.map((c: any,i: number)=>(
      <div key={i} className="col-12 my-2">{c}</div>
    ));
  }

  if (screen < 1400) { // tablet
    return (
      <div className="row g-3">
        {cards.slice(0,3).map((c:any,i:number)=>(
          <div key={i} className="col-12 col-md-4">{c}</div>))}
        {cards[3] && <div className="col-12 mt-2">{cards[3]}</div>}
      </div>
    );
  }

  // desktop
  return (
    <div className="row g-3">
      {cards.map((c:any,i:number)=>(
        <div key={i} className="col-lg-3 col-md-6">{c}</div>
      ))}
    </div>
  );
}

function ChartResponsive({ detail, total, labels, titleSuffix, isDesktop }: any) {
  return (
    <>
      <DashboardRevenueChart labels={labels} datasets={detail} title={`แยกประเภท (${titleSuffix})`} />
      <DashboardRevenueChart labels={labels} datasets={total} title={`รวมทั้งหมด (${titleSuffix})`} />
    </>
  );
}

function Section({ title, children }: any) {
  return <div className="mt-4"><h4 className="fw-bold">{title}</h4>{children}</div>;
}

function Card({ title, value, color }: any) {
  return (
    <div className="card text-center shadow-sm"
      style={{background:color,color:"#fff",borderRadius:14}}>
      <div className="card-body">
        <b>{title}</b>
        <h4 className="fw-bold mt-2">{value.toLocaleString("th-TH")} บาท</h4>
      </div>
    </div>
  );
}