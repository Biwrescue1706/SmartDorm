import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { checkinBookings } from "../apis/endpoint.api";
import type { Booking } from "../types/booking";

export function useBookingDetail(bookingId?: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const res = await fetch(`${API_BASE}${checkinBookings(bookingId)}`);
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error("❌ Fetch booking failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  return { booking, loading };
}
