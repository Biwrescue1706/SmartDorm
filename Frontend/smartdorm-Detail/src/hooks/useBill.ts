import { useState, useEffect } from "react";
import axios from "axios";
import { Bill } from "../types/bill";
import { API_BASE } from "../config";

export function useBill(billId?: string) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) return;

    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/bill/${billId}`)
      .then((res) => setBill(res.data))
      .catch(() => setError("ไม่พบบิลนี้"))
      .finally(() => setLoading(false));
  }, [billId]);

  return { bill, loading, error };
}