// src/hooks/useRooms.ts
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import {
  GetAllRoom,
  UpdateRoom,
  CreateRoom,
  DeleteRoom,
} from "../apis/endpoint.api";
import type { Room } from "../types/Room";

export function useRooms(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  //  โหลดห้องทั้งหมด
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${GetAllRoom}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("โหลดห้องล้มเหลว");
      const data: Room[] = await res.json();

      setRooms(data.sort((a, b) => Number(a.number) - Number(b.number)));
      return data;
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ล้มเหลว",
        text: "โหลดข้อมูลห้องไม่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  //  เพิ่มห้องใหม่
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

      if (!res.ok) throw new Error("เพิ่มห้องล้มเหลว");
      const data = await res.json();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "เพิ่มห้องสำเร็จ",
        text: "ระบบได้บันทึกการเพิ่มห้องของคุณเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });

      setRooms((prev) => [...prev, data.room]);
      return data.room;
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ผิดพลาด",
        text: err.message || "ไม่สามารถเพิ่มห้องได้",
        timer: 1500,
        showConfirmButton: false,
      });
      throw err;
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  //  โหลดห้องเดียว
  const loadRoom = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${UpdateRoom(roomId)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลห้องล้มเหลว");
      const data: Room = await res.json();
      setRoom(data);
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ล้มเหลว",
        text: err.message || "โหลดข้อมูลห้องล้มเหลว",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  //  อัปเดตห้อง
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
        throw new Error(err.error || "แก้ไขห้องล้มเหลว");
      }

      const data = await res.json();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "แก้ไขห้องเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
      setRoom(data.updated);
      return data.updated;
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ล้มเหลว",
        text: err.message || "ไม่สามารถแก้ไขห้องได้",
        timer: 1500,
        showConfirmButton: false,
      });
      throw err;
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  //  ลบห้อง
  const deleteRoom = async (roomId: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "คุณแน่ใจหรือไม่?",
      text: `ต้องการลบห้องนี้ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return false;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${DeleteRoom(roomId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบห้องล้มเหลว");

      await res.json();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ลบห้องเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });

      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      return true;
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: err.message || "ไม่สามารถลบห้องได้",
        timer: 1500,
        showConfirmButton: false,
      });
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
