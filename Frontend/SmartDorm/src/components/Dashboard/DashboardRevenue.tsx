// src/components/Dashboard/DashboardRevenue.tsx
import { useMemo, useState, useEffect } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1400);

  useEffect(() => {
    const resizeHandler = () => setIsWideScreen(window.innerWidth >= 1400);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const monthNamesTH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const availableYears = Array.from({ length: 8 }, (_, i) =>
    (2568 + i).toString()
  );

  // Filter Bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const y = d.getFullYear() + 543;
      const m = String(d.getMonth() + 1).padStart(2, "0");
      if (selectedYear && selectedMonth)
        return y.toString() === selectedYear && m === selectedMonth;
      else if (selectedYear)
        return y.toString() === selectedYear;
      return true;
    });
  }, [bills, selectedYear, selectedMonth]);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt) return false;
      const d = new Date(b.createdAt);
      const y = d.getFullYear() + 543;
      const m = String(d.getMonth() + 1).padStart(2, "0");
      if (selectedYear && selectedMonth)
        return y.toString() === selectedYear && m === selectedMonth;
      else if (selectedYear)
        return y.toString() === selectedYear;
      return true;
    });
  }, [bookings, selectedYear, selectedMonth]);

  // Booking revenue
  const totalRentBooking = filteredBookings.reduce((s, b) => s + (b.room?.rent || 0), 0);
  const totalDepositBooking = filteredBookings.reduce((s, b) => s + (b.room?.deposit || 0), 0);
  const totalBookingFee = filteredBookings.reduce((s, b) => s + (b.room?.bookingFee || 0), 0);

  // Bill revenue
  const paidBills = filteredBills.filter((b) => b.status === 1);
  const totalRentBill = paidBills.reduce((s, b) => s + (b.rent || 0), 0);
  const totalWaterBill = paidBills.reduce((s, b) => s + (b.waterCost || 0), 0);
  const totalElectricBill = paidBills.reduce((s, b) => s + (b.electricCost || 0), 0);
  const totalAllBill = paidBills.reduce((s, b) => s + (b.total || 0), 0);

  // Total revenue
  const totalAllRevenue =
    totalRentBooking + totalDepositBooking + totalBookingFee + totalAllBill;

  // Monthly Report
  const monthlyData = useMemo(() => {
    const acc = new Map<string, { rent: number; water: number; electric: number; total: number }>();
    paidBills.forEach((b) => {
      const d = new Date(b.month);
      const y = d.getFullYear() + 543;
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      const current = acc.get(key) || { rent: 0, water: 0, electric: 0, total: 0 };
      current.rent += b.rent || 0;
      current.water += b.waterCost || 0;
      current.electric += b.electricCost || 0;
      current.total += b.total || 0;
      acc.set(key, current);
    });
    return Array.from(acc.entries()).map(([key, v]) => {
      const [y, m] = key.split("-");
      return {
        month: `${monthNamesTH[+m - 1]} ${y}`,
        sortKey: key,
        ...v,
      };
    });
  }, [paidBills]);

  return (
    <div className="mt-4">
      {/* Title */}
      <h3 className="fw-bold text-center" style={{ color: "#4A0080" }}>
        💜 รายรับรวมทั้งหมด
      </h3>

      {/* Filter */}
      <div className="d-flex justify-content-center gap-2 mb-3">
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
          disabled={!selectedYear}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Revenue Card */}
      <RevenueCard
        title="💰 รายรับทั้งหมด (Booking + Bill)"
        amount={totalAllRevenue}
        bg="#4A0080"
        fg="#F7D53D"
        height="110px"
      />

      {/* Monthly Section */}
      <h4 className="fw-bold text-center mt-4" style={{ color: "#4A0080" }}>
        📅 รายรับรายเดือนจากบิล
      </h4>

      {isWideScreen ? (
        <div style={{ overflowX: "auto" }}>
          <table className="table table-bordered text-center align-middle mt-3">
            <thead style={{ background: "#4A0080", color: "#F7D53D" }}>
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
              {monthlyData.length ? (
                monthlyData
                  .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
                  .map((m, i) => (
                    <tr key={m.sortKey}>
                      <td>{i + 1}</td>
                      <td>{m.month}</td>
                      <td>{m.rent.toLocaleString("th-TH")}</td>
                      <td>{m.water.toLocaleString("th-TH")}</td>
                      <td>{m.electric.toLocaleString("th-TH")}</td>
                      <td className="fw-bold">
                        {m.total.toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6}>ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mt-3">
          {monthlyData.length ? (
            monthlyData.map((m) => (
              <RevenueCard
                key={m.sortKey}
                title={`📆 ${m.month}`}
                amount={m.total}
                bg="#4A0080"
                fg="#F7D53D"
              />
            ))
          ) : (
            <p className="text-muted text-center">ไม่มีข้อมูล</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ============ Sub Component ============ */
function RevenueCard({
  title,
  amount,
  bg = "#4A0080",
  fg = "white",
  height = "95px",
}: {
  title: string;
  amount: number;
  bg?: string;
  fg?: string;
  height?: string;
}) {
  return (
    <div
      className="card border-0 shadow-sm"
      style={{
        background: bg,
        color: fg,
        borderRadius: "18px",
        height,
      }}
    >
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div className="fw-bold" style={{ fontSize: "1.2rem" }}>{title}</div>
        <div className="fw-bold" style={{ fontSize: "1.45rem" }}>
          {amount.toLocaleString("th-TH")}
        </div>
      </div>
    </div>
  );
}