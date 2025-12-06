import type { Bill } from "../../types/Bill";

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
    <div className="mt-4 row g-2">
      {entries.map(([k, v]: any, i) => {
        const [y, m] = k.split("-");
        return (
          <div key={i} className={getColClass()}>
            <div className="card shadow-sm" style={{ borderRadius: 10 }}>
              <div className="card-body p-2">

                {/* TITLE */}
                <h5 className="fw-bold text-center text-primary">
                  รายการรับเงินของ 🏫SmartDorm🎉
                </h5>

                {/* DATE */}
                <h6 className="fw-bold text-primary text-center mb-3">
                  📅 {monthNamesTH[+m - 1]} {y}
                </h6>

                {/* RENT */}
                <div className="mb-1">
                  <h6 className="text-start fw-bold">ค่าเช่าห้อง</h6>
                  <h6 className="fw-bold">{v.rent.toLocaleString("th-TH")}</h6>
                </div>

                {/* WATER */}
                <div className="mb-1">
                  <h6 className="text-start fw-bold">ค่าน้ำ</h6>
                  <h6 className="fw-bold">{v.water.toLocaleString("th-TH")}</h6>
                </div>

                {/* ELECTRIC */}
                <div className="mb-1">
                  <h6 className="text-start fw-bold">ค่าไฟ</h6>
                  <h6 className="fw-bold">{v.electric.toLocaleString("th-TH")}</h6>
                </div>

                {/* TOTAL */}
                <div className="mt-2">
                  <h6 className="fw-bold text-success text-start">
                    รวมรายรับบิล
                  </h6>
                  <h6 className="fw-bold text-success">
                    {v.total.toLocaleString("th-TH")}
                  </h6>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}