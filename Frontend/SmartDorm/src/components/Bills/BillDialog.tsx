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

  //  โหลดบิลล่าสุดของห้อง เพื่อเติมค่าหน่วยก่อนหน้าอัตโนมัติ
  useEffect(() => {
    if (!room) return;

    const loadPrevBill = async () => {
      try {
        const res = await fetch(`${API_BASE}/bill/getall`, {
          credentials: "include",
        });
        const data = await res.json();

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

  //  ฟังก์ชันเปลี่ยนค่า input (แปลง number ทันที)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setForm({
      ...form,
      [id]: type === "number" ? Number(value) : value, //  convert เป็น number ถ้าเป็น input[type=number]
    });
  };

  //  ฟังก์ชันกดยืนยันสร้างบิล
  const handleSubmit = async () => {
    if (!room) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        month: form.month ? new Date(form.month).toISOString() : null,
      };

      const res = await fetch(
        `${API_BASE}/bill/createFromRoom/${room.roomId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถสร้างบิลได้");

      alert(" สร้างบิลสำเร็จ");
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
          className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg"
          style={{
            width: "90%",
            maxWidth: "460px",
            maxHeight: "85vh",
            overflowY: "auto",
            zIndex: 1100,
          }}
        >
          <Dialog.Title asChild>
            <h5
              className="text-center text-white fw-bold py-2 mb-3 rounded-top-4"
              style={{
                background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                fontSize: "1rem",
                position: "sticky",
                top: 0,
                zIndex: 5,
              }}
            >
              ออกบิลห้อง {room?.number}
            </h5>
          </Dialog.Title>
          <Dialog.Description asChild>
            <p className="visually-hidden">แบบฟอร์มสำหรับออกบิลห้องพัก</p>
          </Dialog.Description>

          <div className="px-4 pb-3">
            <div className="mb-3">
              <label htmlFor="month" className="form-label fw-semibold mb-1">
                เดือนที่ออกบิล
              </label>
              <input
                id="month"
                type="date"
                className="form-control form-control-lg rounded-3 shadow-sm"
                value={form.month}
                onChange={handleChange}
              />
            </div>

            <div className="row mb-4">
              <div>
                <label
                  htmlFor="wBefore"
                  className="form-label fw-semibold mb-1"
                >
                  หน่วยน้ำก่อนหน้า
                </label>
                <input
                  id="wBefore"
                  type="number"
                  className="form-control form-control-lg rounded-3 shadow-sm"
                  value={form.wBefore}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-4">
              <div>
                <label htmlFor="wAfter" className="form-label fw-semibold mb-1">
                  หน่วยน้ำปัจจุบัน
                </label>
                <input
                  id="wAfter"
                  type="number"
                  className="form-control form-control-lg rounded-3 shadow-sm"
                  value={form.wAfter}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-4">
              <div>
                <label
                  htmlFor="eBefore"
                  className="form-label fw-semibold mb-1"
                >
                  หน่วยไฟก่อนหน้า
                </label>
                <input
                  id="eBefore"
                  type="number"
                  className="form-control form-control-lg rounded-3 shadow-sm"
                  value={form.eBefore}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-4">
              <div>
                <label htmlFor="eAfter" className="form-label fw-semibold mb-1">
                  หน่วยไฟปัจจุบัน
                </label>
                <input
                  id="eAfter"
                  type="number"
                  className="form-control form-control-lg rounded-3 shadow-sm"
                  value={form.eAfter}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between p-3 border-top">
            <Dialog.Close asChild>
              <button
                className="btn text-white fw-bold mx-4 px-4"
                style={{
                  background: "linear-gradient(135deg, #ff512f, #dd2476)",
                  border: "none",
                }}
              >
                ยกเลิก
              </button>
            </Dialog.Close>
            <button
              className="btn text-white fw-bold mx-4 px-4"
              style={{
                background: "linear-gradient(135deg, #11998e, #38ef7d)",
                border: "none",
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "กำลังสร้าง..." : "ออกบิล"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
