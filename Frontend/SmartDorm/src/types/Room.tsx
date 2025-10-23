// src/types/Room.ts
export interface Admin {
  adminId: string;
  username: string;
  name: string;
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
}
export interface RoomForm {
  number: string;
  size: string;
  rent: string;
  deposit: string;
  bookingFee: string;
  status: number; // 0=ว่าง, 1=ไม่ว่าง
}
