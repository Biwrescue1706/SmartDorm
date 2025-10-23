import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import {
  GetAllBooking,
  ApproveBooking,
  RejectBooking,
  DeleteBooking,
} from "../apis/endpoint.api";
import Swal from "sweetalert2";
import axios from "axios";

export function useBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลทั้งหมด
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${GetAllBooking}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setBookings(data);
    } catch {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลการจองได้",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // อนุมัติการจอง
  const approveBooking = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}${ApproveBooking(id)}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "อนุมัติเรียบร้อยแล้ว",
        text: "ระบบได้บันทึกข้อมูลการอนุมัติแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchBookings();
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

  // ปฏิเสธการจอง
  const rejectBooking = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}${RejectBooking(id)}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "warning",
        title: "ปฏิเสธการจองแล้ว",
        text: "ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchBookings();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "ไม่สามารถปฏิเสธได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // ลบการจอง
  const deleteBooking = async (id: string, roomNum: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      text: `คุณต้องการลบการจองห้อง ${roomNum} ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteBooking(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        icon: "success",
        title: "ลบการจองสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchBookings();
    } catch {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "ไม่สามารถลบข้อมูลได้",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const checkinBooking = async (id: string) => {
    try {
      await axios.put(
        `${API_BASE}/booking/${id}/checkin`,
        {},
        { withCredentials: true }
      );
      Swal.fire("สำเร็จ", "เช็คอินสำเร็จแล้ว", "success");
      fetchBookings(); // ✅ ต้องรีโหลดข้อมูลใหม่ด้วย
    } catch (err: any) {
      Swal.fire(
        "เกิดข้อผิดพลาด",
        err.response?.data?.error || "ไม่สามารถเช็คอินได้",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    fetchBookings,
    approveBooking,
    rejectBooking,
    deleteBooking,
    checkinBooking,
  };
}
