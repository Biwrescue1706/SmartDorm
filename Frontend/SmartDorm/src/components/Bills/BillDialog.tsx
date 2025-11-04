// src/components/Bills/BillDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import type { Room } from "../../types/Room";
import { API_BASE } from "../../config";

interface BillDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  reloadExistingBills: () => void;
}

export default function BillDialog({
  open,
  onClose,
  room,
  reloadExistingBills,
}: BillDialogProps) {
  const [form, setForm] = useState({
    month: "",
    wBefore: 0,
    wAfter: 0,
    eBefore: 0,
    eAfter: 0,
  });
  const [loading, setLoading] = useState(false);

  // ✅ โหลดบิลล่าสุดของห้อง เพื่อเติมค่าหน่วยก่อนหน้าอัตโนมัติ
  useEffect(() => {
    if (!room) return;

    const loadPrevBill = async () => {
      try {
        const res = await fetch(`${API_BASE}/bill/getall`, {
          credentials: "include",
        });
        const data = await res.json();

        // หา "บิลล่าสุด" ของห้องนี้
        const latestBill = data
          .filter((b: any) => b.roomId === room.roomId)
          .sort(
            (a: any, b: any) =>
              new Date(b.month).getTime() - new Date(a.month).getTime()
          )[0];

        if (latestBill) {
          setForm((prev) => ({
            ...prev,
            wBefore: latestBill.wAfter,
            eBefore: latestBill.eAfter,
          }));
        }
      } catch (err) {
        console.warn("ไม่สามารถโหลดบิลก่อนหน้าได้", err);
      }
    };

    loadPrevBill();
  }, [room]);

  // ✅ ฟังก์ชันเปลี่ยนค่าใน input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // ✅ ฟังก์ชันกดยืนยันสร้างบิล
  const handleSubmit = async () => {
    if (!room) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/bill/createFromRoom/${room.roomId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถสร้างบิลได้");

      const newBill = data.bill; // ✅ ดึงข้อมูลบิลจาก backend
      if (newBill) {
        setForm((prev) => ({
          ...prev,
          wBefore: newBill.wBefore,
          eBefore: newBill.eBefore,
        }));
      }

      alert("✅ สร้างบิลสำเร็จ");
      await reloadExistingBills();
      onClose();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
        <Dialog.Content
          className="position-fixed top-50 start-50 translate-middle card shadow-lg border-0 rounded-4 p-4"
          style={{ width: "400px" }}
        >
          <Dialog.Title className="fw-bold text-center mb-3">
            ออกบิลห้อง {room?.number}
          </Dialog.Title>

          <div className="mb-2">
            <label className="form-label">เดือนที่ออกบิล</label>
            <input
              id="month"
              type="date"
              className="form-control"
              value={form.month}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col-6 mb-2">
              <label className="form-label">หน่วยน้ำก่อนหน้า</label>
              <input
                id="wBefore"
                type="number"
                className="form-control"
                value={form.wBefore}
                onChange={handleChange}
              />
            </div>
            <div className="col-6 mb-2">
              <label className="form-label">หน่วยน้ำปัจจุบัน</label>
              <input
                id="wAfter"
                type="number"
                className="form-control"
                value={form.wAfter}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-6 mb-2">
              <label className="form-label">หน่วยไฟก่อนหน้า</label>
              <input
                id="eBefore"
                type="number"
                className="form-control"
                value={form.eBefore}
                onChange={handleChange}
              />
            </div>
            <div className="col-6 mb-2">
              <label className="form-label">หน่วยไฟปัจจุบัน</label>
              <input
                id="eAfter"
                type="number"
                className="form-control"
                value={form.eAfter}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-3 d-flex justify-content-between">
            <Dialog.Close asChild>
              <button className="btn btn-secondary btn-sm px-3">ยกเลิก</button>
            </Dialog.Close>
            <button
              className="btn btn-success btn-sm px-3"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "กำลังสร้าง..." : "ยืนยันออกบิล"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
