import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type { Booking } from "../types/Checkout";
import {
  GetAllCheckout,
  ApproveCheckout,
  RejectCheckout,
  DeleteCheckout,
  EditCheckout,
  ConfirmReturn,
} from "../apis/endpoint.api";
import { toast } from "../utils/toast"; // ⬅️ ใช้ toast กลาง

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลทั้งหมด
  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${GetAllCheckout}`, {
        credentials: "include",
      });

      if (!res.ok) {
        toast("error", "โหลดข้อมูลล้มเหลว", "ไม่สามารถโหลดข้อมูลการคืนได้");
        return;
      }

      const data: Booking[] = await res.json();
      setCheckouts(data);
    } catch {
      toast("error", "เชื่อมต่อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  // อนุมัติการคืน
  const approveCheckout = async (id: string) => {
    const ok = await Swal.fire({
      title: "ยืนยันอนุมัติ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${ApproveCheckout(id)}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      toast("success", "อนุมัติสำเร็จ", "ลูกค้าได้คืนห้องแล้ว");
      fetchCheckouts();
    } catch {
      toast("error", "อนุมัติไม่สำเร็จ", "ไม่สามารถอนุมัติการคืนได้");
    }
  };

  // ปฏิเสธการคืน
  const rejectCheckout = async (id: string) => {
    const ok = await Swal.fire({
      title: "ยืนยันปฏิเสธ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });
    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${RejectCheckout(id)}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      toast("success", "ปฏิเสธสำเร็จ", "สถานะการคืนถูกปฏิเสธแล้ว");
      fetchCheckouts();
    } catch {
      toast("error", "ปฏิเสธไม่สำเร็จ", "ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  // ลบข้อมูลการคืน
  const deleteCheckout = async (id: string, room: string) => {
    const ok = await Swal.fire({
      title: `ลบข้อมูลห้อง ${room}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteCheckout(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      toast("success", "ลบสำเร็จ", `ข้อมูลการคืนห้อง ${room} ถูกลบแล้ว`);
      fetchCheckouts();
    } catch {
      toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบข้อมูลได้");
    }
  };

  // แก้ไขข้อมูลคืนห้อง
  const editCheckout = async (bookingId: string, values: { checkout: string }) => {
    try {
      const res = await fetch(`${API_BASE}${EditCheckout(bookingId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error();
      toast("success", "แก้ไขสำเร็จ", "อัปเดตข้อมูลคืนเรียบร้อย");
      fetchCheckouts();
    } catch {
      toast("error", "แก้ไขไม่สำเร็จ", "ไม่สามารถแก้ไขข้อมูลได้");
    }
  };

  // Confirm Return — ลูกค้าคืนห้องจริง
  const confirmReturn = async (id: string) => {
    const ok = await Swal.fire({
      title: "ลูกค้าคืนห้องแล้วใช่ไหม?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${ConfirmReturn(id)}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      toast("success", "บันทึกสำเร็จ", "สถานะการคืนถูกอัปเดตแล้ว");
      fetchCheckouts();
    } catch {
      toast("error", "บันทึกไม่สำเร็จ", "ไม่สามารถอัปเดตสถานะได้");
    }
  };

  return {
    checkouts,
    loading,
    fetchCheckouts,
    approveCheckout,
    rejectCheckout,
    deleteCheckout,
    editCheckout,
    confirmReturn,
  };
}
