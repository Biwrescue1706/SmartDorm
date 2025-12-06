// src/components/Dashboard/DashboardRevenue.tsx
import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";

export default function DashboardRevenue({
  bills,
  bookings,
}: {
  bills: Bill[];
  bookings: Booking[];
}) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const screen = window.innerWidth;
  const isMobile = screen < 600;
  const isTablet = screen >= 600 && screen < 1400;
  const isDesktop = screen >= 1400;

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  /* ===== ปีที่มีข้อมูลจริง (เริ่ม 2568-2578) ===== */
  const yearsInData = Array.from(
    new Set(bills.map(b => new Date(b.month).getUTCFullYear() + 543))
  ).sort((a,b)=>a-b);
  const availableYears = Array.from({length:11},(_,i)=>2568+i)
    .filter(y => yearsInData.includes(y));

  /* ===== labels ของกราฟ ===== */
  const labels = useMemo(()=>{
    if(!selectedYear) return yearsInData.map(String);      // โหมดรวมรายปี
    const months = bills
      .filter(b=>new Date(b.month).getUTCFullYear()+543===+selectedYear)
      .map(b=>new Date(b.month).getUTCMonth());
    const uniqMonths = Array.from(new Set(months)).sort((a,b)=>a-b);
    if(!selectedMonth) return uniqMonths.map(i=>monthNamesTH[i]); // โหมดรายเดือน
    return [monthNamesTH[+selectedMonth-1]];              // เดือนเดียว
  },[bills,selectedYear,selectedMonth]);

  /* ===== กรองข้อมูลตามปี/เดือน ===== */
  const filteredBills = useMemo(()=>bills.filter(b=>{
    const d=new Date(b.month);
    const y=d.getUTCFullYear()+543;
    const m=String(d.getUTCMonth()+1).padStart(2,"0");
    return b.status===1 &&
      (!selectedYear || y.toString()===selectedYear) &&
      (!selectedMonth || m===selectedMonth);
  }),[bills,selectedYear,selectedMonth]);

  const filteredBookings = useMemo(()=>bookings.filter(b=>{
    if(!b.createdAt||b.approveStatus!==1||!b.room) return false;
    const d=new Date(b.createdAt);
    const y=d.getUTCFullYear()+543;
    const m=String(d.getUTCMonth()+1).padStart(2,"0");
    return (!selectedYear||y.toString()===selectedYear)&&(!selectedMonth||m===selectedMonth);
  }),[bookings,selectedYear,selectedMonth]);

  /* ===== รวมยอด ===== */
  const sum=(arr:any[],key:any)=>arr.reduce((s,b)=>s+(b[key]||0),0);
  const rentBooking=sum(filteredBookings.map(b=>b.room),"rent");
  const depositBooking=sum(filteredBookings.map(b=>b.room),"deposit");
  const bookingFee=sum(filteredBookings.map(b=>b.room),"bookingFee");
  const totalBookingRevenue=rentBooking+depositBooking+bookingFee;

  const rentBill=sum(filteredBills,"rent");
  const waterBill=sum(filteredBills,"waterCost");
  const electricBill=sum(filteredBills,"electricCost");
  const totalBillRevenue=sum(filteredBills,"total");
  const totalAllRevenue=totalBookingRevenue+totalBillRevenue;

  /* ===== ข้อมูลกราฟตามโหมด ===== */
  const isYearMode=!selectedYear;
  const getYearData=(key:keyof Bill)=>yearsInData.map(y=>
    bills.filter(b=>new Date(b.month).getUTCFullYear()+543===y)
         .reduce((s,b)=>s+(b[key]||0),0)
  );
  const getMonthData=(arr:Bill[],key:keyof Bill)=>
    labels.map(label=>{
      const idx=monthNamesTH.indexOf(label);
      return arr.filter(b=>new Date(b.month).getUTCMonth()===idx)
                .reduce((s,b)=>s+(b[key]||0),0);
    });

  const billRentData=isYearMode?getYearData("rent"):getMonthData(filteredBills,"rent");
  const waterData=isYearMode?getYearData("waterCost"):getMonthData(filteredBills,"waterCost");
  const electricData=isYearMode?getYearData("electricCost"):getMonthData(filteredBills,"electricCost");
  const billTotalData=isYearMode?getYearData("total"):getMonthData(filteredBills,"total");

  /* ===== หัวข้อกราฟ ===== */
  const titleSuffix =
    !selectedYear && !selectedMonth ? "ทุกปี" :
    selectedYear && !selectedMonth ? `ปี ${selectedYear}` :
    `${monthNamesTH[+selectedMonth-1]} ${selectedYear}`;

  return (
    <div className="mt-4">
      <h2 className="fw-bold text-center" style={{color:"#4A0080"}}>💜 รายรับ SmartDorm</h2>
      <h5 className="text-center mb-4">({titleSuffix})</h5>

      {/* ตัวเลือกปี/เดือน */}
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <select value={selectedYear}
          onChange={e=>{setSelectedYear(e.target.value);setSelectedMonth("");}}
          className="form-select w-auto">
          <option value="">ทุกปี</option>
          {Array.from({length:11},(_,i)=>2568+i).map(y=>
            <option key={y}>{y}</option>
          )}
        </select>

        <select disabled={!selectedYear}
          value={selectedMonth}
          onChange={e=>setSelectedMonth(e.target.value)}
          className="form-select w-auto">
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m,i)=>
            <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>
          )}
        </select>
      </div>

      {/* ==== รายรับการจอง ==== */}
      <Section title="รายรับการจอง">
        {isTablet
          ? <Cards3>
              <Card title="ค่าเช่า" value={rentBooking} color="#4A148C"/>
              <Card title="ค่ามัดจำ" value={depositBooking} color="#7B1FA2"/>
              <Card title="ค่าจอง" value={bookingFee} color="#FFC107"/>
              <Card title="รวมรายรับการจอง" value={totalBookingRevenue} color="#2E7D32"/>
            </Cards3>
          : <>
              <Card title="ค่าเช่า" value={rentBooking} color="#4A148C"/>
              <Card title="ค่ามัดจำ" value={depositBooking} color="#7B1FA2"/>
              <Card title="ค่าจอง" value={bookingFee} color="#FFC107"/>
              <Card title="รวมรายรับการจอง" value={totalBookingRevenue} color="#2E7D32"/>
            </>
        }
        <DashboardRevenueChart labels={labels}
          data={billRentData} title={`ค่าเช่า${titleSuffix}`} color="#4A148C"/>
      </Section>

      {/* ==== รายรับบิล ==== */}
      <Section title="รายรับบิล">
        {isTablet
          ? <Cards3>
              <Card title="ค่าเช่าห้อง" value={rentBill} color="#3F51B5"/>
              <Card title="ค่าน้ำ" value={waterBill} color="#29B6F6"/>
              <Card title="ค่าไฟ" value={electricBill} color="#FF7043"/>
              <Card title="รวมรายรับบิล" value={totalBillRevenue} color="#00838F"/>
            </Cards3>
          : <>
              <Card title="ค่าเช่าห้อง" value={rentBill} color="#3F51B5"/>
              <Card title="ค่าน้ำ" value={waterBill} color="#29B6F6"/>
              <Card title="ค่าไฟ" value={electricBill} color="#FF7043"/>
              <Card title="รวมรายรับบิล" value={totalBillRevenue} color="#00838F"/>
            </>
        }

        <DashboardRevenueChart labels={labels} data={billRentData}
          title={`ค่าเช่าห้อง${titleSuffix}`} color="#3F51B5"/>
        <DashboardRevenueChart labels={labels} data={waterData}
          title={`ค่าน้ำ${titleSuffix}`} color="#29B6F6"/>
        <DashboardRevenueChart labels={labels} data={electricData}
          title={`ค่าไฟ${titleSuffix}`} color="#FF7043"/>
        <DashboardRevenueChart labels={labels} data={billTotalData}
          title={`รวมรายรับบิล${titleSuffix}`} color="#00838F"/>
      </Section>

      {/* ==== รวมรายรับทั้งหมด ==== */}
      <Section title="รวมรายรับทั้งหมด">
        <Card title="รวมรายรับทั้งหมด" value={totalAllRevenue} color="#4A0080"/>
      </Section>

      {/* ==== การ์ดรายเดือน ==== */}
      <MonthlyBillCards bills={filteredBills} monthNamesTH={monthNamesTH}/>

      {/* ==== ตารางสำหรับ Desktop ==== */}
      {isDesktop && (
        <>
          <h4 className="fw-bold mt-4" style={{color:"#4A0080"}}>📅 รายรับรายเดือนจากบิล</h4>
          <MonthlyBillTable bills={filteredBills} monthNamesTH={monthNamesTH}/>
        </>
      )}
    </div>
  );
}

/* ===== helpers ===== */
function Section({title,children}:any){
  return(<div className="mt-4"><h4 className="fw-bold">{title}</h4>{children}</div>);
}

function Cards3({children}:any){
  const cards=Array.isArray(children)?children:[children];
  return(
    <div className="row g-3">
      {cards.slice(0,3).map((c,i)=><div key={i} className="col-12 col-md-4">{c}</div>)}
      {cards[3]&&<div className="col-12 mt-2">{cards[3]}</div>}
    </div>
  );
}

function Card({title,value,color}:any){
  return(
    <div className="card text-center shadow-sm"
      style={{background:color,color:"#fff",borderRadius:14}}>
      <div className="card-body">
        <b>{title}</b>
        <h4 className="fw-bold mt-2">{value.toLocaleString("th-TH")} บาท</h4>
      </div>
    </div>
  );
}

/* ===== การ์ดรายเดือน ===== */
function MonthlyBillCards({bills,monthNamesTH}:any){
  const acc:any={};
  bills.forEach((b:Bill)=>{
    const d=new Date(b.month);
    const key=`${d.getUTCFullYear()+543}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
    if(!acc[key]) acc[key]={rent:0,water:0,electric:0,total:0};
    acc[key].rent+=b.rent||0;
    acc[key].water+=b.waterCost||0;
    acc[key].electric+=b.electricCost||0;
    acc[key].total+=b.total||0;
  });
  const rows=Object.entries(acc).map(([k,v]:any)=>{
    const [y,m]=k.split("-");
    return {month:`${monthNamesTH[+m-1]} ${y}`,...v};
  });
  return(
    <div className="mt-4">
      {rows.map((r,i)=>(
        <div key={i} className="card shadow-sm mb-2" style={{borderRadius:14}}>
          <div className="card-body">
            <h5 className="fw-bold text-primary">📅 {r.month}</h5>
            <p className="mb-1">- ค่าเช่าห้อง: {r.rent.toLocaleString("th-TH")} บาท</p>
            <p className="mb-1">- ค่าน้ำ: {r.water.toLocaleString("th-TH")} บาท</p>
            <p className="mb-1">- ค่าไฟ: {r.electric.toLocaleString("th-TH")} บาท</p>
            <h6 className="fw-bold text-success">
              - รวมรายรับบิล: {r.total.toLocaleString("th-TH")} บาท
            </h6>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== ตาราง Desktop ===== */
function MonthlyBillTable({bills,monthNamesTH}:{bills:Bill[],monthNamesTH:string[]}){
  const acc:any={};
  bills.forEach(b=>{
    const d=new Date(b.month);
    const key=`${d.getUTCFullYear()+543}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
    if(!acc[key]) acc[key]={rent:0,water:0,electric:0,total:0};
    acc[key].rent+=b.rent||0;
    acc[key].water+=b.waterCost||0;
    acc[key].electric+=b.electricCost||0;
    acc[key].total+=b.total||0;
  });
  const rows=Object.entries(acc).map(([k,v]:any)=>{
    const [y,m]=k.split("-");
    return {month:`${monthNamesTH[+m-1]} ${y}`,...v};
  });
  return(
    <table className="table table-hover text-center mt-3">
      <thead style={{background:"#4A0080",color:"#fff"}}>
        <tr><th>#</th><th>เดือน</th><th>ค่าเช่าห้อง</th><th>ค่าน้ำ</th><th>ค่าไฟ</th><th>รวม</th></tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i}>
            <td>{i+1}</td><td>{r.month}</td>
            <td>{r.rent.toLocaleString("th-TH")}</td>
            <td>{r.water.toLocaleString("th-TH")}</td>
            <td>{r.electric.toLocaleString("th-TH")}</td>
            <td className="fw-bold text-primary">{r.total.toLocaleString("th-TH")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}