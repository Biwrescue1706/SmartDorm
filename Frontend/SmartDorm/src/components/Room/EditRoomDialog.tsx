import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRooms } from "../../hooks/ManageRooms/useRooms";
import type { Room } from "../../types/Room";
import { createPortal } from "react-dom";

interface Props {
  roomId: string;
  onSuccess: (room: Room) => void;
}

export default function EditRoomDialog({ roomId, onSuccess }: Props) {
  const [show, setShow] = useState(false);

  const { room, loading, loadRoom, updateRoom } = useRooms(roomId);

  const [form, setForm] = useState<Room | null>(null);

  useEffect(() => {
    if (show) loadRoom();
  }, [show]);

  useEffect(() => {
    if (room) setForm(room);
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    try {
      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const updated = await updateRoom({
        number: form.number,
        size: form.size,
        rent: form.rent,
        deposit: form.deposit,
        bookingFee: form.bookingFee,
        status: form.status,
      });

      Swal.fire({
        icon: "success",
        title: "แก้ไขห้องเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess(updated as Room);
      setShow(false);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: err.message || "ไม่สามารถแก้ไขห้องได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  if (loading && show) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  return (
    <>
      {/* ปุ่มเปิด modal */}
      <button
        className="btn btn-sm fw-semibold text-white px-2 mx-2 my-2 py-1"
        style={{
          background: "linear-gradient(100deg, #26ff05ff, #f9d849ff)",
          border: "none",
        }}
        onClick={() => setShow(true)}
      >
        ✏️
      </button>

      {/* Modal แก้ไข แล้วลอยออกจากการ์ดด้วย createPortal */}
      {show &&
        form &&
        createPortal(
          <div
            className="modal show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              zIndex: 2000,
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "500px" }}
            >
              <div className="modal-content shadow-lg rounded-4 border-0">
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div
                    className="modal-header justify-content-center"
                    style={{
                      background: "linear-gradient(135deg, #11998e, #38ef7d)",
                      borderTopLeftRadius: "1rem",
                      borderTopRightRadius: "1rem",
                    }}
                  >
                    <h5 className="modal-title fw-bold text-white">
                      แก้ไขข้อมูลห้อง
                    </h5>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-4">
                    {/* หมายเลขห้อง */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        หมายเลขห้อง
                      </label>
                      <input
                        className="form-control text-center"
                        value={form.number}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev ? { ...prev, number: e.target.value } : prev
                          )
                        }
                        required
                      />
                    </div>

                    {/* ขนาด */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">ขนาด</label>
                      <input
                        className="form-control text-center"
                        value={form.size}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev ? { ...prev, size: e.target.value } : prev
                          )
                        }
                        required
                      />
                    </div>

                    {/* ค่าเช่า */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        ค่าเช่า (บาท)
                      </label>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={form.rent}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, rent: Number(e.target.value) }
                              : prev
                          )
                        }
                        required
                      />
                    </div>

                    {/* เงินมัดจำ */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        เงินมัดจำ
                      </label>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={form.deposit}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, deposit: Number(e.target.value) }
                              : prev
                          )
                        }
                        required
                      />
                    </div>

                    {/* ค่าจอง */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">ค่าจอง</label>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={form.bookingFee}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, bookingFee: Number(e.target.value) }
                              : prev
                          )
                        }
                        required
                      />
                    </div>

                    {/* สถานะ */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">สถานะ</label>
                      <select
                        className="form-select text-center"
                        value={form.status}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, status: Number(e.target.value) }
                              : prev
                          )
                        }
                      >
                        <option value={0}>ว่าง</option>
                        <option value={1}>ไม่ว่าง</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer d-flex justify-content-between px-4 pb-3">
                    <button
                      type="button"
                      className="btn fw-semibold text-white px-4"
                      style={{
                        background: "linear-gradient(135deg, #ff512f, #dd2476)",
                      }}
                      onClick={() => setShow(false)}
                    >
                      ยกเลิก
                    </button>

                    <button
                      type="submit"
                      className="btn fw-semibold text-white px-4"
                      style={{
                        background: "linear-gradient(135deg, #11998e, #38ef7d)",
                      }}
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
