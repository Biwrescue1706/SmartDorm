// src/hooks/useBookings.ts
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE } from "../config";
import {
  GetAllBooking,
  ApproveBooking,
  RejectBooking,
  DeleteBooking,
} from "../apis/endpoint.api";
import { toast } from "../utils/toast";

// ================= Type =================
export interface BookingType {
  bookingId: string;
  fullName?: string;
  ctitle?: string;
  cname?: string;
  csurname?: string;
  cphone?: string;
  cmumId?: string;
  bookingDate: string;
  checkin: string;
  checkinAt?: string | null;
  approveStatus: number;
  checkinStatus: number;
  slipUrl?: string;
  room: {
    roomId: string;
    number: string;
  };
  customer: {
    userName?: string;
  };
  checkout?: string | null;
  checkoutAt?: string | null;
}

// ================= Hook =================
export function useBookings() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // --------- Fetch all bookings ---------
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${GetAllBooking}`, {
        credentials: "include",
      });

      if (!res.ok) {
        toast("error", "โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลการจองได้");
        return;
      }

      const data = await res.json();

      // map ให้ตรง type
      const formatted: BookingType[] = data.map((b: any) => ({
        bookingId: b.bookingId,
        fullName: b.fullName,
        ctitle: b.ctitle,
        cname: b.cname,
        csurname: b.csurname,
        cphone: b.cphone,
        cmumId: b.cmumId,
        bookingDate: b.bookingDate,
        checkin: b.checkin,
        checkinAt: b.checkinAt,
        approveStatus: b.approveStatus,
        checkinStatus: b.checkinStatus,
        slipUrl: b.slipUrl,
        room: {
          roomId: b.room.roomId,
          number: b.room.number,
        },
        customer: {
          userName: b.customer?.userName,
        },
        checkout: b.checkout || null,
        checkoutAt: b.checkoutAt || null,
      }));

      setBookings(formatted);
    } catch (err) {
      toast("error", "เชื่อมต่อไม่สำเร็จ", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // --------- Approve booking ---------
  const approveBooking = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}${ApproveBooking(id)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast("success", "อนุมัติสำเร็จ", "การจองได้รับการอนุมัติแล้ว");
      await fetchBookings();
    } catch {
      toast("error", "ไม่สามารถอนุมัติได้", "กรุณาลองใหม่อีกครั้ง");
    }
  };

  // --------- Reject booking ---------
  const rejectBooking = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}${RejectBooking(id)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast("warning", "ปฏิเสธสำเร็จ", "สถานะกลับเป็นยังไม่อนุมัติ");
      await fetchBookings();
    } catch {
      toast("error", "ปฏิเสธไม่สำเร็จ", "ไม่สามารถปฏิเสธการจองได้");
    }
  };

  // --------- Delete booking ---------
  const deleteBooking = async (id: string, room: string) => {
    const ok = await Swal.fire({
      title: `ลบการจองห้อง ${room}?`,
      text: "การลบจะไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteBooking(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast("success", "ลบสำเร็จ", `ลบการจองห้อง ${room} แล้ว`);
      await fetchBookings();
    } catch {
      toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบข้อมูลได้");
    }
  };

  // --------- Checkin booking ---------
  const checkinBooking = async (id: string) => {
    try {
      await axios.put(
        `${API_BASE}/booking/${id}/checkin`,
        {},
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchBookings();
      toast("success", "เช็คอินสำเร็จ", "ผู้จองได้เช็คอินแล้ว");
    } catch {
      toast("warning", "เช็คอินไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
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