import { useState } from "react";
import Swal from "sweetalert2";
import type { Bill } from "../../types/Bill";

interface Props {
  bill: Bill | null;
  onSave: (billId: string, formValues: any) => Promise<void>;
  onClose: () => void;
}

export default function AllBillsEditDialog({ bill, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    wBefore: bill?.wBefore ?? 0,
    wAfter: bill?.wAfter ?? 0,
    eBefore: bill?.eBefore ?? 0,
    eAfter: bill?.eAfter ?? 0,
    status: bill?.status ?? 0,
  });

  if (!bill) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.wAfter < form.wBefore || form.eAfter < form.eBefore) {
      Swal.fire("ข้อมูลไม่ถูกต้อง", "ค่าหลังต้องมากกว่าค่าก่อน", "warning");
      return;
    }

    await onSave(bill.billId, form);
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "600px" }}>
        <div className="modal-content shadow-lg rounded-4 border-0">
          {/* Header */}
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
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* หน่วยน้ำ */}
                <div className="col-md-6 text-center">
                  <label className="form-label fw-semibold">หน่วยน้ำก่อน</label>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={form.wBefore}
                    onChange={(e) =>
                      setForm({ ...form, wBefore: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="col-md-6 text-center">
                  <label className="form-label fw-semibold">หน่วยน้ำหลัง</label>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={form.wAfter}
                    onChange={(e) =>
                      setForm({ ...form, wAfter: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                {/* หน่วยไฟ */}
                <div className="col-md-6 text-center">
                  <label className="form-label fw-semibold">หน่วยไฟก่อน</label>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={form.eBefore}
                    onChange={(e) =>
                      setForm({ ...form, eBefore: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="col-md-6 text-center">
                  <label className="form-label fw-semibold">หน่วยไฟหลัง</label>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={form.eAfter}
                    onChange={(e) =>
                      setForm({ ...form, eAfter: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                {/* สถานะ */}
                <div className="col-12 text-center">
                  <label className="form-label fw-semibold">สถานะ</label>
                  <select
                    className="form-select text-center"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: Number(e.target.value) })
                    }
                  >
                    <option value={0}>ยังไม่ชำระ</option>
                    <option value={1}>ชำระแล้ว</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
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
