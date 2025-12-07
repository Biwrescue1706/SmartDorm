// src/hooks/usePendingBookings.ts
import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { GetAllBooking } from "../apis/endpoint.api";
import { toast } from "../utils/toast"; // ⬅️ ใช้ toast กลาง

export function usePendingBookings(intervalMs = 30000) {
  const [pendingBookings, setPendingBookings] = useState(0);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await fetch(`${API_BASE}${GetAllBooking}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error();
        const data = await res.json();

        // ✔️ นับเฉพาะ status = 0 (รออนุมัติ)
        const pending = data.filter((b: any) => b.status === 0).length;
        setPendingBookings(pending);
      } catch {
        toast("error", "โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดสถานะการจองได้");
      }
    };

    loadPending();
    const interval = setInterval(loadPending, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return pendingBookings;
}
