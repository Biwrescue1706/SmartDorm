// src/types/Room.ts
export interface Admin {
  adminId: string;
  username: string;
  name: string;
}

// เพิ่ม type Booking ถ้ายังไม่มี
export interface Booking {
  bookingId: string;
  fullName: string; // ชื่อผู้เช่า
}

export interface Room {
  roomId: string;
  number: string;
  size: string;
  rent: number;
  deposit: number;
  bookingFee: number;
  status: number; // 0=ว่าง, 1=ไม่ว่าง
  createdAt: string;
  updatedAt: string;
  adminCreated?: Admin;
  adminUpdated?: Admin;

  // ✅ เพิ่ม booking
  booking?: Booking | null;
}

export interface RoomForm {
  number: string;
  size: string;
  rent: string;
  deposit: string;
  bookingFee: string;
  status: number; // 0=ว่าง, 1=ไม่ว่าง
}