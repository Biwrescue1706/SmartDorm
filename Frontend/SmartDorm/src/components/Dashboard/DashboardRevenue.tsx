import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

interface Props {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardRevenue({ bills, bookings }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // 🗓️ รายชื่อเดือนภาษาไทย
  const monthNamesTH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  // 📅 ปี พ.ศ. 2568–2666
  const availableYears = Array.from({ length: 8 }, (_, i) => (2568 + i).toString());

  const selectedMonthName = selectedMonth && monthNamesTH[parseInt(selectedMonth) - 1];
  const selectedYearTH = selectedYear || "";

  const displayTitle =
    selectedYear && selectedMonth
      ? `${selectedMonthName} ${selectedYearTH}`
      : selectedYear
      ? `ปี ${selectedYearTH}`
      : "ทั้งหมด";

  // 🧾 กรองบิลตามเดือน/ปี (UTC ป้องกัน timezone)
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

  // 💰 รวมยอดจาก booking (เช่า / มัดจำ / ค่าจอง)
  const totalRent = useMemo(
    () => filteredBills.filter((b) => b.status === 1).reduce((s, b) => s + (b.rent || 0), 0),
    [filteredBills]
  );

  const totalWater = useMemo(
    () => filteredBills.filter((b) => b.status === 1).reduce((s, b) => s + (b.waterCost || 0), 0),
    [filteredBills]
  );

  const totalElectric = useMemo(
    () => filteredBills.filter((b) => b.status === 1).reduce((s, b) => s + (b.electricCost || 0), 0),
    [filteredBills]
  );

  const totalAll = useMemo(
    () => filteredBills.filter((b) => b.status === 1).reduce((s, b) => s + (b.total || 0), 0),
    [filteredBills]
  );

  // 📊 รวมรายเดือน (เฉพาะ Bill ที่ชำระแล้ว)
  const monthlyData = useMemo(() => {
    const map = new Map<string, { rent: number; water: number; electric: number; total: number }>();

    filteredBills
      .filter((b) => b.status === 1)
      .forEach((b) => {
        const d = new Date(b.month);
        const yearBE = d.getUTCFullYear() + 543;
        const monthNum = d.getUTCMonth() + 1;
        const key = `${yearBE}-${String(monthNum).padStart(2, "0")}`;
        const current = map.get(key) || { rent: 0, water: 0, electric: 0, total: 0 };

        current.rent += b.rent || 0;
        current.water += b.waterCost || 0;
        current.electric += b.electricCost || 0;
        current.total += b.total || 0;

        map.set(key, current);
      });

    return Array.from(map.entries()).map(([key, val]) => {
      const [yearBE, mm] = key.split("-");
      const monthName = monthNamesTH[parseInt(mm) - 1];
      return { month: `${monthName} ${yearBE}`, ...val, sortKey: key };
    });
  }, [filteredBills]);

  return (
    <div className="mt-4">
      <h1 className="fw-bold mb-2 text-center">💰 สรุปรายรับรวม</h1>
      <h4 className="fw-bold mb-4 text-center">( {displayTitle} )</h4>

      {/* ฟิลเตอร์ */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
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
          {monthNamesTH.map((m, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* การ์ดยอดรวม */}
      <div className="row g-3 justify-content-center mb-4">
        <div className="col-6 col-md-3 col-lg-2">
          <RevenueCard title="ค่าเช่าห้อง" amount={totalRent} color="#0077b6" />
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <RevenueCard title="ค่าน้ำ" amount={totalWater} color="#48cae4" />
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <RevenueCard title="ค่าไฟ" amount={totalElectric} color="#ffb703" />
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <RevenueCard title="รายรับรวม" amount={totalAll} color="#00b4d8" />
        </div>
      </div>

      {/* ตารางรายเดือน */}
      <div className="table-responsive">
        <table className="table table-striped align-middle text-center shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>เดือน</th>
              <th>ค่าเช่าห้อง</th>
              <th>ค่าน้ำ</th>
              <th>ค่าไฟ</th>
              <th>รายรับรวม</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.length > 0 ? (
              monthlyData
                .sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1))
                .map((m) => (
                  <tr key={m.sortKey}>
                    <td>{m.month}</td>
                    <td>{m.rent.toLocaleString("th-TH")}</td>
                    <td>{m.water.toLocaleString("th-TH")}</td>
                    <td>{m.electric.toLocaleString("th-TH")}</td>
                    <td className="fw-bold text-success">
                      {m.total.toLocaleString("th-TH")}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} className="text-muted">
                  ไม่มีข้อมูลรายรับในช่วงที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ Sub Component: การ์ดยอดรวม
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