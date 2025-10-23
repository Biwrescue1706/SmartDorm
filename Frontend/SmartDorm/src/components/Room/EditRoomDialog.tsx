import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRooms } from "../../hooks/useRooms";
import type { Room } from "../../types/Room";

interface Props {
  roomId: string;
  onSuccess: (room: Room) => void;
}

export default function EditRoomDialog({ roomId, onSuccess }: Props) {
  const [show, setShow] = useState(false);

  // ดึงข้อมูลจาก hook
  const { room, loading, loadRoom, updateRoom } = useRooms(roomId);

  // สถานะฟอร์มภายในคอมโพเนนต์ (แยกจาก room ใน hook)
  const [form, setForm] = useState<Room | null>(null);

  // เมื่อเปิด modal ให้โหลดข้อมูลห้อง
  useEffect(() => {
    if (show) loadRoom();
  }, [show]);

  // เมื่อ room จาก hook เปลี่ยน ให้อัปเดตแบบฟอร์มภายใน
  useEffect(() => {
    if (room) setForm(room);
  }, [room]);

  // บันทึก
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

      // หมายเหตุ: ถ้าใน hook มี Swal success แล้ว อาจไม่ต้องแสดงซ้ำที่นี่
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

      {/* Modal */}
      {show && form && (
        <div className="modal show d-block" tabIndex={-1}>
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-content shadow-lg rounded-4 border-0">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div
                  className="modal-header bg-teal-gradient justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #11998e, #38ef7d)",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                  }}
                >
                  <h5 className="modal-title fw-bold">แก้ไขข้อมูลห้อง</h5>
                </div>

                {/* Body */}
                <div className="modal-body p-4">
                  {/* หมายเลขห้อง */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">หมายเลขห้อง</label>
                    <input
                      className="form-control text-center"
                      value={form.number}
                      onChange={(e) =>
                        setForm((prev) => prev ? { ...prev, number: e.target.value } : prev)
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
                        setForm((prev) => prev ? { ...prev, size: e.target.value } : prev)
                      }
                      required
                    />
                  </div>

                  {/* ค่าเช่า */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">ค่าเช่า (บาท)</label>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={form.rent}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev ? { ...prev, rent: Number(e.target.value) } : prev
                        )
                      }
                      required
                    />
                  </div>

                  {/* เงินมัดจำ */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">เงินมัดจำ</label>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={form.deposit}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev ? { ...prev, deposit: Number(e.target.value) } : prev
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
                          prev ? { ...prev, bookingFee: Number(e.target.value) } : prev
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
                          prev ? { ...prev, status: Number(e.target.value) } : prev
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
                      border: "none",
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
                      border: "none",
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}