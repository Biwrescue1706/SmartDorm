import type { Bill } from "../../types/Bill";

export default function MonthlyBillTable({ bills, monthNamesTH }: any) {
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
    <table className="table table-hover text-center mt-3">
      <thead style={{ background: "#4A0080", color: "#fff" }}>
        <tr>
          <th>#</th>
          <th>เดือน</th>
          <th>ค่าเช่า</th>
          <th>ค่าน้ำ</th>
          <th>ค่าไฟ</th>
          <th>รวมรายรับบิล</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(acc).map(([k, v]: any, i) => {
          const [y, m] = k.split("-");
          return (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{monthNamesTH[+m - 1]} {y}</td>
              <td>{v.rent.toLocaleString("th-TH")}</td>
              <td>{v.water.toLocaleString("th-TH")}</td>
              <td>{v.electric.toLocaleString("th-TH")}</td>
              <td className="fw-bold text-primary">{v.total.toLocaleString("th-TH")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}