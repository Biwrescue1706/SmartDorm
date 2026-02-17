// src/components/Dashboard/MonthlyBillCards.tsx
import type { Bill } from "../../types/All";

/*
Responsive:
<600px       = 1 card / row
600-1399px   = 2 cards / row
>=1400px     = 3 cards / row
*/

export default function MonthlyBillCards({ bills, monthNamesTH }: any) {
  const screen = window.innerWidth;
  const acc: any = {};

  bills.forEach((b: Bill) => {
    const d = new Date(b.month);
    const key = `${d.getUTCFullYear() + 543}-${String(
      d.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[key]) acc[key] = { rent: 0, water: 0, electric: 0, total: 0 };

    acc[key].rent += Number(b.rent ?? 0);
    acc[key].water += Number(b.waterCost ?? 0);
    acc[key].electric += Number(b.electricCost ?? 0);
    acc[key].total += Number(b.total ?? 0);
  });

  const entries = Object.entries(acc);

  const getColClass = () => {
    if (screen < 600) return "col-12";
    if (screen < 1400) return "col-6";
    return "col-4"; // Desktop 3 cards / row
  };

  return (
    <div className="mt-4 row g-3">
      {entries.map(([k, v]: any, i) => {
        const [y, m] = k.split("-");

        return (
          <div key={i} className={getColClass()}>
            <div
              className="card shadow-lg border-0 h-100"
              style={{
                borderRadius: "18px",
                background: "linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)",
                color: "#fff",
              }}
            >
              {/* HEADER */}
              <div
                className="text-center fw-bold py-2"
                style={{
                  backgroundColor: "#FFCC00",
                  color: "#4A148C",
                  borderTopLeftRadius: "18px",
                  borderTopRightRadius: "18px",
                  fontSize: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                🏦 รายการรายรับ SmartDorm
              </div>

              {/* BODY */}
              <div className="card-body px-3 pt-3">
                {/* DATE */}
                <h6 className="fw-bold text-warning text-center mb-3">
                  📅 {monthNamesTH[+m - 1]} {y}
                </h6>

                {/* RENT */}
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">ค่าเช่าห้อง</span>
                  <span className="fw-bold">
                    {v.rent.toLocaleString("th-TH")}
                  </span>
                </div>

                {/* WATER */}
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">ค่าน้ำ</span>
                  <span className="fw-bold">
                    {v.water.toLocaleString("th-TH")}
                  </span>
                </div>

                {/* ELECTRIC */}
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">ค่าไฟ</span>
                  <span className="fw-bold">
                    {v.electric.toLocaleString("th-TH")}
                  </span>
                </div>

                {/* TOTAL */}
                <div
                  className="mt-3 text-center py-2 fw-bold"
                  style={{
                    backgroundColor: "#FFCC00",
                    color: "#4A148C",
                    borderRadius: "10px",
                    fontSize: "1.05rem",
                    boxShadow: "0 1px 6px rgba(255,204,0,0.45)",
                  }}
                >
                  รวมรายรับบิล {v.total.toLocaleString("th-TH")}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
