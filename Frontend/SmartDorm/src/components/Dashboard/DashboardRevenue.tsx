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
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  /* ================= SCREEN BREAKPOINT ================= */
  const screen = window.innerWidth;
  const isMobile = screen < 600;          // ใช้ในการแสดง 1 กราฟ 1 แถว
  const isTablet = screen >= 600 && screen < 1400; // 3 กราฟต่อแถว
  const isDesktop = screen >= 1400;       // ตารางรายเดือน

  const monthNamesTH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  const availableYears = Array.from({ length: 10 }, (_, i) =>
    (2566 + i).toString()
  );

  /* ================= FILTER ================= */
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return (
        b.status === 1 &&
        (!selectedYear || y.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      );
    });
  }, [bills, selectedYear, selectedMonth]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt || b.approveStatus !== 1 || !b.room) return false;
      const d = new Date(b.createdAt);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return (
        (!selectedYear || y.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      );
    });
  }, [bookings, selectedYear, selectedMonth]);

  /* ================= SUMMARY ================= */
  const sum = (arr: any[], key: any) =>
    arr.reduce((s, b) => s + (b[key] || 0), 0);

  // Booking revenue
  const rentBooking = sum(filteredBookings.map((b) => b.room), "rent");
  const depositBooking = sum(filteredBookings.map((b) => b.room), "deposit");
  const bookingFee = sum(filteredBookings.map((b) => b.room), "bookingFee");
  const totalBookingRevenue = rentBooking + depositBooking + bookingFee;

  // Bill revenue
  const totalBillRevenue = sum(filteredBills, "total");
  const totalAllRevenue = totalBookingRevenue + totalBillRevenue;

  /* ================= MONTHLY DATA ================= */
  const monthlyData = useMemo(() => {
    const acc: Record<string, any> = {};
    filteredBills.forEach((b) => {
      const d = new Date(b.month);
      const y = d.getUTCFullYear() + 543;
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      if (!acc[key]) acc[key] = { rent: 0, water: 0, electric: 0, total: 0 };
      acc[key].rent += b.rent || 0;
      acc[key].water += b.waterCost || 0;
      acc[key].electric += b.electricCost || 0;
      acc[key].total += b.total || 0;
    });
    return Object.entries(acc).map(([k, v]) => {
      const [y, m] = k.split("-");
      return {
        month: `${monthNamesTH[+m - 1]} ${y}`,
        sortKey: k,
        ...v,
      };
    });
  }, [filteredBills]);

  const displayTitle =
    selectedYear && selectedMonth
      ? `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`
      : selectedYear
      ? `ปี ${selectedYear}`
      : "ทุกปี";

  /* ================= CHART DATA ================= */
  const labels = monthNamesTH;
  const rentData = filteredBills.map((b) => b.rent);
  const depositData = filteredBookings.map((b) => b.room?.deposit || 0);
  const bookingFeeData = filteredBookings.map((b) => b.room?.bookingFee || 0);
  const waterData = filteredBills.map((b) => b.waterCost);
  const electricData = filteredBills.map((b) => b.electricCost);
  const billTotalData = filteredBills.map((b) => b.total);
  const bookingTotalData = filteredBookings.map(
    (b) =>
      (b.room?.rent || 0) + (b.room?.deposit || 0) + (b.room?.bookingFee || 0)
  );

  /* ================= UI ================= */

  return (
    <div className="mt-4">

      {/* TITLE */}
      <h2 className="fw-bold text-center mb-3" style={{ color: "#4A0080" }}>
        💜 รายรับรวม SmartDorm
      </h2>
      <h5 className="text-center mb-4">({displayTitle})</h5>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedMonth("");
          }}
        >
          <option value="">ทุกปี</option>
          {availableYears.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          disabled={!selectedYear}
          className="form-select w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* ================= CHART RESPONSIVE ================= */}
      <div className="mt-4">
        {isMobile && (
          <>
            <DashboardRevenueChart labels={labels} data={rentData} title="ค่าเช่า" color="#4A0080" />
            <DashboardRevenueChart labels={labels} data={depositData} title="ค่ามัดจำ" color="#8D41D8" />
            <DashboardRevenueChart labels={labels} data={bookingFeeData} title="ค่าจอง" color="#FBD341" />
            <DashboardRevenueChart labels={labels} data={bookingTotalData} title="รวมรายรับการจอง" color="#28A745" />
            <DashboardRevenueChart labels={labels} data={waterData} title="ค่าน้ำ" color="#48CAE4" />
            <DashboardRevenueChart labels={labels} data={electricData} title="ค่าไฟ" color="#FF9800" />
            <DashboardRevenueChart labels={labels} data={billTotalData} title="รวมรายรับบิล" color="#00B4D8" />
          </>
        )}

        {isTablet && (
          <div className="row row-cols-1 row-cols-md-3 g-3">
            <DashboardRevenueChart labels={labels} data={rentData} title="ค่าเช่า" color="#4A0080" />
            <DashboardRevenueChart labels={labels} data={depositData} title="ค่ามัดจำ" color="#8D41D8" />
            <DashboardRevenueChart labels={labels} data={bookingFeeData} title="ค่าจอง" color="#FBD341" />
            <DashboardRevenueChart labels={labels} data={bookingTotalData} title="รวมรายรับการจอง" color="#28A745" />
            <DashboardRevenueChart labels={labels} data={waterData} title="ค่าน้ำ" color="#48CAE4" />
            <DashboardRevenueChart labels={labels} data={electricData} title="ค่าไฟ" color="#FF9800" />
            <DashboardRevenueChart labels={labels} data={billTotalData} title="รวมรายรับบิล" color="#00B4D8" />
          </div>
        )}

        {isDesktop && (
          <>
            <DashboardRevenueChart labels={labels} data={bookingTotalData} title="รวมรายรับการจอง" color="#28A745" />
            <DashboardRevenueChart labels={labels} data={billTotalData} title="รวมรายรับบิล" color="#00B4D8" />
          </>
        )}
      </div>

      {/* SUMMARY CARD */}
      <div className="row g-3 mt-4 justify-content-center">
        <Card title="รายรับการจอง" value={totalBookingRevenue} color="#4A0080" />
        <Card title="รายรับบิล" value={totalBillRevenue} color="#6A1B9A" />
        <Card title="รวมทั้งหมด" value={totalAllRevenue} color="#28A745" />
      </div>

      {/* DESKTOP TABLE */}
      {isDesktop && monthlyData.length > 0 && (
        <>
          <h4 className="fw-bold mt-4" style={{ color: "#4A0080" }}>
            📅 รายรับรายเดือน
          </h4>
          <table className="table table-hover text-center">
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
              {monthlyData.map((m, i) => (
                <tr key={m.sortKey}>
                  <td>{i + 1}</td>
                  <td>{m.month}</td>
                  <td>{m.rent.toLocaleString("th-TH")}</td>
                  <td>{m.water.toLocaleString("th-TH")}</td>
                  <td>{m.electric.toLocaleString("th-TH")}</td>
                  <td className="fw-bold text-primary">
                    {m.total.toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

/* ================= CARD COMPONENT ================= */
function Card({ title, value, color }: any) {
  return (
    <div
      className="card shadow-sm col-4 text-center border-0"
      style={{ background: color, color: "white", borderRadius: "14px" }}
    >
      <div className="card-body">
        <b>{title}</b>
        <h4 className="fw-bold mt-2">{value.toLocaleString("th-TH")} บาท</h4>
      </div>
    </div>
  );
}