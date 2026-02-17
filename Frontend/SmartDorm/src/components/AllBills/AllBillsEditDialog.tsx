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

  // ✅ breakpoint system
  let width = "95%";
  let maxWidth = 520;
  let radius: string | number = "1rem";

  if (screenWidth < 480) {
    width = "100%";
    maxWidth = 9999;
    radius = 0;
  } else if (screenWidth < 768) {
    maxWidth = 520;
  } else if (screenWidth < 1279) {
    maxWidth = 600;
  } else if (screenWidth < 1399) {
    maxWidth = 720;
  } else {
    maxWidth = 820;
  }

  const dialogStyle: React.CSSProperties = {
    width,
    maxWidth,
    maxHeight: "95vh",
    overflowY: "auto",
    borderRadius: radius,
  };

  const inputClass = "form-control text-center rounded-3 shadow-sm py-2";

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      <div className="bg-white shadow-lg" style={dialogStyle}>
        <div
          className="text-white text-center py-3"
          style={{
            background: "linear-gradient(135deg,#4facfe,#00f2fe)",
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          }}
        >
          <h5 className="fw-bold mb-0">
            แก้ไขบิลห้อง {bill.room.number}
          </h5>
        </div>

        <form onSubmit={submit} className="p-4">
          <label className="fw-semibold mb-1">เดือนบิล</label>
          <input type="date" className={inputClass}
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
          />

          <label className="fw-semibold mt-3 mb-1">หน่วยน้ำก่อน</label>
          <input type="number" className={inputClass}
            value={form.wBefore}
            onChange={(e) => setForm({ ...form, wBefore: Number(e.target.value) })}
          />

          <label className="fw-semibold mt-3 mb-1">หน่วยน้ำหลัง</label>
          <input type="number" className={inputClass}
            value={form.wAfter}
            onChange={(e) => setForm({ ...form, wAfter: Number(e.target.value) })}
          />

          <label className="fw-semibold mt-3 mb-1">หน่วยไฟก่อน</label>
          <input type="number" className={inputClass}
            value={form.eBefore}
            onChange={(e) => setForm({ ...form, eBefore: Number(e.target.value) })}
          />

          <label className="fw-semibold mt-3 mb-1">หน่วยไฟหลัง</label>
          <input type="number" className={inputClass}
            value={form.eAfter}
            onChange={(e) => setForm({ ...form, eAfter: Number(e.target.value) })}
          />

          <label className="fw-semibold mt-3 mb-1">วันครบกำหนด</label>
          <input type="date" className={inputClass}
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <label className="fw-semibold mt-3 mb-1">สถานะบิล</label>
          <select
            className="form-select text-center rounded-3 shadow-sm py-2"
            value={form.billStatus}
            onChange={(e) => setForm({ ...form, billStatus: Number(e.target.value) })}
          >
            <option value={0}>ยังไม่ชำระ</option>
            <option value={2}>รอตรวจสอบ</option>
            <option value={1}>ชำระแล้ว</option>
          </select>

          <div className="d-flex justify-content-between mt-4 gap-3">
            <button type="button"
              className="btn text-white fw-semibold w-50 py-2 rounded-3"
              style={{ background: "linear-gradient(135deg,#ff512f,#dd2476)" }}
              onClick={onClose}
            >
              ยกเลิก
            </button>

            <button type="submit"
              className="btn text-white fw-semibold w-50 py-2 rounded-3"
              style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}