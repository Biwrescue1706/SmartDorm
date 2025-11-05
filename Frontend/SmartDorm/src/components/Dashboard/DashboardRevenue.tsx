import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>(""); // พ.ศ.
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // 🗓️ รายชื่อเดือนแบบไทย
  const monthNamesTH = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  // 📅 ปี พ.ศ. เริ่ม 2568 ถึง 2666
  const availableYears = Array.from({ length: 8 }, (_, i) =>
    (2568 + i).toString()
  );

  const selectedMonthName =
    selectedMonth && monthNamesTH[parseInt(selectedMonth) - 1];
  const selectedYearTH = selectedYear || "";

  const displayTitle =
    selectedYear && selectedMonth
      ? `${selectedMonthName} ${selectedYearTH}`
      : selectedYear
      ? `ปี ${selectedYearTH}`
      : "ทั้งหมด";

  // 🔍 กรองบิลตามปี / เดือน (ใช้ UTC ป้องกัน timezone shift)
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const yearBE = d.getUTCFullYear() + 543;
      const monthStr = String(d.getUTCMonth() + 1).padStart(2, "0");

      if (selectedYear && selectedMonth) {
        return yearBE.toString() === selectedYear && monthStr === selectedMonth;
      } else if (selectedYear) {
        return yearBE.toString() === selectedYear;
      } else {
        return true;
      }
    });
  }, [bills, selectedYear, selectedMonth]);

  // 🔍 กรอง booking ตามปี / เดือน (อิงจาก createdAt)
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt) return false;
      const d = new Date(b.createdAt);
      const yearBE = d.getUTCFullYear() + 543;
      const monthStr = String(d.getUTCMonth() + 1).padStart(2, "0");

      if (selectedYear && selectedMonth) {
        return yearBE.toString() === selectedYear && monthStr === selectedMonth;
      } else if (selectedYear) {
        return yearBE.toString() === selectedYear;
      } else {
        return true;
      }
    });
  }, [bookings, selectedYear, selectedMonth]);

  const hasMonthData =
    selectedYear && selectedMonth ? filteredBills.length > 0 : true;

  // 💰 รวมค่าเช่า
  const totalRent = useMemo(() => {
    if (!hasMonthData) return 0;
    return filteredBookings
      .filter((b) => b.approveStatus === 1 && b.room)
      .reduce((sum, b) => sum + (b.room.rent || 0), 0);
  }, [filteredBookings, hasMonthData]);

  // 💵 รวมค่าประกัน
  const totalDeposit = useMemo(() => {
    if (!hasMonthData) return 0;
    return filteredBookings
      .filter((b) => b.approveStatus === 1 && b.room)
      .reduce((sum, b) => sum + (b.room.deposit || 0), 0);
  }, [filteredBookings, hasMonthData]);

  // 💳 รวมค่าจอง
  const totalBooking = useMemo(() => {
    if (!hasMonthData) return 0;
    return filteredBookings
      .filter((b) => b.approveStatus === 1 && b.room)
      .reduce((sum, b) => sum + (b.room.bookingFee || 0), 0);
  }, [filteredBookings, hasMonthData]);

  // 💰 รวมรายรับจากบิล (เฉพาะ Bill.status === 1)
  const totalAll = useMemo(() => {
    if (!hasMonthData) return 0;
    return filteredBills
      .filter((b) => b.status === 1)
      .reduce((sum, b) => sum + (b.total || 0), 0);
  }, [filteredBills, hasMonthData]);

  // 📊 รวมรายเดือน (เฉพาะบิลที่ status === 1)
  const monthlyData = useMemo(() => {
    const acc = new Map<string, number>();

    filteredBills
      .filter((bill) => bill.status === 1)
      .forEach((bill) => {
        const d = new Date(bill.month);
        const yearBE = d.getUTCFullYear() + 543;
        const monthNum = d.getUTCMonth() + 1;
        const key = `${yearBE}-${String(monthNum).padStart(2, "0")}`;
        acc.set(key, (acc.get(key) || 0) + (bill.total || 0));
      });

    return Array.from(acc.entries()).map(([key, total]) => {
      const [yearBE, mm] = key.split("-");
      const monthName = monthNamesTH[parseInt(mm) - 1];
      return { month: `${monthName} ${yearBE}`, total, sortKey: key };
    });
  }, [filteredBills]);

  return (
    <div className="mt-4">
      <h4 className="fw-bold mb-3 text-center">
        💰 สรุปรายรับรวม ( {displayTitle} )
      </h4>

      {/* ฟิลเตอร์เลือก ปี / เดือน */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
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
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="form-select w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          disabled={!selectedYear}
        >
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* การ์ดยอดรวม */}
      <div className="row g-2 justify-content-center mb-3">
        <div className="col-5 col-md-2">
          <RevenueCard title="ค่าเช่า" amount={totalRent} color="#0077b6" />
        </div>
        <div className="col-5 col-md-2">
          <RevenueCard
            title="ค่าประกัน"
            amount={totalDeposit}
            color="#8338ec"
          />
        </div>
        <div className="col-5 col-md-2">
          <RevenueCard title="ค่าจอง" amount={totalBooking} color="#ffb703" />
        </div>
        <div className="col-5 col-md-2">
          <RevenueCard title="รายรับบิล" amount={totalAll} color="#00b4d8" />
        </div>
      </div>

      {/* ตารางรายเดือน */}
      <div className="responsive-table">
        <table
          className="table table-sm table-striped align-middle text-center"
          style={{ tableLayout: "fixed", width: "20%" }}
        >
          <thead className="table-dark">
            <tr>
              <th style={{ width: "2%" }}>เดือน</th>
              <th style={{ width: "2%" }}>รายรับรวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.length > 0 ? (
              monthlyData
                .sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1))
                .map((m) => (
                  <tr key={m.sortKey}>
                    <td>{m.month}</td>
                    <td>{m.total.toLocaleString("th-TH")}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={2} className="text-muted">
                  ไม่มีข้อมูลรายรับของ{" "}
                  {selectedYear && selectedMonth
                    ? `${selectedMonthName} ${selectedYearTH}`
                    : selectedYear
                    ? `ปี ${selectedYearTH}`
                    : "ช่วงที่เลือก"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================== Sub Component ==================
function RevenueCard({
  title,
  amount,
  color,
}: {
  title: string;
  amount: number;
  color: string;
}) {
  return (
    <div
      className="card text-center border-0 shadow-sm"
      style={{
        background: color,
        color: "white",
        borderRadius: "10px",
        height: "90px",
      }}
    >
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div className="fw-bold" style={{ fontSize: "1rem" }}>
          {title}
        </div>
        <div className="fw-semibold" style={{ fontSize: "1rem" }}>
          {amount.toLocaleString("th-TH")}
        </div>
      </div>
    </div>
  );
}
