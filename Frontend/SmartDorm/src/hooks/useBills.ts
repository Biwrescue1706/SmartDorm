import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
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
        title: "ไม่สามารถโหลดข้อมูลได้",
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

      if (!res.ok) throw new Error("Update failed");

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "อัปเดตสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchBills();
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ไม่สามารถอัปเดตข้อมูลได้",
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
        title: "ลบบิลสำเร็จแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBills();
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ลบบิลไม่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // ✔️ อนุมัติบิล
  const approveBill = async (billId: string, room: string) => {
    const ok = await Swal.fire({
      title: `อนุมัติบิลห้อง ${room}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✔️ อนุมัติ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    await axios.put(`${API_BASE}/bill/${billId}/approve`, {}, { withCredentials: true });
    await fetchBills();
    Swal.fire("สำเร็จ", "อนุมัติการชำระแล้ว", "success");
  };

  // ❌ ปฏิเสธบิล
  const rejectBill = async (billId: string, room: string) => {
    const ok = await Swal.fire({
      title: `ปฏิเสธบิลห้อง ${room}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "❌ ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    await axios.put(`${API_BASE}/bill/${billId}/reject`, {}, { withCredentials: true });
    await fetchBills();
    Swal.fire("ปฏิเสธสำเร็จ", "สถานะกลับไปยังไม่ชำระ", "info");
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ⭐ สำคัญมาก — ต้อง return ทั้ง 2 ฟังก์ชันใหม่ด้วย
  return {
    bills,
    loading,
    fetchBills,
    updateBill,
    deleteBill,
    approveBill,
    rejectBill,
  };
}
