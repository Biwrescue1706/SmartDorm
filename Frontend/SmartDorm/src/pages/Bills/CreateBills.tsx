// src/pages/Bills/CreateBills.tsx
import { useMemo, useState, useEffect } from "react";
import { useCreateBill } from "../../hooks/Bill/useCreateBill";
import type { Room } from "../../types/Room";
import { useNavigate } from "react-router-dom";

const WATER_PRICE = 19;
const ELECTRIC_PRICE = 7;
const SERVICE_FEE = 50;

type PrevMap = Record<
  string,
  { wBefore: number; eBefore: number; rent: number; month?: string }
>;

export default function CreateBills() {
  const { rooms, bookings, existingBills, loading } = useCreateBill();
  const navigate = useNavigate();

  const [month, setMonth] = useState("");
  const [meters, setMeters] = useState<
    Record<string, { wAfter: string; eAfter: string }>
  >({});
  const [prev, setPrev] = useState<PrevMap>({});
  const [saving, setSaving] = useState(false);

  // โหลดบิลล่าสุดของทุกห้อง เพื่อเอามิเตอร์ "ครั้งก่อน"
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/bill/getall`,
          { credentials: "include" },
        );
        const data = await res.json();

        const latest: any = {};
        for (const b of data) {
          if (
            !latest[b.roomId] ||
            new Date(b.month) > new Date(latest[b.roomId].month)
          ) {
            latest[b.roomId] = b;
          }
        }

        const map: PrevMap = {};
        for (const k in latest) {
          map[k] = {
            wBefore: latest[k].wAfter ?? 0,
            eBefore: latest[k].eAfter ?? 0,
            rent: latest[k].rent ?? 0,
            month: latest[k].month,
          };
        }
        setPrev(map);
      } catch {
        setPrev({});
      }
    })();
  }, []);

  // ห้องที่มีผู้พักจริง
  const bookedRooms = useMemo(() => {
    return rooms.filter((r: Room) =>
      bookings.find(
        (b: any) => b.roomId === r.roomId && b.approveStatus !== 0,
      ),
    );
  }, [rooms, bookings]);

  // ห้องที่ยังไม่มีบิลของเดือนปัจจุบัน
  const notBilledRooms = bookedRooms.filter(
    (r: Room) => !existingBills.includes(r.roomId),
  );

  const setMeter = (
    roomId: string,
    key: "wAfter" | "eAfter",
    value: string,
  ) => {
    setMeters((prev) => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || { wAfter: "", eAfter: "" }),
        [key]: value,
      },
    }));
  };

  const calcUnits = (r: Room) => {
    const p = prev[r.roomId] || { wBefore: 0, eBefore: 0, rent: r.rent };
    const m = meters[r.roomId];
    if (!m?.wAfter || !m?.eAfter) {
      return { wUnits: 0, eUnits: 0, total: 0 };
    }

    const wUnits = Number(m.wAfter) - p.wBefore;
    const eUnits = Number(m.eAfter) - p.eBefore;

    if (wUnits < 0 || eUnits < 0) {
      return { wUnits, eUnits, total: 0 };
    }

    const total =
      p.rent +
      SERVICE_FEE +
      wUnits * WATER_PRICE +
      eUnits * ELECTRIC_PRICE;

    return { wUnits, eUnits, total };
  };

  const submitAll = async () => {
    if (!month) {
      alert("กรุณาเลือกเดือน");
      return;
    }

    for (const r of notBilledRooms) {
      const m = meters[r.roomId];
      if (!m?.wAfter || !m?.eAfter) {
        alert(`กรุณากรอกมิเตอร์ให้ครบ ห้อง ${r.number}`);
        return;
      }

      const p = prev[r.roomId] || { wBefore: 0, eBefore: 0 };
      if (Number(m.wAfter) < p.wBefore || Number(m.eAfter) < p.eBefore) {
        alert(`มิเตอร์ต้องไม่น้อยกว่าครั้งก่อน ห้อง ${r.number}`);
        return;
      }
    }

    const payload = {
      month,
      meters: notBilledRooms.map((r) => ({
        roomId: r.roomId,
        wAfter: Number(meters[r.roomId].wAfter),
        eAfter: Number(meters[r.roomId].eAfter),
      })),
    };

    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/bill/createFromActiveRooms`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สร้างบิลไม่สำเร็จ");

      alert(
        `สร้างบิลสำเร็จ ${data.success} ห้อง\nไม่สำเร็จ ${data.failed} ห้อง`,
      );

      if (data.failed > 0) {
        console.table(data.errors);
      }

      navigate("/bills");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3">
      <h2 className="fw-bold mb-3">สร้างบิลทั้งหมด</h2>

      <div className="mb-3" style={{ maxWidth: 260 }}>
        <label className="fw-bold">เดือน</label>
        <input
          type="month"
          className="form-control"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : notBilledRooms.length === 0 ? (
        <p className="text-muted">ไม่มีห้องที่ต้องสร้างบิล</p>
      ) : (
        <>
          <table className="table table-bordered align-middle">
            <thead>
              <tr>
                <th>ห้อง</th>
                <th>น้ำ (ครั้งก่อน)</th>
                <th>น้ำ (ครั้งหลัง)</th>
                <th>ไฟ (ครั้งก่อน)</th>
                <th>ไฟ (ครั้งหลัง)</th>
                <th>หน่วยน้ำ</th>
                <th>หน่วยไฟ</th>
                <th>ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {notBilledRooms.map((r: Room) => {
                const p = prev[r.roomId] || {
                  wBefore: 0,
                  eBefore: 0,
                  rent: r.rent,
                };
                const { wUnits, eUnits, total } = calcUnits(r);

                return (
                  <tr key={r.roomId}>
                    <td className="fw-bold">{r.number}</td>

                    <td>{p.wBefore}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={meters[r.roomId]?.wAfter || ""}
                        onChange={(e) =>
                          setMeter(r.roomId, "wAfter", e.target.value)
                        }
                      />
                    </td>

                    <td>{p.eBefore}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={meters[r.roomId]?.eAfter || ""}
                        onChange={(e) =>
                          setMeter(r.roomId, "eAfter", e.target.value)
                        }
                      />
                    </td>

                    <td className={wUnits < 0 ? "text-danger" : ""}>
                      {wUnits > 0 ? wUnits : wUnits < 0 ? "ผิดพลาด" : "-"}
                    </td>
                    <td className={eUnits < 0 ? "text-danger" : ""}>
                      {eUnits > 0 ? eUnits : eUnits < 0 ? "ผิดพลาด" : "-"}
                    </td>

                    <td className="fw-bold">
                      {total > 0 ? total.toLocaleString() + " บาท" : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="text-end">
            <button
              className="btn btn-primary px-4"
              onClick={submitAll}
              disabled={saving}
            >
              {saving ? "กำลังสร้าง..." : "สร้างบิลทั้งหมด"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}