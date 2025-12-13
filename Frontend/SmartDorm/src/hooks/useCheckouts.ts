import { useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type { Checkout } from "../types/Checkout";

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);

  //📦 GET ALL
  const fetchCheckouts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/checkout/getall`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("โหลดข้อมูลการคืนไม่สำเร็จ");
      const data = await res.json();

      if (Array.isArray(data)) setCheckouts(data);
      else if (Array.isArray(data?.checkouts)) setCheckouts(data.checkouts);
      else setCheckouts([]);
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  //   ✅ APPROVE

  const approveCheckout = async (checkoutId: string) => {
    await fetch(`${API_BASE}/checkout/${checkoutId}/approve`, {
      method: "PUT",
      credentials: "include",
    });
    fetchCheckouts();
  };

  //   ❌ REJECT
  const rejectCheckout = async (checkoutId: string) => {
    await fetch(`${API_BASE}/checkout/${checkoutId}/reject`, {
      method: "PUT",
      credentials: "include",
    });
    fetchCheckouts();
  };

  //   🗑️ DELETE
  const deleteCheckout = async (checkoutId: string) => {
    const ok = await Swal.fire({
      title: "ยืนยันลบข้อมูล?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    await fetch(`${API_BASE}/checkout/${checkoutId}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchCheckouts();
  };

  return {
    checkouts,
    loading,
    fetchCheckouts,
    approveCheckout,
    rejectCheckout,
    deleteCheckout,
  };
}
