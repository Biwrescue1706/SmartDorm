// src/pages/Bills/CreateBills.tsx
import { useEffect, useMemo, useState } from "react";
import { useCreateBill } from "../../hooks/Bill/useCreateBill";
import type { Room } from "../../types/Room";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { usePendingBookings } from "../../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../../hooks/ManageRooms/usePendingCheckouts";

const WATER_PRICE = 19;
const ELECTRIC_PRICE = 7;
const SERVICE_FEE = 50;

type PrevMap = Record<
  string,
  { wBefore: number; eBefore: number; rent: number }
>;

export default function CreateBills() {
  const { rooms, bookings, loading } = useCreateBill();
  const navigate = useNavigate();

  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  const [todayStr, setTodayStr] = useState("");
  const [month, setMonth] = useState("");
  const [meters, setMeters] = useState<
    Record<string, { wAfter: string; eAfter: string }>
  >({});
  const [prev, setPrev] = useState<PrevMap>({});
  const [billedOfMonth, setBilledOfMonth] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = new Date();
    const monthsThai = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    setTodayStr(
      `${d.getDate()} ${monthsThai[d.getMonth()]} ${d.getFullYear() + 543}`,
    );
  }, []);

  // โหลดบิลทั้งหมดเพื่อหา "ครั้งก่อน"
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
          };
        }
        setPrev(map);
      } catch {
        setPrev({});
      }
    })();
  }, []);

  // เมื่อเลือกเดือน → หา roomId ที่มีบิลของเดือนนั้น
  useEffect(() => {
    if (!month) {
      setBilledOfMonth([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/bill/getall`,
          { credentials: "include" },
        );
        const data = await res.json();

        const d = new Date(month);
        const m = d.getMonth();
        const y = d.getFullYear();

        const roomIds = data
          .filter((b: any) => {
            const bm = new Date(b.month);
            return bm.getMonth() === m && bm.getFullYear() === y;
          })
          .map((b: any) => b.roomId);

        setBilledOfMonth(roomIds);
      } catch {
        setBilledOfMonth([]);
      }
    })();
  }, [month]);

  const bookedRooms = useMemo(() => {
    return rooms.filter((r: Room) =>
      bookings.find(
        (b: any) => b.roomId === r.roomId && b.approveStatus !== 0,
      ),
    );
  }, [rooms, bookings]);

  const notBilledRooms = bookedRooms.filter(
    (r: Room) => !billedOfMonth.includes(r.roomId),
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

  const calcTotal = (r: Room) => {
    const p = prev[r.roomId] || { wBefore: 0, eBefore: 0, rent: r.rent };
    const m = meters[r.roomId];
    if (!m?.wAfter || !m?.eAfter) return 0;

    const wUnits = Number(m.wAfter) - p.wBefore;
    const eUnits = Number(m.eAfter) - p.eBefore;

    if (wUnits < 0 || eUnits < 0) return 0;

    return (
      p.rent +
      SERVICE_FEE +
      wUnits * WATER_PRICE +
      eUnits * ELECTRIC_PRICE
    );
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

      navigate("/bills");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 mx-2 mt-0 mb-4">
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7">
        <div className="mx-auto" style={{ maxWidth: 1400 }}>
          <h2 className="fw-bold text-center mb-2">สร้างบิลห้องพักทั้งหมด</h2>
          <h5 className="text-center mb-3">
            วันนี้: <b>{todayStr}</b>
          </h5>

          <div className="d-flex gap-2 mb-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => window.location.reload()}
            >
              รีเฟรชข้อมูล
            </button>

            <div style={{ maxWidth: 260 }}>
              <label className="fw-bold">เดือน</label>
              <input
                type="month"
                className="form-control"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p>กำลังโหลด...</p>
          ) : !month ? (
            <p className="text-muted">กรุณาเลือกเดือนก่อน</p>
          ) : notBilledRooms.length === 0 ? (
            <p className="text-muted">ทุกห้องมีบิลของเดือนนี้แล้ว</p>
          ) : (
            <>
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>ห้อง</th>
                    <th>น้ำ (ก่อน)</th>
                    <th>น้ำ (หลัง)</th>
                    <th>ไฟ (ก่อน)</th>
                    <th>ไฟ (หลัง)</th>
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
                    const total = calcTotal(r);

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
      </main>
    </div>
  );
}