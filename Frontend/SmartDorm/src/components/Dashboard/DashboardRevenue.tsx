// ---------------- DashboardRevenue.tsx ----------------
import { useMemo, useState } from "react";
import DashboardRevenueChart from "./DashboardRevenueChart";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  const availableYears = Array.from({ length: 10 }, (_, i) =>
    (2567 + i).toString()
  );

  // ✨ Filter ตามปี / เดือน
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const y = d.getFullYear() + 543;
      const m = String(d.getMonth() + 1).padStart(2, "0");

      return (
        b.status === 1 &&
        (!selectedYear || y.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      );
    });
  }, [bills, selectedYear, selectedMonth]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt || b.approveStatus !== 1) return false;
      const d = new Date(b.createdAt);
      const y = d.getFullYear() + 543;
      const m = String(d.getMonth() + 1).padStart(2, "0");

      return (
        (!selectedYear || y.toString() === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      );
    });
  }, [bookings, selectedYear, selectedMonth]);

  // ✨ เดือนที่มีข้อมูลจริง
  const monthly = useMemo(() => {
    const acc: any = {};
    filteredBills.forEach((b) => {
      const d = new Date(b.month);
      const m = d.getMonth() + 1;
      if (!acc[m]) acc[m] = { bill: 0, booking: 0 };
      acc[m].bill += b.total || 0;
    });

    filteredBookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const m = d.getMonth() + 1;
      if (!acc[m]) acc[m] = { bill: 0, booking: 0 };
      acc[m].booking +=
        (b.room?.rent || 0) +
        (b.room?.deposit || 0) +
        (b.room?.bookingFee || 0);
    });

    return Object.entries(acc)
      .sort(([a], [b]) => +a - +b)
      .map(([m, v]: any) => ({
        month: monthNames[+m - 1],
        bill: v.bill,
        booking: v.booking,
        total: v.bill + v.booking,
      }));
  }, [filteredBills, filteredBookings]);

  const chartLabels = monthly.map((m) => m.month);
  const chartBooking = monthly.map((m) => m.booking);
  const chartBill = monthly.map((m) => m.bill);

  const totalRevenue = chartBooking.reduce((a, b) => a + b, 0) +
    chartBill.reduce((a, b) => a + b, 0);

  return (
    <div className="mt-4">
      <h2 className="fw-bold text-center" style={{ color: "#4A0080" }}>
        💜 รายรับรวม
      </h2>

      {/* เลือกปี / เดือน */}
      <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
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
          className="form-select w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          disabled={!selectedYear}
        >
          <option value="">ทุกเดือน</option>
          {monthNames.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* การ์ดรวม */}
      <div
        className="card shadow-sm text-center mx-auto my-4"
        style={{
          maxWidth: "420px",
          borderRadius: "16px",
          background: "#4A0080",
          color: "white",
        }}
      >
        <div className="card-body">
          <h5 className="fw-bold">💰 รายรับทั้งหมด</h5>
          <h3 className="fw-bold">
            {totalRevenue.toLocaleString("th-TH")} บาท
          </h3>
        </div>
      </div>

      {/* กราฟรายเดือน */}
      {selectedYear && monthly.length > 0 && (
        <DashboardRevenueChart
          labels={chartLabels}
          bookingData={chartBooking}
          billData={chartBill}
          title={`รายรับรายเดือน (${selectedYear})`}
        />
      )}

      {/* การ์ดรายเดือน */}
      {selectedYear &&
        monthly.map((m, i) => (
          <div
            key={i}
            className="card shadow-sm p-3 mb-3"
            style={{ borderRadius: "16px" }}
          >
            <h5 className="fw-bold" style={{ color: "#4A0080" }}>
              📅 {m.month} {selectedYear}
            </h5>
            <div className="row text-center fw-bold">
              <div className="col-6">จอง<br />{m.booking.toLocaleString("th-TH")}</div>
              <div className="col-6">บิล<br />{m.bill.toLocaleString("th-TH")}</div>
              <div className="col-12 mt-2" style={{ color: "#4A0080" }}>
                รวมทั้งหมด {m.total.toLocaleString("th-TH")} บาท
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}