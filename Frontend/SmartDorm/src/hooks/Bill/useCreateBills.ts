//src/hooks/bill/useCreateBills.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import type { Room, Booking, Bill, CreateBillPayload } from "../../types/BillCreate";

export function useCreateBills() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [r, b, bl] = await Promise.all([
      axios.get(`${API_BASE}/room/getall`),
      axios.get(`${API_BASE}/booking/getall`),
      axios.get(`${API_BASE}/bill/getall`),
    ]);

    setRooms(r.data);
    setBookings(b.data);
    setBills(bl.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createBill = async (
    roomId: string,
    payload: CreateBillPayload,
  ) => {
    await axios.post(
      `${API_BASE}/bill/createFromRoom/${roomId}`,
      payload,
    );
    await loadAll();
  };

  return {
    rooms,
    bookings,
    bills,
    loading,
    reload: loadAll,
    createBill,
  };
}