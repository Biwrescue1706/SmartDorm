//src/pages/CreateBills.tsx

import { useMemo, useState } from "react";
import { useCreateBill } from "../../hooks/Bill/useCreateBill";
import type { Room } from "../../types/BillCreate";

export default function CreateBills() {
  const { rooms, bookings, bills, loading, createBill } = useCreateBills();

  const [filter, setFilter] = useState<"not" | "done">("not");
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  const [month, setMonth] = useState("");
  const [wAfter, setWAfter] = useState("");
  const [eAfter, setEAfter] = useState("");
  const [saving, setSaving] = useState(false);

  const bookedRooms = useMemo(() => {
    return rooms.filter((r) =>
      bookings.find(
        (b) => b.roomId === r.roomId && b.approveStatus !== 0,
      ),
    );
  }, [rooms, bookings]);

  const billedRoomIds = useMemo(
    () => bills.map((b) => b.roomId),
    [bills],
  );

  const filtered = bookedRooms.filter((r) => {
    const has = billedRoomIds.includes(r.roomId);
    return filter === "not" ? !has : has;
  });

  const openDialog = (r: Room) => {
    setRoom(r);
    setMonth("");
    setWAfter("");
    setEAfter("");
    setOpen(true);
  };

  const submit = async () => {
    if (!room) return;
    if (!month || !wAfter || !eAfter) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }

    setSaving(true);
    try {
      await createBill(room.roomId, {
        month,
        wAfter: Number(wAfter),
        eAfter: Number(eAfter),
      });
      setOpen(false);
    } catch (e: any) {
      alert(e.response?.data?.error || "สร้างบิลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3">
      <h2 className="fw-bold mb-3">สร้างบิลห้องพัก</h2>

      <div className="mb-3">
        <button
          className={`btn me-2 ${filter === "not" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setFilter("not")}
        >
          ยังไม่ได้ออกบิล
        </button>
        <button
          className={`btn ${filter === "done" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setFilter("done")}
        >
          ออกบิลแล้ว
        </button>
      </div>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ห้อง</th>
              <th>ค่าเช่า</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const has = billedRoomIds.includes(r.roomId);
              return (
                <tr key={r.roomId}>
                  <td>{r.number}</td>
                  <td>{r.rent}</td>
                  <td>
                    {!has && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openDialog(r)}
                      >
                        สร้างบิล
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {open && room && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5 className="fw-bold mb-3">สร้างบิล ห้อง {room.number}</h5>

              <div className="mb-2">
                <label>เดือน</label>
                <input
                  type="month"
                  className="form-control"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label>เลขมิเตอร์น้ำปัจจุบัน</label>
                <input
                  type="number"
                  className="form-control"
                  value={wAfter}
                  onChange={(e) => setWAfter(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>เลขมิเตอร์ไฟปัจจุบัน</label>
                <input
                  type="number"
                  className="form-control"
                  value={eAfter}
                  onChange={(e) => setEAfter(e.target.value)}
                />
              </div>

              <div className="text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  className="btn btn-primary"
                  onClick={submit}
                  disabled={saving}
                >
                  {saving ? "กำลังสร้าง..." : "สร้างบิล"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}