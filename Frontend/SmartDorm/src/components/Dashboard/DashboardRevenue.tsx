// src/components/Dashboard/DashboardRevenue.tsx
import { useMemo, useState, useEffect } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1400);

  // ✅ ตรวจจับขนาดจอแบบเรียลไทม์
  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 1400);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];
  const availableYears = Array.from({ length: 8 }, (_, i) => (2568 + i).toString());

  const selectedMonthName = selectedMonth && monthNamesTH[parseInt(selectedMonth) - 1];
  const selectedYearTH = selectedYear || "";
  const displayTitle =
    selectedYear && selectedMonth
      ? `${selectedMonthName} ${selectedYearTH}`
      : selectedYear
      ? `ปี ${selectedYearTH}`
      : "ทั้งหมด";

  // 🧾 กรองบิล
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const yearBE = d.getUTCFullYear() + 543;
      const monthStr = String(d.getUTCMonth() + 1).padStart(2, "0");
      if (selectedYear && selectedMonth) return yearBE.toString() === selectedYear && monthStr === selectedMonth;
      else if (selectedYear) return yearBE.toString() === selectedYear;
      return true;
    });
  }, [bills, selectedYear, selectedMonth]);

  // 🧾 กรอง booking (ใช้ createdAt)
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt) return false;
      const d = new Date(b.createdAt);
      const yearBE = d.getUTCFullYear() + 543;
      const monthStr = String(d.getUTCMonth() + 1).padStart(2, "0");
      if (selectedYear && selectedMonth) return yearBE.toString() === selectedYear && monthStr === selectedMonth;
      else if (selectedYear) return yearBE.toString() === selectedYear;
      return true;
    });
  }, [bookings, selectedYear, selectedMonth]);

  // 💵 Booking
  const totalRentBooking = useMemo(() =>
    filteredBookings.filter((b) => b.approveStatus === 1 && b.room)
      .reduce((sum, b) => sum + (b.room?.rent || 0), 0), [filteredBookings]);

  const totalDepositBooking = useMemo(() =>
    filteredBookings.filter((b) => b.approveStatus === 1 && b.room)
      .reduce((sum, b) => sum + (b.room?.deposit || 0), 0), [filteredBookings]);

  const totalBookingFee = useMemo(() =>
    filteredBookings.filter((b) => b.approveStatus === 1 && b.room)
      .reduce((sum, b) => sum + (b.room?.bookingFee || 0), 0), [filteredBookings]);

  // 💰 Bill
  const totalRentBill = useMemo(() =>
    filteredBills.filter((b) => b.status === 1)
      .reduce((sum, b) => sum + (b.rent || 0), 0), [filteredBills]);

  const totalWaterBill = useMemo(() =>
    filteredBills.filter((b) => b.status === 1)
      .reduce((sum, b) => sum + (b.waterCost || 0), 0), [filteredBills]);

  const totalElectricBill = useMemo(() =>
    filteredBills.filter((b) => b.status === 1)
      .reduce((sum, b) => sum + (b.electricCost || 0), 0), [filteredBills]);

  const totalAllBill = useMemo(() =>
    filteredBills.filter((b) => b.status === 1)
      .reduce((sum, b) => sum + (b.total || 0), 0), [filteredBills]);

  // 📊 รวมรายเดือน
  const monthlyData = useMemo(() => {
    const acc = new Map<string, { rent: number; water: number; electric: number; total: number }>();
    filteredBills.filter((b) => b.status === 1).forEach((b) => {
      const d = new Date(b.month);
      const yearBE = d.getUTCFullYear() + 543;
      const monthNum = d.getUTCMonth() + 1;
      const key = `${yearBE}-${String(monthNum).padStart(2, "0")}`;
      const current = acc.get(key) || { rent: 0, water: 0, electric: 0, total: 0 };
      current.rent += b.rent || 0;
      current.water += b.waterCost || 0;
      current.electric += b.electricCost || 0;
      current.total += b.total || 0;
      acc.set(key, current);
    });
    return Array.from(acc.entries()).map(([key, v]) => {
      const [yearBE, mm] = key.split("-");
      const monthName = monthNamesTH[parseInt(mm) - 1];
      return { month: `${monthName} ${yearBE}`, ...v, sortKey: key };
    });
  }, [filteredBills]);

  // 🧮 รวมรายรับทั้งหมด
  const totalAllRevenue =
    totalRentBooking + totalDepositBooking + totalBookingFee + totalAllBill;

  return (
    <div className="mt-4">
      <h1 className="fw-bold mb-3 text-center">💰 สรุปรายรับรวม</h1>
      <h4 className="fw-bold mb-3 text-center">( {displayTitle} )</h4>

      {/* ฟิลเตอร์ */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <select className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonth(""); }}>
          <option value="">ทุกปี</option>
          {availableYears.map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>

        <select className="form-select w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          disabled={!selectedYear}>
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, i) => (<option key={i + 1} value={String(i + 1).padStart(2, "0")}>{m}</option>))}
        </select>
      </div>

      {/* การ์ดจาก Booking */}
      <h5 className="fw-bold text-center mb-2 text-primary">📦 รายรับจากการจอง</h5>
      <div className="row g-2 justify-content-center mb-4">
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="ค่าเช่า (Booking)" amount={totalRentBooking} color="#0077b6" /></div>
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="ค่ามัดจำ" amount={totalDepositBooking} color="#8338ec" /></div>
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="ค่าจอง" amount={totalBookingFee} color="#ffb703" /></div>
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="รวมรายรับจากการจอง" amount={totalRentBooking + totalDepositBooking + totalBookingFee} color="#00916e" /></div>
      </div>

      {/* การ์ดจาก Bill */}
      <h5 className="fw-bold text-center mb-2 text-success">📄 รายรับจากบิล (ชำระแล้ว)</h5>
      <div className="row g-2 justify-content-center mb-4">
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="ค่าเช่าห้อง" amount={totalRentBill} color="#0077b6" /></div>
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="ค่าน้ำ" amount={totalWaterBill} color="#48cae4" /></div>
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="ค่าไฟ" amount={totalElectricBill} color="#ffb703" /></div>
        <div className="col-6 col-md-3 col-lg-2"><RevenueCard title="รายรับรวม" amount={totalAllBill} color="#00b4d8" /></div>
      </div>

      {/* ✅ รวมรายรับทั้งหมด */}
      <h5 className="fw-bold text-center mb-2 text-danger">💵 รายรับทั้งหมด (Booking + Bill)</h5>
      <div className="row justify-content-center mb-5">
        <div className="col-10 col-md-4">
          <RevenueCard title="รวมรายรับทั้งหมด" amount={totalAllRevenue} color="#28a745" />
        </div>
      </div>

      {/* ✅ ตารางหรือการ์ดรายเดือน */}
      <h5 className="fw-bold text-center mb-2 text-secondary">📅 รายรับรายเดือนจากบิล</h5>
      {isWideScreen ? (
        // แสดงแบบตาราง
        <div className="responsive-table" style={{ overflowX: "auto" }}>
          <table className="table table-sm table-striped align-middle text-center">
            <thead className="table-dark">
              <tr><th>#</th><th>เดือน</th><th>ค่าเช่าห้อง</th><th>ค่าน้ำ</th><th>ค่าไฟ</th><th>รายรับรวม</th></tr>
            </thead>
            <tbody>
              {monthlyData.length > 0 ? (
                monthlyData.sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1)).map((m, idx) => (
                  <tr key={m.sortKey}>
                    <td>{idx + 1}</td>
                    <td>{m.month}</td>
                    <td>{m.rent.toLocaleString("th-TH")}</td>
                    <td>{m.water.toLocaleString("th-TH")}</td>
                    <td>{m.electric.toLocaleString("th-TH")}</td>
                    <td className="fw-bold text-success">{m.total.toLocaleString("th-TH")}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-muted">ไม่มีข้อมูลรายรับในช่วงที่เลือก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // แสดงแบบการ์ด
        <div className="d-flex flex-column gap-3 align-items-center mt-3">
          {monthlyData.length > 0 ? (
            monthlyData.sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1)).map((m) => (
              <div key={m.sortKey} className="card shadow-sm w-100" style={{ maxWidth: "600px", borderRadius: "12px" }}>
                <div className="card-body">
                  <h6 className="fw-bold text-center mb-2">📆 {m.month}</h6>
                  <div className="row text-center">
                    <div className="col-6"><small className="text-muted">ค่าเช่าห้อง</small><div>{m.rent.toLocaleString("th-TH")} ฿</div></div>
                    <div className="col-6"><small className="text-muted">ค่าน้ำ</small><div>{m.water.toLocaleString("th-TH")} ฿</div></div>
                  </div>
                  <div className="row text-center mt-2">
                    <div className="col-6"><small className="text-muted">ค่าไฟ</small><div>{m.electric.toLocaleString("th-TH")} ฿</div></div>
                    <div className="col-6"><small className="text-muted fw-bold text-success">รายรับรวม</small><div className="fw-bold text-success">{m.total.toLocaleString("th-TH")} ฿</div></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">ไม่มีข้อมูลรายรับในช่วงที่เลือก</p>
          )}
        </div>
      )}
    </div>
  );
}

// ✅ Sub component
function RevenueCard({ title, amount, color }: { title: string; amount: number; color: string }) {
  return (
    <div className="card text-center border-0 shadow-sm"
      style={{ background: color, color: "white", borderRadius: "10px", height: "90px" }}>
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div className="fw-bold" style={{ fontSize: "1rem" }}>{title}</div>
        <div className="fw-semibold" style={{ fontSize: "1rem" }}>{amount.toLocaleString("th-TH")}</div>
      </div>
    </div>
  );
}