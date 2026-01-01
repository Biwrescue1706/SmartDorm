// src/hooks/useCreateBill.ts
import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import type { Room } from "../types/Room";
import type { Booking } from "../types/Booking";

export function useCreateBill() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [existingBills, setExistingBills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState(0);

  const loadRooms = async () => {
    const res = await fetch(`${API_BASE}/room/getall`, { credentials: "include" });
    const data: Room[] = await res.json();
    setRooms(data.filter((r) => r.status === 1));
  };

  const loadBookings = async () => {
    const res = await fetch(`${API_BASE}/booking/getall`, { credentials: "include" });
    const data: Booking[] = await res.json();
    setBookings(data.filter((b) => b.approveStatus === 1));
    // แก้ตรงนี้เป็น checkinAt แทน actualCheckin
    setPendingBookings(data.filter((b) => !b.checkinAt).length);
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

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([loadRooms(), loadBookings(), loadExistingBills()]);
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