// src/components/Room/AddRoomDialog.tsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRooms } from "../../hooks/useRooms";
import type { Room } from "../../types/Room";

interface AddRoomDialogProps {
  onSuccess: (room?: Room) => void;
}

export default function AddRoomDialog({ onSuccess }: AddRoomDialogProps) {
  const [show, setShow] = useState(false);
  const [modalWidth, setModalWidth] = useState("480px");
  const [number, setNumber] = useState("");
  const [size, setSize] = useState("");
  const [rent, setRent] = useState<number | "">("");
  const [deposit, setDeposit] = useState<number | "">("");
  const [bookingFee, setBookingFee] = useState<number | "">(500);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const { fetchRooms, createRoom } = useRooms();

  // ปรับขนาด modal ตามหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setModalWidth(window.innerWidth < 1280 ? "420px" : "480px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // โหลดห้องที่เหลือว่าง
  const loadAvailableRooms = async () => {
    const data = await fetchRooms();
    const existing = data.map((r) => r.number);

    const allRooms = Array.from({ length: 11 * 20 }, (_, i) => {
      const floor = Math.floor(i / 20) + 1;
      const num = (i % 20) + 1;
      return `${floor}${num.toString().padStart(2, "0")}`;
    });

    const remaining = allRooms.filter((r) => !existing.includes(r));
    setAvailableRooms(remaining);
  };

  useEffect(() => {
    if (show) loadAvailableRooms();
  }, [show]);

  // 🧩 ตั้งราคาตามขนาด
  const setPriceBySize = (size: string) => {
    switch (size) {
      case "ก. 3.5 ม. * ย. 5.5 ม.":
        setRent(2500);
        setDeposit(2500);
        setBookingFee(500);
        break;
      case "ก. 4.5 ม. * ย. 5.5 ม.":
        setRent(3200);
        setDeposit(3200);
        setBookingFee(500);
        break;
      case "ก. 5.5 ม. * ย. 6.5 ม.":
        setRent(4000);
        setDeposit(4000);
        setBookingFee(500);
        break;
      case "ก. 6.5 ม. * ย. 7.5 ม.":
        setRent(4500);
        setDeposit(4500);
        setBookingFee(500);
        break;
      case "ก. 7.5 ม. * ย. 8.5 ม.":
        setRent(5000);
        setDeposit(5000);
        setBookingFee(500);
        break;
      default:
        setRent("");
        setDeposit("");
        setBookingFee(500);
    }
  };

  // 🧩 ตั้งค่าราคาตามหมายเลขห้อง (1–4, 5–8, ... 17–20)
  const setPriceByRoomNumber = (roomNum: string) => {
    if (!roomNum) return;
    const num = parseInt(roomNum.slice(-2));

    if (num >= 1 && num <= 4) {
      setSize("ก. 3.5 ม. * ย. 5.5 ม.");
      setRent(2500);
      setDeposit(2500);
      setBookingFee(500);
    } else if (num >= 5 && num <= 8) {
      setSize("ก. 4.5 ม. * ย. 5.5 ม.");
      setRent(3200);
      setDeposit(3200);
      setBookingFee(500);
    } else if (num >= 9 && num <= 12) {
      setSize("ก. 5.5 ม. * ย. 6.5 ม.");
      setRent(4000);
      setDeposit(4000);
      setBookingFee(500);
    } else if (num >= 13 && num <= 16) {
      setSize("ก. 6.5 ม. * ย. 7.5 ม.");
      setRent(4500);
      setDeposit(4500);
      setBookingFee(500);
    } else if (num >= 17 && num <= 20) {
      setSize("ก. 7.5 ม. * ย. 8.5 ม.");
      setRent(5000);
      setDeposit(5000);
      setBookingFee(500);
    } else {
      setSize("");
      setRent("");
      setDeposit("");
      setBookingFee(500);
    }
  };

  //  เพิ่มห้องใหม่
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        number,
        size,
        rent: Number(rent),
        deposit: Number(deposit),
        bookingFee: Number(bookingFee),
      };

      const newRoom = await createRoom(payload);

      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: `เพิ่มห้อง ${number} เรียบร้อยแล้ว`,
        timer: 1800,
        showConfirmButton: false,
      });

      onSuccess(newRoom);
      setShow(false);

      // รีเซ็ตฟอร์ม
      setNumber("");
      setSize("");
      setRent("");
      setDeposit("");
      setBookingFee(500);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: err?.message || "ไม่สามารถเพิ่มห้องได้",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      Swal.hideLoading();
    }
  };

  return (
    <>
      <div className="text-center mb-3">
        <button
          className="btn fw-bold text-white px-5 py-2"
          style={{
            background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            border: "none",
            borderRadius: "10px",
          }}
          onClick={() => setShow(true)}
        >
          เพิ่มห้อง
        </button>
      </div>

      {show && (
        <div className="modal show d-block" tabIndex={-1}>
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ width: modalWidth, maxWidth: "95%" }}
          >
            <div className="modal-content rounded-4 shadow border-0">
              <form onSubmit={handleSubmit}>
                <div
                  className="modal-header justify-content-center"
                  style={{
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    background: "linear-gradient(135deg, #11998e, #38ef7d)",
                  }}
                >
                  <h5 className="fw-bold text-white m-0">เพิ่มห้องใหม่</h5>
                </div>

                <div className="modal-body px-4 py-3">
                  {/* หมายเลขห้อง */}
                  <div className="mb-2">
                    <label className="fw-semibold mb-1">หมายเลขห้อง</label>
                    {availableRooms.length > 0 ? (
                      <select
                        className="form-select form-select-sm text-center rounded-3 shadow-sm"
                        value={number}
                        onChange={(e) => {
                          setNumber(e.target.value);
                          setPriceByRoomNumber(e.target.value);
                        }}
                        required
                      >
                        <option value="">เลือกห้อง</option>
                        {availableRooms.map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-control form-control-sm text-center rounded-3 shadow-sm"
                        placeholder="กรอกหมายเลขห้อง เช่น 301"
                        value={number}
                        onChange={(e) => {
                          setNumber(e.target.value);
                          setPriceByRoomNumber(e.target.value);
                        }}
                        required
                      />
                    )}
                  </div>

                  {/* ขนาดห้อง */}
                  <div className="mb-2">
                    <label className="fw-semibold mb-1">ขนาดห้อง</label>
                    <input
                      list="room-sizes"
                      type="text"
                      className="form-control form-control-sm text-center rounded-3 shadow-sm"
                      placeholder="เลือกหรือกรอกขนาดห้อง"
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value);
                        setPriceBySize(e.target.value);
                      }}
                      required
                    />
                    <datalist id="room-sizes">
                      <option value="ก. 3.5 ม. * ย. 5.5 ม." />
                      <option value="ก. 4.5 ม. * ย. 5.5 ม." />
                      <option value="ก. 5.5 ม. * ย. 6.5 ม." />
                      <option value="ก. 6.5 ม. * ย. 7.5 ม." />
                      <option value="ก. 7.5 ม. * ย. 8.5 ม." />
                    </datalist>
                  </div>

                  {/* ค่าเช่า */}
                  <div className="mb-2">
                    <label className="fw-semibold mb-1">ค่าเช่า (บาท)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center rounded-3 shadow-sm"
                      value={rent}
                      onChange={(e) =>
                        setRent(e.target.value ? Number(e.target.value) : "")
                      }
                      required
                    />
                  </div>

                  {/* ค่าประกัน */}
                  <div className="mb-2">
                    <label className="fw-semibold mb-1">ค่าประกัน (บาท)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center rounded-3 shadow-sm"
                      value={deposit}
                      onChange={(e) =>
                        setDeposit(e.target.value ? Number(e.target.value) : "")
                      }
                      required
                    />
                  </div>

                  {/* ค่าจอง */}
                  <div className="mb-2">
                    <label className="fw-semibold mb-1">ค่าจอง (บาท)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center rounded-3 shadow-sm"
                      value={bookingFee}
                      onChange={(e) =>
                        setBookingFee(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-between px-4 py-2">
                  <button
                    type="button"
                    className="btn btn-sm text-white fw-bold px-3"
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
                    className="btn btn-sm text-white fw-bold px-3"
                    style={{
                      background: "linear-gradient(135deg, #11998e, #38ef7d)",
                      border: "none",
                    }}
                  >
                    ยืนยัน
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
