// src/pages/Bills.tsx
import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Dialog from "@radix-ui/react-dialog";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import type { Room } from "../types/Room";
import type { Booking } from "../types/Booking";

export default function Bills() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [existingBills, setExistingBills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState(0);
  const { message, handleLogout, role } = useAuth();

  const [canCreateBill, setCanCreateBill] = useState(false);
  const [todayStr, setTodayStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== Dialog state =====
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    month: "",
    wBefore: 0,
    wAfter: 0,
    eBefore: 0,
    eAfter: 0,
  });

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthsThai = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    return `${date.getDate()} ${monthsThai[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  // ตรวจว่าวันนี้ออกบิลได้ไหม (15–31 เท่านั้น)
  useEffect(() => {
    const now = new Date();
    setTodayStr(formatThaiDate(now.toISOString()));
    setCanCreateBill(now.getDate() >= 15 && now.getDate() <= 31);
  }, []);

  // โหลดข้อมูล
  const loadRooms = async () => {
    const res = await fetch(`${API_BASE}/room/getall`, { credentials: "include" });
    const data: Room[] = await res.json();
    setRooms(data.filter((r) => r.status === 1));
    setLoading(false);
  };

  const loadBookings = async () => {
    const res = await fetch(`${API_BASE}/booking/getall`, { credentials: "include" });
    const data: Booking[] = await res.json();
    setBookings(data.filter((b) => b.approveStatus === 1));
    setPendingBookings(data.filter((b) => b.actualCheckin === 0).length);
  };

  const loadExistingBills = async () => {
    const res = await fetch(`${API_BASE}/bill/getall`, { credentials: "include" });
    const data = await res.json();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const roomIds = data
      .filter((b: any) => {
        const billDate = new Date(b.month);
        return billDate.getMonth() === thisMonth && billDate.getFullYear() === thisYear;
      })
      .map((b: any) => b.roomId);
    setExistingBills(roomIds);
  };

  useEffect(() => {
    loadRooms();
    loadBookings();
    loadExistingBills();
  }, []);

  // ===== Handlers =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id.includes("Before") || id.includes("After") ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.month || !formData.wAfter || !formData.eAfter) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (formData.wAfter < formData.wBefore || formData.eAfter < formData.eBefore) {
      alert("ค่าปัจจุบันต้องมากกว่าค่าก่อนหน้า");
      return;
    }
    if (!selectedRoom) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/bill/createFromRoom/${selectedRoom.roomId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สร้างบิลไม่สำเร็จ");

      alert("✅ สร้างบิลสำเร็จ");
      await loadExistingBills();
      setOpen(false);
    } catch (err: any) {
      alert("❌ สร้างบิลไม่สำเร็จ: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
      <Nav message={message} onLogout={handleLogout} pendingBookings={pendingBookings} role={role} />

      <main className="main-content flex-grow-1 px-1 py-5 mt-3 mt-lg-3">
        <div className="mx-auto container-max">
          <h2 className="mt-4 mb-3 fw-bold text-center">สร้างบิลห้องพัก</h2>
          <div className="text-center mb-3 text-muted">
            วันนี้: <b>{todayStr}</b>
          </div>

          {!canCreateBill && (
            <div className="alert alert-warning text-center fw-semibold">
              ออกบิลได้เฉพาะวันที่ <b>15–31 ของเดือน</b> เท่านั้น
            </div>
          )}

          {loading ? (
            <p className="text-center">กำลังโหลดข้อมูล...</p>
          ) : (
            <div className="table-responsive bg-white shadow-sm rounded-3 p-2">
              <table className="table table-hover table-striped mb-0 align-middle text-center">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>หมายเลขห้อง</th>
                    <th>ค่าเช่า</th>
                    <th>วันเข้าพัก</th>
                    <th>สถานะรอบบิล</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room, index) => {
                    const booking = bookings.find((b) => b.room.number === room.number);
                    const checkinText = booking ? formatThaiDate(booking.actualCheckin) : "-";
                    const hasBillThisMonth = existingBills.includes(room.roomId);

                    return (
                      <tr key={room.roomId}>
                        <td>{index + 1}</td>
                        <td>{room.number}</td>
                        <td>{room.rent.toLocaleString()}</td>
                        <td>{checkinText}</td>
                        <td>
                          {canCreateBill && !hasBillThisMonth ? (
                            <button
                              className="btn btn-primary btn-sm fw-semibold"
                              onClick={() => {
                                setSelectedRoom(room);
                                setFormData({
                                  month: "",
                                  wBefore: 0,
                                  wAfter: 0,
                                  eBefore: 0,
                                  eAfter: 0,
                                });
                                setOpen(true);
                              }}
                            >
                              ออกบิล
                            </button>
                          ) : (
                            <button className="btn btn-secondary btn-sm fw-semibold" disabled>
                              ปิดรอบออกบิล
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 🧾 Dialog: ออกบิล */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
          <Dialog.Content
            className="position-fixed top-50 start-50 translate-middle card shadow-lg border-0 rounded-4 p-4"
            style={{ width: "400px" }}
          >
            <Dialog.Title className="fw-bold text-center mb-3">
              ออกบิลห้อง {selectedRoom?.number}
            </Dialog.Title>
            <Dialog.Description className="visually-hidden">
              แบบฟอร์มกรอกข้อมูลการออกบิล
            </Dialog.Description>

            {selectedRoom ? (
              <>
                <div className="mb-2">
                  <label className="form-label">เดือนที่ออกบิล</label>
                  <input
                    id="month"
                    type="date"
                    className="form-control"
                    value={formData.month}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label">หน่วยน้ำก่อนหน้า</label>
                    <input
                      id="wBefore"
                      type="number"
                      className="form-control"
                      value={formData.wBefore}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">หน่วยน้ำปัจจุบัน</label>
                    <input
                      id="wAfter"
                      type="number"
                      className="form-control"
                      value={formData.wAfter}
                      onChange={handleInputChange}
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
                      value={formData.eBefore}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">หน่วยไฟปัจจุบัน</label>
                    <input
                      id="eAfter"
                      type="number"
                      className="form-control"
                      value={formData.eAfter}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-between">
                  <Dialog.Close asChild>
                    <button className="btn btn-secondary btn-sm px-3">ยกเลิก</button>
                  </Dialog.Close>
                  <button
                    className="btn btn-success btn-sm px-3"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "กำลังสร้าง..." : "ยืนยันออกบิล"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-muted">ไม่พบข้อมูลห้อง</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}