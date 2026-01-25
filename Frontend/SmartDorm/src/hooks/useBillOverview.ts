// src/hooks/useOverview.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import type {
  OverviewRoom,
  OverviewResponse,
} from "../types/Overview";

export function useOverview(year: number, month: number) {
  const [rooms, setRooms] = useState<OverviewRoom[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get<OverviewResponse>(
          `${API_BASE}/overview`,
          {
            params: { year, month },
            withCredentials: true,
          }
        );

        if (!mounted) return;

        setRooms(res.data.data);
        setTotalRooms(res.data.totalRooms);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [year, month]);

  return {
    rooms,
    totalRooms,
    loading,
    error,
  };
}