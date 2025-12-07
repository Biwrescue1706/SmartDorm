import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE } from "../config";
import { GetAllBill, UpdateBill, DeleteBill } from "../apis/endpoint.api";
import type { Bill } from "../types/Bill";
import { toast } from "../utils/toast"; // ใช้ toast กลาง

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลบิลทั้งหมด
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${GetAllBill}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        toast("error", "โหลดข้อมูลบิลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลได้");
        return;
      }

      const data = await res.json();
      setBills(data);
      // ไม่จำเป็นต้องโชว์ toast เมื่อโหลดสำเร็จทุกครั้ง
    } catch {
      toast("error", "เชื่อมต่อไม่สำเร็จ", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // อัปเดตบิล
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

      toast("success", "อัปเดตสำเร็จ", "ระบบได้บันทึกข้อมูลบิลแล้ว");
      await fetchBills();
    } catch {
      toast("error", "อัปเดตไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ลบบิล
  const deleteBill = async (billId: string, roomNumber: string) => {
    const ok = await Swal.fire({
      title: `ลบบิลห้อง ${roomNumber}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteBill(billId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast("success", "ลบบิลสำเร็จ", `บิลห้อง ${roomNumber} ถูกลบแล้ว`);
      await fetchBills();
    } catch {
      toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบบิลได้");
    }
  };

  // อนุมัติบิล
  const approveBill = async (billId: string, room: string) => {
    const ok = await Swal.fire({
      title: `อนุมัติบิลห้อง ${room}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✔️ อนุมัติ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/bill/${billId}/approve`,
        {},
        { withCredentials: true }
      );
      toast("success", "อนุมัติการชำระแล้ว", `บิลห้อง ${room} ถูกอนุมัติ`);
      await fetchBills();
    } catch {
      toast("error", "อนุมัติไม่สำเร็จ", "ไม่สามารถอัปเดตสถานะได้");
    }
  };

  // ปฏิเสธบิล
  const rejectBill = async (billId: string, room: string) => {
    const ok = await Swal.fire({
      title: `ปฏิเสธบิลห้อง ${room}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "❌ ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/bill/${billId}/reject`,
        {},
        { withCredentials: true }
      );
      toast("info", "ปฏิเสธสำเร็จ", "สถานะกลับเป็นยังไม่ชำระ");
      await fetchBills();
    } catch {
      toast("error", "ปฏิเสธไม่สำเร็จ", "ระบบไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

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
