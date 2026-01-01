// src/components/Booking/EditBookingDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { API_BASE } from "../../config";
import Swal from "sweetalert2";
import { UpdateBooking } from "../../apis/endpoint.api";

interface Props {
  booking: any;
  onSuccess: () => void;
}

export default function EditBookingDialog({ booking, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ctitle: booking.ctitle || "",
    cname: booking.cname || "",
    csurname: booking.csurname || "",
    cphone: booking.cphone || "",
    cmumId: booking.cmumId || "",
    approveStatus: booking.approveStatus ?? 0,
    checkinStatus: booking.checkinStatus ?? 0,
    checkoutStatus: booking.checkoutStatus ?? 0,
  });

  // =================== Validation + Save ===================
  const handleSave = async () => {
    // ตรวจสอบคำนำหน้า
    if (!form.ctitle) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกคำนำหน้า",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // ตรวจสอบชื่อ
    if (!form.cname || form.cname.trim().length < 1) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อ",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // ตรวจสอบนามสกุล
    if (!form.csurname || form.csurname.trim().length < 1) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกนามสกุล",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // ตรวจสอบเบอร์โทร 10 หลัก
    if (!form.cphone || !/^\d{10}$/.test(form.cphone)) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกเบอร์โทร 10 หลัก",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // ตรวจสอบเลขบัตรประชาชน 13 หลัก
    if (!form.cmumId || !/^\d{13}$/.test(form.cmumId)) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกเลขบัตรประชาชน 13 หลัก",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // =================== Save ===================
    try {
      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(
        `${API_BASE}${UpdateBooking(booking.bookingId)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "แก้ไขข้อมูลผู้จองเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });

      setOpen(false);
      onSuccess();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* ปุ่มเปิด Dialog */}
      <Dialog.Trigger asChild>
        <button
          className="btn btn-sm fw-semibold text-white ms-2 mt-1 mx-2 my-1 "
          style={{
            background: "linear-gradient(135deg, #005effff, #33ff00ff)",
            border: "none",
            padding: "4px 8px",
          }}
        >
          ✏️
        </button>
      </Dialog.Trigger>

      {/* กล่อง Dialog */}
      <Dialog.Portal>
        {/* พื้นหลังโปร่งแสง */}
        <Dialog.Overlay
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
        />

        {/* เนื้อหา Dialog */}
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
          {/* Title */}
          <Dialog.Title asChild>
            <h3
              className="text-center text-white fw-bold py-2 mb-3 rounded-top-4"
              style={{
                background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                position: "sticky",
                top: 0,
                zIndex: 5,
              }}
            >
              แก้ไขข้อมูลผู้จอง
            </h3>
          </Dialog.Title>

          <Dialog.Description asChild>
            <p className="visually-hidden">
              แบบฟอร์มสำหรับแก้ไขข้อมูลผู้จองในระบบ SmartDorm
            </p>
          </Dialog.Description>

          {/* ฟอร์ม */}
          <div className="px-4 pb-3">
            {/* คำนำหน้า */}
            <div className="row align-items-center mb-3">
              <label className="col-4 col-form-label fw-bold text-center">
                คำนำหน้า
              </label>
              <div className="col-7">
                <select
                  className="form-select border-0 bg-light shadow-sm rounded-3 text-center"
                  value={form.ctitle}
                  onChange={(e) => setForm({ ...form, ctitle: e.target.value })}
                >
                  <option value="">-- เลือกคำนำหน้า --</option>
                  <option value="ด.ช.">เด็กชาย</option>
                  <option value="นาย">นาย</option>
                  <option value="ด.ญ.">เด็กหญิง</option>
                  <option value="นาง">นาง</option>
                  <option value="น.ส.">น.ส.</option>
                </select>
              </div>
            </div>

            {/* ชื่อ */}
            <div className="row align-items-center mb-3">
              <label className="col-4 col-form-label fw-bold text-center">
                ชื่อ
              </label>
              <div className="col-7">
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-sm rounded-3 text-center"
                  placeholder="ชื่อผู้จอง"
                  value={form.cname}
                  onChange={(e) =>
                    setForm({ ...form, cname: e.target.value })
                  }
                />
              </div>
            </div>

            {/* นามสกุล */}
            <div className="row align-items-center mb-3">
              <label className="col-4 col-form-label fw-bold text-center">
                นามสกุล
              </label>
              <div className="col-7">
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-sm rounded-3 text-center"
                  placeholder="นามสกุล"
                  value={form.csurname}
                  onChange={(e) =>
                    setForm({ ...form, csurname: e.target.value })
                  }
                />
              </div>
            </div>

            {/* เบอร์โทร */}
            <div className="row align-items-center mb-3">
              <label className="col-4 col-form-label fw-bold text-center">
                เบอร์โทร
              </label>
              <div className="col-7">
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-sm rounded-3 text-center"
                  placeholder="0xxxxxxxxx"
                  value={form.cphone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setForm({ ...form, cphone: val });
                  }}
                />
              </div>
            </div>

            {/* เลขบัตรประชาชน */}
            <div className="row align-items-center mb-3">
              <label className="col-4 col-form-label fw-bold text-center">
                เลขบัตรประชาชน
              </label>
              <div className="col-7">
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-sm rounded-3 text-center"
                  placeholder="เลข 13 หลัก"
                  value={form.cmumId}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 13) setForm({ ...form, cmumId: val });
                  }}
                />
              </div>
            </div>

            {/* สถานะ */}
            <div className="row align-items-center mb-3">
              <label className="col-4 col-form-label fw-bold text-center">
                สถานะ
              </label>
              <div className="col-7">
                <select
                  className="form-select border-0 bg-light shadow-sm rounded-3 text-center"
                  value={form.approveStatus}
                  onChange={(e) =>
                    setForm({ ...form, approveStatus: Number(e.target.value) })
                  }
                >
                  <option value={0}>รออนุมัติ</option>
                  <option value={1}>อนุมัติแล้ว</option>
                  <option value={2}>ไม่อนุมัติ</option>
                </select>
              </div>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="d-flex justify-content-between p-3 border-top">
            <Dialog.Close asChild>
              <button
                className="btn text-white fw-bold px-4"
                style={{
                  background: "linear-gradient(135deg, #ff512f, #dd2476)",
                  border: "none",
                }}
              >
                ยกเลิก
              </button>
            </Dialog.Close>

            <button
              className="btn text-white fw-bold px-4"
              style={{
                background: "linear-gradient(135deg, #11998e, #38ef7d)",
                border: "none",
              }}
              onClick={handleSave}
            >
              บันทึก
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}