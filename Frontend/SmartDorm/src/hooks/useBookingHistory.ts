// src/hooks/useBookingHistory.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import type { BookingHistory } from "../types/BookingHistory";

export function useBookingHistory() {
  const [data, setData] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/booking/history`, {
        withCredentials: true,
      });
      setData(res.data.bookings || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = data.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.room?.number?.toLowerCase().includes(q) ||
      b.fullName?.toLowerCase().includes(q) ||
      b.customer?.userName?.toLowerCase().includes(q) ||
      b.cphone?.includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const ra = Number(a.room?.number) || 0;
    const rb = Number(b.room?.number) || 0;
    return ra - rb;
  });

  return {
    data: sorted,
    loading,
    search,
    setSearch,
    refetch: fetchHistory,
  }
}
