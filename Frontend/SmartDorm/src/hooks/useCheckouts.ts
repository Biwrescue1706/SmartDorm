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

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  //  ดึงข้อมูลทั้งหมด
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

  //  อนุมัติการคืน
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

  // ❌ ปฏิเสธการคืน
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

  // 🗑️ ลบข้อมูลการคืน
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
        title: "ลบข้อมูลสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCheckouts();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: "ไม่สามารถลบข้อมูลได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // ✏️ แก้ไขข้อมูลคืนห้อง
  const editCheckout = async (
    bookingId: string,
    values: { checkout: string }
  ) => {
    try {
      const res = await fetch(`${API_BASE}${EditCheckout(bookingId)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        text: "อัปเดตข้อมูลการคืนแล้ว",
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

  // 🚪 ลูกค้าคืนห้องจริง (Confirm Return)
  const confirmReturn = async (id: string) => {
    const confirm = await Swal.fire({
      title: "ลูกค้าคืนห้องแล้วใช่ไหม?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${ConfirmReturn(id)}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "ลูกค้าคืนห้องแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCheckouts();
    } catch {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกการคืนห้องได้",
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
    editCheckout,
    confirmReturn, //  เพิ่มให้ใช้งานในตาราง
  };
}
