import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import { GetAllBill, UpdateBill, DeleteBill } from "../apis/endpoint.api";
import type { Bill } from "../types/Bill";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_BASE}${GetAllBill}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลบิลไม่สำเร็จ");
      const data = await res.json();
      setBills(data);
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "โหลดข้อมูลบิลล้มเหลว",
        text: "ไม่สามารถโหลดข้อมูลได้",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBill = async (billId: string, formValues: any) => {
    try {
      Swal.fire({ title: "กำลังอัปเดต...", didOpen: () => Swal.showLoading() });
      const res = await fetch(`${API_BASE}${UpdateBill(billId)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "อัปเดตสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBills();
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "อัปเดตบิลล้มเหลว",
        text: "ไม่สามารถอัปเดตข้อมูลได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const deleteBill = async (billId: string, roomNumber: string) => {
    const confirm = await Swal.fire({
      title: `ลบบิลของห้อง ${roomNumber}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteBill(billId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ลบสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBills();
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: "เกิดข้อผิดพลาด",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return { bills, loading, fetchBills, updateBill, deleteBill };
}
