// src/hooks/Bill/useCreateBill.ts
import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import type { Room } from "../../types/Room";
import type { Booking } from "../../types/Booking";

export function useCreateBill() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState(0);

  const loadRooms = async () => {
    const res = await fetch(`${API_BASE}/room/getall`, {
      credentials: "include",
    });
    const data: any[] = await res.json();
    setRooms(data.filter((r) => r.status === 1));
  };

  const loadBookings = async () => {
    const res = await fetch(`${API_BASE}/booking/getall`, {
      credentials: "include",
    });
    const data: any[] = await res.json();

    const approved = data.filter((b) => b.approveStatus === 1);
    setBookings(approved);

    setPendingBookings(data.filter((b) => !b.checkinAt).length);
  };

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([loadRooms(), loadBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

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
    loading,
    pendingBookings,
    reloadAll,
    createBill,
  };
}