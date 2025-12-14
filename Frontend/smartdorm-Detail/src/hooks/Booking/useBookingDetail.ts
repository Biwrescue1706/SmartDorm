//src/hooks/Booking/useBookingDetail.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import type { Booking } from "../../types/booking";

export function useBookingDetail(bookingId?: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/booking/${bookingId}`
        );
        if (!cancelled) setBooking(res.data);
      } catch (err: any) {
        if (!cancelled)
          setError(
            err?.response?.data?.error ||
              "ไม่พบข้อมูลการจอง"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return { booking, loading, error };
}
