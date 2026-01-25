// src/hooks/useBillOverview.ts
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface Room {
  roomId: string;
  number: string;
}

interface Bill {
  billId: string;
  roomId: string;
  month: string;
  total: number;
  dueDate: string;
  billStatus: number;
}

const API = import.meta.env.VITE_API_BASE;

export function useBillOverview(year: number, month: number) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [rRooms, rBills] = await Promise.all([
          axios.get(`${API}/room/getall`),
          axios.get(`${API}/bill/getall`),
        ]);

        if (!mounted) return;
        setRooms(rRooms.data);
        setBills(rBills.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const years = useMemo(() => {
    const ys = bills.map((b) => new Date(b.month).getFullYear());
    return Array.from(new Set(ys)).sort((a, b) => b - a);
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = new Date(b.month);
      if (d.getFullYear() !== year) return false;
      if (d.getMonth() + 1 !== month) return false;
      return true;
    });
  }, [bills, year, month]);

  const billMap = useMemo(() => {
    const m = new Map<string, Bill>();
    filteredBills.forEach((b) => m.set(b.roomId, b));
    return m;
  }, [filteredBills]);

  return {
    rooms,
    bills,
    years,
    billMap,
    loading,
  };
}