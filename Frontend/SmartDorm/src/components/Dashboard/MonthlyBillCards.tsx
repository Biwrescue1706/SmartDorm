import type { Bill } from "../../types/Bill";

export default function MonthlyBillCards({ bills, monthNamesTH }: any) {
  const acc: any = {};

  bills.forEach((b: Bill) => {
    const d = new Date(b.month);
    const key = `${d.getUTCFullYear() + 543}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    if (!acc[key]) acc[key] = { rent: 0, water: 0, electric: 0, total: 0 };

    acc[key].rent += Number(b.rent ?? 0);
    acc[key].water += Number(b.waterCost ?? 0);
    acc[key].electric += Number(b.electricCost ?? 0);
    acc[key].total += Number(b.total ?? 0);
  });

  return (
    <div className="mt-4">
      {Object.entries(acc).map(([k, v]: any, i) => {
        const [y, m] = k.split("-");
        return (
          <div key={i} className="card shadow-sm mb-2" style={{ borderRadius: 10 }}>
            <div className="card-body p-2">
              <h6 className="fw-bold text-primary">📅 {monthNamesTH[+m - 1]} {y}</h6>
              <p className="mb-1">- ค่าเช่าห้อง: {v.rent.toLocaleString("th-TH")}</p>
              <p className="mb-1">- ค่าน้ำ: {v.water.toLocaleString("th-TH")}</p>
              <p className="mb-1">- ค่าไฟ: {v.electric.toLocaleString("th-TH")}</p>
              <b className="text-success">- รวมรายรับบิล: {v.total.toLocaleString("th-TH")}</b>
            </div>
          </div>
        );
      })}
    </div>
  );
}