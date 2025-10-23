import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type { Booking } from "../types/Checkout";
import {
  GetAllCheckout,
  ApproveCheckout,
  RejectCheckout,
  DeleteCheckout,
} from "../apis/endpoint.api";

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckouts = async () => {
    try {
      const res = await fetch(`${API_BASE}${GetAllCheckout}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลล้มเหลว");
      const data: Booking[] = await res.json();
      setCheckouts(data);
    } catch {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "โหลดข้อมูลการคืนไม่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const approveCheckout = async (id: string) => {
    const confirm = await Swal.fire({
      title: "ยืนยันอนุมัติ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${ApproveCheckout(id)}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "อนุมัติการคืนสำเร็จ",
        text: "ระบบได้บันทึกข้อมูลของคุณแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCheckouts();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: "ไม่สามารถอนุมัติได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const rejectCheckout = async (id: string) => {
    const confirm = await Swal.fire({
      title: "ยืนยันปฏิเสธ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${RejectCheckout(id)}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "ปฏิเสธการคืนสำเร็จ",
        text: "ระบบได้บันทึกข้อมูลของคุณแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCheckouts();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: "ไม่สามารถปฏิเสธการคืนได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const deleteCheckout = async (id: string, roomNum: string) => {
    const confirm = await Swal.fire({
      title: `ลบข้อมูลการคืนห้อง ${roomNum}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteCheckout(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "ลบการคืนสำเร็จ",
        text: "ระบบได้ลบข้อมูลของคุณแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCheckouts();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: "ลบการคืนไม่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  //  ฟังก์ชันใหม่: แก้ไขข้อมูลการคืนห้อง
  const editCheckout = async (
    bookingId: string,
    values: { checkout: string }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/checkout/${bookingId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        text: "การคืนห้องได้รับการอัปเดตแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCheckouts();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: "ไม่สามารถแก้ไขข้อมูลได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return {
    checkouts,
    loading,
    fetchCheckouts,
    approveCheckout,
    rejectCheckout,
    deleteCheckout,
    editCheckout, // export ออกมาใช้
  };
}
