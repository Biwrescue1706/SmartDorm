// src/components/Room/EditRoomDialog.tsx
import { useState, useEffect } from "react";
import { useRooms } from "../../hooks/ManageRooms/useRooms";
import type { Room } from "../../types/All";
import { createPortal } from "react-dom";
import { toast } from "../../utils/toast";

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

  // 🔥 reset ค่าเวลาเปิด (ให้เลือกใหม่)
  useEffect(() => {
    if (room) {
      setForm(room); // 👈 ใช้ของเดิมเลย
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    try {
      toast("info", "กำลังบันทึก...", "กรุณารอสักครู่");

      const updated = await updateRoom({
        number: form.number,
        size: form.size,
        rent: form.rent,
        deposit: form.deposit,
        bookingFee: form.bookingFee,
        status: form.status,
      });

      toast("success", "แก้ไขห้องเรียบร้อยแล้ว");

      onSuccess(updated as Room);
      setShow(false);
    } catch (err: any) {
      toast("error", "ล้มเหลว", err.message || "ไม่สามารถแก้ไขห้องได้");
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
      <button
        className="btn btn-sm text-white px-2 mx-2 my-2 py-1"
        style={{
          background: "linear-gradient(100deg, #26ff05ff, #f9d849ff)",
          border: "none",
        }}
        onClick={() => setShow(true)}
      >
        ✏️
      </button>

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
                  <div className="modal-body p-4 text-center fw-bold h6">
                    {/* ห้อง */}
                    <div className="mb-3">
                      <label className="form-label">ห้อง</label>
                      <input
                        className="form-control text-center"
                        value={form.number}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev ? { ...prev, number: e.target.value } : prev,
                          )
                        }
                        required
                      />
                    </div>

                    {/* 🔥 ขนาด (เลือกเอง) */}
                    <div className="mb-3">
                      <label className="form-label">ขนาด</label>
                      <input
                        list="room-sizes"
                        className="form-control text-center"
                        placeholder="เลือกหรือพิมพ์ขนาด"
                        value={form.size || ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          let data = {
                            size: value,
                            rent: form.rent,
                            deposit: form.deposit,
                            bookingFee: form.bookingFee,
                          };

                          if (value.includes("19.25")) {
                            data = {
                              size: "19.25 ตร.ม. (3.5 × 5.5 ม.)",
                              rent: 2500,
                              deposit: 2500,
                              bookingFee: 500,
                            };
                          } else if (value.includes("24.75")) {
                            data = {
                              size: "24.75 ตร.ม. (4.5 × 5.5 ม.)",
                              rent: 3200,
                              deposit: 3200,
                              bookingFee: 500,
                            };
                          } else if (value.includes("36.75")) {
                            data = {
                              size: "36.75 ตร.ม. (5.5 × 6.5 ม.)",
                              rent: 4000,
                              deposit: 4000,
                              bookingFee: 500,
                            };
                          }

                          setForm((prev) =>
                            prev ? { ...prev, ...data } : prev,
                          );
                        }}
                      />

                      <datalist id="room-sizes">
                        <option value="19.25 ตร.ม. (3.5 × 5.5 ม.)" />
                        <option value="24.75 ตร.ม. (4.5 × 5.5 ม.)" />
                        <option value="36.75 ตร.ม. (5.5 × 6.5 ม.)" />
                        <option value="48.75 ตร.ม. (6.5 × 7.5 ม.)" />
                        <option value="63.75 ตร.ม. (7.5 × 8.5 ม.)" />
                      </datalist>
                    </div>

                    {/* ค่าเช่า */}
                    <div className="mb-3">
                      <label className="form-label">ค่าเช่า (บาท)</label>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={form.rent}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, rent: Number(e.target.value) }
                              : prev,
                          )
                        }
                      />
                    </div>

                    {/* เงินมัดจำ */}
                    <div className="mb-3">
                      <label className="form-label">เงินมัดจำ</label>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={form.deposit}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, deposit: Number(e.target.value) }
                              : prev,
                          )
                        }
                      />
                    </div>

                    {/* ค่าจอง */}
                    <div className="mb-3">
                      <label className="form-label">ค่าจอง</label>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={form.bookingFee}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, bookingFee: Number(e.target.value) }
                              : prev,
                          )
                        }
                      />
                    </div>

                    {/* สถานะ */}
                    <div className="mb-3">
                      <label className="form-label">สถานะ</label>
                      <select
                        className="form-select text-center"
                        value={form.status}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev
                              ? { ...prev, status: Number(e.target.value) }
                              : prev,
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
                      className="btn text-white px-4"
                      style={{
                        background: "linear-gradient(135deg, #ff512f, #dd2476)",
                      }}
                      onClick={() => setShow(false)}
                    >
                      ยกเลิก
                    </button>

                    <button
                      type="submit"
                      className="btn text-white px-4"
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
          document.body,
        )}
    </>
  );
}
