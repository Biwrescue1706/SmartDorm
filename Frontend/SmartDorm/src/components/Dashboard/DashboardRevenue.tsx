import { useMemo, useEffect } from "react";
import type { Bill } from "../../types/Bill";
import type { Room } from "../../types/Room";

interface Props {
  bills: Bill[];
  rooms: Room[];
}

export default function DashboardRevenue({ bills, rooms }: Props) {
  // ✅ รวมยอดจาก Bill
  const totalRent = useMemo(
    () => bills.reduce((sum, b) => sum + (b.rent || 0), 0),
    [bills]
  );

  const totalAll = useMemo(
    () => bills.reduce((sum, b) => sum + (b.total || 0), 0),
    [bills]
  );

  // ✅ รวมเฉพาะห้องที่ "มีบิล" (แสดงว่ามีผู้เช่าจริง)
  const totalDeposit = useMemo(() => {
    const roomIdsWithBills = new Set(
      bills
        .filter((b) => b.room && b.room.roomId)
        .map((b) => b.room.roomId)
    );

    return rooms
      .filter(
        (r) =>
          roomIdsWithBills.has(r.roomId) &&
          r.deposit > 0 &&
          r.deposit < 50000 // กันหน่วยผิด
      )
      .reduce((sum, r) => sum + r.deposit, 0);
  }, [rooms, bills]);

  const totalBooking = useMemo(() => {
    const roomIdsWithBills = new Set(
      bills
        .filter((b) => b.room && b.room.roomId)
        .map((b) => b.room.roomId)
    );

    return rooms
      .filter(
        (r) =>
          roomIdsWithBills.has(r.roomId) &&
          r.bookingFee > 0 &&
          r.bookingFee < 10000 // กันหน่วยผิด
      )
      .reduce((sum, r) => sum + r.bookingFee, 0);
  }, [rooms, bills]);

  // ✅ รวมรายเดือนจาก Bill
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    bills.forEach((b) => {
      const d = new Date(b.month);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map.set(key, (map.get(key) || 0) + (b.total || 0));
    });
    return Array.from(map.entries()).map(([month, total]) => ({
      month,
      total,
    }));
  }, [bills]);

  // ✅ debug ห้องที่ค่าประกันผิดหน่วย
  useEffect(() => {
    const wrongDepositRooms = rooms.filter((r) => r.deposit > 50000);
    if (wrongDepositRooms.length > 0) {
      console.warn("⚠️ ห้องที่มีค่าประกันเกิน 50,000:", wrongDepositRooms);
    }
  }, [rooms]);

  return (
    <div className="mt-4">
      <h4 className="fw-bold mb-3 text-center">💰 สรุปรายรับรวม</h4>

      <div className="row g-2 justify-content-center mb-3">
        <div className="col-6 col-md-3">
          <RevenueCard title="ค่าเช่ารวม" amount={totalRent} color="#0077b6" />
        </div>
        <div className="col-6 col-md-3">
          <RevenueCard title="ค่าประกันรวม" amount={totalDeposit} color="#8338ec" />
        </div>
        <div className="col-6 col-md-3">
          <RevenueCard title="ค่าจองรวม" amount={totalBooking} color="#ffb703" />
        </div>
        <div className="col-6 col-md-3">
          <RevenueCard title="รายรับบิลรวม" amount={totalAll} color="#00b4d8" />
        </div>
      </div>

      <div className="table-responsive bg-white shadow-sm rounded p-2">
        <table className="table table-striped align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>เดือน</th>
              <th>รายรับรวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.length > 0 ? (
              monthlyData
                .sort((a, b) => (a.month > b.month ? -1 : 1))
                .map((m) => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>{m.total.toLocaleString("th-TH")}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={2} className="text-muted">
                  ไม่มีข้อมูลรายรับ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
        <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
          {title}
        </div>
        <div className="fw-semibold" style={{ fontSize: "1.3rem" }}>
          {amount.toLocaleString("th-TH")} ฿
        </div>
      </div>
    </div>
  );
}
