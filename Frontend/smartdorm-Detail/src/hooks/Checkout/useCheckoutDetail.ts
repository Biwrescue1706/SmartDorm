// src/hooks/Checkout/useCheckoutDetail.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import type { Checkout } from "../../types/checkout";

export function useCheckoutDetail(checkoutId?: string) {
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/checkout/${checkoutId}`
        );

        if (!cancelled) {
          setCheckout(res.data.checkout);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error || "ไม่พบข้อมูลการคืนห้อง"
          );
          setCheckout(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutId]);

  return { checkout, loading, error };
}
