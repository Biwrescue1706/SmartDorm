// ================= DashboardRevenue.tsx =================
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

  const monthNamesTH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  // ================= YEAR LIST FROM DATA =================
  const yearFromBills = Array.from(
    new Set(bills.map((b) => new Date(b.month).getUTCFullYear() + 543))
  ).sort((a, b) => a - b);

  const availableYears = yearFromBills.length
    ? yearFromBills.map(String)
    : ["2568"];

  // ================= FILTER =================
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

  // ================= SUMMARY =================
  const sum = (arr: any[], key: any) =>
    arr.reduce((s, b) => s + (b[key] || 0), 0);

  // booking revenue
  const rentBooking = sum(filteredBookings.map((b) => b.room), "rent");
  const depositBooking = sum(filteredBookings.map((b) => b.room), "deposit");
  const bookingFee = sum(filteredBookings.map((b) => b.room), "bookingFee");
  const totalBookingRevenue = rentBooking + depositBooking + bookingFee;

  // bill revenue
  const rentBill = sum(filteredBills, "rent");
  const waterBill = sum(filteredBills, "waterCost");
  const electricBill = sum(filteredBills, "electricCost");
  const totalBillRevenue = sum(filteredBills, "total");

  const totalAllRevenue = totalBillRevenue + totalBookingRevenue;

  // ================= MONTHLY TABLE =================
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

    return Object.entries(acc)
      .map(([key, v]) => {
        const [y, m] = key.split("-");
        return {
          month: `${monthNamesTH[+m - 1]} ${y}`,
          sortKey: key,
          ...v,
        };
      })
      .sort((a, b) => (a.sortKey > b.sortKey ? 1 : -1));
  }, [filteredBills]);

  // ================= TITLE LOGIC =================
  const subtitle = !selectedYear
    ? "ทุกปี"
    : selectedYear && !selectedMonth
    ? `ปี ${selectedYear}`
    : `${monthNamesTH[+selectedMonth - 1]} ${selectedYear}`;

  const labels =
    !selectedYear && !selectedMonth
      ? availableYears
      : selectedYear && !selectedMonth
      ? filteredBills.length
        ? Array.from(
            new Set(
              filteredBills.map((b) =>
                `${monthNamesTH[new Date(b.month).getUTCMonth()]}`
              )
            )
          )
        : monthNamesTH
      : [
          `${monthNamesTH[+selectedMonth - 1]}`,
        ];

  // ================= GRAPH DATA =================
  const rentBookingData = filteredBookings.map((b) => b.room?.rent || 0);
  const depositData = filteredBookings.map((b) => b.room?.deposit || 0);
  const bookingFeeData = filteredBookings.map((b) => b.room?.bookingFee || 0);
  const bookingTotalData = filteredBookings.map(
    (b) =>
      (b.room?.rent || 0) + (b.room?.deposit || 0) + (b.room?.bookingFee || 0)
  );

  const rentBillData = filteredBills.map((b) => b.rent);
  const waterData = filteredBills.map((b) => b.waterCost);
  const electricData = filteredBills.map((b) => b.electricCost);
  const billTotalData = filteredBills.map((b) => b.total);

  // ================= UI =================
  return (
    <div className="mt-3">

      <h2 className="fw-bold text-center mb-4" style={{ color: "#4A0080" }}>
        💜 รายรับรวม SmartDorm
      </h2>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-3 flex-wrap">
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

      {/* ============ BOOKING CARDS ============ */}
      <h4 className="fw-bold mt-4">📦 รายรับจากการจอง</h4>
      <div className="row g-2">
        <Card title="ค่าเช่า" value={rentBooking} color="#4A148C" />
        <Card title="ค่ามัดจำ" value={depositBooking} color="#7E57C2" />
        <Card title="ค่าจอง" value={bookingFee} color="#F9A825" />
        <Card title="รวมรายรับการจอง" value={totalBookingRevenue} color="#00897B" />
      </div>

      {/* BOOKING CHART */}
      <DashboardRevenueChart
        labels={labels}
        data={rentBookingData}
        title="ค่าเช่า (จากการจอง)"
        subtitle={subtitle}
        color="#4A148C"
      />
      <DashboardRevenueChart
        labels={labels}
        data={depositData}
        title="ค่ามัดจำ"
        subtitle={subtitle}
        color="#7E57C2"
      />
      <DashboardRevenueChart
        labels={labels}
        data={bookingFeeData}
        title="ค่าจอง"
        subtitle={subtitle}
        color="#F9A825"
      />
      <DashboardRevenueChart
        labels={labels}
        data={bookingTotalData}
        title="รวมรายรับการจอง"
        subtitle={subtitle}
        color="#00897B"
      />

      {/* ============ BILL CARDS ============ */}
      <h4 className="fw-bold mt-4">🧾 รายรับจากบิล</h4>
      <div className="row g-2">
        <Card title="ค่าเช่าห้อง" value={rentBill} color="#3F51B5" />
        <Card title="ค่าน้ำ" value={waterBill} color="#26C6DA" />
        <Card title="ค่าไฟ" value={electricBill} color="#FF7043" />
        <Card title="รวมรายรับบิล" value={totalBillRevenue} color="#0097A7" />
      </div>

      {/* BILL CHART */}
      <DashboardRevenueChart
        labels={labels}
        data={rentBillData}
        title="ค่าเช่าห้อง"
        subtitle={subtitle}
        color="#3F51B5"
      />
      <DashboardRevenueChart
        labels={labels}
        data={waterData}
        title="ค่าน้ำ"
        subtitle={subtitle}
        color="#26C6DA"
      />
      <DashboardRevenueChart
        labels={labels}
        data={electricData}
        title="ค่าไฟ"
        subtitle={subtitle}
        color="#FF7043"
      />
      <DashboardRevenueChart
        labels={labels}
        data={billTotalData}
        title="รวมรายรับบิล"
        subtitle={subtitle}
        color="#0097A7"
      />

      {/* ============ TOTAL ============ */}
      <h4 className="fw-bold mt-4">💰 รายรับทั้งหมด</h4>
      <div className="row g-2">
        <Card title="รวมทั้งหมด" value={totalAllRevenue} color="#2E7D32" />
      </div>

      {/* ============ MONTH TABLE ============ */}
      {monthlyData.length > 0 && (
        <>
          <h4 className="fw-bold mt-4" style={{ color: "#4A0080" }}>
            📅 รายรับรายเดือนจากบิล
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

/* ========= CARD ========= */
function Card({ title, value, color }: any) {
  return (
    <div
      className="card shadow-sm col-6 col-md-3 text-center border-0"
      style={{ background: color, color: "white", borderRadius: 14 }}
    >
      <div className="card-body">
        <b>{title}</b>
        <h4 className="fw-bold mt-2">{value.toLocaleString("th-TH")} บาท</h4>
      </div>
    </div>
  );
}