import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

export function useCreateBill() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [existingBills, setExistingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState(0);

  // โหลดห้อง
  const loadRooms = async () => {
    const res = await fetch(`${API_BASE}/room/getall`, {
      credentials: "include",
    });
    const data: Room[] = await res.json();
    setRooms(data.filter((r) => r.status === 1));
  };

  // โหลด booking
  const loadBookings = async () => {
    const res = await fetch(`${API_BASE}/booking/getall`, {
      credentials: "include",
    });
    const data: Booking[] = await res.json();

    const approved = data.filter((b) => b.approveStatus === 1);
    setBookings(approved);

    // ยังไม่ check-in จริง
    setPendingBookings(approved.filter((b) => !b.checkinAt).length);
  };

  // โหลดบิล (สำคัญ)
  // ❗ เก็บ bill object เต็ม ๆ
  const loadExistingBills = async () => {
    const res = await fetch(`${API_BASE}/bill/getall`, {
      credentials: "include",
    });
    const data = await res.json();

    setExistingBills(data);
  };

  // reload ทั้งหมด
  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadRooms(),
      loadBookings(),
      loadExistingBills(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  return {
    rooms,
    bookings,
    existingBills,
    loading,
    pendingBookings,
    reloadAll,
  };
}
