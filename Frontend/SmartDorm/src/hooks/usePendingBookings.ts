// src/hooks/usePendingBookings.ts
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import { GetAllBooking } from "../apis/endpoint.api";

export function usePendingBookings(intervalMs = 30000) {
  const [pendingBookings, setPendingBookings] = useState(0);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await fetch(`${API_BASE}${GetAllBooking}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("โหลดการจองล้มเหลว");
        const data = await res.json();

        //  นับเฉพาะ status = 0
        const pending = data.filter((b: any) => b.status === 0).length;
        setPendingBookings(pending);
      } catch {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "โหลดข้อมูลการจองไม่สำเร็จ",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    };

    loadPending();
    const interval = setInterval(loadPending, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return pendingBookings;
}
