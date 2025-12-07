// src/components/Bills/BillDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import type { Room } from "../../types/Room";
import { API_BASE } from "../../config";
import Swal from "sweetalert2";

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
  // SCB Theme
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";
  const BG_SOFT = "#F8F5FC";
  const TEXT_DARK = "#2D1A47";

  const [form, setForm] = useState({
    month: "",
    wBefore: 0,
    wAfter: 0,
    eBefore: 0,
    eAfter: 0,
  });

  const [loading, setLoading] = useState(false);

  // โหลดค่าเดิม
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
              new Date(b.month).getTime() - new Date(a.month).getTime()
          )[0];

        if (latest) {
          setForm((prev) => ({
            ...prev,
            wBefore: latest.wAfter,
            eBefore: latest.eAfter,
          }));
        }
      } catch {}
    };

    loadPrev();
  }, [room]);

  // เปลี่ยนค่า input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  // ปิด dialog + reset เฉพาะค่าปัจจุบัน
  const handleClose = () => {
    setForm((prev) => ({
      ...prev,
      month: "",
      wAfter: 0,
      eAfter: 0,
    }));
    onClose();
  };

  // บันทึกบิล
  const handleSubmit = async () => {
    if (!room) return;
    if (!form.month) {
      Swal.fire("กรุณาเลือกเดือนก่อนออกบิล", "", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/bill/createFromRoom/${room.roomId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            month: new Date(form.month).toISOString(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถสร้างบิลได้");

      await reloadExistingBills();
      onClose();

      Swal.fire("สร้างบิลสำเร็จแล้ว", "", "success");
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* ฉากดำด้านหลัง */}
        <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />

        {/* กล่อง Dialog */}
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
          {/* หัว Dialog */}
          <Dialog.Title
            className="fw-bold text-center text-white py-2"
            style={{
              background: SCB_PURPLE,
              fontSize: "1.1rem",
            }}
          >
            ออกบิลห้อง {room?.number}
          </Dialog.Title>

          {/* 🟢 เพิ่ม Description ตรงนี้เพื่อแก้ Warning */}
          <Dialog.Description className="visually-hidden">
            แบบฟอร์มสร้างบิลห้องพัก กรุณากรอกข้อมูลหน่วยน้ำและหน่วยไฟ
          </Dialog.Description>

          {/* FORM CONTENT */}
          <div className="p-4">
            <label className="fw-semibold">เดือนที่ออกบิล</label>
            <input
              id="month"
              type="date"
              className="form-control shadow-sm mb-3"
              value={form.month}
              onChange={handleChange}
            />

            <label className="fw-semibold">หน่วยน้ำก่อนหน้า</label>
            <input
              id="wBefore"
              type="number"
              className="form-control shadow-sm mb-3"
              value={form.wBefore}
              disabled
            />

            <label className="fw-semibold">หน่วยน้ำปัจจุบัน</label>
            <input
              id="wAfter"
              type="number"
              className="form-control shadow-sm mb-3"
              value={form.wAfter}
              onChange={handleChange}
            />

            <label className="fw-semibold">หน่วยไฟก่อนหน้า</label>
            <input
              id="eBefore"
              type="number"
              className="form-control shadow-sm mb-3"
              value={form.eBefore}
              disabled
            />

            <label className="fw-semibold">หน่วยไฟปัจจุบัน</label>
            <input
              id="eAfter"
              type="number"
              className="form-control shadow-sm"
              value={form.eAfter}
              onChange={handleChange}
            />
          </div>

          {/* ปุ่มท้าย */}
          <div className="d-flex justify-content-between border-top p-3">
            <Dialog.Close asChild>
              <button
                className="btn fw-bold px-4 text-white"
                onClick={handleClose}
                style={{ background: SCB_PURPLE }}
              >
                ยกเลิก
              </button>
            </Dialog.Close>

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
