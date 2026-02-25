import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import type { Room } from "../../types/Room";
import { API_BASE } from "../../config";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface BillDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  reloadExistingBills: () => void;
}

// ✅ default form
const emptyForm = {
  month: "",
  wBefore: 0,
  wAfter: 0,
  eBefore: 0,
  eAfter: 0,
};

export default function BillDialog({
  open,
  onClose,
  room,
  reloadExistingBills,
}: BillDialogProps) {
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";
  const BG_SOFT = "#F8F5FC";
  const TEXT_DARK = "#2D1A47";

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ reset form เมื่อ dialog ปิด
  useEffect(() => {
    if (!open) setForm(emptyForm);
  }, [open]);

  // โหลดค่ามิเตอร์ครั้งก่อน
  useEffect(() => {
    if (!room) return;

    const loadPrev = async () => {
      try {
        const res = await fetch(`${API_BASE}/bill/getall`, {
          credentials: "include",
        });
        const data = await res.json();

        const latest = data
          .filter((b: any) => b.roomId === room.roomId)
          .sort(
            (a: any, b: any) =>
              new Date(b.month).getTime() - new Date(a.month).getTime(),
          )[0];

        if (latest) {
          setForm((prev) => ({
            ...prev,
            wBefore: latest.wAfter ?? 0,
            eBefore: latest.eAfter ?? 0,
          }));
        }
      } catch {}
    };

    loadPrev();
  }, [room]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  // ✅ cancel = reset + close
  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleSubmit = async () => {
    if (!room) return;

    if (!form.month) {
      handleClose();
      Swal.fire({
        title: "กรุณาเลือกเดือนก่อนออกบิล",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const selected = new Date(form.month);
    const billMonth = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      1,
      0,
      0,
      0,
    );

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/bill/createFromRoom/${room.roomId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wAfter: form.wAfter,
            eAfter: form.eAfter,
            month: billMonth.toISOString(),
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถสร้างบิลได้");

      await reloadExistingBills();
      handleClose();

      Swal.fire({
        title: "สร้างบิลสำเร็จแล้ว",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        navigate("/bill-overview");
      });
    } catch (err: any) {
      handleClose();
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.message,
        icon: "error",
        timer: 1800,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />

        <Dialog.Content
          className="position-fixed start-50 top-50 translate-middle shadow-lg rounded-4"
          style={{
            width: "92%",
            maxWidth: "480px",
            background: BG_SOFT,
            border: `3px solid ${SCB_PURPLE}`,
            overflow: "hidden",
            zIndex: 11000,
          }}
        >
          <Dialog.Title
            className="fw-bold text-center text-white py-2"
            style={{ background: SCB_PURPLE }}
          >
            ออกบิลห้อง {room?.number}
          </Dialog.Title>

          <Dialog.Description className="visually-hidden">
            ฟอร์มออกบิลห้องพัก
          </Dialog.Description>

          <div className="p-4 text-black">
            <label className="fw-semibold">เดือนที่ออกบิล</label>
            <input
              id="month"
              type="date"
              className="form-control shadow-sm mb-3"
              value={form.month}
              onChange={handleChange}
            />

            <label className="fw-semibold">มิเตอร์ปะปา ( ครั้งก่อน )</label>
            <input
              type="number"
              className="form-control shadow-sm mb-3"
              value={form.wBefore}
              disabled
            />

            <label className="fw-semibold">มิเตอร์ปะปา ( ปัจจุบัน )</label>
            <input
              id="wAfter"
              type="number"
              className="form-control shadow-sm mb-3"
              value={form.wAfter}
              onChange={handleChange}
            />

            <label className="fw-semibold">มิเตอร์ไฟฟ้า ( ครั้งก่อน )</label>
            <input
              type="number"
              className="form-control shadow-sm mb-3"
              value={form.eBefore}
              disabled
            />

            <label className="fw-semibold">มิเตอร์ไฟฟ้า ( ปัจจุบัน )</label>
            <input
              id="eAfter"
              type="number"
              className="form-control shadow-sm"
              value={form.eAfter}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-between border-top p-3">
            <button
              className="btn fw-bold px-4 text-white"
              onClick={handleClose}
              style={{ background: SCB_PURPLE }}
            >
              ยกเลิก
            </button>

            <button
              className="btn fw-bold px-4"
              style={{ background: SCB_GOLD, color: TEXT_DARK }}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "กำลังสร้าง..." : "ออกบิล"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}