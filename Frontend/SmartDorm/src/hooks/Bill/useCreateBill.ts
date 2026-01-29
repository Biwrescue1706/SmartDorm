// src/hooks/Bill/useCreateBill.ts
import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

export function useCreateBill() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [existingBills, setExistingBills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState(0);

  const loadRooms = async () => {
    const res = await fetch(`${API_BASE}/room/getall`, {
      credentials: "include",
    });
    const data: Room[] = await res.json();
    setRooms(data.filter((r) => r.status === 1));
  };

  const loadBookings = async () => {
    const res = await fetch(`${API_BASE}/booking/getall`, {
      credentials: "include",
    });
    const data: Booking[] = await res.json();

    const approved = data.filter((b) => b.approveStatus === 1);
    setBookings(approved);

    // ใช้ checkinAt แทน actualCheckin
    setPendingBookings(data.filter((b) => !b.checkinAt).length);
  };

  const loadExistingBills = async () => {
    const res = await fetch(`${API_BASE}/bill/getall`, {
      credentials: "include",
    });
    const data = await res.json();

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const roomIds = data
      .filter((b: any) => {
        const billDate = new Date(b.month);
        return (
          billDate.getMonth() === thisMonth &&
          billDate.getFullYear() === thisYear
        );
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

  // สำหรับหน้า "สร้างบิลหน้าเดียวจบ"
  const createBill = async (
    roomId: string,
    payload: { month: string; wAfter: number; eAfter: number },
  ) => {
    const res = await fetch(
      `${API_BASE}/bill/createFromRoom/${roomId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "สร้างบิลไม่สำเร็จ");
    }

    await reloadAll();
  };

  return {
    rooms,
    bookings,
    existingBills,
    loading,
    pendingBookings,
    reloadAll,
    createBill,
  };
}