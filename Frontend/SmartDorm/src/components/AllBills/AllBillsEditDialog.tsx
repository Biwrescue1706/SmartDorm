import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type { Bill } from "../../types/All";

interface Props {
  bill: Bill | null;
  onSave: (billId: string, formValues: any) => Promise<void>;
  onClose: () => void;
}

const toISO = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return new Date(Date.UTC(+y, +m - 1, +d)).toISOString();
};

export default function AllBillsEditDialog({ bill, onSave, onClose }: Props) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const [form, setForm] = useState({
    wBefore: 0,
    wAfter: 0,
    eBefore: 0,
    eAfter: 0,
    billStatus: 0,
    month: "",
    dueDate: "",
  });

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!bill) return;

    setForm({
      wBefore: bill.wBefore ?? 0,
      wAfter: bill.wAfter ?? 0,
      eBefore: bill.eBefore ?? 0,
      eAfter: bill.eAfter ?? 0,
      billStatus: bill.billStatus ?? 0,
      month: bill.month ? bill.month.slice(0, 10) : "",
      dueDate: bill.dueDate ? bill.dueDate.slice(0, 10) : "",
    });
  }, [bill]);

  if (!bill) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.wAfter < form.wBefore || form.eAfter < form.eBefore) {
      Swal.fire("ข้อมูลไม่ถูกต้อง", "ค่าหลังต้องมากกว่าค่าก่อน", "warning");
      return;
    }

    await onSave(bill.billId, {
      wBefore: Number(form.wBefore),
      wAfter: Number(form.wAfter),
      eBefore: Number(form.eBefore),
      eAfter: Number(form.eAfter),
      billStatus: Number(form.billStatus),
      month: form.month ? toISO(form.month) : undefined,
      dueDate: form.dueDate ? toISO(form.dueDate) : undefined,
    });

    onClose();
  };

  // responsive width
  let width = "94%";
  let maxWidth = 520;

  if (screenWidth < 480) maxWidth = 420;
  else if (screenWidth < 768) maxWidth = 520;
  else if (screenWidth < 1200) maxWidth = 620;
  else maxWidth = 760;

  const dialogStyle: React.CSSProperties = {
    width,
    maxWidth,
    maxHeight: "92vh",
    overflowY: "auto",
    borderRadius: "1.2rem",
  };

  const inputClass = "form-control rounded-3 shadow-sm py-2 px-3";
  const labelClass = "fw-semibold mb-1 text-black";

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        position: "fixed",
        inset: 0,
        padding:
          "max(24px, env(safe-area-inset-top)) 12px max(24px, env(safe-area-inset-bottom))",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(5px)",
        zIndex: 9999,
      }}
    >
      <div className="bg-white shadow-lg" style={dialogStyle}>
        <div
          className="text-white text-center py-3"
          style={{
            background: "linear-gradient(135deg,#4facfe,#00f2fe)",
            borderTopLeftRadius: "1.2rem",
            borderTopRightRadius: "1.2rem",
          }}
        >
          <h5 className="fw-bold mb-0">
            แก้ไขบิลห้อง {bill.room?.number ?? "-"}
          </h5>
        </div>

        <form onSubmit={submit} className="p-4">

          <div className="mb-3">
            <label className={labelClass}>เดือนที่ออกบิล</label>
            <input
              type="date"
              className={inputClass}
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>เลขมิเตอร์น้ำเดือนก่อน</label>
            <input
              type="number"
              className={inputClass}
              value={form.wBefore}
              onChange={(e) =>
                setForm({ ...form, wBefore: Number(e.target.value) })
              }
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>เลขมิเตอร์น้ำปัจจุบัน</label>
            <input
              type="number"
              className={inputClass}
              value={form.wAfter}
              onChange={(e) =>
                setForm({ ...form, wAfter: Number(e.target.value) })
              }
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>เลขมิเตอร์ไฟครั้งก่อน</label>
            <input
              type="number"
              className={inputClass}
              value={form.eBefore}
              onChange={(e) =>
                setForm({ ...form, eBefore: Number(e.target.value) })
              }
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>มิเตอร์ไฟฟ้าปัจจุบัน</label>
            <input
              type="number"
              className={inputClass}
              value={form.eAfter}
              onChange={(e) =>
                setForm({ ...form, eAfter: Number(e.target.value) })
              }
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>วันครบกำหนด</label>
            <input
              type="date"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) =>
                setForm({ ...form, dueDate: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>สถานะบิล</label>
            <select
              className="form-select rounded-3 shadow-sm py-2"
              value={form.billStatus}
              onChange={(e) =>
                setForm({ ...form, billStatus: Number(e.target.value) })
              }
            >
              <option value={0}>ยังไม่ชำระ</option>
              <option value={2}>รอตรวจสอบ</option>
              <option value={1}>ชำระแล้ว</option>
            </select>
          </div>

          <div className="d-flex justify-content-between mt-4 gap-3">
            <button
              type="button"
              className="btn text-white fw-semibold w-50 py-2 rounded-3"
              style={{
                background: "linear-gradient(135deg,#ff512f,#dd2476)",
              }}
              onClick={onClose}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="btn text-white fw-semibold w-50 py-2 rounded-3"
              style={{
                background: "linear-gradient(135deg,#11998e,#38ef7d)",
              }}
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}