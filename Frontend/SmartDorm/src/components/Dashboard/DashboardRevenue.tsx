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

  const screen = window.innerWidth;
  const isMobile = screen < 600; // A
  const isTablet = screen >= 600 && screen < 1400; // B
  const isDesktop = screen >= 1400; // Table

  const monthNamesTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  /* ================= YEAR OPTIONS ================= */
  const yearFromBills = Array.from(
    new Set(bills.map((b) => new Date(b.month).getUTCFullYear() + 543))
  ).sort((a, b) => a - b);

  const availableYears = yearFromBills.length
    ? yearFromBills.map(String)
    : ["2568"];

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

  /* ---- BOOKING ---- */
  const rentBooking = sum(filteredBookings.map((b) => b.room), "rent");
  const depositBooking = sum(filteredBookings.map((b) => b.room), "deposit");
  const bookingFee = sum(filteredBookings.map((b) => b.room), "bookingFee");
  const totalBookingRevenue =
    rentBooking + depositBooking + bookingFee;

  /* ---- BILL ---- */
  const rentBill = sum(filteredBills, "rent");
  const waterBill = sum(filteredBills, "waterCost");
  const electricBill = sum(filteredBills, "electricCost");
  const totalBillRevenue = sum(filteredBills, "total");

  const totalAllRevenue = totalBookingRevenue + totalBillRevenue;

  /* ================= CHART DATA ================= */
  const labels = monthNamesTH;

  const bookingRentData = filteredBookings.map((b) => b.room?.rent || 0);
  const bookingDepositData = filteredBookings.map((b) => b.room?.deposit || 0);
  const bookingFeeData = filteredBookings.map((b) => b.room?.bookingFee || 0);
  const bookingTotalData = filteredBookings.map(
    (b) => (b.room?.rent || 0) + (b.room?.deposit || 0) + (b.room?.bookingFee || 0)
  );

  const billRentData = filteredBills.map((b) => b.rent);
  const waterData = filteredBills.map((b) => b.waterCost);
  const electricData = filteredBills.map((b) => b.electricCost);
  const billTotalData = filteredBills.map((b) => b.total);

  const displayTitle =
    selectedYear && selectedMonth
      ? `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`
      : selectedYear
      ? `ปี ${selectedYear}`
      : `ทุกปี`;

  /* ============ RESPONSIVE UI ============ */

  return (
    <div className="mt-4">

      {/* TITLE */}
      <h2 className="fw-bold text-center" style={{ color: "#4A0080" }}>
        💜 รายรับ SmartDorm
      </h2>
      <h5 className="text-center mb-4">({displayTitle})</h5>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <select
          value={selectedYear}
          onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonth(""); }}
          className="form-select w-auto"
        >
          <option value="">ทุกปี</option>
          {availableYears.map((y) => <option key={y}>{y}</option>)}
        </select>

        <select
          disabled={!selectedYear}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="form-select w-auto"
        >
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
          ))}
        </select>
      </div>

      {/* ===========================================================
         📌 A — MOBILE (<600px) : การ์ด → กราฟ → การ์ด → กราฟ
      =========================================================== */}
      {isMobile && (
        <>
          {/* BOOKING */}
          <Section title="รายรับการจอง">
            <Card title="ค่าเช่า" value={rentBooking} color="#4A148C" />
            <DashboardRevenueChart labels={labels} data={bookingRentData} title="ค่าเช่า" color="#4A148C" />

            <Card title="ค่ามัดจำ" value={depositBooking} color="#7B1FA2" />
            <DashboardRevenueChart labels={labels} data={bookingDepositData} title="ค่ามัดจำ" color="#7B1FA2" />

            <Card title="ค่าจอง" value={bookingFee} color="#FFC107" />
            <DashboardRevenueChart labels={labels} data={bookingFeeData} title="ค่าจอง" color="#FFC107" />

            <Card title="รวมรายรับการจอง" value={totalBookingRevenue} color="#2E7D32" />
            <DashboardRevenueChart labels={labels} data={bookingTotalData} title="รวมรายรับการจอง" color="#2E7D32" />
          </Section>

          {/* BILL */}
          <Section title="รายรับบิล">
            <Card title="ค่าเช่าห้อง" value={rentBill} color="#3F51B5" />
            <DashboardRevenueChart labels={labels} data={billRentData} title="ค่าเช่าห้อง" color="#3F51B5" />

            <Card title="ค่าน้ำ" value={waterBill} color="#29B6F6" />
            <DashboardRevenueChart labels={labels} data={waterData} title="ค่าน้ำ" color="#29B6F6" />

            <Card title="ค่าไฟ" value={electricBill} color="#FF7043" />
            <DashboardRevenueChart labels={labels} data={electricData} title="ค่าไฟ" color="#FF7043" />

            <Card title="รวมรายรับบิล" value={totalBillRevenue} color="#00838F" />
            <DashboardRevenueChart labels={labels} data={billTotalData} title="รวมรายรับบิล" color="#00838F" />
          </Section>
        </>
      )}

      {/* ===========================================================
         📌 B — TABLET (600–1399px)
         แผงการ์ด 3 ใบต่อแถว + กราฟเรียงต่อกัน
      =========================================================== */}
      {isTablet && (
        <>
          <Section title="รายรับการจอง">
            <Cards3>
              <Card title="ค่าเช่า" value={rentBooking} color="#4A148C" />
              <Card title="ค่ามัดจำ" value={depositBooking} color="#7B1FA2" />
              <Card title="ค่าจอง" value={bookingFee} color="#FFC107" />
              <Card title="รวมรายรับการจอง" value={totalBookingRevenue} color="#2E7D32" />
            </Cards3>

            <DashboardRevenueChart labels={labels} data={bookingRentData} title="ค่าเช่า" color="#4A148C" />
            <DashboardRevenueChart labels={labels} data={bookingDepositData} title="ค่ามัดจำ" color="#7B1FA2" />
            <DashboardRevenueChart labels={labels} data={bookingFeeData} title="ค่าจอง" color="#FFC107" />
            <DashboardRevenueChart labels={labels} data={bookingTotalData} title="รวมรายรับการจอง" color="#2E7D32" />
          </Section>

          <Section title="รายรับบิล">
            <Cards3>
              <Card title="ค่าเช่าห้อง" value={rentBill} color="#3F51B5" />
              <Card title="ค่าน้ำ" value={waterBill} color="#29B6F6" />
              <Card title="ค่าไฟ" value={electricBill} color="#FF7043" />
              <Card title="รวมรายรับบิล" value={totalBillRevenue} color="#00838F" />
            </Cards3>

            <DashboardRevenueChart labels={labels} data={billRentData} title="ค่าเช่าห้อง" color="#3F51B5" />
            <DashboardRevenueChart labels={labels} data={waterData} title="ค่าน้ำ" color="#29B6F6" />
            <DashboardRevenueChart labels={labels} data={electricData} title="ค่าไฟ" color="#FF7043" />
            <DashboardRevenueChart labels={labels} data={billTotalData} title="รวมรายรับบิล" color="#00838F" />
          </Section>
        </>
      )}

      {/* ===========================================================
         📌 DESKTOP TABLE (>1400px)
      =========================================================== */}
      {isDesktop && (
        <>
          <h4 className="fw-bold mt-4" style={{ color: "#4A0080" }}>
            📅 รายรับรายเดือนจากบิล
          </h4>
          <MonthlyBillTable bills={filteredBills} monthNamesTH={monthNamesTH} />
        </>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children }: any) {
  return (
    <div className="mt-4">
      <h4 className="fw-bold">{title}</h4>
      {children}
    </div>
  );
}

function Cards3({ children }: any) {
  return <div className="row g-2">{children}</div>;
}

function Card({ title, value, color }: any) {
  return (
    <div
      className="card col-6 col-md-3 text-center shadow-sm"
      style={{ background: color, color: "white", borderRadius: 14 }}
    >
      <div className="card-body">
        <b>{title}</b>
        <h4 className="fw-bold mt-2">{value.toLocaleString("th-TH")} บาท</h4>
      </div>
    </div>
  );
}

/* ================= MONTHLY TABLE ================= */

function MonthlyBillTable({
  bills,
  monthNamesTH,
}: {
  bills: Bill[];
  monthNamesTH: string[];
}) {
  const acc: any = {};
  bills.forEach((b) => {
    const d = new Date(b.month);
    const key = `${d.getUTCFullYear() + 543}-${String(
      d.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = { rent: 0, water: 0, electric: 0, total: 0 };
    acc[key].rent += b.rent || 0;
    acc[key].water += b.waterCost || 0;
    acc[key].electric += b.electricCost || 0;
    acc[key].total += b.total || 0;
  });

  const rows = Object.entries(acc).map(([k, v]: any) => {
    const [y, m] = k.split("-");
    return { month: `${monthNamesTH[+m - 1]} ${y}`, ...v };
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
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{r.month}</td>
            <td>{r.rent.toLocaleString("th-TH")}</td>
            <td>{r.water.toLocaleString("th-TH")}</td>
            <td>{r.electric.toLocaleString("th-TH")}</td>
            <td className="fw-bold text-primary">
              {r.total.toLocaleString("th-TH")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}