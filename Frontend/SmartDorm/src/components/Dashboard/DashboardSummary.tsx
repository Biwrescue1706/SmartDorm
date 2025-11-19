// src/components/Dashboard/DashboardSummaryRevenue.tsx
import { useState, useEffect, useMemo } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";

interface SummaryProps {
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  pendingBookings: number;
  pendingCheckouts: number;
}

interface RevenueProps {
  bills: Bill[];
  bookings: Booking[];
}

export default function DashboardSummaryRevenue({
  totalRooms,
  availableRooms,
  bookedRooms,
  pendingBookings,
  pendingCheckouts,
  bills,
  bookings,
}: SummaryProps & RevenueProps) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isWideScreen, setIsWideScreen] = useState(
    window.innerWidth >= 1400
  );

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

  const availableYears = Array.from({ length: 5 }, (_, i) =>
    (2567 + i).toString()
  );

  // 📌 DashboardCard (ฝังในไฟล์นี้เลย ไม่ import)
  function DashboardCard({
    title,
    count,
    color,
  }: {
    title: string;
    count: number;
    color: string;
  }) {
    return (
      <div
        className="card text-center border-0 shadow-sm"
        style={{
          background: color,
          color: "white",
          borderRadius: "20px",
          height: "85px",
        }}
      >
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
          <div className="fw-semibold" style={{ fontSize: "1.2rem" }}>
            {title}
          </div>
          <div className="fw-bold" style={{ fontSize: "1.25rem" }}>
            {count}
          </div>
        </div>
      </div>
    );
  }

  // 🧮 ฟิลเตอร์บิล
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      const yearBE = d.getUTCFullYear() + 543;
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");

      if (selectedYear && selectedMonth)
        return yearBE.toString() === selectedYear && mm === selectedMonth;
      else if (selectedYear) return yearBE.toString() === selectedYear;

      return true;
    });
  }, [bills, selectedYear, selectedMonth]);

  // 🏨 ฟิลเตอร์ booking
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.createdAt) return false;
      const d = new Date(b.createdAt);
      const yearBE = d.getUTCFullYear() + 543;
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");

      if (selectedYear && selectedMonth)
        return yearBE.toString() === selectedYear && mm === selectedMonth;
      else if (selectedYear) return yearBE.toString() === selectedYear;

      return true;
    });
  }, [bookings, selectedYear, selectedMonth]);

  // 💰 สรุปรายรับจาก Booking
  const totalRentBooking = filteredBookings.reduce(
    (sum, b) => (b.approveStatus === 1 && b.room ? sum + (b.room.rent || 0) : sum),
    0
  );
  const totalDepositBooking = filteredBookings.reduce(
    (sum, b) => (b.approveStatus === 1 && b.room ? sum + (b.room.deposit || 0) : sum),
    0
  );
  const totalBookingFee = filteredBookings.reduce(
    (sum, b) => (b.approveStatus === 1 && b.room ? sum + (b.room.bookingFee || 0) : sum),
    0
  );

  // 💵 สรุปจาก Bill (ที่ชำระแล้ว)
  const paidBills = filteredBills.filter((b) => b.status === 1);

  const totalRentBill = paidBills.reduce((s, b) => s + (b.rent || 0), 0);
  const totalWaterBill = paidBills.reduce((s, b) => s + (b.waterCost || 0), 0);
  const totalElectricBill = paidBills.reduce(
    (s, b) => s + (b.electricCost || 0),
    0
  );
  const totalAllBill = paidBills.reduce((s, b) => s + (b.total || 0), 0);

  // 💸 รวมรายรับทั้งหมด
  const totalAllRevenue =
    totalRentBooking +
    totalDepositBooking +
    totalBookingFee +
    totalAllBill;

  // ========================
  //  📊 MONTHLY SUMMARY
  // ========================
  const monthlyMap = new Map();
  paidBills.forEach((b) => {
    const d = new Date(b.month);
    const yearBE = d.getUTCFullYear() + 543;
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");

    const key = `${yearBE}-${mm}`;
    const current = monthlyMap.get(key) || {
      rent: 0,
      water: 0,
      electric: 0,
      total: 0,
    };

    current.rent += b.rent || 0;
    current.water += b.waterCost || 0;
    current.electric += b.electricCost || 0;
    current.total += b.total || 0;

    monthlyMap.set(key, current);
  });

  const monthlyData = Array.from(monthlyMap.entries()).map(([k, v]) => {
    const [yy, mm] = k.split("-");
    return {
      month: `${monthNamesTH[parseInt(mm) - 1]} ${yy}`,
      sortKey: k,
      ...v,
    };
  });

  // ตรวจจอ
  useEffect(() => {
    const onResize = () => setIsWideScreen(window.innerWidth >= 1400);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div>
      {/* =========================== */}
      {/*     SUMMARY CARDS           */}
      {/* =========================== */}

      <div className="container my-3">
        <div className="row g-2 justify-content-center">
          <div className="col-4 col-md-2">
            <DashboardCard
              title="ห้องทั้งหมด"
              count={totalRooms}
              color="linear-gradient(135deg,#00b4d8,#0077b6)"
            />
          </div>

          <div className="col-4 col-md-2">
            <DashboardCard
              title="ห้องว่าง"
              count={availableRooms}
              color="linear-gradient(135deg,#38b000,#008000)"
            />
          </div>

          <div className="col-4 col-md-2">
            <DashboardCard
              title="ห้องเต็ม 1"
              count={bookedRooms}
              color="linear-gradient(135deg,#ef233c,#d90429)"
            />
          </div>

          <div className="col-4 col-md-2">
            <DashboardCard
              title="คำขอจอง"
              count={pendingBookings}
              color="linear-gradient(135deg,#ffb703,#fb8500)"
            />
          </div>

          <div className="col-4 col-md-2">
            <DashboardCard
              title="คำขอคืนห้อง"
              count={pendingCheckouts}
              color="linear-gradient(135deg,#8338ec,#3a0ca3)"
            />
          </div>
        </div>
      </div>

      {/* =========================== */}
      {/*     FILTER REVENUE          */}
      {/* =========================== */}

      <h3 className="fw-bold text-center mb-3">💰 รายรับรวม</h3>

      <div className="d-flex justify-content-center gap-2 mb-4">
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
          disabled={!selectedYear}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">ทุกเดือน</option>
          {monthNamesTH.map((m, idx) => (
            <option key={idx} value={String(idx + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* =========================== */}
      {/*     BOOKING REVENUE CARDS   */}
      {/* =========================== */}

      <h3 className="fw-bold text-center mb-3">📦 รายรับจากการจอง</h3>
      <div className="row g-2 justify-content-center mb-4">
        {[
          { title: "ค่าเช่า", amount: totalRentBooking, color: "#0077b6" },
          { title: "ค่ามัดจำ", amount: totalDepositBooking, color: "#8338ec" },
          { title: "ค่าจอง", amount: totalBookingFee, color: "#ffb703" },
          {
            title: "รวม",
            amount:
              totalRentBooking + totalDepositBooking + totalBookingFee,
            color: "#00916e",
          },
        ].map((item, i) => (
          <div key={i} className="col-4 col-md-2">
            <div
              className="card text-center border-0 shadow-sm"
              style={{
                background: item.color,
                color: "white",
                borderRadius: "12px",
                height: "90px",
              }}
            >
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <div className="fw-bold">{item.title}</div>
                <div className="fw-semibold">
                  {item.amount.toLocaleString("th-TH")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================== */}
      {/*       BILL REVENUE CARDS    */}
      {/* =========================== */}

      <h3 className="fw-bold text-center mb-3">📄 รายรับจากบิล (ชำระแล้ว)</h3>

      <div className="row g-2 justify-content-center mb-4">
        {[
          { title: "ค่าเช่า", amount: totalRentBill, color: "#0077b6" },
          { title: "ค่าน้ำ", amount: totalWaterBill, color: "#48cae4" },
          { title: "ค่าไฟ", amount: totalElectricBill, color: "#ffb703" },
          { title: "รวม", amount: totalAllBill, color: "#00b4d8" },
        ].map((item, i) => (
          <div key={i} className="col-4 col-md-2">
            <div
              className="card text-center border-0 shadow-sm"
              style={{
                background: item.color,
                color: "white",
                borderRadius: "12px",
                height: "90px",
              }}
            >
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <div className="fw-bold">{item.title}</div>
                <div className="fw-semibold">
                  {item.amount.toLocaleString("th-TH")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================== */}
      {/*     TOTAL ALL REVENUE       */}
      {/* =========================== */}

      <h3 className="fw-bold text-center mb-3">💵 รวมรายรับทั้งหมด</h3>

      <div className="row justify-content-center mb-4">
        <div className="col-4 col-md-2">
          <div
            className="card text-center border-0 shadow-sm"
            style={{
              background: "#28a745",
              color: "white",
              borderRadius: "12px",
              height: "90px",
            }}
          >
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <div className="fw-bold">รวมทั้งหมด</div>
              <div className="fw-semibold">
                {totalAllRevenue.toLocaleString("th-TH")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================== */}
      {/*     MONTHLY SUMMARY         */}
      {/* =========================== */}

      <h3 className="fw-bold text-center mb-3">📅 รายเดือนจากบิล</h3>

      {isWideScreen ? (
        <div className="responsive-table" style={{ overflowX: "auto" }}>
          <table className="table table-sm table-striped text-center">
            <thead className="table-dark">
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
              {monthlyData.length > 0 ? (
                monthlyData
                  .sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1))
                  .map((m, i) => (
                    <tr key={m.sortKey}>
                      <td>{i + 1}</td>
                      <td>{m.month}</td>
                      <td>{m.rent.toLocaleString("th-TH")}</td>
                      <td>{m.water.toLocaleString("th-TH")}</td>
                      <td>{m.electric.toLocaleString("th-TH")}</td>
                      <td>{m.total.toLocaleString("th-TH")}</td>
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
        <div className="d-flex flex-column gap-3">
          {monthlyData.length > 0 ? (
            monthlyData
              .sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1))
              .map((m) => (
                <div key={m.sortKey} className="card shadow-sm p-3">
                  <h5 className="fw-bold text-center">📆 {m.month}</h5>
                  <div className="row text-center mt-3">
                    <div className="col-6">
                      <p className="fw-bold text-black">ค่าเช่า</p>
                      <p className="fw-semibold">
                        {m.rent.toLocaleString("th-TH")}
                      </p>
                    </div>
                    <div className="col-6">
                      <p className="fw-bold text-black">ค่าน้ำ</p>
                      <p className="fw-semibold">
                        {m.water.toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>
                  <div className="row text-center mt-2">
                    <div className="col-6">
                      <p className="fw-bold text-black">ค่าไฟ</p>
                      <p className="fw-semibold">
                        {m.electric.toLocaleString("th-TH")}
                      </p>
                    </div>
                    <div className="col-6">
                      <p className="fw-bold text-black">รวม</p>
                      <p className="fw-semibold">
                        {m.total.toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-muted">ไม่มีข้อมูล</p>
          )}
        </div>
      )}
    </div>
  );
}
