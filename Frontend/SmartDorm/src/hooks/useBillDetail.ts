import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import type { Bill } from "../types/All";

export const useBillDetail = (billId?: string) => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/bill/${billId}`, {
          withCredentials: true,
        });

        if (!mounted) return;
        setBill(res.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (billId) load();

    return () => {
      mounted = false;
    };
  }, [billId]);

  return { bill, loading };
};