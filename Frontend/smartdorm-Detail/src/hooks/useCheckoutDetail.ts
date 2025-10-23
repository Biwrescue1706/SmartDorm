import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { checkoutBooking } from "../apis/endpoint.api";
import type { Booking } from "../types/checkout";

export function useCheckoutDetail(bookingId?: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckout() {
      if (!bookingId) return;
      try {
        const res = await fetch(`${API_BASE}${checkoutBooking(bookingId)}`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error("❌ Fetch checkout failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCheckout();
  }, [bookingId]);

  return { booking, loading };
}
