import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type { Bill } from "../../types/Bill";

interface Props {
  bill: Bill | null;
  onSave: (billId: string, formValues: any) => Promise<void>;
  onClose: () => void;
}

// ✅ ป้องกัน timezone เลื่อนวัน
const toISO = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return new Date(Date.UTC(+y, +m - 1, +d)).toISOString();
};

export default function AllBillsEditDialog({ bill, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    wBefore: 0,
    wAfter: 0,
    eBefore: 0,
    eAfter: 0,
    billStatus: 0,
    month: "",
    dueDate: "",
  });

  // ✅ sync bill → form
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

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "#00000080" }}
    >
      <div
        className="modal-body p-4 mt-5"
        style={{
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        <div className="modal-content shadow-lg mx-3 rounded-3 border-0">
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(135deg, #4facfe, #00f2fe)",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          >
            <h5 className="modal-title fw-bold">
              แก้ไขบิลห้อง {bill.room.number}
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={submit}>
            <div className="modal-body p-4">
              <label className="form-label fw-semibold">เดือนบิล</label>
              <input
                type="date"
                className="form-control text-center"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />

              <label className="form-label fw-semibold mt-2">
                หน่วยน้ำก่อน
              </label>
              <input
                type="number"
                className="form-control text-center"
                value={form.wBefore}
                onChange={(e) =>
                  setForm({ ...form, wBefore: Number(e.target.value) })
                }
              />

              <label className="form-label fw-semibold mt-2">
                หน่วยน้ำหลัง
              </label>
              <input
                type="number"
                className="form-control text-center"
                value={form.wAfter}
                onChange={(e) =>
                  setForm({ ...form, wAfter: Number(e.target.value) })
                }
              />

              <label className="form-label fw-semibold mt-3">หน่วยไฟก่อน</label>
              <input
                type="number"
                className="form-control text-center"
                value={form.eBefore}
                onChange={(e) =>
                  setForm({ ...form, eBefore: Number(e.target.value) })
                }
              />

              <label className="form-label fw-semibold mt-2">หน่วยไฟหลัง</label>
              <input
                type="number"
                className="form-control text-center"
                value={form.eAfter}
                onChange={(e) =>
                  setForm({ ...form, eAfter: Number(e.target.value) })
                }
              />

              <label className="form-label fw-semibold mt-2">วันครบกำหนด</label>
              <input
                type="date"
                className="form-control text-center"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />

              <label className="form-label fw-semibold mt-3">สถานะบิล</label>
              <select
                className="form-select text-center"
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

            <div className="modal-footer d-flex justify-content-between px-4 pb-3">
              <button
                type="button"
                className="btn fw-semibold text-white px-4"
                style={{
                  background: "linear-gradient(135deg, #ff512f, #dd2476)",
                  border: "none",
                }}
                onClick={onClose}
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="btn fw-semibold text-white px-4"
                style={{
                  background: "linear-gradient(135deg, #11998e, #38ef7d)",
                  border: "none",
                }}
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
