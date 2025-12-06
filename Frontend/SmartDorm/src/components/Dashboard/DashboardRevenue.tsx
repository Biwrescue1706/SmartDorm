import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const years = Array.from({ length: 6 }, (_, i) => (2568 + i).toString());

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2,"0");
      return b.status === 1 &&
        (!year || y.toString() === year) &&
        (!month || m === month);
    });
  }, [bills, year, month]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt || b.approveStatus !== 1) return false;
      const d = new Date(b.createdAt);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return (!year || y.toString() === year) &&
        (!month || m === month);
    });
  }, [bookings, year, month]);

  const sum = (arr: any[], key: string) =>
    arr.reduce((s, b) => s + (b[key] || 0), 0);

  const totalRentBooking = sum(filteredBookings.map((b)=>b.room),"rent");
  const totalDepositBooking = sum(filteredBookings.map((b)=>b.room),"deposit");
  const totalBookingFee = sum(filteredBookings.map((b)=>b.room),"bookingFee");

  const totalRentBill = sum(filteredBills,"rent");
  const totalWater = sum(filteredBills,"waterCost");
  const totalElectric = sum(filteredBills,"electricCost");
  const totalBill = sum(filteredBills,"total");

  const totalAll = totalRentBooking + totalDepositBooking + totalBookingFee + totalBill;

  return (
    <div className="mt-4">

      {/* === FILTER === */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        <select
          value={year}
          className="form-select w-auto"
          onChange={(e)=>{ setYear(e.target.value); setMonth(""); }}
        >
          <option value="">ทุกปี</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>

        <select
          value={month}
          className="form-select w-auto"
          onChange={(e)=>setMonth(e.target.value)}
          disabled={!year}
        >
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m,i)=>(
            <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>
          ))}
        </select>
      </div>

      {/* === TOTAL SUMMARY === */}
      <div className="card shadow-sm text-center mb-3"
        style={{
          maxWidth:"420px",margin:"0 auto",
          background:"#4A0080",color:"white",borderRadius:"12px"
        }}
      >
        <div className="card-body">
          <h5 className="fw-bold mb-1">💰 รายรับรวม</h5>
          <h3 className="fw-bold">{totalAll.toLocaleString("th-TH")} บาท</h3>
        </div>
      </div>

      {/* === GRAPH SECTION === */}
      <DashboardRevenueChart
        bills={filteredBills}
        bookings={filteredBookings}
        year={year}
        month={month}
      />

      {/* === BOOKING CARDS === */}
      <h4 className="fw-bold mt-4" style={{color:"#4A0080"}}>📦 รายรับจากการจอง</h4>
      <div className="row g-2">
        <RevenueCard title="ค่าเช่า" amount={totalRentBooking} color="#5A00A8" />
        <RevenueCard title="ค่ามัดจำ" amount={totalDepositBooking} color="#8D41D8" />
        <RevenueCard title="ค่าจอง" amount={totalBookingFee} color="#FBD341" dark />
      </div>

      {/* === BILL CARDS === */}
      <h4 className="fw-bold mt-4" style={{color:"#4A0080"}}>📄 รายรับจากบิล</h4>
      <div className="row g-2">
        <RevenueCard title="ค่าเช่า" amount={totalRentBill} color="#5A00A8" />
        <RevenueCard title="ค่าน้ำ" amount={totalWater} color="#48CAE4" />
        <RevenueCard title="ค่าไฟ" amount={totalElectric} color="#FF9800" />
        <RevenueCard title="รวมบิล" amount={totalBill} color="#00B4D8" />
      </div>

    </div>
  );
}

function RevenueCard({title,amount,color,dark}:any){
  return(
    <div className="col-6 col-md-3">
      <div className="card shadow-sm text-center p-3"
        style={{background:color,color:dark?"#4A0080":"white",borderRadius:"10px"}}
      >
        <strong className="small">{title}</strong>
        <div>{amount.toLocaleString("th-TH")}</div>
      </div>
    </div>
  );
}