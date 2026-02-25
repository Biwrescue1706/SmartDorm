import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config";
import { toast } from "../../utils/toast"; // ⬅️ ใช้ toast กลาง
import {
  GetAllRoom,
  UpdateRoom,
  CreateRoom,
  DeleteRoom,
} from "../../apis/endpoint.api";
import type { Room } from "../../types/All";

export function useRooms(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // โหลดห้องทั้งหมด
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${GetAllRoom}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const dataFromApi: any[] = await res.json(); // ใช้ any ก่อน
      const data: Room[] = dataFromApi.map((r) => ({
        ...r,
        booking: r.bookings[0] || null, // ✅ เพิ่ม booking
      }));

      setRooms(data.sort((a, b) => Number(a.number) - Number(b.number)));
      return data;
    } catch {
      toast("error", "โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลห้องได้");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มห้องใหม่
  const createRoom = async (payload: {
    number: string;
    size: string;
    rent: number;
    deposit: number;
    bookingFee: number;
  }) => {
    try {
      setLoading(true);

      Swal.fire({
        title: "กำลังเพิ่มห้อง...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(`${API_BASE}${CreateRoom}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      toast("success", "เพิ่มห้องสำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");

      setRooms((prev) => [...prev, data.room]);
      return data.room;
    } catch (err: any) {
      toast("error", "เพิ่มห้องไม่สำเร็จ", err.message);
      throw err;
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  // โหลดห้องเดียว
  const loadRoom = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${UpdateRoom(roomId)}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      const data: Room = await res.json();
      setRoom(data);
    } catch {
      toast("error", "โหลดข้อมูลไม่สำเร็จ", "ไม่พบข้อมูลห้องนี้");
    } finally {
      setLoading(false);
    }
  };

  // อัปเดตห้อง
  const updateRoom = async (updatedData: Partial<Room>) => {
    if (!roomId) return;

    try {
      setLoading(true);

      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(`${API_BASE}${UpdateRoom(roomId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const data = await res.json();
      toast("success", "แก้ไขห้องสำเร็จ", "บันทึกข้อมูลใหม่เรียบร้อยแล้ว");

      setRoom(data.updated);
      return data.updated;
    } catch {
      toast("error", "แก้ไขห้องไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      throw Error();
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  // ลบห้อง
  const deleteRoom = async (id: string) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "ลบห้องนี้?",
      text: "การลบจะไม่สามารถกู้คืนได้",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return false;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${DeleteRoom(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      await res.json();

      toast("success", "ลบห้องสำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว");
      setRooms((prev) => prev.filter((r) => r.roomId !== id));
      return true;
    } catch {
      toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบห้องได้");
      return false;
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    if (roomId) loadRoom();
  }, [roomId]);

  return {
    room,
    rooms,
    loading,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    loadRoom,
  };
}
