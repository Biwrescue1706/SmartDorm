// src/components/Dashboard/DashboardRevenue.tsx
import { useMemo, useState } from "react";
import type { Bill } from "../../types/Bill";
import type { Booking } from "../../types/Booking";
import DashboardRevenueChart from "./DashboardRevenueChart";
import MonthlyBillCards from "./MonthlyBillCards";
import MonthlyBillTable from "./MonthlyBillTable";

/* ---------------- BASIC UI COMPONENTS ---------------- */
function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="mt-4">
      <h4 className="fw-bold" style={{ color: "#4A0080" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="card text-center border-0 shadow-sm"
      style={{
        background: color,
        color: "#F7D53D",
        borderRadius: "18px",
        height: "95px", // fixed size
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h4 className="fw-bold mt-1">{title}</h4>
        <h4 className="fw-bold mt-1">{value.toLocaleString("th-TH")}</h4>
      </div>
    </div>
  );
}

function CardsGrid({ children }: { children: any }) {
  const arr = Array.isArray(children) ? children : [children];
  const w = window.innerWidth;
  const col = w < 600 ? "col-12" : w < 1400 ? "col-4" : "col-3";

  return (
    <div className="row g-2 mt-1">
      {arr.map((c, i) => (
        <div key={i} className={col}>
          {c}
        </div>
      ))}
    </div>
  );
}

/* ---------------- CHART GRID ---------------- */
function ChartsGrid({
  labels,
  datasets,
  suffix,
}: {
  labels: string[];
  datasets: { label: string; data: number[]; borderColor: string }[];
  suffix: string;
}) {
  const w = window.innerWidth;
  const col = w < 600 ? "col-12" : w < 1400 ? "col-6" : "col-3";

  return (
    <div className="row g-3 mt-2">
      {datasets.map((d, i) => (
        <div key={i} className={col}>
          <DashboardRevenueChart
            labels={labels}
            datasets={[d]}
            title={`${d.label} (${suffix})`}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */
export default function DashboardRevenue({
  bills,
  bookings,
}: {
  bills: Bill[];
  bookings: Booking[];
}) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const isDesktop = window.innerWidth >= 1400;

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

  /* ---------------- YEARS ---------------- */
  const YEARS = useMemo(() => {
    const yBills = bills.map((b) => new Date(b.month).getUTCFullYear() + 543);
    const yBookings = bookings
      .filter((b) => b.createdAt && b.approveStatus === 1)
      .map((b) => new Date(b.createdAt!).getUTCFullYear() + 543);
    return Array.from(new Set([...yBills, ...yBookings])).sort((a, b) => a - b);
  }, [bills, bookings]);

  /* ---------------- FILTERING ---------------- */
  const FBills = useMemo(
    () =>
      bills.filter((b) => {
        const y = new Date(b.month).getUTCFullYear() + 543;
        const m = String(new Date(b.month).getUTCMonth() + 1).padStart(2, "0");
        return (
          b.status === 1 &&
          (!selectedYear || y.toString() === selectedYear) &&
          (!selectedMonth || m === selectedMonth)
        );
      }),
    [bills, selectedYear, selectedMonth]
  );

  const FBookings = useMemo(
    () =>
      bookings.filter((b) => {
        if (!b.createdAt || b.approveStatus !== 1 || !b.room) return false;
        const y = new Date(b.createdAt).getUTCFullYear() + 543;
        const m = String(new Date(b.createdAt).getUTCMonth() + 1).padStart(
          2,
          "0"
        );
        return (
          (!selectedYear || y.toString() === selectedYear) &&
          (!selectedMonth || m === selectedMonth)
        );
      }),
    [bookings, selectedYear, selectedMonth]
  );

  /* ---------------- GROUP KEYS ---------------- */
  let groupKeys: string[] = [];

  if (!selectedYear) {
    groupKeys = YEARS.map(String);
  } else {
    const mb = FBills.map((b) =>
      String(new Date(b.month).getUTCMonth() + 1).padStart(2, "0")
    );
    const mk = FBookings.map((b) =>
      String(new Date(b.createdAt!).getUTCMonth() + 1).padStart(2, "0")
    );
    groupKeys = Array.from(new Set([...mb, ...mk])).sort();
    if (selectedMonth) groupKeys = [selectedMonth];
  }

  /* ---------------- LABELS ---------------- */
  const labels = !selectedYear
    ? groupKeys
    : groupKeys.map((m) => monthNamesTH[Number(m) - 1]);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  /* ---------------- BOOKINGS ---------------- */
  const bookingVals = (key: string, field: "rent" | "deposit" | "fee") =>
    !selectedYear
      ? sum(
          FBookings.filter(
            (b) => String(new Date(b.createdAt!).getUTCFullYear() + 543) === key
          ).map((b) =>
            Number(b.room?.[field === "fee" ? "bookingFee" : field] ?? 0)
          )
        )
      : sum(
          FBookings.filter(
            (b) =>
              String(new Date(b.createdAt!).getUTCMonth() + 1).padStart(
                2,
                "0"
              ) === key
          ).map((b) =>
            Number(b.room?.[field === "fee" ? "bookingFee" : field] ?? 0)
          )
        );

  const rentBooking = groupKeys.map((k) => bookingVals(k, "rent"));
  const depositBooking = groupKeys.map((k) => bookingVals(k, "deposit"));
  const feeBooking = groupKeys.map((k) => bookingVals(k, "fee"));
  const totalBooking = rentBooking.map(
    (v, i) => v + depositBooking[i] + feeBooking[i]
  );

  /* ---------------- BILLS ---------------- */
  const billVals = (key: string, field: keyof Bill) =>
    !selectedYear
      ? sum(
          FBills.filter(
            (b) => String(new Date(b.month).getUTCFullYear() + 543) === key
          ).map((b) => Number(b[field] ?? 0))
        )
      : sum(
          FBills.filter(
            (b) =>
              String(new Date(b.month).getUTCMonth() + 1).padStart(2, "0") ===
              key
          ).map((b) => Number(b[field] ?? 0))
        );

  const rentBill = groupKeys.map((k) => billVals(k, "rent"));
  const waterBill = groupKeys.map((k) => billVals(k, "waterCost"));
  const electricBill = groupKeys.map((k) => billVals(k, "electricCost"));
  const totalBill = rentBill.map((v, i) => v + waterBill[i] + electricBill[i]);

  /* ---------------- MODES ---------------- */
  const YEAR = !selectedYear;
  const MONTH = selectedYear && !selectedMonth;
  const ONEMONTH = selectedYear && selectedMonth;

  /* ---------------- TITLE BUILDER ---------------- */
  const getTitle = (base: string) => {
    if (YEAR) return base;
    if (MONTH) {
      const Year = [Number(selectedYear)];
      return `${base} ( ปี ${Year} )`;
    }

    if (ONEMONTH) {
      const monthTH = monthNamesTH[Number(selectedMonth) - 1];
      return `${base} ( ${monthTH} ปี ${selectedYear} )`;
    }
    return base;
  };

  /* ---------------- SUFFIX FOR CHART ---------------- */
  const suffix = YEAR
    ? " ทุกปี "
    : MONTH
    ? ` ปี ${selectedYear} `
    : ` ${monthNamesTH[Number(selectedMonth) - 1]} ${selectedYear} `;

  /* ================================================================ */
  return (
    <div className="mt-4">
      <h2 className="fw-bold text-center" style={{ color: "#4A0080" }}>
        รายรับ SmartDorm
      </h2>
      <h6 className="text-center mb-3">({suffix})</h6>

      {/* FILTER */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedMonth("");
          }}
        >
          <option value="">ทุกปี</option>
          {YEARS.map((y) => (
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
          {groupKeys.map((m) => (
            <option key={m} value={m}>
              {monthNamesTH[Number(m) - 1]}
            </option>
          ))}
        </select>
      </div>

      {/* YEAR MODE */}
      {YEAR && (
        <>
          <Section title={getTitle("รายรับการจอง")}>
            <CardsGrid>
              <Card title="ค่าเช่า" value={sum(rentBooking)} color="#4A148C" />
              <Card
                title="ค่ามัดจำ"
                value={sum(depositBooking)}
                color="#7B1FA2"
              />
              <Card title="ค่าจอง" value={sum(feeBooking)} color="#FB0707" />
              <Card
                title="รายรับการจอง"
                value={sum(totalBooking)}
                color="#2E7D32"
              />
            </CardsGrid>
            <ChartsGrid
              labels={labels}
              datasets={[
                { label: "ค่าเช่า", data: rentBooking, borderColor: "#4A148C" },
                {
                  label: "ค่ามัดจำ",
                  data: depositBooking,
                  borderColor: "#7B1FA2",
                },
                { label: "ค่าจอง", data: feeBooking, borderColor: "#FB0707" },
                {
                  label: "รายรับการจอง",
                  data: totalBooking,
                  borderColor: "#2E7D32",
                },
              ]}
              suffix={suffix}
            />
          </Section>

          <Section title={getTitle("รายรับบิล")}>
            <CardsGrid>
              <Card title="ค่าเช่าห้อง" value={sum(rentBill)} color="#3F51B5" />
              <Card title="ค่าน้ำ" value={sum(waterBill)} color="#29B6F6" />
              <Card title="ค่าไฟ" value={sum(electricBill)} color="#FF7043" />
              <Card
                title="รวมรายรับบิล"
                value={sum(totalBill)}
                color="#00838F"
              />
            </CardsGrid>
            <ChartsGrid
              labels={labels}
              datasets={[
                {
                  label: "ค่าเช่าห้อง",
                  data: rentBill,
                  borderColor: "#3F51B5",
                },
                { label: "ค่าน้ำ", data: waterBill, borderColor: "#29B6F6" },
                { label: "ค่าไฟ", data: electricBill, borderColor: "#FF7043" },
                {
                  label: "รวมรายรับบิล",
                  data: totalBill,
                  borderColor: "#00838F",
                },
              ]}
              suffix={suffix}
            />
            {isDesktop ? (
              <MonthlyBillTable bills={FBills} monthNamesTH={monthNamesTH} />
            ) : (
              <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />
            )}
          </Section>
        </>
      )}

      {/* MONTH MODE */}
      {MONTH && (
        <>
          <Section title={getTitle("รายรับการจอง")}>
            <CardsGrid>
              <Card title="ค่าเช่า" value={sum(rentBooking)} color="#4A148C" />
              <Card
                title="ค่ามัดจำ"
                value={sum(depositBooking)}
                color="#7B1FA2"
              />
              <Card title="ค่าจอง" value={sum(feeBooking)} color="#FB0707" />
              <Card
                title="รายรับการจอง"
                value={sum(totalBooking)}
                color="#2E7D32"
              />
            </CardsGrid>
            <ChartsGrid
              labels={labels}
              datasets={[
                { label: "ค่าเช่า", data: rentBooking, borderColor: "#4A148C" },
                {
                  label: "ค่ามัดจำ",
                  data: depositBooking,
                  borderColor: "#7B1FA2",
                },
                { label: "ค่าจอง", data: feeBooking, borderColor: "#FB0707" },
                {
                  label: "รายรับการจอง",
                  data: totalBooking,
                  borderColor: "#2E7D32",
                },
              ]}
              suffix={suffix}
            />
          </Section>

          <Section title={getTitle("รายรับบิล")}>
            <CardsGrid>
              <Card title="ค่าเช่าห้อง" value={sum(rentBill)} color="#3F51B5" />
              <Card title="ค่าน้ำ" value={sum(waterBill)} color="#29B6F6" />
              <Card title="ค่าไฟ" value={sum(electricBill)} color="#FF7043" />
              <Card
                title="รวมรายรับบิล"
                value={sum(totalBill)}
                color="#00838F"
              />
            </CardsGrid>
            <ChartsGrid
              labels={labels}
              datasets={[
                {
                  label: "ค่าเช่าห้อง",
                  data: rentBill,
                  borderColor: "#3F51B5",
                },
                { label: "ค่าน้ำ", data: waterBill, borderColor: "#29B6F6" },
                { label: "ค่าไฟ", data: electricBill, borderColor: "#FF7043" },
                {
                  label: "รวมรายรับบิล",
                  data: totalBill,
                  borderColor: "#00838F",
                },
              ]}
              suffix={suffix}
            />
          </Section>

          {isDesktop ? (
            <MonthlyBillTable bills={FBills} monthNamesTH={monthNamesTH} />
          ) : (
            <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />
          )}
        </>
      )}

      {/* ONE MONTH MODE */}
      {ONEMONTH && (
        <>
          <Section title={getTitle("รายรับการจอง")}>
            <CardsGrid>
              <Card title="ค่าเช่า" value={sum(rentBooking)} color="#4A148C" />
              <Card
                title="ค่ามัดจำ"
                value={sum(depositBooking)}
                color="#7B1FA2"
              />
              <Card title="ค่าจอง" value={sum(feeBooking)} color="#FB0707" />
              <Card
                title="รายรับการจอง"
                value={sum(totalBooking)}
                color="#2E7D32"
              />
            </CardsGrid>
            {/* ✅ เพิ่มกราฟตรงนี้ */}
            <ChartsGrid
              labels={labels}
              datasets={[
                { label: "ค่าเช่า", data: rentBooking, borderColor: "#4A148C" },
                {
                  label: "ค่ามัดจำ",
                  data: depositBooking,
                  borderColor: "#7B1FA2",
                },
                { label: "ค่าจอง", data: feeBooking, borderColor: "#FB0707" },
                {
                  label: "รายรับการจอง",
                  data: totalBooking,
                  borderColor: "#2E7D32",
                },
              ]}
              suffix={suffix}
            />
          </Section>

          <Section title={getTitle("รายรับบิล")}>
            <CardsGrid>
              <Card title="ค่าเช่าห้อง" value={sum(rentBill)} color="#3F51B5" />
              <Card title="ค่าน้ำ" value={sum(waterBill)} color="#29B6F6" />
              <Card title="ค่าไฟ" value={sum(electricBill)} color="#FF7043" />
              <Card
                title="รวมรายรับบิล"
                value={sum(totalBill)}
                color="#00838F"
              />
            </CardsGrid>
            <ChartsGrid
              labels={labels}
              datasets={[
                {
                  label: "ค่าเช่าห้อง",
                  data: rentBill,
                  borderColor: "#3F51B5",
                },
                { label: "ค่าน้ำ", data: waterBill, borderColor: "#29B6F6" },
                { label: "ค่าไฟ", data: electricBill, borderColor: "#FF7043" },
                {
                  label: "รวมรายรับบิล",
                  data: totalBill,
                  borderColor: "#00838F",
                },
              ]}
              suffix={suffix}
            />
          </Section>

          {isDesktop ? (
            <MonthlyBillTable bills={FBills} monthNamesTH={monthNamesTH} />
          ) : (
            <MonthlyBillCards bills={FBills} monthNamesTH={monthNamesTH} />
          )}
        </>
      )}
    </div>
  );
}
