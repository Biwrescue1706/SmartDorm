import { useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config";
import type { Checkout } from "../../types/Checkout";

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCheckouts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/checkout/getall`, {
        credentials: "include",
      });
      const data = await res.json();
      setCheckouts(Array.isArray(data?.checkouts) ? data.checkouts : []);
    } finally {
      setLoading(false);
    }
  };

  const approveCheckout = async (id: string) => {
    await fetch(`${API_BASE}/checkout/${id}/approve`, {
      method: "PUT",
      credentials: "include",
    });
    fetchCheckouts();
  };

  const rejectCheckout = async (id: string) => {
    await fetch(`${API_BASE}/checkout/${id}/reject`, {
      method: "PUT",
      credentials: "include",
    });
    fetchCheckouts();
  };

  const checkoutConfirm = async (id: string) => {
    await fetch(`${API_BASE}/checkout/${id}/checkout`, {
      method: "PUT",
      credentials: "include",
    });
    fetchCheckouts();
  };

  const updateCheckoutDate = async (
    id: string,
    values: { requestedCheckout: string }
  ) => {
    await fetch(`${API_BASE}/checkout/${id}/date`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    });
    fetchCheckouts();
  };

  const deleteCheckout = async (id: string) => {
    const ok = await Swal.fire({
      title: "ยืนยันลบข้อมูล?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;

    await fetch(`${API_BASE}/checkout/${id}`, {
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
    checkoutConfirm,
    updateCheckoutDate,
    deleteCheckout,
  };
}