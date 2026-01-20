// src/hooks/usePendingCheckouts.ts
import { useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { GetAllCheckout } from "../../apis/endpoint.api";
import { toast } from "../../utils/toast";

export function usePendingCheckouts(intervalMs = 30000) {
  const [pendingCheckouts, setPendingCheckouts] = useState(0);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await fetch(`${API_BASE}${GetAllCheckout}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error();

        const json = await res.json();

        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.checkouts)
          ? json.checkouts
          : [];

        const pending = list.filter(
          (c: any) => c.ReturnApprovalStatus === 0
        ).length;
        setPendingCheckouts(pending);
      } catch {
        setPendingCheckouts(0);
        toast(
          "error",
          "โหลดข้อมูลไม่สำเร็จ",
          "ไม่สามารถโหลดสถานะการคืนห้องได้"
        );
      }
    };

    loadPending();
    const interval = setInterval(loadPending, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return pendingCheckouts;
}
